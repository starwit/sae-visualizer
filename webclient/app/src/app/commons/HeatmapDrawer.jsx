import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { OrthographicView } from "@deck.gl/core";
import DeckGL from "@deck.gl/react";
import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import WebSocketClient from "../services/WebSocketClient";

function HeatmapDrawer(props) {
    const { stream, running, label } = props;
    // const {  } = useSettings();
    
    const wsClient = useRef(new WebSocketClient());

    const deckGlContainer = useRef(null);

    const [detections, setDetections] = useState([]);
    const [shape, setShape] = useState({});

    const [viewState, setViewState] = useState({
        target: [0, 0, 0],
        zoom: -1,
        minZoom: -5,
        maxZoom: 10
    });
    
    useEffect(() => {
        if (running) {
            setDetections([]);
            wsClient.current.setup(handleMessage, [stream]);
            wsClient.current.connect();
        } else {
            wsClient.current.disconnect();
        }
        return () => wsClient.current.disconnect();
    }, [running]);

    function handleMessage(detectionList) {
        if (detectionList.length > 0 && running) {
            updateShape(detectionList);

            const currentTimestamp = new Date().getTime();
            detectionList.forEach(detection => {
                detections.push({
                    x: detection.coordinates.x,
                    y: detection.coordinates.y,
                    timestamp: currentTimestamp,
                });
            });
            setDetections(Array.from(detections));
        }
    }

    useEffect(() => {
        function updateDimensions() {
            if (shape) {
                const containerWidth = deckGlContainer.current.clientWidth;
                const containerHeight = deckGlContainer.current.clientHeight;

                const { width: frameWidth, height: frameHeight } = shape;

                // Calculate zoom level to fit view
                const { width: viewWidth, height: viewHeight } = calculateViewportDimensions(
                    containerWidth,
                    containerHeight,
                    frameWidth,
                    frameHeight
                );

                // Calculate zoom to fit the frame dimensions to the viewport
                const scale = Math.min(
                    viewWidth / frameWidth,
                    viewHeight / frameHeight
                );

                const zoom = Math.log2(scale);

                if ( !(Number.isFinite(zoom) && Number.isFinite(frameHeight) && Number.isFinite(frameWidth)) ) {
                    return;
                }

                setViewState({
                    target: [frameWidth / 2, frameHeight / 2, 0],
                    zoom,
                    minZoom: -5,
                    maxZoom: 10
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions)
        return () => window.removeEventListener('resize', updateDimensions);
    }, [shape]);
    
    function updateShape(trackedObjectList) {
        const newShape = trackedObjectList[0].shape;
        setShape(oldShape => {
            if (oldShape.width == newShape.width && oldShape.height == newShape.height) {
                return oldShape;
            }
            return newShape;                
        });
    }

    // Function to calculate the viewport dimensions that maintain aspect ratio
    function calculateViewportDimensions(containerWidth, containerHeight, frameWidth, frameHeight) {
        if (!frameWidth || !frameHeight) return { width: containerWidth, height: containerHeight };

        const frameAspectRatio = frameWidth / frameHeight;
        const containerAspectRatio = containerWidth / containerHeight;

        let viewWidth, viewHeight;

        if (containerAspectRatio > frameAspectRatio) {
            // Container is wider than frame - constrain by height
            viewHeight = containerHeight;
            viewWidth = viewHeight * frameAspectRatio;
        } else {
            // Container is taller than frame - constrain by width
            viewWidth = containerWidth;
            viewHeight = viewWidth / frameAspectRatio;
        }

        return { width: viewWidth, height: viewHeight };
    };

    const layers = [];

    if (detections && detections.length > 0) {
        // Add points for the current positions (only for active trajectories)
        layers.push(
            new HeatmapLayer({
                id: 'detections',
                data: detections.map(d => ({
                    position: [d.x, d.y]
                })),
                getPosition: d => d.position,
                aggregation: 'SUM',
                radiusPixels: 20,
            })
        );
    }

    return (
        <>
            <div id={stream} ref={deckGlContainer} style={{backgroundColor: 'rgba(149, 149, 149, 0.09)', position: 'relative'}} >
                <Typography variant="body2" style={{position: 'absolute', top: 10, left: 10, color: 'rgba(149, 149, 149, 0.6)'}}>
                    {label}
                </Typography>
                {detections.length > 0 && (
                    <DeckGL
                    views={new OrthographicView({
                        id: 'ortho',
                        flipY: true // Y increases from top to bottom in image space
                    })}
                    viewState={viewState}
                    controller={false}
                    layers={layers}
                    getCursor={() => 'default'}
                    _pickable={false}
                    />
                )}
            </div>
        </>
    )
}

export default HeatmapDrawer;
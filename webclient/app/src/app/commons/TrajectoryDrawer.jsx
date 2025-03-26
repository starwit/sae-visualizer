import React, { useEffect, useState, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import ObjectTracker from "../services/ObjectTracker";
import WebSocketClient from "../services/WebSocketClient";

const ACTIVE_PATH_COLOR = [0, 128, 255, 255]; // Blue for active trajectories
const PASSIVE_PATH_COLOR = [150, 150, 150, 200]; // Grey with some transparency for passive trajectories
const MARKER_COLOR = ACTIVE_PATH_COLOR;
const STATIONARY_MARKER_COLOR = [137, 196, 255, 255]; // Light blue for stationary markers

const MAX_PASSIVE_TRAJECTORIES_AGE = 120000; // Maximum age of passive trajectories in milliseconds


function TrajectoryDrawer(props) {
    const { stream, running } = props;

    const wsClient = useRef(new WebSocketClient());

    const deckGlContainer = useRef(null);

    const [trajectories, setTrajectories] = useState([]);
    const [shape, setShape] = useState({});
    const [objectTracker, setObjectTracker] = useState(new ObjectTracker(500, MAX_PASSIVE_TRAJECTORIES_AGE));

    const [viewState, setViewState] = useState({
        target: [0, 0, 0],
        zoom: -1,
        minZoom: -5,
        maxZoom: 10
    });

    const layers = [];

    useEffect(() => {
        if (running) {
            setTrajectories([]);
            setObjectTracker(new ObjectTracker(500, MAX_PASSIVE_TRAJECTORIES_AGE));
            wsClient.current.setup(handleMessage, [stream]);
            wsClient.current.connect();
        } else {
            wsClient.current.disconnect();
        }
        return () => wsClient.current.disconnect();
    }, [running]);

    function handleMessage(trackedObjectList) {
        console.log(`${stream}: Received tracked object list`, trackedObjectList);
    }

    useEffect(() => {
        const updateDimensions = () => {
            if (shape) {
                const containerWidth = deckGlContainer.current.clientWidth;
                const containerHeight = deckGlContainer.current.clientHeight;
                console.log(`${stream}: containerWidth: ${containerWidth}, containerHeight: ${containerHeight}`);

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

                setViewState({
                    target: [frameWidth / 2, frameHeight / 2, 0],
                    zoom,
                    minZoom: -5,
                    maxZoom: 10
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [shape]);

    function handleMessage(trackedObjectList) {
        if (trackedObjectList.length > 0) {
            updateShape(trackedObjectList);
            const updatedTrajectories = objectTracker.updateTrajectories(trackedObjectList, trackedObjectList[0].receiveTimestamp);
            setTrajectories(updatedTrajectories);
        }
    }
    
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
    const calculateViewportDimensions = (containerWidth, containerHeight, frameWidth, frameHeight) => {
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

    // Get passive color based on age
    function getColorForAge(createdAt) {
        const age = new Date().getTime() - createdAt;
        const alphaFactor = Math.pow(1 - (age / MAX_PASSIVE_TRAJECTORIES_AGE), 3); // Non-linear fade out
        const alpha = Math.max(0, 255 * alphaFactor); 
        return [...PASSIVE_PATH_COLOR.slice(0, 3), alpha];
    };

    const backgroundLayer = new ScatterplotLayer({
        id: 'background',
        getPosition: d => d.position,
        getRadius: 1,
        getFillColor: [0, 0, 0, 0], // Transparent
        getLineColor: [100, 100, 100], // Gray border
        stroked: true,
        filled: true,
        lineWidthMinPixels: 1
    });

    if (trajectories && trajectories.length > 0) {
        // First, separate active and passive trajectories
        const activeTrajectories = trajectories.filter(t => t.isActive && !t.isStationary);
        const stationaryTrajectories = trajectories.filter(t => t.isActive && t.isStationary);
        const passiveTrajectories = trajectories.filter(t => !t.isActive);

        // Add paths for passive trajectories (render these first, so they appear below active ones)
        if (passiveTrajectories.length > 0) {
            layers.push(
                new PathLayer({
                    id: 'passive-trajectory-paths',
                    data: passiveTrajectories,
                    getPath: d => d.path,
                    getColor: d => getColorForAge(d.createdAt),
                    getWidth: 1.5, // Slightly thinner than active trajectories
                    widthUnits: 'pixels',
                    jointRounded: true,
                    capRounded: true,
                    billboard: false,
                    miterLimit: 2
                })
            );
        }

        // Add paths for active trajectories
        if (activeTrajectories.length > 0) {
            layers.push(
                new PathLayer({
                    id: 'active-trajectory-paths',
                    data: activeTrajectories,
                    getPath: d => d.path,
                    getColor: ACTIVE_PATH_COLOR,
                    getWidth: 2,
                    widthUnits: 'pixels',
                    jointRounded: true,
                    capRounded: true,
                    billboard: false,
                    miterLimit: 2,
                })
            );

            // Add points for the current positions (only for active trajectories)
            layers.push(
                new ScatterplotLayer({
                    id: 'active-positions',
                    data: activeTrajectories.map(t => ({
                        position: t.path[t.path.length - 1],
                        id: t.id
                    })),
                    getPosition: d => d.position,
                    getLineColor: [255, 255, 255], // White outline for all markers
                    getFillColor: MARKER_COLOR,
                    getRadius: 5,
                    radiusUnits: 'pixels',
                    stroked: true,
                    lineWidthMinPixels: 1,
                })
            );
        }

        // Add only markers for stationary trajectories
        if (stationaryTrajectories.length > 0) {
            layers.push(
                new ScatterplotLayer({
                    id: 'stationary-positions',
                    data: stationaryTrajectories.map(t => ({
                        position: t.path[t.path.length - 1],
                        id: t.id
                    })),
                    getPosition: d => d.position,
                    getLineColor: [255, 255, 255], // White outline for all markers
                    getFillColor: STATIONARY_MARKER_COLOR,
                    getRadius: 5,
                    radiusUnits: 'pixels',
                    stroked: true,
                    lineWidthMinPixels: 1,
                })
            );
        }
    }

    return (
        <div ref={deckGlContainer} style={{aspectRatio: '16/9', position:'absolute', width: '100%', borderColor: 'black', borderStyle: 'solid', borderWidth: '1px'}}>
            {trajectories.length > 0 && (
                <DeckGL
                    views={new OrthographicView({
                        id: 'ortho',
                        flipY: true // Y increases from top to bottom in image space
                    })}
                    viewState={viewState}
                    controller={false}
                    layers={[backgroundLayer, ...layers]}
                    getCursor={() => 'default'}
                    _pickable={false}
                />
            )}
        </div>
    )
}

export default TrajectoryDrawer;
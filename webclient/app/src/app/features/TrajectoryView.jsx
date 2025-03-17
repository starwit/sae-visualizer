import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from 'react-i18next';
import StreamRest from "../services/StreamRest";
import WebSocketClient from "../services/WebSocketClient";
import { Box, Card, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import DeckGL from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import ObjectTracker from "../services/ObjectTracker";

function TrajectoryView() {
    const { t } = useTranslation();
    const streamRest = useMemo(() => new StreamRest(), []);
    const wsClient = useRef(new WebSocketClient());

    const [streams, setStreams] = useState([]);
    const [streamSelect, setStreamSelect] = useState("");

    const containerRef = useRef(null);
    const [trajectories, setTrajectories] = useState([]);
    const [shape, setShape] = useState({});
    const [objectTracker] = useState(() => new ObjectTracker(500));

    const [viewState, setViewState] = useState({
        target: [0, 0, 0],
        zoom: -1,
        minZoom: -5,
        maxZoom: 10
    });

    const [dimensions, setDimensions] = useState({
        width: 1000,  // Default initial values
        height: 1000
    });

    const layers = [];

    useEffect(() => {
        streamRest.getAvailableStreams().then(response => {
            setStreams(response.data);
        });
    }, []);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current && shape) {
                const containerWidth = window.innerWidth;
                const containerHeight = window.innerHeight;

                const { width: frameWidth, height: frameHeight } = shape;
                setDimensions({ width: frameWidth, height: frameHeight });

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
            setShape(trackedObjectList[0].shape);
            const updatedTrajectories = objectTracker.updateTrajectories(trackedObjectList, trackedObjectList[0].receiveTimestamp);
            setTrajectories(updatedTrajectories);
        }
    }

    function startStream() {
        let selectedStreams = [];
        selectedStreams.push(streamSelect);
        wsClient.current.setup(handleMessage, selectedStreams);
        wsClient.current.connect();
    }

    function stopStream() {
        wsClient.current.disconnect();
    }

    const handleStreamSelectChange = (event) => {
        setStreamSelect(event.target.value);
    };

    const onViewStateChange = ({ viewState: newViewState }) => {
        setViewState(newViewState);
    };

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

    const backgroundLayer = new ScatterplotLayer({
        id: 'background',
        data: [
            { position: [0, 0], radius: 1 },
            { position: [dimensions.width, 0], radius: 1 },
            { position: [dimensions.width, dimensions.height], radius: 1 },
            { position: [0, dimensions.height], radius: 1 }
        ],
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
        const activeTrajectories = trajectories.filter(t => t.isActive);
        const passiveTrajectories = trajectories.filter(t => !t.isActive);

        // Add paths for passive trajectories (render these first, so they appear below active ones)
        if (passiveTrajectories.length > 0) {
            layers.push(
                new PathLayer({
                    id: 'passive-trajectory-paths',
                    data: passiveTrajectories,
                    getPath: d => d.path,
                    getColor: d => d.color,
                    getWidth: 1.5, // Slightly thinner than active trajectories
                    widthUnits: 'pixels',
                    pickable: true,
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
                    getColor: d => d.color,
                    getWidth: 2,
                    widthUnits: 'pixels',
                    pickable: true,
                    jointRounded: true,
                    capRounded: true,
                    billboard: false,
                    miterLimit: 2,
                    onHover: info => {
                        if (info.object) {
                            console.log('Trajectory ID:', info.object.id);
                        }
                    }
                })
            );

            // Add points for the current positions (only for active trajectories)
            layers.push(
                new ScatterplotLayer({
                    id: 'current-positions',
                    data: activeTrajectories.map(t => ({
                        position: t.path[t.path.length - 1],
                        color: t.color,
                        id: t.id
                    })),
                    getPosition: d => d.position,
                    getColor: [255, 255, 255], // White outline for all markers
                    getFillColor: d => d.color,
                    getRadius: 5,
                    radiusUnits: 'pixels',
                    stroked: true,
                    lineWidthMinPixels: 1,
                    pickable: true,
                    onHover: info => {
                        if (info.object) {
                            info.object.hexId;
                        }
                    }
                })
            );
        }
    }

    return (
        <>
            <Stack direction="column" spacing={2}>
                <div>
                    <h1>{t('trajectory.title')}</h1>
                </div>
                <Card>
                    <Stack direction="row" spacing={2}>
                        <div>
                            <IconButton onClick={startStream}><PlayCircleFilledWhiteIcon /></IconButton>
                        </div>
                        <div>
                            <IconButton onClick={stopStream}><StopCircleIcon /></IconButton>
                        </div>
                        <FormControl fullWidth>
                            <InputLabel id="stream-select">Stream</InputLabel>
                            <Select
                                labelId="stream-select"
                                id="stream-select-id"
                                value={streamSelect}
                                label="Stream"
                                onChange={handleStreamSelectChange}
                            >
                                {streams.map((stream) => (
                                    <MenuItem key={stream} value={stream}>
                                        {stream}
                                    </MenuItem>
                                ))}

                            </Select>
                        </FormControl>
                    </Stack>
                </Card>
                <Box sx={{
                    border: 1,
                    height: 850,
                    width: "auto",
                    m: 5,
                    position: 'relative'
                }}>
                    <DeckGL
                        views={new OrthographicView({
                            id: 'ortho',
                            flipY: true // Y increases from top to bottom in image space
                        })}
                        viewState={viewState}
                        controller={false}
                        onViewStateChange={onViewStateChange}
                        layers={[backgroundLayer, ...layers]}
                        getCursor={({ isDragging }) => isDragging ? 'grabbing' : 'default'}
                        className="deckgl-container"
                    />
                </Box>
            </Stack>
        </>
    )
}

export default TrajectoryView;
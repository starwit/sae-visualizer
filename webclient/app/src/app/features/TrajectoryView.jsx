import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from 'react-i18next';
import StreamRest from "../services/StreamRest";
import WebSocketClient from "../services/WebSocketClient";
import { Box, Card, Fab, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
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
    const [selectedStream, setSelectedStream] = useState("");

    const [trajectories, setTrajectories] = useState([]);
    const [shape, setShape] = useState({});
    const [objectTracker, setObjectTracker] = useState(new ObjectTracker(500));
    const [running, setRunning] = useState(false);

    const [viewState, setViewState] = useState({
        target: [0, 0, 0],
        zoom: -1,
        minZoom: -5,
        maxZoom: 10
    });

    const layers = [];

    useEffect(() => {
        streamRest.getAvailableStreams().then(response => {
            setStreams(response.data);
            if (response.data && response.data.length > 0) {
                setSelectedStream(response.data[0]);
            }            
        });
    }, []);

    useEffect(() => {
        const updateDimensions = () => {
            if (shape) {
                const containerWidth = window.innerWidth;
                const containerHeight = window.innerHeight;

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

    // Reset tracked objects when stream is changed
    useEffect(() => {
        stopStream();
        setObjectTracker(new ObjectTracker(500));
        setTrajectories([]);
    }, [selectedStream]);

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

    function startStream() {
        let selectedStreams = [];
        selectedStreams.push(selectedStream);
        wsClient.current.setup(handleMessage, selectedStreams);
        wsClient.current.connect();
        setRunning(true);
    }

    function stopStream() {
        wsClient.current.disconnect();
        setRunning(false);
    }

    const handleStreamSelectChange = (event) => {
        setSelectedStream(event.target.value);
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
                    jointRounded: true,
                    capRounded: true,
                    billboard: false,
                    miterLimit: 2,
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
                    getLineColor: [255, 255, 255], // White outline for all markers
                    getFillColor: d => d.color,
                    getRadius: 5,
                    radiusUnits: 'pixels',
                    stroked: true,
                    lineWidthMinPixels: 1,
                })
            );
        }
    }

    return (
        <>
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
            <Box sx={{
                position: 'fixed',
                top: 60,
                right: 10
            }}>
                <Typography variant="h1">
                    {t('trajectory.title')}
                </Typography>
            </Box>
            <Box sx={{
                position: 'fixed',
                top: 60,
                left: 10,
                width: '100%'
            }}>
                <Stack direction="row">
                    <FormControl sx={{ width: 350 }}>
                        <InputLabel id="stream-select">Stream</InputLabel>
                        <Select
                            labelId="stream-select"
                            id="stream-select-id"
                            value={selectedStream}
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
                    <Fab color="primary">
                        {!running ?
                            <PlayCircleFilledWhiteIcon onClick={startStream} /> :
                            <StopCircleIcon onClick={stopStream} />}
                    </Fab>
                </Stack>
            </Box>
        </>
    )
}

export default TrajectoryView;
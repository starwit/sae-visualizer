import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from 'react-i18next';
import StreamRest from "../services/StreamRest";
import WebSocketClient from "../services/WebSocketClient";
import LiveMapView from "./LiveMapView";
import { Box, Card, IconButton, Stack } from "@mui/material";
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';


function TrajectoryMap() {
    const { t } = useTranslation();
    const streamRest = useMemo(() => new StreamRest(), []);
    const wsClient = useRef(new WebSocketClient());

    const [streams, setStreams] = useState({});
    const [markerList, setMarkerList] = useState({});
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        streamRest.getAvailableStreams().then(response => {
            const streams = response.data;
            const colors = generateDistinctColors(Object.keys(response.data).length);
            let streamsAndColors = {}
            streams.forEach((stream, index) => {
                console.log(stream);
                streamsAndColors[stream] = colors[index];
            });
            setStreams(streamsAndColors);
            setShowMap(true);
    
            wsClient.current.setup(handleMessage, streams);
        });
        return () => wsClient.current.disconnect();
    }, []);

    function generateDistinctColors(n) {
        const colors = [];
        // Use golden ratio to help spread the hues evenly
        const goldenRatio = 0.618033988749895;
        let hue = Math.random(); // Start at random hue
    
        for (let i = 0; i < n; i++) {
            hue = (hue + goldenRatio) % 1; // Use golden ratio to increment hue
            
            // Convert HSV to RGB
            // Using fixed Saturation (100%) and Value (100%) for vibrant colors
            const rgb = hsvToRgb(hue, 1, 1);
            
            // Scale to your desired range (0-100 in this case)
            colors.push([
                Math.round(rgb[0] * 100),
                Math.round(rgb[1] * 100),
                Math.round(rgb[2] * 100)
            ]);
        }
        
        return colors;
    }
    
    function hsvToRgb(h, s, v) {
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
    
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
    
        return [r, g, b];
    }     
    
    function handleMessage(trackedObjectList, streamId) {
        let newMarkers = [];
        trackedObjectList.forEach(trackedObject => {
            if (trackedObject.hasGeoCoordinates) {
                let newMarker = {}
                newMarker.streamId = trackedObject.streamId;
                newMarker.id = trackedObject.objectId;
                newMarker.name = trackedObject.objectId + ' c' + trackedObject.classId;
                newMarker.class = trackedObject.classId;
                newMarker.timestamp = trackedObject.receiveTimestamp;
                newMarker.coordinates = [trackedObject.coordinates.longitude, trackedObject.coordinates.latitude];
                newMarkers.push(newMarker);
            } else {
            }
        });
        setMarkerList(prevMarkerList => ({...prevMarkerList, [streamId]: newMarkers}));
    }

    function startStream() {
        wsClient.current.connect();
    }

    function stopStream() {
        wsClient.current.disconnect();
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
                    </Stack>
                </Card>
                <Box sx={{
                    border: 1,
                    height: 850,
                    width: "auto",
                    m: 5,
                    position: 'relative'
                }}>
                    {showMap ? (
                        <LiveMapView
                            streams={streams}
                            markerList={markerList}
                        />
                    ) : (
                        <></>
                    )}
                </Box>
            </Stack>
        </>
    )
}

export default TrajectoryMap;
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from 'react-i18next';
import StreamRest from "../services/StreamRest";
import WebSocketClient from "../services/WebSocketClient";
import LiveMapView from "./LiveMapView";
import { Box, Card, IconButton, Stack, Typography } from "@mui/material";
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ColorFunctions from "../services/ColorFunctions";

function TrajectoryMap() {
    const { t } = useTranslation();
    const streamRest = useMemo(() => new StreamRest(), []);
    const wsClient = useRef(new WebSocketClient());

    const [streams, setStreams] = useState({});
    const [markerList, setMarkerList] = useState({});
    const [showMap, setShowMap] = useState(false);
    const [started, setStarted] = useState(false);
    const colorFunctions = useRef(new ColorFunctions());

    useEffect(() => {
        streamRest.getAvailableStreams().then(response => {
            const streams = response.data;
            const colors = colorFunctions.current.generateDistinctColors(Object.keys(response.data).length);
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
        setMarkerList(prevMarkerList => ({ ...prevMarkerList, [streamId]: newMarkers }));
    }

    function startStream() {
        wsClient.current.connect();
        setStarted(true);
    }

    function stopStream() {
        wsClient.current.disconnect();
        setStarted(false);
    }

    return (
        <>
            {showMap ? (
                <LiveMapView
                    streams={streams}
                    markerList={markerList}
                />
            ) : (
                <></>
            )}
            <Box sx={{
                position: 'fixed',
                top: 60,
                left: 10,
                width: '100%'
            }}>
                <Stack direction="row" spacing={5} width="fullWidth">
                    {!started ?
                        <IconButton size="large" color="primary" onClick={startStream}><PlayCircleFilledWhiteIcon /></IconButton> :
                        <IconButton size="large" color="error" onClick={stopStream}><StopCircleIcon /></IconButton>}
                    <Typography variant="h1">
                        {t('map.title')}
                    </Typography>                        
                </Stack>
            </Box>
        </>
    )
}

export default TrajectoryMap;
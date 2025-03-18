import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from 'react-i18next';
import StreamRest from "../services/StreamRest";
import WebSocketClient from "../services/WebSocketClient";
import LiveMapView from "./LiveMapView";
import { Box, Card, Fab, IconButton, Stack, Typography } from "@mui/material";
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
                right: 10
            }}>
                <Typography variant="h1">
                    {t('map.title')}
                </Typography>
            </Box>
            <Box sx={{
                position: 'fixed',
                bottom: 60,
                right: 10
            }}>
                <Fab color="primary">
                    {!started ?
                        <PlayCircleFilledWhiteIcon onClick={startStream} /> :
                        <StopCircleIcon onClick={stopStream} />}
                </Fab>
            </Box>
        </>
    )
}

export default TrajectoryMap;
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from 'react-i18next';
import StreamRest from "../services/StreamRest";
import WebSocketClient from "../services/WebSocketClient";
import { Box, Card, IconButton, Stack, Typography } from "@mui/material";
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';

function TrajectoryView() {
    const { t } = useTranslation();
    const streamRest = useMemo(() => new StreamRest(), []);
    const wsClient = useRef(new WebSocketClient());

    const [streams, setStreams] = useState({});
    const [markerList, setMarkerList] = useState({});
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        streamRest.getAvailableStreams().then(response => {
            const streams = response.data;
            setStreams(streams);
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
                        <Typography>TODO</Typography>
                    ) : (
                        <></>
                    )}
                </Box>
            </Stack>
        </>
    )
}

export default TrajectoryView;
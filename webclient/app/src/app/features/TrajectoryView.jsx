import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import StreamRest from "../services/StreamRest";
import WebSocketClient from "../services/WebSocketClient";
import LiveMapView from "./LiveMapView";
import { Box, Card, IconButton, Stack } from "@mui/material";
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';

function TrajectoryView() {
    const { t } = useTranslation();
    const streamRest = useMemo(() => new StreamRest(), []);
    const webSocketClient = useMemo(() => new WebSocketClient(), []);    

    const [streams, setStreams] = useState({});
    const [markerList, setMarkerList] = useState({});
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        streamRest.getAvailableStreams().then((response) => {
            setStreams(response.data);
            setShowMap(true);
        });
    }, []);

    useEffect(() => {
    }, [markerList]);    

    function startStream() {
        webSocketClient.setup(handleMessage, streams);
        webSocketClient.connect();
    }

    function stopStream() {
        webSocketClient.disconnect();
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
        let tmpMarkerList = {...markerList};
        console.log(markerList);
        tmpMarkerList[streamId] = newMarkers;
        setMarkerList(tmpMarkerList);
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

export default TrajectoryView;
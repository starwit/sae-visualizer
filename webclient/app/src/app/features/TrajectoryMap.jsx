import { DeckGL } from "@deck.gl/react";
import { MapView } from '@deck.gl/core';
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer } from "@deck.gl/layers";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';

import StreamRest from "../services/StreamRest";
import WebSocketClient from "../services/WebSocketClient";
import { Box, Card, IconButton, Stack } from "@mui/material";

function TrajectoryMap() {
    const { t } = useTranslation();
    const streamRest = useMemo(() => new StreamRest(), []);
    const webSocketClient = useMemo(() => new WebSocketClient(), []);

    const [streams, setStreams] = useState({});
    const [markerNorth, setMarkerNorth] = useState({});
    const [markerSouth, setMarkerSouth] = useState({});
    const [markerEast, setMarkerEast] = useState({});
    const [markerWest, setMarkerWest] = useState({});

    const INITIAL_VIEW_STATE = {
        longitude: 10.787001,     // Initial longitude (X coordinate)
        latitude: 52.424239,      // Initial latitude (Y coordinate)
        zoom: 19,            // Initial zoom level
        pitch: 0,           // No tilt
        bearing: 0          // No rotation
    };
    const MAP_VIEW = new MapView({ repeat: true });
    const layers = [
        createBaseMapLayer(),
        createIconLayer(markerNorth, "north", [100, 0, 100]),
        createIconLayer(markerSouth, "south", [190, 0, 0]),
        createIconLayer(markerEast, "east", [140, 0, 0]),
        createIconLayer(markerWest, "west", [0, 100, 100]),
    ];

    useEffect(() => {
        streamRest.getAvailableStreams().then((response) => {
            setStreams(response.data);
        });
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
        if (streamId === 'meckauer:north') {
            setMarkerNorth(newMarkers);
        }
        if (streamId === 'meckauer:south') {
            setMarkerSouth(newMarkers);
        }
        if (streamId === 'meckauer:east') {
            setMarkerEast(newMarkers);
        }
        if (streamId === 'meckauer:west') {
            setMarkerWest(newMarkers);
        }
    }

    function createBaseMapLayer() {
        return new TileLayer({
            data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            minZoom: 0,     // Minimum zoom level
            maxZoom: 19,    // Maximum zoom level
            tileSize: 256,  // Size of each map tile

            renderSubLayers: props => {
                // Get geographical boundaries of the current tile
                const {
                    bbox: { west, south, east, north }
                } = props.tile;

                return new BitmapLayer(props, {
                    data: null,
                    image: props.data,
                    bounds: [west, south, east, north]
                });
            }
        })
    }

    function createIconLayer(markerArray, streamId, color) {

        return new IconLayer({
            id: 'IconLayer-' + streamId,
            data: markerArray,

            getColor: d => color,
            getIcon: d => 'marker',
            getPosition: d => d.coordinates,
            getSize: 30,
            iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
            iconMapping: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
            pickable: true,
        });
    }

    function startStream() {
        webSocketClient.setup(handleMessage, streams);
        webSocketClient.connect();
    }

    function stopStream() {
        webSocketClient.disconnect();
    }

    return (
        <>
            <Stack direction="column" spacing={2}>
                <div>
                    <h1>{t('map.title')}</h1>
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
                    <DeckGL
                        layers={layers}               // Add map layers
                        views={MAP_VIEW}              // Add map view settings
                        initialViewState={INITIAL_VIEW_STATE}  // Set initial position
                        controller={{ dragRotate: false }}       // Disable rotation
                    />
                </Box>
            </Stack>
        </>
    );
}

export default TrajectoryMap;
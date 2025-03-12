import { DeckGL } from "@deck.gl/react";
import { MapView } from '@deck.gl/core';
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer } from "@deck.gl/layers";
import React, { useEffect, useMemo, useState } from "react";
import {useTranslation} from 'react-i18next';

import StreamRest from "../services/StreamRest";
import WebSocketClient from "../services/WebSocketClient";

function TrajectoryMap() {
    const {t} = useTranslation();
    const streamRest = useMemo(() => new StreamRest(), []);
    const [streams, setStreams] = useState([]);
    const [marker, setMarker] = useState({});
    const [layers, setLayers] = useState([]);

    // Set initial map position and zoom level
    const INITIAL_VIEW_STATE = { 
        longitude: 10.787001,     // Initial longitude (X coordinate)
        latitude: 52.424239,      // Initial latitude (Y coordinate)
        zoom: 19,            // Initial zoom level
        pitch: 0,           // No tilt
        bearing: 0          // No rotation
    };

    // Create map view settings - enable map repetition when scrolling horizontally
    const MAP_VIEW = new MapView({ repeat: true });

    useEffect(() => {
        streamRest.getAvailableStreams().then((response) => {
            setStreams(response.data);
            createIconLayerPerStream(response.data);
            const webSocketClient = new WebSocketClient(handleMessage, response.data);
            webSocketClient.connect(); 
        });
    }, []);

    function handleMessage(trackedObjectList, streamId) {
        let newMarkers = [];
        trackedObjectList.forEach(trackedObject => {
            if(trackedObject.hasGeoCoordinates) {
                let newEntry = {}
                newEntry.streamId = trackedObject.streamId;
                newEntry.id = trackedObject.objectId;
                newEntry.name = trackedObject.objectId + ' c' + trackedObject.classId;
                newEntry.class = trackedObject.classId;
                newEntry.timestamp = trackedObject.receiveTimestamp;
                newEntry.coordinates = [trackedObject.coordinates.longitude, trackedObject.coordinates.latitude];
                newMarkers.push(newEntry);
            } else {
            }            
        });
        marker[streamId] = newMarkers;
        setMarker(marker);
        console.log(layers);
    }

    function createIconLayerPerStream(streams) {        
        let layers = [
            createBaseMapLayer()
        ];        
        for (let stream of streams) {
            marker[stream] = [];
            setMarker(marker);
            layers.push(createIconLayer(stream));
        }
        setLayers(layers);
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

    function createIconLayer(streamId) {
        return new IconLayer({
            id: 'IconLayer-' + streamId,
            data: marker[streamId],

            getColor: d => [140, 0, 0],
            getIcon: d => 'marker',
            getPosition: d => d.coordinates,
            getSize: 30,
            iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
            iconMapping: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
            pickable: true,
        });
    }    

    return (
        <>
            <div>
                <h1>{t('map.title')}</h1>
            </div>
            <DeckGL
                layers={layers}               // Add map layers
                views={MAP_VIEW}              // Add map view settings
                initialViewState={INITIAL_VIEW_STATE}  // Set initial position
                controller={{ dragRotate: false }}       // Disable rotation
            />
        </>
    );
}

export default TrajectoryMap;
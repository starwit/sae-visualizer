import { DeckGL } from "@deck.gl/react";
import { MapView } from '@deck.gl/core';
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer } from "@deck.gl/layers";
import AlertRest from "../services/AlertRest";
import React, { useEffect, useMemo, useState } from "react";
import {useTranslation} from 'react-i18next';

import WebSocketClient from "../services/WebSocketClient";

function TrajectoryMap() {
    const {t} = useTranslation();
    const [marker, setMarker] = useState([]);

    // Set initial map position and zoom level
    const INITIAL_VIEW_STATE = { 
        longitude: 10.787001,     // Initial longitude (X coordinate)
        latitude: 52.424239,      // Initial latitude (Y coordinate)
        zoom: 19,            // Initial zoom level
        pitch: 0,           // No tilt
        bearing: 0          // No rotation
    };

    const layers = [
        createBaseMapLayer(),
        createIconLayer()
    ];

    // Create map view settings - enable map repetition when scrolling horizontally
    const MAP_VIEW = new MapView({ repeat: true });

    useEffect(() => {
        const webSocketClient = new WebSocketClient(handleMessage);
        webSocketClient.connect();
    }, []);

    function handleMessage(trackedObjectList) {
        let newMarkers = [];
        trackedObjectList.forEach(trackedObject => {
            if(trackedObject.hasGeoCoordinates) {
                let newEntry = {}
                newEntry.id = trackedObject.objectId;
                newEntry.name = trackedObject.objectId + ' c' + trackedObject.classId;
                newEntry.class = trackedObject.classId;
                newEntry.timestamp = trackedObject.receiveTimestamp;
                newEntry.coordinates = [trackedObject.coordinates.longitude, trackedObject.coordinates.latitude];
                //updateOrAddEntry(newEntry);
                newMarkers.push(newEntry);
            } else {
            }            
        });
        setMarker(newMarkers);
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

                // Create image layer for the tile
                return new BitmapLayer(props, {
                    data: null,
                    image: props.data,
                    bounds: [west, south, east, north]
                });
            }
        })
    }

    function createIconLayer() {
        return new IconLayer({
            id: 'IconLayer',
            data: marker,

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
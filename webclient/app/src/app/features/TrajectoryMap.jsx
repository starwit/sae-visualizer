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
    const [marker, setMarker] = useState({});
    const [markerNorth, setMarkerNorth] = useState({});
    const [markerSouth, setMarkerSouth] = useState({});
    const [markerEast, setMarkerEast] = useState({});
    const [markerWest, setMarkerWest] = useState({});

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

    const streams = ['meckauer:north','meckauer:south','meckauer:east','meckauer:west'];
    
    const layers = [
        createBaseMapLayer(),
        createIconLayer(markerNorth, "north"),
        createIconLayer(markerSouth, "south"),
        createIconLayer(markerEast, "east"),
        createIconLayer(markerWest, "west"),
    ];    

    useEffect(() => {
        const webSocketClient = new WebSocketClient(handleMessage, streams);
        webSocketClient.connect(); 
    }, []);

    function handleMessage(trackedObjectList, streamId) {
        let newMarkers = [];
        trackedObjectList.forEach(trackedObject => {
            if(trackedObject.hasGeoCoordinates) {
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
        if(streamId === 'meckauer:north') {
            setMarkerNorth(newMarkers);
        }
        if(streamId === 'meckauer:south') {
            setMarkerSouth(newMarkers);
        }
        if(streamId === 'meckauer:east') {
            setMarkerEast(newMarkers);
        }
        if(streamId === 'meckauer:west') {
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

    function createIconLayer(markerArray, streamId) {

        return new IconLayer({
            id: 'IconLayer-' + streamId,
            data: markerArray,

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
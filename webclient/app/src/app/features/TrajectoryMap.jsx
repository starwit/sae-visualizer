import { DeckGL } from "@deck.gl/react";
import { MapView } from '@deck.gl/core';
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer } from "@deck.gl/layers";
import AlertRest from "../services/AlertRest";
import { toast } from "react-toastify";
import React, { useEffect, useMemo, useState } from "react";
import {useTranslation} from 'react-i18next';

function TrajectoryMap() {
    const {t} = useTranslation();
    const alertRest = useMemo(() => new AlertRest(), []);
    const [alerts, setAlerts] = useState([]);
    const [marker, setMarker] = useState([]);

    // Set initial map position and zoom level
    const INITIAL_VIEW_STATE = {
        longitude: -86.13470,     // Initial longitude (X coordinate)
        latitude: 39.91,      // Initial latitude (Y coordinate)
        zoom: 10,            // Initial zoom level
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
        reloadAlerts();
        const interval = setInterval(reloadAlerts, 5000); // Update alle 5 Sekunden
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (alerts == null) {
            return;
        }
        alerts.forEach(alert => {
            toast.info(alert.name, {
                position: "top-left",
                style: { top: 100 },
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                onClose: deleteAlert(alert.name),
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                delay: 0,
                theme: "colored",
                type: "error"
            });
        });
    }, [alerts]);

    function reloadAlerts() {
        alertRest.findAllMarker().then(response => {
            if (response.data == null) {
                return;
            }
            let markers = response.data;
            alertRest.findAll().then(response => {
                if (response.data != null) {
                    setAlerts(response.data);
                }
                setMarker(markers);
            });
        });
    }

    function deleteAlert(name) {
        alertRest.delete(name);
    }

    // Define map layers
    function createBaseMapLayer() {
        // Creating base map layer using CartoDB light theme
        return new TileLayer({
            // URL for map tiles
            data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            minZoom: 0,     // Minimum zoom level
            maxZoom: 19,    // Maximum zoom level
            tileSize: 256,  // Size of each map tile

            // Function to render each map tile
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
import { DeckGL } from "@deck.gl/react";
import { MapView } from '@deck.gl/core';
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer } from "@deck.gl/layers";
import React, { useEffect, useMemo, useState } from "react";

function LiveMapView(props) {
    const { markerList, streams } = props;

    const INITIAL_VIEW_STATE = {
        longitude: 10.787001,     // Initial longitude (X coordinate)
        latitude: 52.424239,      // Initial latitude (Y coordinate)
        zoom: 19,            // Initial zoom level
        pitch: 0,           // No tilt
        bearing: 0          // No rotation
    };
    const MAP_VIEW = new MapView({ repeat: true });

    const layers = setupLayers();

    function setupLayers() {
        let layers = [
            createBaseMapLayer()
        ];
        for (let stream in streams) {
            let streamId = streams[stream];
            layers.push(createIconLayer(markerList[streamId], streamId, [100, 0, 100]));
        }
        return layers;
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

    return (
            <DeckGL
                layers={layers}               // Add map layers
                views={MAP_VIEW}              // Add map view settings
                initialViewState={INITIAL_VIEW_STATE}  // Set initial position
                controller={{ dragRotate: false }}       // Disable rotation
            />
    );
}

export default LiveMapView;
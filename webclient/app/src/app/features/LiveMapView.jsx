import { MapView } from '@deck.gl/core';
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer } from "@deck.gl/layers";
import { DeckGL } from "@deck.gl/react";
import { useState, useEffect } from "react";

function LiveMapView(props) {
    const { markerList, streams } = props;

    const [mapInitDone, setMapInitDone] = useState(false);

    const [initialViewState, setInitialViewState] = useState({
        longitude: 10.716988775029739,
        latitude: 52.41988232741599,
        zoom: 5,
        pitch: 0,
        bearing: 0
    });

    if (!mapInitDone && Object.keys(markerList).length > 0) {
        setInitialViewState({
            longitude: markerList[Object.keys(markerList)[0]][0].coordinates[0],
            latitude: markerList[Object.keys(markerList)[0]][0].coordinates[1],
            zoom: 17,
            pitch: 0,
            bearing: 0
        });
        setMapInitDone(true);
    }

    const MAP_VIEW = new MapView({ repeat: true });

    const layers = setupLayers();

    function setupLayers() {
        let layers = [
            createBaseMapLayer()
        ];

        for (let stream in streams) {
            let color = streams[stream]
            layers.push(createIconLayer(markerList[stream], stream, color));
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
                initialViewState={initialViewState}  // Set initial position
                controller={{ dragRotate: false }}       // Disable rotation
            />
    );
}

export default LiveMapView;
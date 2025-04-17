import { MapView, WebMercatorViewport } from '@deck.gl/core';
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer } from "@deck.gl/layers";
import { DeckGL } from "@deck.gl/react";
import { useState, useRef } from "react";

function findMax(arr) {
    return arr.reduce((a, b) => Math.max(a, b), -Infinity);
}

function findMin(arr) {
    return arr.reduce((a, b) => Math.min(a, b), Infinity);
}

function markerListToLatitudes(markerList) {
    return Object.keys(markerList).flatMap(stream => markerList[stream].map(m => m.coordinates[1]));
}

function markerListToLongitudes(markerList) {
    return Object.keys(markerList).flatMap(stream => markerList[stream].map(m => m.coordinates[0]));
}

function LiveMapView(props) {
    const { markerList, streams } = props;

    const minMaxCoords = useRef({
        minLat: Infinity, maxLat: -Infinity, minLon: Infinity, maxLon: -Infinity
    });
    const firstDataTime = useRef(null);
    
    const [mapInitDone, setMapInitDone] = useState(false);
    const [initialViewState, setInitialViewState] = useState({
        longitude: 10.716988775029739,
        latitude: 52.41988232741599,
        zoom: 5,
        pitch: 0,
        bearing: 0
    });

    if (!mapInitDone) {
        console.log('time since init:', Date.now() - firstDataTime.current);
        if (firstDataTime.current == null || Date.now() - firstDataTime.current < 1000) {
            console.log('Waiting for map to initialize');
            const longitudes = markerListToLongitudes(markerList);
            const latitudes = markerListToLatitudes(markerList);

            if (latitudes.length > 0 && firstDataTime.current == null) {
                firstDataTime.current = Date.now();
                console.log('First data received');
            }

            const minLat = findMin(latitudes);
            const maxLat = findMax(latitudes);
            const minLon = findMin(longitudes);
            const maxLon = findMax(longitudes);

            const currentMinMax = minMaxCoords.current;
            if (minLon < currentMinMax.minLon) currentMinMax.minLon = minLon;
            if (maxLon > currentMinMax.maxLon) currentMinMax.maxLon = maxLon;
            if (minLat < currentMinMax.minLat) currentMinMax.minLat = minLat;
            if (maxLat > currentMinMax.maxLat) currentMinMax.maxLat = maxLat;
        } else {
            console.log('Map initialized');
            const fitViewport = new WebMercatorViewport().fitBounds(
                [[minMaxCoords.current.minLon, minMaxCoords.current.minLat], [minMaxCoords.current.maxLon, minMaxCoords.current.maxLat]],
                {width: window.innerWidth, height: window.innerHeight, padding: Math.min(window.innerWidth, window.innerHeight) / 5, minExtent: 0.002}
            );
            setInitialViewState({
                longitude: fitViewport.longitude,
                latitude: fitViewport.latitude,
                zoom: fitViewport.zoom,
                pitch: 0,
                bearing: 0
            });
            setMapInitDone(true);
        }
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
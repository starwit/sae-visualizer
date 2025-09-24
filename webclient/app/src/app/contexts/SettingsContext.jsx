import React, { createContext, useState, useContext } from 'react';

// Default values
const DEFAULT_TRAJECTORY_DECAY = 120;
const DEFAULT_HEATMAP_EXPIRY = 60;
const DEFAULT_HEATMAP_RADIUS = 20;
const DEFAULT_HEATMAP_USE_COORDINATES = false;
const DEFAULT_HEATMAP_MIN_UPDATE_INTERVAL = 200; // in ms

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [trajectoryDecay, setTrajectoryDecay] = useState(DEFAULT_TRAJECTORY_DECAY);
    const [heatmapExpiry, setHeatmapExpiry] = useState(DEFAULT_HEATMAP_EXPIRY);
    const [heatmapRadius, setHeatmapRadius] = useState(DEFAULT_HEATMAP_RADIUS);
    const [heatmapUseCoordinates, setHeatmapUseCoordinates] = useState(DEFAULT_HEATMAP_USE_COORDINATES);
    const [heatmapMinUpdateInterval, setHeatmapMinUpdateInterval] = useState(DEFAULT_HEATMAP_MIN_UPDATE_INTERVAL);

    const value = {
        trajectoryDecay,
        setTrajectoryDecay,
        trajectoryDecayMs: trajectoryDecay * 1000,
        
        heatmapExpiry,
        setHeatmapExpiry,
        heatmapExpiryMs: heatmapExpiry * 1000,
        
        heatmapRadius,
        setHeatmapRadius,

        heatmapUseCoordinates,
        setHeatmapUseCoordinates,

        heatmapMinUpdateInterval,
        setHeatmapMinUpdateInterval,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;

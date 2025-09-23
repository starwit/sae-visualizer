import React, { createContext, useState, useContext } from 'react';

// Default values
const DEFAULT_TRAJECTORY_DECAY = 120; // 120 seconds = 120000 milliseconds
const DEFAULT_HEATMAP_EXPIRY = 60; // 60 seconds = 60000 milliseconds

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

    const value = {
        trajectoryDecay,
        setTrajectoryDecay,
        heatmapExpiry,
        setHeatmapExpiry,
        // Convert to milliseconds for components that need it
        trajectoryDecayMs: trajectoryDecay * 1000,
        heatmapExpiryMs: heatmapExpiry * 1000,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;

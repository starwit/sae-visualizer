import { Container, CssBaseline } from "@mui/material";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ErrorHandler from "./commons/errorHandler/ErrorHandler";
import HeatmapDrawer from "./commons/HeatmapDrawer";
import StarwitAppBar from "./commons/StarwitAppBar";
import StarwitFooter from "./commons/StarwitFooter";
import TrajectoryDrawer from "./commons/TrajectoryDrawer";
import { SettingsProvider } from "./contexts/SettingsContext";
import GridView from "./features/GridView";
import SingleView from "./features/SingleView";
import TrajectoryMap from "./features/TrajectoryMap";
import { useTranslation } from 'react-i18next';

function App() {
    const { t } = useTranslation();
    return (
        <React.Fragment>
            <ErrorHandler>
                <SettingsProvider>
                    <CssBaseline />
                    <StarwitAppBar />
                    <Container sx={{paddingTop: "4em"}}>
                        <Routes>
                            <Route index element={<Navigate to="/map" replace />} />
                            <Route path="/heatmap" element={<SingleView DrawerComponent={HeatmapDrawer} title={t('heatmap.title')} />} />
                            <Route path="/trajectory" element={<SingleView DrawerComponent={TrajectoryDrawer} title={t('trajectory.title')} />} />
                            <Route path="/grid" element={<GridView />} />
                            <Route path="/map" element={<TrajectoryMap />} />
                        </Routes>
                    </Container>
                    <StarwitFooter />
                </SettingsProvider>
            </ErrorHandler>
        </React.Fragment>
    );
}

export default App;

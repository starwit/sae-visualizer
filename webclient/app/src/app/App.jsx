import { Container, CssBaseline } from "@mui/material";
import React from "react";
import { Route, Routes } from "react-router-dom";
import ErrorHandler from "./commons/errorHandler/ErrorHandler";
import HeatmapDrawer from "./commons/HeatmapDrawer";
import StarwitAppBar from "./commons/StarwitAppBar";
import StarwitFooter from "./commons/StarwitFooter";
import TrajectoryDrawer from "./commons/TrajectoryDrawer";
import { SettingsProvider } from "./contexts/SettingsContext";
import GridView from "./features/GridView";
import SingleView from "./features/SingleView";
import TrajectoryMap from "./features/TrajectoryMap";

function App() {
    return (
        <React.Fragment>
            <ErrorHandler>
                <SettingsProvider>
                    <CssBaseline />
                    <StarwitAppBar />
                    <Container sx={{paddingTop: "4em"}}>
                        <Routes>
                            <Route path="/heatmap" element={<SingleView DrawerComponent={HeatmapDrawer} />} />
                            <Route path="/trajectory" element={<SingleView DrawerComponent={TrajectoryDrawer} />} />
                            <Route path="/grid" element={<GridView />} />
                            <Route path="/" element={<TrajectoryMap />} />
                        </Routes>
                    </Container>
                    <StarwitFooter />
                </SettingsProvider>
            </ErrorHandler>
        </React.Fragment>
    );
}

export default App;

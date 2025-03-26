import {Container} from "@mui/material";
import {CssBaseline} from "@mui/material";
import '@mui/material/styles/styled';
import React from "react";
import {Route, Routes} from "react-router-dom";
import StarwitAppBar from "./commons/StarwitAppBar";
import ErrorHandler from "./commons/errorHandler/ErrorHandler";
import StarwitFooter from "./commons/StarwitFooter";
import TrajectoryMap from "./features/TrajectoryMap"
import GridView from "./features/GridView"
import TrajectoryView from "./features/TrajectoryView"

function App() {
    return (
        <React.Fragment>
            <ErrorHandler>
                <CssBaseline />
                <StarwitAppBar />
                <Container sx={{paddingTop: "4em"}}>
                    <Routes>
                        <Route path="/trajectory" element={<TrajectoryView />} />
                        <Route path="/grid" element={<GridView />} />
                        <Route path="/" element={<TrajectoryMap />} />
                    </Routes>
                </Container>
                <StarwitFooter />
            </ErrorHandler>
        </React.Fragment>
    );
}

export default App;

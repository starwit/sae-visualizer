import {Container} from "@mui/material";
import {CssBaseline} from "@mui/material";
import '@mui/material/styles/styled';
import React from "react";
import {Route, Routes} from "react-router-dom";
import MyAppBar from "./commons/MyAppBar";
import ErrorHandler from "./commons/errorHandler/ErrorHandler";
import AlertFooter from "./commons/AlertFooter";
import TrajectoryMap from "./features/TrajectoryMap"
import TrajectoryView from "./features/TrajectoryView"

function App() {
    return (
        <React.Fragment>
            <ErrorHandler>
                <CssBaseline />
                <MyAppBar />
                <Container sx={{paddingTop: "4em"}}>
                    <Routes>
                        <Route path="/trajectory" element={<TrajectoryView />} />
                        <Route path="/" element={<TrajectoryMap />} />
                    </Routes>
                </Container>
                <AlertFooter />
            </ErrorHandler>
        </React.Fragment>
    );
}

export default App;

import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { Box, Fab, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import TrajectoryDrawer from "../commons/TrajectoryDrawer";
import StreamRest from "../services/StreamRest";

function TrajectoryView() {
    const { t } = useTranslation();
    const streamRest = useMemo(() => new StreamRest(), []);

    const [streams, setStreams] = useState([]);
    const [selectedStream, setSelectedStream] = useState("");

    const [running, setRunning] = useState(false);

    useEffect(() => {
        streamRest.getAvailableStreams().then(response => {
            setStreams(response.data);
            if (response.data && response.data.length > 0) {
                setSelectedStream(response.data[0]);
            }            
        });
    }, []);

    function toggleStream() {
        setRunning(!running);
    }

    const handleStreamSelectChange = (event) => {
        setSelectedStream(event.target.value);
    };


    console.log(`selectedStream: ${selectedStream}`);
    console.log(`running: ${running}`);

    return (
        <>
            <div style={{
                position: 'absolute', 
                display: 'grid',
                placeItems: 'center',
                height: '100vh',
                width: '100vw',
                top: 0,
                left: 0,
            }}> 
                <div style={{
                    position: 'relative', 
                    aspectRatio: '16/9', 
                    width: '100%', 
                    display: 'grid',
                }}>
                    <TrajectoryDrawer
                        key={selectedStream}
                        stream={selectedStream}
                        running={running}/>
                </div>
            </div>
            <Box sx={{
                position: 'fixed',
                top: 60,
                right: 10
            }}>
                <Typography variant="h1">
                    {t('trajectory.title')}
                </Typography>
            </Box>
            <Box sx={{
                position: 'fixed',
                top: 60,
                left: 10,
                width: '100%'
            }}>
                <Stack direction="row">
                    <FormControl sx={{ width: 350 }}>
                        <InputLabel id="stream-select">Stream</InputLabel>
                        <Select
                            labelId="stream-select"
                            id="stream-select-id"
                            value={selectedStream}
                            label="Stream"
                            onChange={handleStreamSelectChange}
                        >
                            {streams.map((stream) => (
                                <MenuItem key={stream} value={stream}>
                                    {stream}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Fab 
                        color="primary"
                        onClick={toggleStream}
                    >
                        {!running ?
                            <PlayCircleFilledWhiteIcon/> :
                            <StopCircleIcon/>}
                    </Fab>
                </Stack>
            </Box>
        </>
    )
}

export default TrajectoryView;
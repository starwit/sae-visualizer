import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from 'react-i18next';
import StreamRest from "../services/StreamRest";
import { Box, Card, Fab, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import TrajectoryDrawer from "../commons/TrajectoryDrawer";

function TrajectoryView() {
    const { t } = useTranslation();
    const streamRest = useMemo(() => new StreamRest(), []);

    const [streams, setStreams] = useState([]);
    const [selectedStreams, setSelectedStreams] = useState([]);

    const [running, setRunning] = useState(false);

    useEffect(() => {
        streamRest.getAvailableStreams().then(response => {
            setStreams(response.data);
        });
    }, []);

    // Reset tracked objects when stream is changed
    useEffect(() => {
        setRunning(false);
    }, [selectedStreams]);
    
    function toggleStream() {
        setRunning(!running);
    }

    const handleStreamSelectChange = (event) => {
        setSelectedStreams(event.target.value);
    };

    return (
        <>
            <div style={{
                position: 'absolute', 
                aspectRatio: '16/9', 
                width: '100%', 
                display: 'grid',
                gridTemplateRows: '1fr 1fr',
                gridTemplateColumns: '1fr 1fr',
                gridGap: '10px',
            }}>
                {selectedStreams.map(stream => (
                    <TrajectoryDrawer
                        key={stream}
                        stream={stream}
                        running={running}
                    />
                ))}
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
                    <FormControl sx={{ width: 500 }}>
                        <InputLabel id="stream-select">Stream</InputLabel>
                        <Select
                            labelId="stream-select"
                            id="stream-select-id"
                            value={selectedStreams}
                            label="Streams"
                            onChange={handleStreamSelectChange}
                            multiple={true}
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
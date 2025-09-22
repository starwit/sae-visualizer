import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { Box, Fab, FormControl, InputLabel, MenuItem, Select, Stack, Tooltip, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import StreamRest from "../services/StreamRest";

function SingleView(props) {
    const { DrawerComponent, title } = props;
    const { t } = useTranslation();
    const streamRest = useMemo(() => new StreamRest(), []);
    const fileInputRef = useRef(null);
    const containerRef = useRef(null);

    const [streams, setStreams] = useState([]);
    const [selectedStream, setSelectedStream] = useState("");
    const [running, setRunning] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState(null);

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

    function handleStreamSelectChange(event) {
        setSelectedStream(event.target.value);
    };

    function handleImageUploadClick() {
        fileInputRef.current.click();
    };

    function handleImageChange(event) {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setBackgroundImage(imageUrl);
        }
    };

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        }
    };

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
                <div 
                    ref={containerRef}
                    style={{
                        position: 'relative', 
                        aspectRatio: '16/9', 
                        width: '100%', 
                        height: 'auto',
                        display: 'grid',
                        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <DrawerComponent
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
                    {title}
                </Typography>
            </Box>
            <Box sx={{
                position: 'fixed',
                top: 60,
                left: 10,
                width: '100%'
            }}>
                <Stack direction="row" spacing={2}>
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
                            <PlayArrowIcon/> :
                            <StopIcon/>}
                    </Fab>
                    <Tooltip title="Upload background image">
                        <Fab 
                            color="secondary"
                            onClick={handleImageUploadClick}
                        >
                            <AddPhotoAlternateIcon/>
                        </Fab>
                    </Tooltip>
                    <Tooltip title="Enter fullscreen">
                        <Fab 
                            color="secondary"
                            onClick={toggleFullscreen}
                        >
                            <FullscreenIcon/>
                        </Fab>
                    </Tooltip>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </Stack>
            </Box>
        </>
    )
}

export default SingleView;
import React, { useState } from 'react';
import { 
    IconButton, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Tooltip
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';

function SettingsMenu() {
    const { t } = useTranslation();
    const { 
        trajectoryDecay, setTrajectoryDecay,
        heatmapExpiry, setHeatmapExpiry,
        heatmapRadius, setHeatmapRadius,
        heatmapUseCoordinates, setHeatmapUseCoordinates
    } = useSettings();
    
    const [openDialog, setOpenDialog] = useState(false);
    const [tempTrajectoryDecay, setTempTrajectoryDecay] = useState(trajectoryDecay);
    const [tempHeatmapExpiry, setTempHeatmapExpiry] = useState(heatmapExpiry);
    const [tempHeatmapRadius, setTempHeatmapRadius] = useState(heatmapRadius);
    const [tempHeatmapUseCoordinates, setTempHeatmapUseCoordinates] = useState(heatmapUseCoordinates);

    function handleOpenSettings() {
        setTempTrajectoryDecay(trajectoryDecay);
        setTempHeatmapExpiry(heatmapExpiry);
        setTempHeatmapRadius(heatmapRadius);
        setTempHeatmapUseCoordinates(heatmapUseCoordinates);
        setOpenDialog(true);
    };
    
    function handleCloseDialog() {
        setOpenDialog(false);
    };
    
    function handleSaveSettings() {
        setTrajectoryDecay(Number(tempTrajectoryDecay));
        setHeatmapExpiry(Number(tempHeatmapExpiry));
        setHeatmapRadius(Number(tempHeatmapRadius));
        setHeatmapUseCoordinates(tempHeatmapUseCoordinates);
        handleCloseDialog();
    };
    
    return (
        <>
            <Tooltip title={t('settings.tooltip')}>
                <IconButton
                    color="inherit"
                    onClick={handleOpenSettings}
                >
                    <SettingsIcon />
                </IconButton>
            </Tooltip>
            
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{t('settings.title')}</DialogTitle>
                <DialogContent sx={{ pb: 1 }}>
                    <Typography variant="h6" sx={{ mt: 0.5, mb: 0.25, fontSize: '1rem' }}>
                        {t('settings.trajectoryDecay')}
                    </Typography>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                        {t('settings.trajectoryDecayDescription')}
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('settings.seconds')}
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={tempTrajectoryDecay}
                        onChange={(e) => setTempTrajectoryDecay(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    
                    <Typography variant="h6" sx={{ mt: 1, mb: 0.25, fontSize: '1rem' }}>
                        {t('settings.heatmapExpiry')}
                    </Typography>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                        {t('settings.heatmapExpiryDescription')}
                    </Typography>
                    <TextField
                        margin="dense"
                        label={t('settings.seconds')}
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={tempHeatmapExpiry}
                        onChange={(e) => setTempHeatmapExpiry(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    
                    <Typography variant="h6" sx={{ mt: 1, mb: 0.25, fontSize: '1rem' }}>
                        Heatmap Radius
                    </Typography>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                        Set the radius of influence for each heatmap point (in pixels)
                    </Typography>
                    <TextField
                        margin="dense"
                        label="Pixels"
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={tempHeatmapRadius}
                        onChange={(e) => setTempHeatmapRadius(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    
                    <Typography variant="h6" sx={{ mt: 1, mb: 0.25, fontSize: '1rem' }}>
                        Heatmap Position Source
                    </Typography>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                        Choose whether to use real-world coordinates or pixel positions for the heatmap rendering.
                    </Typography>
                    <Button
                        variant={tempHeatmapUseCoordinates ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => setTempHeatmapUseCoordinates(true)}
                        sx={{ mr: 2 }}
                        size='small'
                    >
                        Coordinates
                    </Button>
                    <Button
                        variant={!tempHeatmapUseCoordinates ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => setTempHeatmapUseCoordinates(false)}
                        size='small'
                    >
                        Pixel Positions
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
                    <Button onClick={handleSaveSettings}>{t('common.save')}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default SettingsMenu;

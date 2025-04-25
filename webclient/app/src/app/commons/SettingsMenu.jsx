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
    const { trajectoryDecay, setTrajectoryDecay } = useSettings();
    
    const [openDialog, setOpenDialog] = useState(false);
    const [tempTrajectoryDecay, setTempTrajectoryDecay] = useState(trajectoryDecay);
    
    const handleOpenSettings = () => {
        setTempTrajectoryDecay(trajectoryDecay);
        setOpenDialog(true);
    };
    
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    
    const handleSaveSettings = () => {
        setTrajectoryDecay(Number(tempTrajectoryDecay));
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
                <DialogContent>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        {t('settings.trajectoryDecay')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {t('settings.trajectoryDecayDescription')}
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('settings.seconds')}
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={tempTrajectoryDecay}
                        onChange={(e) => setTempTrajectoryDecay(e.target.value)}
                    />
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

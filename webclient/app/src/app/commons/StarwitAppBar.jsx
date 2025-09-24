import BlurOnIcon from '@mui/icons-material/BlurOn';
import GridViewIcon from '@mui/icons-material/GridView';
import MapIcon from "@mui/icons-material/Map";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import {
    AppBar,
    Container,
    IconButton,
    Toolbar,
    Tooltip,
    Typography,
    Divider,
} from "@mui/material";

import { useTranslation } from 'react-i18next';
import general from "../assets/images/logo_color.png";
import SettingsMenu from './SettingsMenu';

function MyAppBar() {
    const { t } = useTranslation();
    const DynamicLogo = general;

    return (
        <>
            <Container>
                <AppBar color="secondary">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            href="./"
                            aria-label="menu"
                            sx={{ m: 0, p: 0, mr: 2 }}
                        >
                            <img src={DynamicLogo} height={40} alt="Alert Viewer" />
                        </IconButton>
                        <Typography variant="h1" component="div" sx={{ flexGrow: 1 }}>
                            {t('app.title')}
                        </Typography>
                        <Tooltip title={t('map.tooltip')}>
                            <IconButton
                                href="./#/map"
                                variant="outlined">
                                <MapIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('trajectory.tooltip')}>
                            <IconButton
                                href="./#/trajectory"
                                variant="outlined">
                                <TrendingUpIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('heatmap.tooltip')}>
                            <IconButton
                                href="./#/heatmap"
                                variant="outlined">
                                <BlurOnIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('grid.tooltip')}>
                            <IconButton
                                href="./#/grid"
                                variant="outlined">
                                <GridViewIcon />
                            </IconButton>
                        </Tooltip>
                        <Divider orientation='vertical' flexItem sx={{ m: "10px" }} />
                        <SettingsMenu />
                    </Toolbar>
                </AppBar>
            </Container>
        </>
    );
}

export default MyAppBar;
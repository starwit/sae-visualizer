import MapIcon from "@mui/icons-material/Map";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
    AppBar,
    Container,
    IconButton,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";

import React from "react";
import {useTranslation} from 'react-i18next';
import general from "../assets/images/logo_color.png";

function MyAppBar() {
    const {t} = useTranslation();
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
                            sx={{m: 0, p: 0, mr: 2}}
                        >
                            <img src={DynamicLogo} height={40} alt="Alert Viewer" />
                        </IconButton>
                        <Typography variant="h1" component="div" sx={{flexGrow: 1}}>
                            {t('app.title')}
                        </Typography>
                        <Tooltip title={t('map.tooltip')}>
                            <IconButton
                                onClick={() => {/*TODO*/}}

                                href="./"
                                variant="outlined">
                                <MapIcon />
                            </IconButton>
                        </Tooltip> 
                        <Tooltip title={t('trajectory.tooltip')}>
                            <IconButton
                                onClick={() => {/*TODO*/}}

                                href="./#/trajectory"
                                variant="outlined">
                                <TrendingUpIcon />
                            </IconButton>
                        </Tooltip>                                               
                    </Toolbar>
                </AppBar>
            </Container>
        </>
    );
}

export default MyAppBar;
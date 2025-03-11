import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import WebSocketClient from "../services/WebSocketClient";

function TrajectoryView() {
    const {t} = useTranslation();
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const webSocketClient = new WebSocketClient(handleMessage);
        webSocketClient.connect();
        setWs(webSocketClient);
    }, []);

    function handleMessage(message) {
        console.log(message);
    }

    return (
        <div>
            <h1>{t('trajectory.title')}</h1>
        </div>
    )
}

export default TrajectoryView;
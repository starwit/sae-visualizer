import React, {useEffect, useMemo, useState} from "react";
import {useTranslation} from 'react-i18next';


function TrajectoryView() {
    const {t} = useTranslation();

    return (
        <div>
            <h1>{t('trajectory.title')}</h1>
        </div>
    )
}

export default TrajectoryView;
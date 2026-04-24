"use client";

import React from 'react';
import { useDashboardLogic, DashboardProps } from './useDashboardLogic';
import DesktopUI from './components/DesktopUI';
import MobileUI from './components/MobileUI';

export default function Dashboard(props: DashboardProps) {
    const logic = useDashboardLogic(props);

    return props.isMobile ? <MobileUI logic={logic} /> : <DesktopUI logic={logic} />;
}
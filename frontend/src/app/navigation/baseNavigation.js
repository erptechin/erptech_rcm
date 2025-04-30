import { NAV_TYPE_ITEM, } from "constants/app.constant";
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import DualTableIcon from 'assets/dualicons/table.svg?react'

export const baseNavigation = [
    {
        id: 'dashboards',
        type: NAV_TYPE_ITEM,
        path: '/dashboards/home',
        title: 'Dashboards',
        transKey: 'nav.dashboards.dashboards',
        Icon: DashboardsIcon,
    },
    {
        id: 'masters',
        type: NAV_TYPE_ITEM,
        path: '/masters/region',
        title: 'masters',
        transKey: 'nav.masters.masters',
        Icon: DualTableIcon,
    }
]

import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import StatisticIcon from 'assets/nav-icons/statistic.svg?react'
import PeopleIcon from 'assets/nav-icons/people.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_DASHBOARDS = '/dashboards'

const path = (root, item) => `${root}${item}`;

export const dashboards = {
    id: 'dashboards',
    type: NAV_TYPE_ROOT,
    path: '/dashboards',
    title: 'Home',
    transKey: 'nav.dashboards.dashboards',
    Icon: DashboardsIcon,
    childs: [
        {
            id: 'dashboards.home',
            path: path(ROOT_DASHBOARDS, '/home'),
            type: NAV_TYPE_ITEM,
            title: 'Home',
            transKey: 'nav.dashboards.home',
            Icon: StatisticIcon,
        },
        {
            id: 'dashboards.charge-entry',
            path: path(ROOT_DASHBOARDS, '/charge-entry'),
            type: NAV_TYPE_ITEM,
            title: 'Case',
            transKey: 'nav.dashboards.charge-entry',
            Icon: PeopleIcon,
        },
    ]
}
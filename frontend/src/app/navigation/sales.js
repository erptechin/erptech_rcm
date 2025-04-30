import DualElementsIcon from 'assets/dualicons/elements.svg?react'
import StatisticIcon from 'assets/nav-icons/statistic.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_MASTERS = '/sales'

const path = (root, item) => `${root}${item}`;

export const sales = {
    id: 'sales',
    type: NAV_TYPE_ROOT,
    path: '/sales',
    title: 'sales',
    transKey: 'nav.sales.sales',
    Icon: DualElementsIcon,
    childs: [
        {
            id: 'sales.sales-order',
            path: path(ROOT_MASTERS, '/sales-order'),
            type: NAV_TYPE_ITEM,
            title: 'Sales Order',
            transKey: 'nav.sales.sales-order',
            Icon: StatisticIcon,
        },
    ]
}

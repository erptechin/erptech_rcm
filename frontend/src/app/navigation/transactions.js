import DualElementsIcon from 'assets/dualicons/elements.svg?react'
import StatisticIcon from 'assets/nav-icons/statistic.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_MASTERS = '/transactions'

const path = (root, item) => `${root}${item}`;

export const transactions = {
    id: 'transactions',
    type: NAV_TYPE_ROOT,
    path: '/transactions',
    title: 'transactions',
    transKey: 'nav.transactions.transactions',
    Icon: DualElementsIcon,
    childs: [
        {
            id: 'transactions.charge-entry',
            path: path(ROOT_MASTERS, '/charge-entry'),
            type: NAV_TYPE_ITEM,
            title: 'Charge Entry',
            transKey: 'nav.transactions.charge-entry',
            Icon: StatisticIcon,
        },
        {
            id: 'transactions.case',
            path: path(ROOT_MASTERS, '/case'),
            type: NAV_TYPE_ITEM,
            title: 'Case',
            transKey: 'nav.transactions.case',
            Icon: StatisticIcon,
        },
        {
            id: 'transactions.payment-details',
            path: path(ROOT_MASTERS, '/payment-details'),
            type: NAV_TYPE_ITEM,
            title: 'Payment Details',
            transKey: 'nav.transactions.payment-details',
            Icon: StatisticIcon,
        },
    ]
}

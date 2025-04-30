import DualTableIcon from 'assets/dualicons/table.svg?react'
import StatisticIcon from 'assets/nav-icons/statistic.svg?react'
import PeopleIcon from 'assets/nav-icons/people.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_MASTERS = '/case-master'

const path = (root, item) => `${root}${item}`;

export const caseMaster = {
    id: 'case-master',
    type: NAV_TYPE_ROOT,
    path: '/case-master',
    title: 'case-master',
    transKey: 'nav.case-master.case-master',
    Icon: DualTableIcon,
    childs: [
        {
            id: 'case-master.agency',
            path: path(ROOT_MASTERS, '/agency'),
            type: NAV_TYPE_ITEM,
            title: 'Agency',
            transKey: 'nav.case-master.agency',
            Icon: StatisticIcon,
        },
    ]
}

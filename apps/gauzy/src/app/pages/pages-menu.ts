import { NbMenuItem } from '@nebular/theme';

export const DEFAULT_MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: 'Income',
    icon: 'plus-circle-outline',
    link: '/pages/income',
  },
  {
    title: 'Expenses',
    icon: 'minus-circle-outline',
    link: '/pages/expenses',
  },
  {
    title: "Help",
    icon: 'question-mark-circle-outline',
    link: '/pages/help'
  },
  {
    title: "About",
    icon: 'droplet-outline',
    link: '/pages/about'
  }
];

export const ADMIN_MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Admin',
    group: true
  },
  {
    title: 'Employees',
    icon: 'people-outline',
    link: '/pages/employees',
  },
  {
    title: 'Organizations',
    icon: 'globe-outline',
    link: '/pages/organizations',
  },
  {
    title: 'Settings',
    // icon: '',
    children: [
      {
        title: 'General',
        link: '/pages/settings/general',
      }
    ]
  },
];

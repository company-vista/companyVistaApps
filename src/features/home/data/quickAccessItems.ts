export const quickAccessItems = [
  { id: 'companyProfile', title: 'Company Profile', icon: 'building-o', color: '#38bdf8' },
  { id: 'invoiceCenter', title: 'Invoice Center', icon: 'file-text-o', color: '#4f7cff' },
  { id: 'businessReports', title: 'Business Reports', icon: 'bar-chart', color: '#f59e0b' },
  { id: 'helpDesk', title: 'Help Desk', icon: 'comments-o', color: '#22c55e' },
  { id: 'federalFiling', title: 'Federal Filing', icon: 'file-text', color: '#B45309' },
];

export type QuickAccessItemId = (typeof quickAccessItems)[number]['id'];

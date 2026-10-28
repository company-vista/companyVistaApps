export const COMPLETED_STATUSES = [
  'active',
  'completed',
  'verified',
  'company registered',
  'setup completed',
  'delivered',
];

export const PENDING_STATUSES = [
  'pending',
  'under review',
  'in review',
  'payment pending',
  'formation in progress',
  'filed with state',
  'ein in progress',
  'bank account setup',
  'awaiting client approval',
];

export const PROBLEM_STATUSES = [
  'action required',
  'rejected',
  'inactive',
  'expired',
  'overdue',
];

export const SOURCE_LABELS = {
  admin: 'Added by admin',
  client_signup: 'Client signup',
  public_link: 'Public link',
};

export const TABS = ['overview', 'shareholders', 'documents', 'timeline'];

export const formatLabel = value => {
  const text = String(value || '').replace(/_/g, ' ').trim();
  if (!text) return '';
  return text.replace(/\b\w/g, char => char.toUpperCase());
};

export const formatDate = value => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${formatDate(value)} · ${date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export const getStatusTone = status => {
  const key = String(status || '').toLowerCase().replace(/_/g, ' ');
  if (COMPLETED_STATUSES.includes(key)) return 'green';
  if (PENDING_STATUSES.includes(key)) return 'amber';
  if (PROBLEM_STATUSES.includes(key)) return 'red';
  return 'blue';
};

const asComplianceObject = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return Object.keys(value).length ? value : null;
};

export const getFilingMeta = item => {
  if (!item) return { label: 'Not Set', tone: 'gray' };

  const status = String(item.status || '').toLowerCase().replace(/_/g, ' ');
  if (status === 'completed' || status === 'active') {
    return { label: 'Completed', tone: 'green' };
  }
  if (status === 'client managed' || status === 'client-managed') {
    return { label: 'Client-Managed', tone: 'gray' };
  }
  if (status === 'expiring soon' || status === 'expiring_soon') {
    return { label: 'Expiring Soon', tone: 'amber' };
  }
  if (status === 'overdue') return { label: 'Overdue', tone: 'red' };
  if (status === 'expired') return { label: 'Expired', tone: 'red' };
  if (status === 'pending' || status === 'inprocess') {
    return { label: 'Pending', tone: 'amber' };
  }
  return status
    ? { label: formatLabel(status), tone: 'gray' }
    : { label: 'Not Set', tone: 'gray' };
};

const formatDueLabel = item => {
  if (!item?.dueDate) return null;
  const date = new Date(item.dueDate);
  if (Number.isNaN(date.getTime())) {
    return `Due ${item.dueDate}`;
  }
  const isNextYear = date.getFullYear() > new Date().getFullYear();
  return `${isNextYear ? 'Due Next Year - ' : 'Due '}${formatDate(item.dueDate)}`;
};

export const getFilingSubtitle = item => {
  if (!item) return 'Not Set';
  const dueLabel = formatDueLabel(item);
  if (dueLabel) return dueLabel;
  if (item.applicableYear) return `Year ${item.applicableYear}`;
  const status = String(item.status || '').toLowerCase().replace(/_/g, ' ');
  if (['completed', 'active', 'client managed', 'client-managed'].includes(status)) {
    return 'N/A this year';
  }
  return 'Due Next Year - N/A this year';
};

export const getAddonSubtitle = item => {
  if (!item) return 'Not Set';
  return formatDueLabel(item) || 'Not Set';
};

export const getAgentAddressItem = compliance => {
  const resident = asComplianceObject(compliance?.resident) || {};
  const address =
    asComplianceObject(compliance?.Address) ||
    asComplianceObject(compliance?.address) ||
    {};

  if (!Object.keys(resident).length && !Object.keys(address).length) {
    return null;
  }

  return {
    ...address,
    ...resident,
    status: resident.status || address.status,
    dueDate: address.dueDate || resident.dueDate,
    lastDate: address.lastDate || resident.lastDate,
  };
};

export const getCoreComplianceItems = compliance => [
  {
    key: 'agentAddress',
    title: 'Registered Agent & Address',
    item: getAgentAddressItem(compliance),
  },
  {
    key: 'stateFiling',
    title: 'State Filing',
    item:
      asComplianceObject(compliance?.annualFiling) ||
      asComplianceObject(compliance?.stateFiling),
  },
  {
    key: 'federalFiling',
    title: 'Federal Filing',
    item:
      asComplianceObject(compliance?.federalTaxFiling) ||
      asComplianceObject(compliance?.federalFiling),
  },
];

export const getAddonComplianceItems = compliance => [
  {
    key: 'itin',
    title: 'ITIN Application',
    item:
      asComplianceObject(compliance?.itin) ||
      asComplianceObject(compliance?.itinApplication),
  },
  {
    key: 'personalTax',
    title: 'Personal Tax Filing',
    item:
      asComplianceObject(compliance?.personalTax) ||
      asComplianceObject(compliance?.personalTaxFiling) ||
      asComplianceObject(compliance?.personalFiling),
  },
  {
    key: 'eVerifyDuns',
    title: 'E-Verify & DUNS',
    item:
      asComplianceObject(compliance?.eVerifyDuns) ||
      asComplianceObject(compliance?.eVerify) ||
      asComplianceObject(compliance?.duns) ||
      asComplianceObject(compliance?.eVerifyAndDuns),
  },
];

export const getCompanyName = company =>
  company?.companyName ||
  company?.alternateCompanyName ||
  'Unnamed Company';

export const getCompanyLocation = company => {
  const parts = [company?.stateOfRegistration, company?.countryOfIncorporation]
    .filter(Boolean)
    .join(', ');
  return parts || 'Location not set';
};

export const getInitial = company => (getCompanyName(company)[0] || '?').toUpperCase();

const getShareholderClient = shareholder => {
  const client = shareholder?.clientId;
  return client && typeof client === 'object' ? client : null;
};

export const getShareholderName = shareholder => {
  const client = getShareholderClient(shareholder);
  if (!client) return 'Unnamed Shareholder';
  const fullName = [client.firstName, client.lastName]
    .filter(Boolean)
    .join(' ');
  return fullName || client.email || 'Unnamed Shareholder';
};

export const getShareholderEmail = shareholder => {
  const client = getShareholderClient(shareholder);
  return client?.email || '';
};

export const getShareholderPhone = shareholder => {
  const client = getShareholderClient(shareholder);
  if (!client?.phoneNumber) return '';
  return `${client.countryCode || ''}${client.phoneNumber}`;
};

export const getDocumentGroups = company => [
  {
    key: 'mailsAndLetters',
    title: 'Mails & Letters',
    items: company?.mailsAndLetters || [],
  },
  {
    key: 'registration',
    title: 'Registration Documents',
    items: company?.CompanyRegistrationDocuments || [],
  },
  {
    key: 'tax',
    title: 'Tax Files',
    items: company?.taxfiles || [],
  },
  {
    key: 'annual',
    title: 'Annual State Filings',
    items: company?.annualStateFilingDocuments || [],
  },
];

export const getDocumentCount = company =>
  getDocumentGroups(company).reduce(
    (total, group) => total + group.items.length,
    0,
  );

export const formatUsAddress = address => {
  if (!address) return '';
  return [
    address.street,
    address.suite,
    address.city,
    address.zip,
  ]
    .filter(Boolean)
    .join(', ');
};

export const buildTimeline = company => {
  const history = (company?.statusHistory || []).map((entry, index) => ({
    key: `history-${entry._id || index}-${entry.timestamp}`,
    status: entry.status,
    note: entry.notes || entry.rejectionReason || '',
    date: entry.timestamp,
    actor:
      entry.updatedBy?.name ||
      entry.updatedByClient?.firstName ||
      '',
  }));

  const updates = (company?.statusUpdates || []).map((entry, index) => ({
    key: `update-${entry._id || index}`,
    status: entry.status,
    note: entry.message || '',
    date: entry.updatedAt,
    actor:
      entry.updatedBy?.name ||
      entry.updatedByClient?.firstName ||
      '',
  }));

  return [...history, ...updates]
    .filter(entry => entry.status)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
};

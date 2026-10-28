const createShareholderId = () =>
  `sh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const COMPANY_TYPE_OPTIONS = [
  { label: 'LLC', value: 'LLC' },
  { label: 'C Corporation', value: 'C Corporation' },
  { label: 'S Corporation', value: 'S Corporation' },
  { label: 'Partnership', value: 'Partnership' },
  { label: 'Sole Proprietorship', value: 'Sole Proprietorship' },
  { label: 'Non-Profit', value: 'Non-Profit' },
  { label: 'Other', value: 'Other' },
];

export const OWNERSHIP_TYPE_OPTIONS = [
  { label: 'Individual', value: 'individual' },
  { label: 'Company / Entity', value: 'company' },
  { label: 'Trust', value: 'trust' },
  { label: 'Partnership', value: 'partnership' },
];

export const REGISTRATION_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Completed', value: 'completed' },
  { label: 'Action Required', value: 'action_required' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Inactive', value: 'inactive' },
];

export const DESIGNATION_OPTIONS = [
  { label: 'Shareholder', value: 'Shareholder' },
  { label: 'Director', value: 'Director' },
  { label: 'Authorized Representative', value: 'Authorized Representative' },
];

export const STEP_TITLES = [
  { key: 'details', title: 'Company Details', subtitle: 'Basic company info' },
  { key: 'business', title: 'Business Info', subtitle: 'Activity & tax details' },
  { key: 'people', title: 'Shareholders', subtitle: 'Owners & directors' },
];

const asObject = value =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export const normalizeShareholder = (shareholder = {}, index = 0) => {
  const client = asObject(shareholder.clientId);
  return {
    id: shareholder._id || client._id || `existing-${index}`,
    dbId: shareholder._id || client?._id || null,
    firstName: client.firstName || shareholder.firstName || '',
    lastName: client.lastName || shareholder.lastName || '',
    email: client.email || shareholder.email || '',
    sharePercentage:
      shareholder.sharePercentage != null
        ? String(shareholder.sharePercentage)
        : '',
    designation: shareholder.designation || 'Shareholder',
  };
};

export const createEmptyShareholder = () => ({
  id: createShareholderId(),
  dbId: null,
  firstName: '',
  lastName: '',
  email: '',
  sharePercentage: '',
  designation: 'Shareholder',
});

export const buildEditForm = company => {
  const usAddress = asObject(company?.usAddress);
  const localAddress = asObject(company?.localAddress);
  const address = asObject(company?.address);
  const shareholders = Array.isArray(company?.shareholders)
    ? company.shareholders
    : [];

  return {
    companyName: company?.companyName || '',
    countryOfIncorporation: company?.countryOfIncorporation || '',
    stateOfRegistration: company?.stateOfRegistration || '',
    addressLine1:
      usAddress.street ||
      localAddress.line1 ||
      address.addressLine1 ||
      company?.addressLine1 ||
      '',
    city: usAddress.city || localAddress.city || address.city || '',
    zipCode:
      usAddress.zip ||
      localAddress.postalCode ||
      address.zip ||
      address.postalCode ||
      '',
    companyType: company?.companyType || '',
    ownershipType: company?.ownershipType || '',
    registrationStatus: company?.registrationStatus || '',
    companyWebsite: company?.companyWebsite || '',
    principalActivity: company?.principalActivity || '',
    companyIntroduction: company?.companyIntroduction || '',
    incorporationDate: toDateInputValue(
      company?.registrationDate || company?.incorporationDate,
    ),
    Ein: company?.Ein || company?.ein || '',
    shareholders: shareholders.map(normalizeShareholder),
  };
};

export const buildUpdatePayload = (form, company) => {
  const usAddress = {
    ...asObject(company?.usAddress),
    street: form.addressLine1.trim(),
    city: form.city.trim(),
    zip: form.zipCode.trim(),
  };

  const payload = {
    companyName: form.companyName.trim(),
    countryOfIncorporation: form.countryOfIncorporation.trim(),
    stateOfRegistration: form.stateOfRegistration.trim(),
    companyType: form.companyType,
    ownershipType: form.ownershipType,
    registrationStatus: form.registrationStatus,
    usAddress,
    companyWebsite: form.companyWebsite.trim(),
    principalActivity: form.principalActivity.trim(),
    companyIntroduction: form.companyIntroduction.trim(),
    registrationDate: form.incorporationDate || null,
    Ein: form.Ein.trim(),
    shareholders: (Array.isArray(form.shareholders)
      ? form.shareholders
      : []
    )
      .filter(
        shareholder =>
          shareholder.firstName.trim() ||
          shareholder.lastName.trim() ||
          shareholder.email.trim(),
      )
      .map(shareholder => {
        const firstName = shareholder.firstName.trim();
        const lastName = shareholder.lastName.trim();
        const next = {
          firstName,
          lastName,
          name: [firstName, lastName].filter(Boolean).join(' '),
          email: shareholder.email.trim().toLowerCase(),
          sharePercentage: Number(shareholder.sharePercentage) || 0,
          designation: shareholder.designation,
        };
        if (shareholder.dbId) {
          next._id = shareholder.dbId;
        }
        return next;
      }),
  };

  if (company?.localAddress) {
    payload.localAddress = {
      ...asObject(company.localAddress),
      line1: form.addressLine1.trim(),
      city: form.city.trim(),
      postalCode: form.zipCode.trim(),
    };
  }

  return payload;
};

export const getShareholderName = shareholder =>
  [shareholder.firstName, shareholder.lastName]
    .map(part => (part || '').trim())
    .filter(Boolean)
    .join(' ') ||
  shareholder.email ||
  'New member';

export const getTotalSharePercentage = shareholders =>
  Math.round(
    shareholders.reduce(
      (total, shareholder) =>
        total + (Number(shareholder.sharePercentage) || 0),
      0,
    ) * 100,
  ) / 100;

export const isStepValid = (step, form) => {
  if (step === 0) {
    return Boolean(
      form.companyName.trim() &&
        form.countryOfIncorporation.trim() &&
        form.stateOfRegistration.trim(),
    );
  }
  return true;
};

function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

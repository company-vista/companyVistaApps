const avatarColors = [
    { avatarColor: '#dbeafe', initialsColor: '#2563eb' },
    { avatarColor: '#ede9fe', initialsColor: '#4f46e5' },
    { avatarColor: '#ffedd5', initialsColor: '#b45309' },
    { avatarColor: '#dcfce7', initialsColor: '#059669' },
    { avatarColor: '#fce7f3', initialsColor: '#be185d' },
];
const einKeys = [
    'Ein',
    'EIN',
    'ein',
    'einNumber',
    'taxId',
    'taxIdNumber',
    'federalTaxId',
];
const formationDateKeys = [
    'formationDate',
    'dateOfFormation',
    'dateOfIncorporation',
    'incorporationDate',
    'formedDate',
    'dateIncorporated',
    'incorporation',
    'filingDate',
];
const stateKeys = [
    'stateOfIncorporation',
    'stateOfRegistration',
    'formationState',
    'registeredState',
    'incorporationState',
    'stateOfFormation',
    'state',
];
function getCompanyName(company) {
    return (company.companyName ??
        company.businessName ??
        company.legalName ??
        company.name ??
        'Unnamed Company');
}
function getInitials(name) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    const firstTwo = words.length > 1 ? [words[0], words[1]] : [words[0] ?? 'C'];
    return firstTwo.map(word => word.charAt(0).toUpperCase()).join('');
}
function getCompanyStatus(company) {
    const status = company.status ?? company.registrationStatus ?? company.isActive;
    if (typeof status === 'boolean') {
        return status ? 'Active' : 'Inactive';
    }
    return String(status ?? 'active').toLowerCase() === 'inactive'
        ? 'Inactive'
        : 'Active';
}
function getCompanyType(company) {
    return (company.companyType ??
        company.businessType ??
        company.entityType ??
        company.type ??
        'Company type not added');
}
function findCompanyEin(value, depth = 0) {
    if (!value || typeof value !== 'object' || depth > 4 || Array.isArray(value)) {
        return '';
    }
    const record = value;
    for (const key of einKeys) {
        const fieldValue = record[key];
        if (typeof fieldValue === 'string' && fieldValue.trim()) {
            return fieldValue.trim();
        }
        if (typeof fieldValue === 'number') {
            return String(fieldValue);
        }
    }
    for (const nestedValue of Object.values(record)) {
        const nestedEin = findCompanyEin(nestedValue, depth + 1);
        if (nestedEin) {
            return nestedEin;
        }
    }
    return '';
}
function getCompanyEin(company) {
    return findCompanyEin(company) || 'XX-XXXXXXX';
}
function getCountryOfIncorporation(company) {
    return company.countryOfIncorporation ?? 'United States';
}
function formatCompanyDate(value) {
    if (!value) {
        return 'N/A';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'N/A';
    }
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}
function findField(value, keys, depth = 0) {
    if (!value || typeof value !== 'object' || depth > 4 || Array.isArray(value)) {
        return '';
    }
    const record = value;
    for (const key of keys) {
        const fieldValue = record[key];
        if (typeof fieldValue === 'string' && fieldValue.trim()) {
            return fieldValue.trim();
        }
        if (typeof fieldValue === 'number') {
            return String(fieldValue);
        }
    }
    for (const nestedValue of Object.values(record)) {
        const nestedField = findField(nestedValue, keys, depth + 1);
        if (nestedField) {
            return nestedField;
        }
    }
    return '';
}
function getFormationDate(company) {
    const raw = findField(company, formationDateKeys);
    return raw ? formatCompanyDate(raw) : 'N/A';
}
function getState(company) {
    const raw = findField(company, stateKeys);
    return raw || 'N/A';
}
export function mapCompanyToListItem(company, index) {
    const name = getCompanyName(company);
    const colors = avatarColors[index % avatarColors.length];
    return {
        id: company._id ?? company.id ?? `${name}-${index}`,
        initials: getInitials(name),
        name,
        companyType: getCompanyType(company),
        countryOfIncorporation: getCountryOfIncorporation(company),
        ein: getCompanyEin(company),
        status: getCompanyStatus(company),
        date: formatCompanyDate(company.createdAt ??
            company.created_at ??
            company.updatedAt ??
            company.updated_at),
        formationDate: getFormationDate(company),
        state: getState(company),
        ...colors,
    };
}

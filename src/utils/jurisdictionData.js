import { usStates } from '../features/auth/jurisdictionAdvisor/RegisterJurisdictionScreen';

// ---- Entity types (usStates.entityTypes) ke liye display metadata ----
// usStates entries me entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT']
export const ENTITY_META = {
  LLC: {
    key: 'LLC',
    id: 'LLC',
    chip: 'LLC',
    title: 'LLC',
    subtitle: 'Limited Liability Company',
    ending: 'LLC',
    icon: 'business',
    price: 299,
    description:
      'Simplest structure with full liability protection. Pass-through taxation — no double tax. Best for consultants, e-commerce & agencies.',
    tags: ['✓ 100% foreign owned', '✓ Pass-through tax', '✓ Minimal paperwork'],
    badge: 'Most popular',
    badgeType: 'green',
  },
  'C-CORP': {
    key: 'C-CORP',
    id: 'C-Corp',
    chip: 'C-Corp',
    title: 'C-Corporation',
    subtitle: 'Standard Corporation',
    ending: 'Inc.',
    icon: 'landmark',
    price: 399,
    description:
      'Required if you plan to raise venture capital or issue stock options. The structure every US investor expects.',
    tags: ['✓ VC-ready', '✓ Issue shares', '✓ Stock options'],
    badge: 'For startups',
    badgeType: 'blue',
  },
  'S-CORP': {
    key: 'S-CORP',
    id: 'S-Corp',
    chip: 'S-Corp',
    title: 'S-Corporation',
    subtitle: 'Small Business Corporation',
    ending: 'Inc.',
    icon: 'person',
    price: 399,
    description:
      'Tax-efficient for US residents drawing a salary. Not available to non-resident owners.',
    tags: ['✓ Self-employment savings', '⚠️ US residents only'],
    badge: null,
    badgeType: null,
  },
  NONPROFIT: {
    key: 'NONPROFIT',
    id: 'Nonprofit',
    chip: 'Nonprofit',
    title: 'Nonprofit',
    subtitle: 'Nonprofit Corporation',
    ending: 'Inc.',
    icon: 'heart',
    price: 399,
    description:
      'For mission-driven organisations. Requires tax-exempt status approval and specific governance rules.',
    tags: ['✓ Tax-exempt eligible', '⚠️ Extra IRS filings'],
    badge: null,
    badgeType: null,
  },
};

export const DEFAULT_ENTITY_TYPES = ['LLC', 'C-CORP', 'S-CORP'];

// State name ya code (e.g. 'Delaware' / 'DE') se usStates entry nikalo
export function getStateData(stateNameOrCode) {
  if (!stateNameOrCode) return null;
  const key = String(stateNameOrCode).trim().toLowerCase();
  return (
    usStates.find(
      (st) =>
        String(st.code || st.id).toLowerCase() === key ||
        String(st.name).toLowerCase() === key,
    ) || null
  );
}

// State ke entityTypes -> valid meta list (fallback default)
export function getEntityTypes(stateData) {
  const list =
    Array.isArray(stateData?.entityTypes) && stateData.entityTypes.length
      ? stateData.entityTypes
      : DEFAULT_ENTITY_TYPES;
  const filtered = list.filter((t) => ENTITY_META[t]);
  return filtered.length ? filtered : DEFAULT_ENTITY_TYPES;
}

export function getEntityMeta(entityKey) {
  return ENTITY_META[entityKey] || null;
}

export function getEntityByStructureId(structureId) {
  return (
    Object.values(ENTITY_META).find((m) => m.id === structureId) || null
  );
}

// ---- Package items (usStates.packageIncludes) ke liye display metadata ----
const PACKAGE_ITEM_META = {
  'name availability check': {
    iconLib: 'Feather',
    icon: 'search',
    description: 'Cleared before filing — no rejected applications',
    price: 75,
  },
  'registered address (1 year)': {
    iconLib: 'Feather',
    icon: 'home',
    description: 'Real street address, not a PO box. Mail scanned to your dashboard',
    price: 180,
  },
  'registered agent (1 year)': {
    iconLib: 'Feather',
    icon: 'user',
    description: 'Legally required — we accept service of process on your behalf',
    price: 199,
  },
  'ein application': {
    iconLib: 'Feather',
    icon: 'file-text',
    description: 'Federal Tax ID filed via Form SS-4. Required for banking and Stripe',
    price: 149,
    badge: 'NO SSN NEEDED',
  },
  'ein / tax id application': {
    iconLib: 'Feather',
    icon: 'file-text',
    description: 'Federal Tax ID filed via Form SS-4. Required for banking and Stripe',
    price: 149,
    badge: 'NO SSN NEEDED',
  },
  'bank account assistance': {
    iconLib: 'FontAwesome5',
    icon: 'university',
    description: 'Introductions to partner banks that accept non-residents',
    price: 137,
  },
};

export const DEFAULT_PACKAGE_INCLUDES = [
  'Name availability check',
  'Registered Address (1 year)',
  'Registered Agent (1 year)',
  'EIN application',
  'Bank account assistance',
];

// stateData.packageIncludes -> renderable items (icon + desc + free badge)
export function getPackageIncludes(stateData) {
  const labels =
    Array.isArray(stateData?.packageIncludes) && stateData.packageIncludes.length
      ? stateData.packageIncludes
      : DEFAULT_PACKAGE_INCLUDES;
  return labels.map((label) => {
    const meta = PACKAGE_ITEM_META[String(label).trim().toLowerCase()] || {};
    return {
      label,
      iconLib: meta.iconLib || 'Feather',
      icon: meta.icon || 'check-circle',
      description: meta.description || '',
      price: meta.price || 0,
      badge: meta.badge || null,
    };
  });
}

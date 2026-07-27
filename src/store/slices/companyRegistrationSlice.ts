import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type HoldingCompany = {
  legalName: string;
  country: string;
  registrationNo: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  addressCountry: string;
  ownershipPercent: string;
};

type AddressForm = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type DirectorShareholder = {
  firstName: string;
  lastName: string;
  roles: { shareholder: boolean; director: boolean; secretary: boolean; representative: boolean };
  ownership: string;
  dob: string;
  passport: string;
  email: string;
  countryCode: string;
  phone: string;
  address: AddressForm;
  passportFile: { name: string; uri: string } | null;
  addressProofFile: { name: string; uri: string } | null;
};

type CompanyRegistrationState = {
  // Step 1 - Applicant
  applicantType: 'owner' | 'representative' | 'partner';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Step 2 - Jurisdiction
  jurisdiction: string | null;
  jurisdictionName: string;

  // Step 3 - Entity Details
  stateOfIncorporation: string;
  entityType: string;
  companyName: string;
  alternateName: string;

  // Step 4 - Ownership
  ownershipType: 'individual' | 'company' | 'branch';
  holdingCompanies: HoldingCompany[];

  // Step 5 - Registered Address
  hasAddress: 'yes' | 'no' | null;
  localAddress: AddressForm;
  hasAgent: 'yes' | 'no' | null;
  agentDetails: { firstName: string; lastName: string; idNumber: string };
  agentAddress: AddressForm;

  // Step 6 - Directors & Shareholders
  directors: DirectorShareholder[];

  // Step 7 - Business
  website: string;
  establishReason: string;
  principalActivity: string;
  briefIntroduction: string;
  additionalInfo: string;

  // Step 8 - Additional Documents
  holdingFiles: { name: string; uri: string }[];
  otherFiles: { name: string; uri: string }[];
};

const initialState: CompanyRegistrationState = {
  applicantType: 'owner',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jurisdiction: null,
  jurisdictionName: '',
  stateOfIncorporation: '-- Select --',
  entityType: '-- Select --',
  companyName: '',
  alternateName: '',
  ownershipType: 'individual',
  holdingCompanies: [],
  hasAddress: null,
  localAddress: { line1: '', line2: '', city: '', state: '', postalCode: '', country: '' },
  hasAgent: null,
  agentDetails: { firstName: '', lastName: '', idNumber: '' },
  agentAddress: { line1: '', line2: '', city: '', state: '', postalCode: '', country: '' },
  directors: [],
  website: '',
  establishReason: '-- Select --',
  principalActivity: '-- Select --',
  briefIntroduction: '',
  additionalInfo: '',
  holdingFiles: [],
  otherFiles: [],
};

const companyRegistrationSlice = createSlice({
  name: 'companyRegistration',
  initialState,
  reducers: {
    setApplicantInfo(state, action: PayloadAction<{ applicantType: CompanyRegistrationState['applicantType']; firstName: string; lastName: string; email: string; phone: string }>) {
      state.applicantType = action.payload.applicantType;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
    },
    setJurisdiction(state, action: PayloadAction<{ code: string; name: string }>) {
      state.jurisdiction = action.payload.code;
      state.jurisdictionName = action.payload.name;
    },
    setEntityDetails(state, action: PayloadAction<{ stateOfIncorporation: string; entityType: string; companyName: string; alternateName: string }>) {
      state.stateOfIncorporation = action.payload.stateOfIncorporation;
      state.entityType = action.payload.entityType;
      state.companyName = action.payload.companyName;
      state.alternateName = action.payload.alternateName;
    },
    setOwnership(state, action: PayloadAction<{ ownershipType: CompanyRegistrationState['ownershipType']; holdingCompanies: HoldingCompany[] }>) {
      state.ownershipType = action.payload.ownershipType;
      state.holdingCompanies = action.payload.holdingCompanies;
    },
    setRegisteredAddress(state, action: PayloadAction<{ hasAddress: 'yes' | 'no' | null; localAddress: AddressForm; hasAgent: 'yes' | 'no' | null; agentDetails: { firstName: string; lastName: string; idNumber: string }; agentAddress: AddressForm }>) {
      state.hasAddress = action.payload.hasAddress;
      state.localAddress = action.payload.localAddress;
      state.hasAgent = action.payload.hasAgent;
      state.agentDetails = action.payload.agentDetails;
      state.agentAddress = action.payload.agentAddress;
    },
    setDirectors(state, action: PayloadAction<DirectorShareholder[]>) {
      state.directors = action.payload;
    },
    setBusinessInfo(state, action: PayloadAction<{ website: string; establishReason: string; principalActivity: string; briefIntroduction: string; additionalInfo: string }>) {
      state.website = action.payload.website;
      state.establishReason = action.payload.establishReason;
      state.principalActivity = action.payload.principalActivity;
      state.briefIntroduction = action.payload.briefIntroduction;
      state.additionalInfo = action.payload.additionalInfo;
    },
    setAdditionalDocuments(state, action: PayloadAction<{ holdingFiles: { name: string; uri: string }[]; otherFiles: { name: string; uri: string }[] }>) {
      state.holdingFiles = action.payload.holdingFiles;
      state.otherFiles = action.payload.otherFiles;
    },
    resetCompanyRegistration() {
      return initialState;
    },
    hydrateCompany(state, action: PayloadAction<Record<string, any>>) {
      const d = action.payload;
      if (d.applicantType) state.applicantType = d.applicantType;
      if (d.firstName) state.firstName = d.firstName;
      if (d.lastName) state.lastName = d.lastName;
      if (d.email) state.email = d.email;
      if (d.phone) state.phone = d.phone;
      if (d.jurisdiction || d.countryOfIncorporation) {
        state.jurisdiction = d.jurisdiction ?? null;
        state.jurisdictionName = d.jurisdictionName ?? d.countryOfIncorporation ?? '';
      }
      if (d.stateOfRegistration || d.stateOfIncorporation) {
        state.stateOfIncorporation = d.stateOfRegistration ?? d.stateOfIncorporation ?? '-- Select --';
      }
      if (d.companyType || d.entityType) {
        state.entityType = d.companyType ?? d.entityType ?? '-- Select --';
      }
      if (d.companyName) state.companyName = d.companyName;
      if (d.alternateCompanyName || d.alternateName) {
        state.alternateName = d.alternateCompanyName ?? d.alternateName ?? '';
      }
      if (d.ownershipType) state.ownershipType = d.ownershipType;
      if (Array.isArray(d.holdingCompanies)) state.holdingCompanies = d.holdingCompanies;
      if (d.hasLocalAddress !== undefined) {
        state.hasAddress = d.hasLocalAddress ? 'yes' : 'no';
      } else if (d.hasAddress) {
        state.hasAddress = d.hasAddress;
      }
      if (d.localAddress && typeof d.localAddress === 'object') {
        state.localAddress = { ...state.localAddress, ...d.localAddress };
      }
      if (d.hasLocalRepresentative !== undefined) {
        state.hasAgent = d.hasLocalRepresentative ? 'yes' : 'no';
      } else if (d.hasAgent) {
        state.hasAgent = d.hasAgent;
      }
      if (d.agentDetails && typeof d.agentDetails === 'object') {
        state.agentDetails = { ...state.agentDetails, ...d.agentDetails };
      }
      if (d.agentAddress && typeof d.agentAddress === 'object') {
        state.agentAddress = { ...state.agentAddress, ...d.agentAddress };
      }
      if (Array.isArray(d.directors)) state.directors = d.directors;
      if (d.companyWebsite || d.website) {
        state.website = d.companyWebsite ?? d.website ?? '';
      }
      if (d.establishReason) state.establishReason = d.establishReason;
      if (d.principalActivity) state.principalActivity = d.principalActivity;
      if (d.companyIntroduction || d.briefIntroduction) {
        state.briefIntroduction = d.companyIntroduction ?? d.briefIntroduction ?? '';
      }
      if (d.additionalInfo) state.additionalInfo = d.additionalInfo;
      if (Array.isArray(d.holdingFiles)) state.holdingFiles = d.holdingFiles;
      if (Array.isArray(d.otherFiles)) state.otherFiles = d.otherFiles;
    },
  },
});

export const {
  setApplicantInfo,
  setJurisdiction,
  setEntityDetails,
  setOwnership,
  setRegisteredAddress,
  setDirectors,
  setBusinessInfo,
  setAdditionalDocuments,
  resetCompanyRegistration,
  hydrateCompany,
} = companyRegistrationSlice.actions;

export default companyRegistrationSlice.reducer;

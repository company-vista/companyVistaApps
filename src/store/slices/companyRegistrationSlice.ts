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
} = companyRegistrationSlice.actions;

export default companyRegistrationSlice.reducer;

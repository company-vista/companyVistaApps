import { createSlice } from '@reduxjs/toolkit';
const initialState = {
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
        setApplicantInfo(state, action) {
            state.applicantType = action.payload.applicantType;
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.email = action.payload.email;
            state.phone = action.payload.phone;
        },
        setJurisdiction(state, action) {
            state.jurisdiction = action.payload.code;
            state.jurisdictionName = action.payload.name;
        },
        setEntityDetails(state, action) {
            state.stateOfIncorporation = action.payload.stateOfIncorporation;
            state.entityType = action.payload.entityType;
            state.companyName = action.payload.companyName;
            state.alternateName = action.payload.alternateName;
        },
        setOwnership(state, action) {
            state.ownershipType = action.payload.ownershipType;
            state.holdingCompanies = action.payload.holdingCompanies;
        },
        setRegisteredAddress(state, action) {
            state.hasAddress = action.payload.hasAddress;
            state.localAddress = action.payload.localAddress;
            state.hasAgent = action.payload.hasAgent;
            state.agentDetails = action.payload.agentDetails;
            state.agentAddress = action.payload.agentAddress;
        },
        setDirectors(state, action) {
            state.directors = action.payload;
        },
        setBusinessInfo(state, action) {
            state.website = action.payload.website;
            state.establishReason = action.payload.establishReason;
            state.principalActivity = action.payload.principalActivity;
            state.briefIntroduction = action.payload.briefIntroduction;
            state.additionalInfo = action.payload.additionalInfo;
        },
        setAdditionalDocuments(state, action) {
            state.holdingFiles = action.payload.holdingFiles;
            state.otherFiles = action.payload.otherFiles;
        },
        resetCompanyRegistration() {
            return initialState;
        },
        hydrateCompany(state, action) {
            const d = action.payload;
            if (d.applicantType)
                state.applicantType = d.applicantType;
            if (d.firstName)
                state.firstName = d.firstName;
            if (d.lastName)
                state.lastName = d.lastName;
            if (d.email)
                state.email = d.email;
            if (d.phone)
                state.phone = d.phone;
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
            if (d.companyName)
                state.companyName = d.companyName;
            if (d.alternateCompanyName || d.alternateName) {
                state.alternateName = d.alternateCompanyName ?? d.alternateName ?? '';
            }
            if (d.ownershipType)
                state.ownershipType = d.ownershipType;
            if (Array.isArray(d.holdingCompanies))
                state.holdingCompanies = d.holdingCompanies;
            if (d.hasLocalAddress !== undefined) {
                state.hasAddress = d.hasLocalAddress ? 'yes' : 'no';
            }
            else if (d.hasAddress) {
                state.hasAddress = d.hasAddress;
            }
            if (d.localAddress && typeof d.localAddress === 'object') {
                state.localAddress = { ...state.localAddress, ...d.localAddress };
            }
            if (d.hasLocalRepresentative !== undefined) {
                state.hasAgent = d.hasLocalRepresentative ? 'yes' : 'no';
            }
            else if (d.hasAgent) {
                state.hasAgent = d.hasAgent;
            }
            if (d.agentDetails && typeof d.agentDetails === 'object') {
                state.agentDetails = { ...state.agentDetails, ...d.agentDetails };
            }
            if (d.agentAddress && typeof d.agentAddress === 'object') {
                state.agentAddress = { ...state.agentAddress, ...d.agentAddress };
            }
            if (Array.isArray(d.directors))
                state.directors = d.directors;
            if (d.companyWebsite || d.website) {
                state.website = d.companyWebsite ?? d.website ?? '';
            }
            if (d.establishReason)
                state.establishReason = d.establishReason;
            if (d.principalActivity)
                state.principalActivity = d.principalActivity;
            if (d.companyIntroduction || d.briefIntroduction) {
                state.briefIntroduction = d.companyIntroduction ?? d.briefIntroduction ?? '';
            }
            if (d.additionalInfo)
                state.additionalInfo = d.additionalInfo;
            if (Array.isArray(d.holdingFiles))
                state.holdingFiles = d.holdingFiles;
            if (Array.isArray(d.otherFiles))
                state.otherFiles = d.otherFiles;
        },
    },
});
export const { setApplicantInfo, setJurisdiction, setEntityDetails, setOwnership, setRegisteredAddress, setDirectors, setBusinessInfo, setAdditionalDocuments, resetCompanyRegistration, hydrateCompany, } = companyRegistrationSlice.actions;
export default companyRegistrationSlice.reducer;

import React from 'react';
import { View } from 'react-native';
import {
  COMPANY_TYPE_OPTIONS,
  OWNERSHIP_TYPE_OPTIONS,
  REGISTRATION_STATUS_OPTIONS,
} from '../../utils/editCompanyForm';
import FormField from './FormField';
import FormSelect from './FormSelect';
import SectionCard from './SectionCard';
import { sharedStyles } from './editCompanyStyles';

const CompanyDetailsStep = ({ form, errors, onChange }) => (
  <>
    <SectionCard
      icon="business-outline"
      title="Company Identity"
      subtitle="Legal name and jurisdiction of the company">
      <FormField
        label="Company Name"
        value={form.companyName}
        onChangeText={value => onChange('companyName', value)}
        placeholder="e.g. Acme Holdings LLC"
        required
        error={errors.companyName}
        autoCapitalize="words"
      />
      <View style={sharedStyles.fieldRow}>
        <View style={sharedStyles.fieldHalf}>
          <FormField
            label="Country of Incorporation"
            value={form.countryOfIncorporation}
            onChangeText={value => onChange('countryOfIncorporation', value)}
            placeholder="e.g. United States"
            required
            error={errors.countryOfIncorporation}
          />
        </View>
        <View style={sharedStyles.fieldHalf}>
          <FormField
            label="State"
            value={form.stateOfRegistration}
            onChangeText={value => onChange('stateOfRegistration', value)}
            placeholder="e.g. Delaware"
            required
            error={errors.stateOfRegistration}
          />
        </View>
      </View>
      <View style={sharedStyles.fieldRow}>
        <View style={sharedStyles.fieldHalf}>
          <FormSelect
            label="Company Type"
            value={form.companyType}
            options={COMPANY_TYPE_OPTIONS}
            onChange={value => onChange('companyType', value)}
            placeholder="Select type"
          />
        </View>
        <View style={sharedStyles.fieldHalf}>
          <FormSelect
            label="Ownership Type"
            value={form.ownershipType}
            options={OWNERSHIP_TYPE_OPTIONS}
            onChange={value => onChange('ownershipType', value)}
            placeholder="Select ownership"
          />
        </View>
      </View>
      <FormSelect
        label="Registration Status"
        value={form.registrationStatus}
        options={REGISTRATION_STATUS_OPTIONS}
        onChange={value => onChange('registrationStatus', value)}
        placeholder="Select status"
      />
    </SectionCard>

    <SectionCard
      icon="location-outline"
      title="Registered Address"
      subtitle="Primary address on file for the company">
      <FormField
        label="Address"
        value={form.addressLine1}
        onChangeText={value => onChange('addressLine1', value)}
        placeholder="Street address, suite, unit"
        multiline
      />
      <View style={sharedStyles.fieldRow}>
        <View style={sharedStyles.fieldHalf}>
          <FormField
            label="City"
            value={form.city}
            onChangeText={value => onChange('city', value)}
            placeholder="City"
          />
        </View>
        <View style={sharedStyles.fieldHalf}>
          <FormField
            label="Zip Code"
            value={form.zipCode}
            onChangeText={value => onChange('zipCode', value)}
            placeholder="Zip / Postal code"
            keyboardType="numbers-and-punctuation"
            autoCapitalize="characters"
          />
        </View>
      </View>
    </SectionCard>
  </>
);

export default CompanyDetailsStep;

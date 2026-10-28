import React from 'react';
import { View } from 'react-native';
import FormField from './FormField';
import SectionCard from './SectionCard';
import { sharedStyles } from './editCompanyStyles';

const BusinessInfoStep = ({ form, errors, onChange }) => (
  <>
    <SectionCard
      icon="globe-outline"
      title="Online Presence"
      subtitle="Where clients and partners can find the company">
      <FormField
        label="Company Website"
        value={form.companyWebsite}
        onChangeText={value => onChange('companyWebsite', value)}
        placeholder="https://example.com"
        keyboardType="url"
        autoCapitalize="none"
        error={errors.companyWebsite}
      />
    </SectionCard>

    <SectionCard
      icon="briefcase-outline"
      title="Business Details"
      subtitle="What the company does and how it is positioned">
      <FormField
        label="Principal Business Activity"
        value={form.principalActivity}
        onChangeText={value => onChange('principalActivity', value)}
        placeholder="e.g. Software development and consulting"
      />
      <FormField
        label="Company Introduction"
        value={form.companyIntroduction}
        onChangeText={value => onChange('companyIntroduction', value)}
        placeholder="Short summary about the company"
        multiline
        helper="A brief overview shown to clients and admins."
      />
    </SectionCard>

    <SectionCard
      icon="document-text-outline"
      title="Incorporation & Tax"
      subtitle="Official registration and tax identifiers">
      <FormField
        label="Incorporation Date"
        value={form.incorporationDate}
        onChangeText={value => onChange('incorporationDate', value)}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        helper="Use the format YYYY-MM-DD."
      />
      <View style={sharedStyles.fieldRow}>
        <View style={sharedStyles.fieldHalf}>
          <FormField
            label="EIN"
            value={form.Ein}
            onChangeText={value => onChange('Ein', value)}
            placeholder="XX-XXXXXXX"
            keyboardType="numbers-and-punctuation"
            autoCapitalize="characters"
          />
        </View>
        <View style={sharedStyles.fieldHalf} />
      </View>
    </SectionCard>
  </>
);

export default BusinessInfoStep;

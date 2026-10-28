import React from 'react';
import { View } from 'react-native';
import { InfoCard, InfoRow } from './InfoCard';
import {
  SOURCE_LABELS,
  formatDate,
  formatLabel,
  formatUsAddress,
  getAgentAddressItem,
  getCompanyName,
  getDocumentCount,
  getFilingMeta,
} from '../utils/companyDetails';

const CompanyOverviewTab = ({ company, compliance }) => {
  const usAddress = formatUsAddress(company.usAddress);
  const shareholderCount = company.shareholders?.length || 0;
  const documentsCount = getDocumentCount(company);

  return (
    <View>
      <InfoCard title="Company Information">
        <InfoRow label="Legal name" value={getCompanyName(company)} />
        <InfoRow
          label="Alternate name"
          value={company.alternateCompanyName || '—'}
        />
        <InfoRow label="Company type" value={company.companyType || '—'} />
        <InfoRow
          label="Registration number"
          value={company.registrationNumber || '—'}
        />
        <InfoRow label="EIN" value={company.Ein || '—'} />
        <InfoRow label="GST" value={company.gst || '—'} />
        <InfoRow
          label="Country"
          value={company.countryOfIncorporation || '—'}
        />
        <InfoRow
          label="State"
          value={company.stateOfRegistration || '—'}
          isLast
        />
      </InfoCard>

      <InfoCard title="Business Information">
        <InfoRow
          label="Website"
          value={company.companyWebsite || '—'}
        />
        <InfoRow
          label="Principal activity"
          value={company.principalActivity || '—'}
        />
        <InfoRow
          label="Local address"
          value={company.hasLocalAddress ? 'Yes' : 'No'}
        />
        <InfoRow
          label="Local representative"
          value={company.hasLocalRepresentative ? 'Yes' : 'No'}
        />
        <InfoRow
          label="US address"
          value={usAddress || '—'}
          isLast={!company.companyIntroduction}
        />
        {company.companyIntroduction ? (
          <InfoRow
            label="Introduction"
            value={company.companyIntroduction}
            isLast
          />
        ) : null}
      </InfoCard>

      <InfoCard title="Registration">
        <InfoRow
          label="Status"
          value={formatLabel(company.registrationStatus || 'pending')}
        />
        <InfoRow
          label="Registration date"
          value={formatDate(company.registrationDate)}
        />
        <InfoRow
          label="Submitted"
          value={formatDate(company.submittedAt)}
        />
        <InfoRow
          label="Approved"
          value={formatDate(company.approvedAt)}
        />
        <InfoRow
          label="Source"
          value={SOURCE_LABELS[company.requestSource] || formatLabel(company.requestSource) || '—'}
        />
        <InfoRow
          label="Package"
          value={formatLabel(company.selectedPackage) || '—'}
        />
        <InfoRow
          label="Created by"
          value={
            company.createdBy?.name ||
            company.createdBy?.email ||
            '—'
          }
          isLast
        />
      </InfoCard>

      <InfoCard title="Compliance Summary">
        <InfoRow
          label="State filing"
          value={
            getFilingMeta(
              compliance?.annualFiling || compliance?.stateFiling,
            ).label
          }
        />
        <InfoRow
          label="Federal filing"
          value={getFilingMeta(compliance?.federalTaxFiling).label}
        />
        <InfoRow
          label="Registered agent"
          value={getFilingMeta(getAgentAddressItem(compliance)).label}
        />
        <InfoRow
          label="Shareholders"
          value={String(shareholderCount)}
        />
        <InfoRow
          label="Documents"
          value={String(documentsCount)}
          isLast
        />
      </InfoCard>
    </View>
  );
};

export default CompanyOverviewTab;

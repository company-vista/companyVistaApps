import TabPlaceholder from '../../components/TabPlaceholder';
import type { CompanyCardItem } from '../quickAccess/CompanyCard';

type RenewActionData = {
  id: 'address' | 'annual_filing' | 'resident' | 'federal_filing';
  title: string;
  subtitle: string;
  status: string;
  date: string;
  details: { label: string; value: string; icon?: string }[];
  companyId?: string | null;
  price?: number;
  years?: number;
};

type ReportsTabContentProps = {
  selectedCompany?: CompanyCardItem | null;
  onOpenRenewPage?: (action: RenewActionData) => void;
  onOpenComplianceHistory?: (action: RenewActionData) => void;
};

function ReportsTabContent({ selectedCompany, onOpenRenewPage, onOpenComplianceHistory }: ReportsTabContentProps) {
  return (
    <TabPlaceholder
      title="Compliances"
      icon="check-square-o"
      companyId={selectedCompany?.id}
      selectedCompanyName={selectedCompany?.name ?? null}
      onOpenRenewPage={onOpenRenewPage}
      onOpenComplianceHistory={onOpenComplianceHistory}
    />
  );
}

export default ReportsTabContent;

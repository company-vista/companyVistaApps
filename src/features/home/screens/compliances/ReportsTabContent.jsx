import TabPlaceholder from '../../components/TabPlaceholder';
function ReportsTabContent({ selectedCompany, onOpenRenewPage, onOpenComplianceHistory }) {
    return (<TabPlaceholder title="Compliances" icon="check-square-o" companyId={selectedCompany?.id} selectedCompanyName={selectedCompany?.name ?? null} onOpenRenewPage={onOpenRenewPage} onOpenComplianceHistory={onOpenComplianceHistory}/>);
}
export default ReportsTabContent;

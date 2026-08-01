import CompanyDetailScreen from './CompanyDetailScreen';
function CompanyTabContent({ onSectionPress, selectedCompany }) {
    return (<CompanyDetailScreen selectedCompany={selectedCompany} onSectionPress={onSectionPress}/>);
}
export default CompanyTabContent;

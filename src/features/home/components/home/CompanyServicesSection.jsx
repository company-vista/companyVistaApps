import { Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../../theme/colors';
import styles from './CompanyServicesSection.styles';
const services = [
    {
        title: 'Documents',
        icon: 'file-text-o',
        color: '#38bdf8',
    },
    {
        title: 'Compliance',
        icon: 'check-square-o',
        color: '#22c55e',
    },
    {
        title: 'Invoices',
        icon: 'credit-card',
        color: '#4f7cff',
    },
];
function CompanyServicesSection() {
    const colors = useThemeColors();
    return (<>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Company Services</Text>
      <View style={styles.servicesGrid}>
        {services.map(service => (<Pressable key={service.title} style={[
                styles.serviceCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <FontAwesome name={service.icon} size={24} color={service.color}/>
            <Text style={[styles.serviceTitle, { color: colors.text }]}>
              {service.title}
            </Text>
          </Pressable>))}
      </View>
    </>);
}
export default CompanyServicesSection;

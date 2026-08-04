import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors } from '../../../../theme/colors';
import { formatPrice, getCategoryServices } from '../../../../constants/exploreServicesData';
import { ServiceCard } from './ServicesCard';
const CATEGORY_NAME = 'Banking & Owner Services';
const SERVICES = getCategoryServices(CATEGORY_NAME);
function BankingOwnerScreen({ route }) {
    const navigation = useNavigation();
    const colors = useThemeColors();
    const safeAreaInsets = useSafeAreaInsets();
    const companyId = route.params?.companyId;
    return (<View style={[styles.screen, { paddingTop: safeAreaInsets.top + 16 }]}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()}/>
        <Text style={[styles.heading, { color: colors.text }]}>{CATEGORY_NAME}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(safeAreaInsets.bottom, 24) }}>
        <View style={styles.list}>
          {SERVICES.map((service) => (<ServiceCard key={service.name} title={service.name} price={formatPrice(service)} amount={service.price} companyId={companyId} description={service.description} service={service} onPayNow={() => { }}/>))}
        </View>
      </ScrollView>
    </View>);
}
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    heading: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 12,
    },
    list: {
        gap: 16,
    },
});
export default BankingOwnerScreen;

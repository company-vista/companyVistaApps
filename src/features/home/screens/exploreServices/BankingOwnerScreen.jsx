import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatPrice, getCategoryServices } from '../../../../constants/exploreServicesData';
import { ServiceCard } from './ServicesCard';
const CATEGORY_NAME = 'Banking & Owner Services';
const SERVICES = getCategoryServices(CATEGORY_NAME);
function BankingOwnerScreen({ route }) {
    const safeAreaInsets = useSafeAreaInsets();
    const companyId = route.params?.companyId;
    return (<View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: Math.max(safeAreaInsets.bottom, 24) }}>
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
    list: {
        gap: 16,
    },
});
export default BankingOwnerScreen;

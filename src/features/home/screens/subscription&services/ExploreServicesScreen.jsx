import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { getServiceCategories } from '../../../../constants/exploreServicesData';
const categoryItems = [
    {
        category: 'Tax & Accounting Services',
        icon: 'calculator',
        tone: 'amber',
    },
    {
        category: 'Business Compliance & Registrations',
        icon: 'briefcase',
        tone: 'blue',
    },
    {
        category: 'Banking & Owner Services',
        icon: 'university',
        tone: 'purple',
    },
    {
        category: 'Corporate Changes & Legal Documentation',
        icon: 'file-text-o',
        tone: 'red',
    },
];
const screenMap = {
    'Tax & Accounting Services': 'TaxAccounting',
    'Business Compliance & Registrations': 'BusinessCompliance',
    'Banking & Owner Services': 'BankingOwner',
    'Corporate Changes & Legal Documentation': 'CorporateChanges',
};
const toneStyles = {
    amber: { iconBg: '#FEF3C7', iconColor: '#B45309' },
    blue: { iconBg: '#DBEAFE', iconColor: '#1D4ED8' },
    purple: { iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    red: { iconBg: '#FEE2E2', iconColor: '#DC2626' },
};
function ExploreServicesScreen({ onBackPress, selectedCompany }) {
    const navigation = useNavigation();
    const colors = useThemeColors();
    const safeAreaInsets = useSafeAreaInsets();
    const categories = getServiceCategories();
    return (<View style={[styles.screen, { paddingTop: safeAreaInsets.top + 12 }]}>
      <View style={styles.header}>
        <BackButton onPress={onBackPress}/>
        <Text style={[styles.title, { color: colors.text }]}>Request a Services</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[
            styles.content,
            { paddingBottom: safeAreaInsets.bottom + 24 },
        ]}>
        {categories.map((category) => {
            const item = categoryItems.find((c) => c.category === category);
            const tone = toneStyles[item?.tone ?? 'blue'];
            const screen = screenMap[category];
            return (<Pressable key={category} disabled={!screen} onPress={() => {
                    if (screen) {
                        navigation.navigate(screen, { companyId: selectedCompany?.id });
                    }
                }} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: tone.iconBg }]}>
                <FontAwesome name={item?.icon ?? 'th-large'} size={20} color={tone.iconColor}/>
              </View>
              <View style={styles.contentSection}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{category}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Browse services & pricing</Text>
              </View>
              <FontAwesome name="angle-right" size={18} color={colors.muted}/>
            </Pressable>);
        })}
      </ScrollView>
    </View>);
}
const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    title: { fontSize: font.hero, fontWeight: '500' },
    content: { paddingHorizontal: 20 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
        gap: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentSection: { flex: 1 },
    cardTitle: { fontSize: font.lg, fontWeight: '600', marginBottom: 2 },
    cardSubtitle: { fontSize: font.sm },
});
export default ExploreServicesScreen;

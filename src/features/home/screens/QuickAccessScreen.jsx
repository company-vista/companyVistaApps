import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { quickAccessItems } from '../data/quickAccessItems';
import { useThemeColors } from '../../../theme/colors';
import { font } from '../../../theme/typography';
const quickAccessScreenMap = {
    companyProfile: 'CompanyProfile',
    invoiceCenter: 'InvoiceCenter',
    businessReports: 'BusinessReports',
    helpDesk: 'HelpDesk',
    federalFiling: 'FederalFiling',
};
function QuickAccessScreen() {
    const navigation = useNavigation();
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    return (<View style={[
            styles.screen,
            { paddingTop: safeAreaInsets.top + 22 },
        ]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surface }]}>
            <FontAwesome name="arrow-left" size={18} color={colors.text}/>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Quick Access</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(safeAreaInsets.bottom, 24) },
        ]}>
        <View style={styles.accessGrid}>
          {quickAccessItems.map(item => (<Pressable key={item.title} onPress={() => {
                const screenName = quickAccessScreenMap[item.id];
                if (screenName) {
                    navigation.navigate(screenName);
                }
            }} style={[
                styles.accessCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
              <FontAwesome name={item.icon} size={24} color={item.color}/>
              <Text style={[styles.accessTitle, { color: colors.text }]}>
                {item.title}
              </Text>
            </Pressable>))}
        </View>
      </ScrollView>
    </View>);
}
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#ffffff',
    },
    title: {
        color: '#111827',
        fontSize: font.hero,
        fontWeight: '500',
    },
    content: {
        paddingTop: 24,
    },
    accessGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
    },
    accessCard: {
        width: '47.8%',
        minHeight: 104,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        padding: 12,
    },
    accessTitle: {
        color: '#111827',
        fontSize: font.lg,
        fontWeight: '800',
        lineHeight: 19,
        marginTop: 9,
        textAlign: 'center',
    },
});
export default QuickAccessScreen;

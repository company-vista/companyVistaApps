import { StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
function PromotionCard() {
    const colors = useThemeColors();
    return (<>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Promotions</Text>
      <View style={styles.promoCard}>
        <View>
          <Text style={styles.promoTitle}>Stay ahead of deadlines</Text>
          <Text style={styles.promoText}>Check current company updates and reminders.</Text>
        </View>
        <FontAwesome name="ticket" size={34} color={themePalette.hex_ea580c}/>
      </View>
    </>);
}
const styles = makeThemeStyles(() => StyleSheet.create({
    sectionTitle: {
        color: themePalette.hex_111827,
        fontSize: font.heading,
        fontWeight: '600',
        marginTop: 32,
        marginBottom: 18,
    },
    promoCard: {
        minHeight: 88,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 14,
        backgroundColor: themePalette.hex_ffedd5,
        padding: 18,
    },
    promoTitle: {
        color: themePalette.hex_111827,
        fontSize: font.xxl,
        fontWeight: '800',
    },
    promoText: {
        color: themePalette.hex_6b7280,
        fontSize: font.md,
        marginTop: 5,
    },
}));
export default PromotionCard;

import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { quickAccessItems } from '../../data/quickAccessItems';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
function QuickAccessSection({ onItemPress, onViewAllPress, }) {
    const colors = useThemeColors();
    const visibleItems = quickAccessItems.slice(0, 4);
    return (<>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
      </View>
      <View style={styles.favouritesGrid}>
        {visibleItems.map(item => (<Pressable key={item.title} onPress={() => onItemPress(item.id)} style={[
                styles.favouriteCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '18' }]}>
              <FontAwesome name={item.icon} size={22} color={item.color}/>
            </View>
            <Text style={[styles.favouriteTitle, { color: colors.text }]}>
              {item.title}
            </Text>
          </Pressable>))}
      </View>
    </>);
}
const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 32,
        marginBottom: 18,
    },
    sectionTitle: {
        color: '#111827',
        fontSize: font.heading,
        fontWeight: '600',
    },
    viewAllButton: {
        minHeight: 34,
        justifyContent: 'center',
        borderRadius: 17,
        paddingHorizontal: 4,
    },
    viewAllText: {
        color: '#dc2626',
        fontSize: font.lg,
        fontWeight: '900',
    },
    favouritesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
    },
    favouriteCard: {
        width: '47.8%',
        minHeight: 92,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
    },
    iconCircle: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    favouriteTitle: {
        fontSize: font.md,
        fontWeight: '600',
        lineHeight: 18,
        marginTop: 8,
        textAlign: 'center',
    },
});
export default QuickAccessSection;

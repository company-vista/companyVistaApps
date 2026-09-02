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
              <FontAwesome name={item.icon} size={16} color={item.color}/>
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
        gap: 8,
        justifyContent: 'space-between',
    },
    favouriteCard: {
        width: '22.5%',
        minHeight: 70,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10,
        padding: 5,
    },
    iconCircle: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    favouriteTitle: {
        fontSize: 10,
        fontWeight: '600',
        lineHeight: 12,
        marginTop: 5,
        textAlign: 'center',
    },
});
export default QuickAccessSection;

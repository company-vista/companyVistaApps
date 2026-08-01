import { Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../../theme/colors';
import styles from './CompanyStatusFilters.styles';
function CompanyStatusFilters({ onChange, value }) {
    const colors = useThemeColors();
    return (<View style={styles.filterRow}>
      <Pressable onPress={() => onChange('All')} style={[
            styles.filterChip,
            value === 'All' ? styles.activeFilterChip : null,
            { backgroundColor: colors.surface, borderColor: colors.accentSoft },
        ]}>
        <FontAwesome name="users" size={16} color={value === 'All' ? '#2563eb' : colors.muted}/>
        <Text style={[
            styles.filterText,
            value === 'All' ? styles.activeFilterText : { color: colors.text },
        ]}>
          All Companies
        </Text>
      </Pressable>

      <Pressable onPress={() => onChange('Active')} style={[
            styles.filterChip,
            value === 'Active' ? styles.activeFilterChip : null,
            {
                backgroundColor: colors.surface,
                borderColor: value === 'Active' ? colors.accentSoft : colors.border,
            },
        ]}>
        <View style={[styles.statusDot, styles.activeStatusDot]}/>
        <Text style={[
            styles.filterText,
            value === 'Active' ? styles.activeFilterText : { color: colors.text },
        ]}>
          Active
        </Text>
      </Pressable>

      <Pressable onPress={() => onChange('Inactive')} style={[
            styles.filterChip,
            value === 'Inactive' ? styles.activeFilterChip : null,
            {
                backgroundColor: colors.surface,
                borderColor: value === 'Inactive' ? colors.accentSoft : colors.border,
            },
        ]}>
        <View style={[styles.statusDot, { backgroundColor: colors.subtle }]}/>
        <Text style={[
            styles.filterText,
            value === 'Inactive' ? styles.activeFilterText : { color: colors.text },
        ]}>
          Inactive
        </Text>
      </Pressable>
    </View>);
}
export default CompanyStatusFilters;

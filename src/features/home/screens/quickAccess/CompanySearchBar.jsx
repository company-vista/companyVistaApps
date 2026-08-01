import { Pressable, TextInput, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../../theme/colors';
import styles from './CompanySearchBar.styles';
function CompanySearchBar({ onChangeText, onClear, value, }) {
    const colors = useThemeColors();
    return (<View style={[
            styles.searchBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
      <FontAwesome name="search" size={17} color={colors.muted}/>
      <TextInput value={value} onChangeText={onChangeText} placeholder="Search companies by name or type..." placeholderTextColor={colors.muted} returnKeyType="search" style={[styles.searchInput, { color: colors.text }]}/>
      {value.length > 0 ? (<Pressable onPress={onClear} style={styles.clearSearchButton}>
          <FontAwesome name="times-circle" size={18} color={colors.muted}/>
        </Pressable>) : null}
    </View>);
}
export default CompanySearchBar;

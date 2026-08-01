import { ActivityIndicator, Text, View } from 'react-native';
import { useThemeColors } from '../../../../theme/colors';
import styles from './CompanyStateCard.styles';
function CompanyLoadingCard() {
    const colors = useThemeColors();
    return (<View style={[
            styles.emptyCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
      <ActivityIndicator size="small" color="#2563eb"/>
      <Text style={[styles.emptyText, { color: colors.muted }]}>
        Loading companies...
      </Text>
    </View>);
}
export default CompanyLoadingCard;

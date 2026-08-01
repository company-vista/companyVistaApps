import { Text, View } from 'react-native';
import { useThemeColors } from '../../../../theme/colors';
import styles from './CompanyStateCard.styles';
function CompanyEmptyCard({ message, title }) {
    const colors = useThemeColors();
    return (<View style={[
            styles.emptyCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.emptyText, { color: colors.muted }]}>
        {message}
      </Text>
    </View>);
}
export default CompanyEmptyCard;

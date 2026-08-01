import { Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../../theme/colors';
import styles from './CompanyErrorCard.styles';
function CompanyErrorCard({ error, onRetry }) {
    const colors = useThemeColors();
    return (<View style={[
            styles.emptyCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Unable to load companies
      </Text>
      <Text style={[styles.emptyText, { color: colors.muted }]}>
        {error}
      </Text>
      <Pressable onPress={onRetry} style={[styles.retryButton, { borderColor: colors.accentSoft }]}>
        <FontAwesome name="refresh" size={15} color="#2563eb"/>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>);
}
export default CompanyErrorCard;

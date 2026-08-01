import { Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../../theme/colors';
import styles from './CompanyCard.styles';
function CompanyCard({ client, onInvoicesPress, onPress }) {
    const colors = useThemeColors();
    return (<Pressable onPress={() => onPress?.(client)} style={[
            styles.clientCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
      <View style={[
            styles.avatar,
            { backgroundColor: client.avatarColor },
        ]}>
        <Text style={[styles.avatarText, { color: client.initialsColor }]}>
          {client.initials}
        </Text>
      </View>

      <View style={styles.clientCopy}>
        <Text style={[styles.clientName, { color: colors.text }]}>
          {client.name}
        </Text>
        <View style={styles.companyTypeRow}>
          <FontAwesome name="tag" size={12} color={colors.muted}/>
          <Text numberOfLines={1} style={[styles.clientMeta, { color: colors.muted }]}>
            <Text style={[styles.clientMetaLabel, { color: colors.text }]}>
              Type:
            </Text>{' '}
            {client.companyType}
          </Text>
        </View>
      </View>

      <View style={styles.clientSide}>
        <View style={styles.actionRow}>
          <View style={[
            styles.statusBadge,
            client.status === 'Active'
                ? styles.activeBadge
                : styles.inactiveBadge,
        ]}>
            <Text style={[
            styles.statusText,
            client.status === 'Active'
                ? styles.activeStatusText
                : styles.inactiveStatusText,
        ]}>
              {client.status}
            </Text>
          </View>
          <Pressable onPress={() => onInvoicesPress?.(client)} style={styles.invoiceButton}>
            <FontAwesome name="file-text-o" size={10} color="#2563eb"/>
            <Text style={styles.invoiceButtonText}>Invoices</Text>
            <FontAwesome name="angle-right" size={11} color="#2563eb"/>
          </Pressable>
        </View>
        <Text style={[styles.addedText, { color: colors.muted }]}>Added on</Text>
        <Text style={[styles.addedDate, { color: colors.muted }]}>
          {client.date}
        </Text>
      </View>
    </Pressable>);
}
export default CompanyCard;

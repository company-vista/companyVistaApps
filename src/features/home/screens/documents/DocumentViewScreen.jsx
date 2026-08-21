import { ScrollView, StatusBar, StyleSheet, Text, View, } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { capitalizeCompanyName } from '../../../../constants/convertFirstChar';
function formatBytes(bytes) {
    if (bytes === undefined || bytes === null)
        return '0 KB';
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function formatDate(dateString) {
    if (!dateString)
        return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
function getStyles(colors) {
    const isDark = colors.mode === 'dark';
    return StyleSheet.create({
        root: {
            backgroundColor: isDark ? colors.background : 'transparent',
            flex: 1,
        },
        header: {
            alignItems: 'center',
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            flexDirection: 'row',
            paddingBottom: 12,
            paddingHorizontal: 16,
            backgroundColor: colors.cardHighlight,
        },
        headerTitle: {
            color: colors.text,
            flex: 1,
            fontSize: font.xxl,
            fontWeight: '500',
            marginLeft: 12,
        },
        scrollContent: {
            padding: 16,
            gap: 16,
        },
        card: {
            backgroundColor: colors.cardHighlight,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            // elevation: 2,
        },
        topCard: {
            alignItems: 'center',
            paddingVertical: 24,
        },
        iconContainer: {
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: isDark ? 'rgba(255, 107, 129, 0.15)' : '#FFF0F3',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
        },
        filename: {
            fontSize: font.md,
            fontWeight: '400',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 8,
        },
        metaText: {
            fontSize: font.base,
            color: colors.subtle,
            textAlign: 'center',
        },
        sectionTitle: {
            fontSize: font.sm,
            fontWeight: '500',
            color: isDark ? colors.muted : '#164066',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 16,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        rowNoBorder: {
            borderBottomWidth: 0,
        },
        rowLabel: {
            fontSize: font.sm,
            color: colors.muted,
            flex: 1,
        },
        rowValue: {
            fontSize: font.sm,
            fontWeight: '500',
            color: colors.text,
            flex: 2,
            textAlign: 'right',
        },
        stackedRow: {
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        stackedLabel: {
            fontSize: font.sm,
            color: colors.muted,
            marginBottom: 4,
        },
        stackedValue: {
            fontSize: font.sm,
            color: colors.text,
        },
    });
}
function DocumentViewScreen({ documentItem, onBackPress }) {
    const colors = useThemeColors();
    const styles = getStyles(colors);
    const insets = useSafeAreaInsets();
    const fileSize = formatBytes(documentItem.fileSize);
    const uploadDate = formatDate(documentItem.uploadedAt);
    return (<View style={styles.root}>
        <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={styles.header.backgroundColor} />

        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <BackButton onPress={onBackPress} />
            <Text numberOfLines={1} style={styles.headerTitle}>Document Details</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Top Card */}
            <View style={[styles.card, styles.topCard]}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="file-text-o" size={32} color="#FF4D6D" />
                </View>
                <Text style={styles.filename}>{documentItem.originalFileName ?? documentItem.fileName ?? 'Document'}</Text>
                <Text style={styles.metaText}>
                    {documentItem.mimeType ?? 'Unknown Type'} • {fileSize}
                </Text>
            </View>

            {/* Document Information Card */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Document Information</Text>

                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Company Name</Text>
                    <Text style={styles.rowValue}>{capitalizeCompanyName(documentItem.companyName) ?? 'N/A'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Document Type</Text>
                    <Text style={styles.rowValue}>{documentItem.documentType ?? 'N/A'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Uploaded By</Text>
                    <Text style={styles.rowValue}>{documentItem.uploadedBy ?? 'N/A'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Upload Date</Text>
                    <Text style={styles.rowValue}>{uploadDate}</Text>
                </View>

                <View style={[styles.row, styles.rowNoBorder]}>
                    <Text style={styles.rowLabel}>Country</Text>
                    <Text style={styles.rowValue}>{documentItem.country ?? 'N/A'}</Text>
                </View>

                <View style={styles.stackedRow}>
                    <Text style={styles.stackedLabel}>Original File Name</Text>
                    <Text style={styles.stackedValue}>{documentItem.originalFileName ?? 'N/A'}</Text>
                </View>
            </View>

            {/* System Details Card */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>System Details</Text>

                <View style={[styles.row, styles.rowNoBorder]}>
                    <Text style={styles.rowLabel}>Source Group</Text>
                    <Text style={styles.rowValue}>{documentItem.sourceGroup ?? 'N/A'}</Text>
                </View>

                <View style={styles.stackedRow}>
                    <Text style={styles.stackedLabel}>Company ID</Text>
                    <Text style={[styles.stackedValue, { color: colors.muted, fontSize: font.base }]}>
                        {documentItem.companyId ?? 'N/A'}
                    </Text>
                </View>
            </View>
        </ScrollView>
    </View>);
}
export default DocumentViewScreen;

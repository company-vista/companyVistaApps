import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../theme/colors';
import { useAppSelector } from '../../../store/hooks';
import type { CompanyCardItem } from './quickAccess/CompanyCard';
import BackButton from '../../../components/buttons/BackButton';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { font } from '../../../theme/typography';
import BasicInfoScreen from './changeCategories/BasicInfoScreen';
import MyRequestsScreen from './changeCategories/MyRequestsScreen';

type ManageCompanyScreenProps = {
  selectedCompany: CompanyCardItem | null;
  onBackPress: () => void;
};

type UrgencyLevel = 'low' | 'medium' | 'high';
type ChangeCategory =
  | 'basic'
  | 'shareholder-director'
  | 'local-address'
  | 'local-representative';

interface CategoryOption {
  id: ChangeCategory;
  label: string;
  fields: number;
  description: string;
  icon: string;
  color: string;
}

interface ChangeType {
  id: UrgencyLevel;
  label: string;
  icon: string;
  color: string;
}

const categories: CategoryOption[] = [
  {
    id: 'basic',
    label: 'Company info',
    fields: 4,
    description: 'Company name, date',
    icon: 'file-text',
    color: '#4F46E5',
  },
  {
    id: 'shareholder-director',
    label: 'ShareHolder/Director',
    fields: 11,
    description: 'List, term, change leads',
    icon: 'percent',
    color: '#3B82F6',
  },
  {
    id: 'local-address',
    label: 'Local address',
    fields: 1,
    description: 'Resources, uplift',
    icon: 'address-book',
    color: '#F97316',
  },
  {
    id: 'local-representative',
    label: 'Local representative',
    fields: 1,
    description: 'End-on, change',
    icon: 'calendar',
    color: '#10B981',
  },
];

const urgencyLevels: ChangeType[] = [
  { id: 'low', label: 'low', icon: 'circle', color: '#22C55E' },
  { id: 'medium', label: 'medium', icon: 'circle', color: '#F59E0B' },
  { id: 'high', label: 'high', icon: 'circle', color: '#EF4444' },
];

const ManageCompanyScreen: React.FC<ManageCompanyScreenProps> = ({
  selectedCompany,
  onBackPress,
}) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const user = useAppSelector(state => state.auth.user);


  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel>('low');
  const [selectedCategories, setSelectedCategories] = useState<
    ChangeCategory[]
  >([]);
  const [openCategoryScreen, setOpenCategoryScreen] =
    useState<ChangeCategory | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const toggleCategory = (categoryId: ChangeCategory) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleCategoryPress = (categoryId: ChangeCategory) => {
    setOpenCategoryScreen(categoryId);
  };

  const handleCloseCategoryScreen = () => {
    setOpenCategoryScreen(null);
  };

  // If a category screen is open, render it
 if (openCategoryScreen) {
    const companyData = selectedCompany as any;
    const userData = user as any;
    const selectedCat = categories.find(c => c.id === openCategoryScreen);

    const companyClientId = companyData?.shareholders?.[0]?.clientId || userData?._id || userData?.id || "";
    const finalCompanyId = companyData?.id || companyData?._id || "";

    return (
      <BasicInfoScreen 
        onBackPress={handleCloseCategoryScreen} 
        companyId={finalCompanyId}
        clientId={companyClientId}
        urgency={selectedUrgency}
        selectedCategory={selectedCat?.label || openCategoryScreen}
      />
    );
  }
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar
        barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* --- HEADER --- */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <BackButton onPress={onBackPress} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Request changes
          </Text>
        </View>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() ?? 'A'}
            </Text>
          </View>
          <Text
            style={[styles.profileEmail, { color: colors.muted }]}
            numberOfLines={1}
          >
            {user?.email?.split('@')[0] ?? 'User'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
    
        <View>
          <View style={styles.stepHeader}>
            <Text style={[styles.stepLabel, { color: colors.muted }]}>
              Submit changes for{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>
                {selectedCompany?.name ?? 'Company'}
              </Text>
            </Text>
          </View>

          {/* Urgency Level Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Urgency level
            </Text>
            <View style={styles.urgencyGrid}>
              {urgencyLevels.map(level => (
                <Pressable
                  key={level.id}
                  onPress={() => setSelectedUrgency(level.id)}
                  style={[
                    styles.urgencyButton,
                    {
                      backgroundColor:
                        selectedUrgency === level.id
                          ? level.color + '20'
                          : colors.surface,
                      borderColor:
                        selectedUrgency === level.id
                          ? level.color
                          : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.urgencyDot,
                      { backgroundColor: level.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.urgencyLabel,
                      {
                        color:
                          selectedUrgency === level.id
                            ? level.color
                            : colors.text,
                      },
                    ]}
                  >
                    {level.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Change Categories Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Select Types
            </Text>
            <View style={styles.categoriesGrid}>
              {categories.map(category => (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    toggleCategory(category.id);
                    handleCategoryPress(category.id);
                  }}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: selectedCategories.includes(category.id)
                        ? category.color + '15'
                        : colors.surface,
                      borderColor: selectedCategories.includes(category.id)
                        ? category.color
                        : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: category.color + '20' },
                    ]}
                  >
                    <FontAwesome
                      name={category.icon as any}
                      size={18}
                      color={category.color}
                    />
                  </View>
                  <Text style={[styles.categoryTitle, { color: colors.text }]}>
                    {category.label}
                  </Text>
                  <Text
                    style={[styles.categoryFields, { color: colors.muted }]}
                  >
                    {category.fields} fields
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Share Transfer Form Section */}
          <View>
            {/* Share Transfer Form Section */}
            {/* <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Share transfer
              </Text>
            </View> */}

            {/* Live Inquiry Feedback */}
            <View
              style={[
                styles.feedbackBox,
                {
                  backgroundColor: colors.primary + '15',
                  borderColor: colors.primary,
                },
              ]}
            >
              <View style={styles.feedbackIcon}>
                <FontAwesome
                  name="lightbulb-o"
                  size={16}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.feedbackTitle, { color: colors.primary }]}>
                  Live inquiry feedback
                </Text>
                <Text style={[styles.feedbackText, { color: colors.muted }]}>
                  Selection logic: Transferring shares will automatically flag
                  'Owner list update' as an associated field for review.
                </Text>
              </View>
            </View>

            {/* Live Request Timeline */}
            <View style={styles.section}>
              <View style={styles.timelineHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Live request timeline
                </Text>
                <Pressable
                  style={[styles.refreshBtn, { borderColor: colors.primary }]}
                  onPress={() => setRefreshKey(k => k + 1)}
                >
                  <FontAwesome
                    name="refresh"
                    size={12}
                    color={colors.primary}
                  />
                  <Text style={[styles.refreshText, { color: colors.primary }]}>
                    Refresh
                  </Text>
                </Pressable>
              </View>

              <Text style={[styles.timelineNote, { color: colors.muted }]}>
                Each card shows exactly where your request stands.
              </Text>

              <MyRequestsScreen companyId={selectedCompany?.id} refreshKey={refreshKey} />
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default ManageCompanyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 8,
    borderBottomWidth: 1,
    gap: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: font.xl,
    fontWeight: '700',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: font.sm,
  },
  profileEmail: {
    fontSize: font.sm,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  stepHeader: {
    marginBottom: 20,
  },
  stepLabel: {
    fontSize: font.lg,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'none',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backLinkText: {
    fontSize: font.base,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: font.lg,
    fontWeight: '600',
    marginBottom: 12,
  },
  urgencyGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  urgencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgencyLabel: {
    fontSize: font.base,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryCard: {
    width: '23%',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 7,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 26,
    height: 26,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: font.xs,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  categoryFields: {
    fontSize: font.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: font.lg,
    fontWeight: '600',
  },
  selectedList: {
    gap: 10,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  selectedItemName: {
    fontSize: font.md,
    fontWeight: '600',
  },
  selectedItemMeta: {
    fontSize: font.sm,
    marginTop: 2,
  },
  fieldsList: {
    gap: 10,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: font.md,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: font.lg,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: font.sm,
    fontWeight: '600',
    marginBottom: 6,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: font.base,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: font.base,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: font.base,
    fontWeight: '500',
  },
  feedbackBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  feedbackIcon: {
    marginTop: 2,
  },
  feedbackTitle: {
    fontSize: font.base,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: font.sm,
    lineHeight: 15,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  refreshText: {
    fontSize: font.sm,
    fontWeight: '600',
  },
  timelineNote: {
    fontSize: font.sm,
    marginBottom: 12,
    lineHeight: 15,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
  },
  badgeText: {
    fontSize: font.sm,
    fontWeight: '600',
  },
  timelineItems: {
    gap: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  itemName: {
    fontSize: font.base,
    fontWeight: '600',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: font.sm,
    fontWeight: '600',
  },
  auditNote: {
    fontSize: font.sm,
    marginBottom: 12,
    lineHeight: 15,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 12,
  },
  auditTitle: {
    fontSize: font.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  auditDesc: {
    fontSize: font.sm,
  },
  auditFooter: {
    fontSize: font.sm,
    lineHeight: 14,
  },
});

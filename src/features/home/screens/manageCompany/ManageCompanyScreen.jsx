import React, { useState } from 'react';
import { ScrollView, StatusBar, Text, View, Pressable, } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { styles } from "./ManageCompanyScreenStyle";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../../theme/colors';
import { useAppSelector } from '../../../../store/hooks';
import BackButton from '../../../../components/buttons/BackButton';
import BasicInfoScreen from '../changeCategories/BasicInfoScreen';
import MyRequestsScreen from '../changeCategories/MyRequestsScreen';
const categories = [
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
const urgencyLevels = [
    { id: 'low', label: 'low', icon: 'circle', color: '#22C55E' },
    { id: 'medium', label: 'medium', icon: 'circle', color: '#F59E0B' },
    { id: 'high', label: 'high', icon: 'circle', color: '#EF4444' },
];
const ManageCompanyScreen = ({ selectedCompany, onBackPress, }) => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const user = useAppSelector(state => state.auth.user);
    const [selectedUrgency, setSelectedUrgency] = useState('low');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [openCategoryScreen, setOpenCategoryScreen] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev => prev.includes(categoryId)
            ? prev.filter(c => c !== categoryId)
            : [...prev, categoryId]);
    };
    const handleCategoryPress = (categoryId) => {
        setOpenCategoryScreen(categoryId);
    };
    const handleCloseCategoryScreen = () => {
        setOpenCategoryScreen(null);
    };
    // If a category screen is open, render it
    if (openCategoryScreen) {
        const companyData = selectedCompany;
        const userData = user;
        const selectedCat = categories.find(c => c.id === openCategoryScreen);
        const companyClientId = companyData?.shareholders?.[0]?.clientId || userData?._id || userData?.id || "";
        const finalCompanyId = companyData?.id || companyData?._id || "";
        return (<BasicInfoScreen onBackPress={handleCloseCategoryScreen} companyId={finalCompanyId} clientId={companyClientId} urgency={selectedUrgency} selectedCategory={selectedCat?.label || openCategoryScreen}/>);
    }
    return (<View style={[
            styles.container,
            {
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom,
            },
        ]}>
      <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background}/>

      {/* --- HEADER --- */}
      <View style={[
            styles.header,
            {
                borderBottomColor: colors.border,
            },
        ]}>
        <View style={styles.headerLeft}>
          <BackButton onPress={onBackPress}/>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Request changes
          </Text>
        </View>
        <View style={[
            styles.profileCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() ?? 'A'}
            </Text>
          </View>
          <Text style={[styles.profileEmail, { color: colors.muted }]} numberOfLines={1}>
            {user?.email?.split('@')[0] ?? 'User'}
          </Text>
        </View>
      </View>

      <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
    
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
              {urgencyLevels.map(level => (<Pressable key={level.id} onPress={() => setSelectedUrgency(level.id)} style={[
                styles.urgencyButton,
                {
                    backgroundColor: selectedUrgency === level.id
                        ? level.color + '20'
                        : colors.surface,
                    borderColor: selectedUrgency === level.id
                        ? level.color
                        : colors.border,
                },
            ]}>
                  <View style={[
                styles.urgencyDot,
                { backgroundColor: level.color },
            ]}/>
                  <Text style={[
                styles.urgencyLabel,
                {
                    color: selectedUrgency === level.id
                        ? level.color
                        : colors.text,
                },
            ]}>
                    {level.label}
                  </Text>
                </Pressable>))}
            </View>
          </View>

          {/* Change Categories Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Select Types
            </Text>
            <View style={styles.categoriesGrid}>
              {categories.map(category => (<Pressable key={category.id} onPress={() => {
                toggleCategory(category.id);
                handleCategoryPress(category.id);
            }} style={[
                styles.categoryCard,
                {
                    backgroundColor: selectedCategories.includes(category.id)
                        ? category.color + '15'
                        : colors.surface,
                    borderColor: selectedCategories.includes(category.id)
                        ? category.color
                        : colors.border,
                },
            ]}>
                  <View style={[
                styles.categoryIcon,
                { backgroundColor: category.color + '20' },
            ]}>
                    <FontAwesome name={category.icon} size={18} color={category.color}/>
                  </View>
                  <Text style={[styles.categoryTitle, { color: colors.text }]}>
                    {category.label}
                  </Text>
                  <Text style={[styles.categoryFields, { color: colors.muted }]}>
                    {category.fields} fields
                  </Text>
                </Pressable>))}
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
            <View style={[
            styles.feedbackBox,
            {
                backgroundColor: colors.primary + '15',
                borderColor: colors.primary,
            },
        ]}>
              <View style={styles.feedbackIcon}>
                <FontAwesome name="lightbulb-o" size={16} color={colors.primary}/>
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

            {/*-------------- Live Request Timeline------------- */}
            <View style={styles.section}>
              <View style={styles.timelineHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Live request timeline
                </Text>
                <Pressable style={[styles.refreshBtn, { borderColor: colors.primary }]} onPress={() => setRefreshKey(k => k + 1)}>
                  <FontAwesome name="refresh" size={12} color={colors.primary}/>
                  <Text style={[styles.refreshText, { color: colors.primary }]}>
                    Refresh
                  </Text>
                </Pressable>
              </View>

              <Text style={[styles.timelineNote, { color: colors.muted }]}>
                Each card shows exactly where your request stands.
              </Text>

              <MyRequestsScreen companyId={selectedCompany?.id} refreshKey={refreshKey}/>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>);
};
export default ManageCompanyScreen;

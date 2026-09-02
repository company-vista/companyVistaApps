import { useMemo, useState } from 'react';
import { Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AnimatedAppear from '../../../components/AnimatedAppear';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { useThemeColors } from '../../../theme/colors';
import { font } from '../../../theme/typography';
import RegistrationTrackingScreen from './addCompany/RegistrationTrackingScreen';
const quickActions = [
    { id: 'companyInfo', label: 'Company Information', icon: 'building-o', color: '#4F46E5' },
    { id: 'shareholders', label: 'Shareholders', icon: 'users', color: '#137333' },
    { id: 'manageCompany', label: 'Manage Company', icon: 'briefcase', color: '#7C3AED' },
    { id: 'transactions', label: 'Transactions', icon: 'exchange', color: '#0891b2' },
    { id: 'subscription', label: 'Subscription', icon: 'credit-card', color: '#16a34a' },
];
const serviceActions = [
    { id: 'subscription', label: 'Subscription', icon: 'credit-card', color: '#16a34a' },
    { id: 'requestService', label: 'Request a Services', icon: 'plus-circle', color: '#0891b2' },
    { id: 'servicesHistory', label: 'Services History', icon: 'history', color: '#7C3AED' },
];
const complianceActions = [
    { id: 'agentAddress', label: 'Agent & Address', icon: 'building', color: '#ea580c' },
    { id: 'federalFiling', label: 'Federal Filing', icon: 'file-text', color: '#B45309' },
    { id: 'annualFiling', label: 'Annual Filing', icon: 'calendar', color: '#0891b2' },
];
const trackingActions = [
    { id: 'registrationTracking', label: 'Registration Tracking', icon: 'map-marker', color: '#0891b2' },
];
const helpAndSupport = [
    { id: 'support', label: 'Support', icon: 'headphones', color: '#0f766e' },
    { id: 'inviteFriends', label: 'Invite Friends', icon: 'share-alt', color: '#7c3aed' },
    { id: 'followUs', label: 'Follow Us', icon: 'globe', color: '#2563eb' },
    { id: 'helpFeedback', label: 'Help & Feedback', icon: 'commenting-o', color: '#ca8a04' },
];
export default function SearchScreen({ route }) {
    const navigation = useNavigation();
    const colors = useThemeColors();
    const [query, setQuery] = useState('');
    const [isRegistrationTrackingOpen, setIsRegistrationTrackingOpen] = useState(false);
    function handleQuickAction(actionId) {
        switch (actionId) {
            case 'companyInfo':
                navigation.navigate('Home', { pendingCompanySection: 'companyInfo' });
                break;
            case 'shareholders':
                navigation.navigate('Home', { pendingCompanySection: 'shareholders' });
                break;
            case 'manageCompany':
                navigation.navigate('Home', { pendingHomeAction: 'manageOptions' });
                break;
            case 'transactions':
                navigation.navigate('Transactions', { companyId: route.params?.companyId });
                break;
            case 'subscription':
                navigation.navigate('Home', { pendingHomeAction: 'subscription' });
                break;
        }
    }
    function handleServicePress(serviceId) {
        switch (serviceId) {
            case 'subscription':
                navigation.navigate('Home', { pendingHomeAction: 'subscription' });
                break;
            case 'requestService':
                navigation.navigate('Home', { pendingHomeAction: 'requestService' });
                break;
            case 'servicesHistory':
                navigation.navigate('Home', { pendingHomeAction: 'servicesHistory' });
                break;
        }
    }
    function handleCompliancePress(actionId) {
        switch (actionId) {
            case 'agentAddress':
                navigation.navigate('ComplianceHistory', {
                    selectedAction: { id: 'agent_address', title: 'Agent & Address', subtitle: '', status: '', date: '', details: [], companyId: route.params?.companyId },
                });
                break;
            case 'federalFiling':
                navigation.navigate('FederalFiling');
                break;
            case 'annualFiling':
                navigation.navigate('AnnualFiling');
                break;
        }
    }
    function handleHelpPress(itemId) {
        switch (itemId) {
            case 'support':
                navigation.navigate('Support');
                break;
            case 'inviteFriends':
                Share.share({ message: 'Join me on Company Vista to manage company work in one place.', title: 'Invite Friends' });
                break;
            case 'followUs':
                navigation.navigate('FollowUs');
                break;
            case 'helpFeedback':
                navigation.navigate('HelpFeedback');
                break;
        }
    }
    const filteredActions = useMemo(() => {
        if (!query.trim())
            return quickActions;
        const q = query.toLowerCase();
        return quickActions.filter(a => a.label.toLowerCase().includes(q));
    }, [query]);
    const filteredServices = useMemo(() => {
        if (!query.trim())
            return serviceActions;
        const q = query.toLowerCase();
        return serviceActions.filter(s => s.label.toLowerCase().includes(q));
    }, [query]);
    const filteredComplianceActions = useMemo(() => {
        if (!query.trim())
            return complianceActions;
        const q = query.toLowerCase();
        return complianceActions.filter(c => c.label.toLowerCase().includes(q));
    }, [query]);
    const filteredTrackingActions = useMemo(() => {
        if (!query.trim())
            return trackingActions;
        const q = query.toLowerCase();
        return trackingActions.filter(t => t.label.toLowerCase().includes(q));
    }, [query]);
    const filteredHelpAndSupport = useMemo(() => {
        if (!query.trim())
            return helpAndSupport;
        const q = query.toLowerCase();
        return helpAndSupport.filter(h => h.label.toLowerCase().includes(q));
    }, [query]);
    if (isRegistrationTrackingOpen) {
        return (<RegistrationTrackingScreen onBackPress={() => {
            setIsRegistrationTrackingOpen(false);
            navigation.setOptions({ headerShown: true });
        }} companyId={route.params?.companyId}/>);
    }
    return (<ScreenWrapper>
      <View style={styles.container}>
        <AnimatedAppear index={0}>
          <View style={[styles.searchInputWrap, { backgroundColor: colors.cardHighlight, borderColor: colors.border }]}>
            <FontAwesome name="search" size={18} color={colors.subtle} style={styles.searchIcon}/>
            <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search..." placeholderTextColor={colors.inputPlaceholder} value={query} onChangeText={setQuery} autoFocus/>
          </View>
        </AnimatedAppear>

        <View style={styles.listContent}>
        <View style={styles.sectionWrap}>
          <AnimatedAppear index={1}>
            {!query.trim() && <Text style={[styles.sectionTitle, { color: colors.muted }]}>QUICK ACTIONS</Text>}
            <View style={styles.settingsList}>
              {filteredActions.map((action) => (<TouchableOpacity key={action.id} style={styles.settingsRow} onPress={() => handleQuickAction(action.id)}>
                  <View style={[styles.settingsIcon, { backgroundColor: `${action.color}15` }]}>
                    <FontAwesome name={action.icon} size={18} color={action.color}/>
                  </View>
                  <Text style={[styles.settingsLabel, { color: colors.text }]}>{action.label}</Text>
                  <FontAwesome name="angle-right" size={18} color={colors.subtle}/>
                </TouchableOpacity>))}
            </View>
          </AnimatedAppear>

          <AnimatedAppear index={2}>
            {!query.trim() && <Text style={[styles.sectionTitle, { color: colors.muted }]}>SERVICES</Text>}
            <View style={styles.settingsList}>
              {filteredServices.map((service) => (<TouchableOpacity key={service.id} style={styles.settingsRow} onPress={() => handleServicePress(service.id)}>
                  <View style={[styles.settingsIcon, { backgroundColor: `${service.color}15` }]}>
                    <FontAwesome name={service.icon} size={18} color={service.color}/>
                  </View>
                  <Text style={[styles.settingsLabel, { color: colors.text }]}>{service.label}</Text>
                  <FontAwesome name="angle-right" size={18} color={colors.subtle}/>
                </TouchableOpacity>))}
            </View>
          </AnimatedAppear>

          <AnimatedAppear index={3}>
            {!query.trim() && <Text style={[styles.sectionTitle, { color: colors.muted }]}>COMPLIANCE ACTIONS</Text>}
            <View style={styles.settingsList}>
              {filteredComplianceActions.map((item) => (<TouchableOpacity key={item.id} style={styles.settingsRow} onPress={() => handleCompliancePress(item.id)}>
                  <View style={[styles.settingsIcon, { backgroundColor: `${item.color}15` }]}>
                    <FontAwesome name={item.icon} size={18} color={item.color}/>
                  </View>
                  <Text style={[styles.settingsLabel, { color: colors.text }]}>{item.label}</Text>
                  <FontAwesome name="angle-right" size={18} color={colors.subtle}/>
                </TouchableOpacity>))}
            </View>
          </AnimatedAppear>

          <AnimatedAppear index={4}>
            {!query.trim() && <Text style={[styles.sectionTitle, { color: colors.muted }]}>TRACKING</Text>}
            <View style={styles.settingsList}>
              {filteredTrackingActions.map((item) => (<TouchableOpacity key={item.id} style={styles.settingsRow} onPress={() => {
                  navigation.setOptions({ headerShown: false });
                  setIsRegistrationTrackingOpen(true);
              }}>
                  <View style={[styles.settingsIcon, { backgroundColor: `${item.color}15` }]}>
                    <FontAwesome name={item.icon} size={18} color={item.color}/>
                  </View>
                  <Text style={[styles.settingsLabel, { color: colors.text }]}>{item.label}</Text>
                  <FontAwesome name="angle-right" size={18} color={colors.subtle}/>
                </TouchableOpacity>))}
            </View>
          </AnimatedAppear>

          <AnimatedAppear index={5}>
            {!query.trim() && <Text style={[styles.sectionTitle, { color: colors.muted }]}>HELP & SUPPORT</Text>}
            <View style={styles.settingsList}>
              {filteredHelpAndSupport.map((item) => (<TouchableOpacity key={item.id} style={styles.settingsRow} onPress={() => handleHelpPress(item.id)}>
                  <View style={[styles.settingsIcon, { backgroundColor: `${item.color}15` }]}>
                    <FontAwesome name={item.icon} size={18} color={item.color}/>
                  </View>
                  <Text style={[styles.settingsLabel, { color: colors.text }]}>{item.label}</Text>
                  <FontAwesome name="angle-right" size={18} color={colors.subtle}/>
                </TouchableOpacity>))}
            </View>
          </AnimatedAppear>

        </View>
        </View>
      </View>
    </ScreenWrapper>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        marginBottom: 8,
        paddingHorizontal: 14,
        borderRadius: 28,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: font.xl,
    },
    sectionWrap: {
        paddingBottom: 4,
    },
    sectionTitle: {
        fontSize: font.base,
        fontWeight: '600',
        letterSpacing: 0.5,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 8,
    },
    settingsList: {
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
    },
    settingsIcon: {
        width: 33,
        height: 33,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    settingsLabel: {
        flex: 1,
        fontSize: font.xl,
        fontWeight: '400',
    },
    listContent: {
        paddingBottom: 24,
    },
});

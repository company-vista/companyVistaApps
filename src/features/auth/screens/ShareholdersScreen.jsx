import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import {
  CheckCircle2,
  Plus,
  Info,
  ArrowRight,
  Check,
} from 'lucide-react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { s } from '../../../theme/responsive';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { fetchReviewApi } from '../api/orderApi';

const ShareholdersScreen = ({ navigation, route }) => {
  // signup ke time jo auth wala naam hai wahi dikhao (Redux user se), fallback route params
  const authUser = useAppSelector(s => s.auth.user);
  const authToken = useAppSelector(s => s.auth.token);
  const pendingOrder = useAppSelector(s => s.auth.pendingOrderData);
  const authName = authUser?.name || [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ').trim() || '';
  const routeName = route?.params?.fullName?.trim() || route?.params?.email?.split('@')[0] || '';
  const accountName = authName || routeName || '';
  const displayName = accountName || 'Rajesh Kumar Sharma';
  const displayInitials = displayName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0,2).toUpperCase() || 'RS';
  const _countryRaw = route?.params?.countryOfResidence || authUser?.country || authUser?.registrationCountry || '';
  const accountCountry = _countryRaw ? `🌐 ${_countryRaw}` : '🇮🇳 India';
  // auth user ke full details (email, phone, country, id)
  const authEmail = authUser?.email || route?.params?.email || route?.params?.userEmail || '';
  const authPhone = authUser?.phoneNumber || authUser?.phone || route?.params?.phone || '';
  const authCountryCode = authUser?.countryCode || route?.params?.countryCode || '';
  const companyId = route?.params?.companyId || pendingOrder?.companyId || '';
  const token = route?.params?.token || authToken || pendingOrder?.token || '';

  // Pehle static 60% dikh raha tha - user ne bhara bhi nahi aur 100% allocated dikh jata tha, isliye dynamic kiya
  const [shareholders, setShareholders] = useState(() => {
    // Sirf logged-in user ko prefill karo par 0% se - user khud ownership bharega
    if (displayName) {
      return [
        {
          id: '1',
          initials: displayInitials,
          name: displayName,
          role: 'Principal founder · Managing Member',
          ownership: '', // khali - user Add/Edit se bharega
          avatarBg: '#3A311A',
          avatarText: '#D97706',
          borderColor: '#3A311A',
          country: accountCountry,
          designation: 'Director',
          status: 'incomplete',
          address: '',
          pincode: '',
        },
      ];
    }
    return [];
  });
  const totalAllocated = shareholders.reduce((sum, s) => sum + (parseInt(String(s.ownership).replace('%','')) || 0), 0);
  const isFullyAllocated = totalAllocated === 100;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newOwnership, setNewOwnership] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('+91');
  const [newCountry, setNewCountry] = useState('India');
  const [newDesignation, setNewDesignation] = useState('Shareholder');
  const [newAddress, setNewAddress] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newPassport, setNewPassport] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEditShareholder = (item) => {
    setEditingId(item.id);
    setNewName(item.name || '');
    setNewEmail(item.email || '');
    setNewOwnership(String(item.ownership || '').replace('%',''));
    setNewPhone(item.phone || '');
    setNewCountryCode(item.countryCode || '+91');
    setNewCountry(item.countryRaw || 'India');
    setNewDesignation(item.designation || 'Shareholder');
    setNewAddress(item.address || '');
    setNewPincode(item.pincode || '');
    setNewPassport(item.passportNumber || item.passport || '');
    setShowAddModal(true);
  };
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setNewName('');
    setNewEmail('');
    setNewOwnership('');
    setNewPhone('');
    setNewCountryCode('+91');
    setNewCountry('India');
    setNewDesignation('Shareholder');
    setNewAddress('');
    setNewPincode('');
    setNewPassport('');
  };

  // Backend integrate: POST /shareholders/:companyId
  const handleAddShareholder = async () => {
    if (!newName.trim()) {
      Toast.show({ type: 'error', text1: 'Name is required' });
      return;
    }
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      Toast.show({ type: 'error', text1: 'Valid email is required' });
      return;
    }
    if (!newOwnership.trim()) {
      Toast.show({ type: 'error', text1: 'Ownership % is required' });
      return;
    }
    const ownershipNum = parseInt(newOwnership, 10);
    if (isNaN(ownershipNum) || ownershipNum <= 0 || ownershipNum > 100) {
      Toast.show({ type: 'error', text1: 'Ownership must be between 1% and 100%' });
      return;
    }
    if (!companyId) {
      Toast.show({ type: 'error', text1: 'Company ID missing', text2: 'Please restart signup' });
      return;
    }
    // Frontend 100% check mirror backend: otherTotal + sharePercentage <=100
    const otherTotal = shareholders.reduce((sum, s) => {
      if (editingId && s.id === editingId) return sum;
      return sum + (parseInt(String(s.ownership).replace('%','')) || 0);
    }, 0);
    if (otherTotal + ownershipNum > 100) {
      Toast.show({ type: 'error', text1: `Ownership would total ${otherTotal + ownershipNum}% — must not exceed 100%` });
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        sharePercentage: ownershipNum,
        phone: newPhone.trim(),
        phoneNumber: newPhone.trim(),
        countryCode: newCountryCode.trim() || '+91',
        country: newCountry.trim() || 'India',
        designation: ['Shareholder','Director','Authorized Representative'].includes(newDesignation) ? newDesignation : 'Shareholder',
      };
      const headers = token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
      const endpoints = [
        `${API_BASE_URL}/api/shareholders/${companyId}`,
        `${API_BASE_URL}/api/company-signup/shareholders/${companyId}`,
        `${API_BASE_URL}/api/company/${companyId}/shareholders`,
        `${API_BASE_URL}/api/companies/${companyId}/shareholders`,
      ];
      let lastErr = null;
      let resp = null;
      for (const url of endpoints) {
        try {
          console.log('=== addShareholder TRY ===', url, body);
          const r = await axios.post(url, body, { headers, timeout: 10000 });
          console.log('=== addShareholder SUCCESS ===', url, JSON.stringify(r.data, null, 2));
          resp = r.data;
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          const status = e?.response?.status;
          const msg = e?.response?.data?.message || e.message;
          console.log(`=== addShareholder FAILED ${url} status`, status, msg);
          if (status === 404) continue;
          throw e;
        }
      }
      if (lastErr) throw lastErr;
      const clientId = resp?.clientId || resp?.data?.clientId || '';
      const totalOwnership = resp?.totalOwnership ?? (otherTotal + ownershipNum);
      Toast.show({ type: 'success', text1: resp?.message || 'Shareholder added', text2: clientId ? `OTP sent to ${body.email}` : `Total: ${totalOwnership}%` });
      const initials = newName.trim().split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
      const newItem = {
        id: editingId || clientId?.toString() || Date.now().toString(),
        clientId,
        initials: initials || 'NS',
        name: newName.trim(),
        email: body.email,
        role: newDesignation === 'Director' ? 'Director' : newDesignation === 'Authorized Representative' ? 'Authorized Representative' : 'Shareholder',
        ownership: `${ownershipNum}%`,
        avatarBg: '#1E293B',
        avatarText: '#EAB308',
        borderColor: 'transparent',
        country: `🌐 ${newCountry}`,
        countryRaw: newCountry,
        countryCode: newCountryCode,
        phone: newPhone.trim(),
        designation: body.designation,
        status: 'awaiting_kyc',
        address: newAddress.trim(),
        pincode: newPincode.trim(),
        passportNumber: newPassport.trim().toUpperCase(),
      };
      if (editingId) {
        setShareholders(prev => prev.map(s => s.id === editingId ? { ...s, ...newItem, id: editingId } : s));
      } else {
        setShareholders(prev => [...prev, newItem]);
      }
      handleCloseModal();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Failed to add shareholder';
      Toast.show({ type: 'error', text1: 'Failed', text2: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070C15" />

      {/* CompanyNaming jaisa Back + Logo header - top se bahar nahi jayega */}
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation?.goBack?.()} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      {/* Step Progress Line */}
      <View style={styles.stepProgressBar}>
        <View style={styles.stepActive} />
        <View style={styles.stepInactive} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Screen Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            Shareholders <Text style={styles.ampersand}>&</Text>{' '}
            <Text style={styles.italicTitle}>ownership</Text>
          </Text>
          <Text style={styles.subTitle}>
            Everyone with a stake in Meridian Global Ventures LLC.
          </Text>
        </View>

        {/* Allocated Banner - dynamic */}
        <View style={[styles.allocatedBanner, !isFullyAllocated && { backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.3)' }]}>
          {isFullyAllocated ? <CheckCircle2 color="#10B981" size={20} /> : <Info color="#EAB308" size={20} />}
          <Text style={styles.allocatedText}>
            <Text style={{ fontWeight: 'bold', color: isFullyAllocated ? '#10B981' : '#EAB308' }}>
              {totalAllocated}% allocated
            </Text>{' '}
            — {isFullyAllocated ? 'ownership adds up correctly' : `${100 - totalAllocated}% remaining — add/edit shareholders to reach 100%`}
          </Text>
        </View>

        {/* Shareholder Cards List */}
        {shareholders.map((item) => (
          <View
            key={item.id}
            style={[
              styles.shareholderCard,
              { borderColor: item.borderColor },
            ]}>
            {/* Top Info */}
            <View style={styles.cardHeader}>
              <View style={styles.userInfoGroup}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: item.avatarBg },
                  ]}>
                  <Text style={[styles.avatarText, { color: item.avatarText }]}>
                    {item.initials}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userRole}>{item.role}</Text>
                  {item.email ? <Text style={styles.userEmail}>{item.email}</Text> : (item.id === '1' && authEmail ? <Text style={styles.userEmail}>{authEmail}</Text> : null)}
                  {item.phone ? <Text style={styles.userPhone}>{item.countryCode ? `${item.countryCode} ` : ''}{item.phone}</Text> : (item.id === '1' && authPhone ? <Text style={styles.userPhone}>{authCountryCode ? `${authCountryCode} ` : ''}{authPhone}</Text> : null)}
                </View>
              </View>

              <View style={styles.ownershipGroup}>
                <Text style={[styles.ownershipValue, !item.ownership && { color: '#EAB308' }]}>{item.ownership || '—'}</Text>
                <Text style={styles.ownershipLabel}>OWNERSHIP</Text>
              </View>
              <TouchableOpacity onPress={() => handleEditShareholder(item)} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                <FontAwesome name="pencil" size={12} color="#EAB308" />
              </TouchableOpacity>
            </View>

            {/* Tags / Badges Footer */}
            <View style={styles.badgeRow}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.country}</Text>
              </View>

              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.designation}</Text>
              </View>

              {item.status === 'complete' ? (
                <View style={styles.completeBadge}>
                  <Check color="#10B981" size={14} />
                  <Text style={styles.completeBadgeText}>Details complete</Text>
                </View>
              ) : (
                <View style={styles.kycBadge}>
                  <Text style={styles.kycBadgeText}>Awaiting KYC</Text>
                </View>
              )}
            </View>
            {(item.address || item.pincode || item.passportNumber) && (
              <View style={{ marginTop: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                {item.address ? <Text style={{ color: '#94A3B8', fontSize: 11, lineHeight: 14 }} numberOfLines={2}>{item.address}</Text> : null}
                {item.pincode ? <Text style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>Pincode: {item.pincode}</Text> : null}
                {item.passportNumber ? <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 2 }}>Passport: {item.passportNumber}</Text> : null}
              </View>
            )}
          </View>
        ))}

        {/* Add Another Shareholder Button */}
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8} onPress={() => setShowAddModal(true)}>
          <Plus color="#EAB308" size={18} />
          <Text style={styles.addButtonText}>Add another shareholder</Text>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Info color="#3B82F6" size={18} style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>
            Each shareholder receives an email to upload their own KYC documents securely.
          </Text>
        </View>

        {/* Continue Button - percentage mandatory, total 100% not required */}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={() => {
            // har shareholder ka ownership mandatory, total ka koi limit nahi
            const hasEmptyOwnership = shareholders.some(s => !s.ownership || String(s.ownership).trim() === '' || String(s.ownership) === '0%');
            if (hasEmptyOwnership) {
              Toast.show({ type: 'error', text1: 'Please set ownership % for all shareholders (tap edit icon)' });
              return;
            }
            navigation?.navigate?.('VerifyIdentity', { ...route?.params, shareholderCompleted: true, shareholders });
          }}>
          <Text style={styles.continueButtonText}>Continue to KYC</Text>
          <ArrowRight color="#070C15" size={20} />
        </TouchableOpacity>
      </ScrollView>

      {/* Add Shareholder Modal - backend fields: name, email, sharePercentage, phone, countryCode, country, designation */}
      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Shareholder' : 'Add Shareholder'}</Text>
            <Text style={styles.modalLabel}>FULL NAME *</Text>
            <View style={styles.modalInputBox}>
              <TextInput style={styles.modalInput} value={newName} onChangeText={setNewName} placeholder="Enter name" placeholderTextColor="#64748B" />
            </View>
            <Text style={styles.modalLabel}>EMAIL *</Text>
            <View style={styles.modalInputBox}>
              <TextInput style={styles.modalInput} value={newEmail} onChangeText={setNewEmail} placeholder="shareholder@email.com" placeholderTextColor="#64748B" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <Text style={styles.modalLabel}>OWNERSHIP % *</Text>
            <View style={styles.modalInputBox}>
              <TextInput style={styles.modalInput} value={newOwnership} onChangeText={t => setNewOwnership(t.replace(/[^0-9]/g,''))} placeholder="e.g. 10 *" placeholderTextColor="#64748B" keyboardType="numeric" maxLength={3} />
            </View>
            <Text style={styles.modalLabel}>PHONE</Text>
            <View style={styles.modalInputBox}>
              <TextInput style={styles.modalInput} value={newPhone} onChangeText={t => setNewPhone(t.replace(/[^0-9]/g,''))} placeholder="Phone number" placeholderTextColor="#64748B" keyboardType="phone-pad" />
            </View>
            <Text style={styles.modalLabel}>COUNTRY CODE</Text>
            <View style={styles.modalInputBox}>
              <TextInput style={styles.modalInput} value={newCountryCode} onChangeText={setNewCountryCode} placeholder="+91" placeholderTextColor="#64748B" />
            </View>
            <Text style={styles.modalLabel}>COUNTRY</Text>
            <View style={styles.modalInputBox}>
              <TextInput style={styles.modalInput} value={newCountry} onChangeText={setNewCountry} placeholder="India" placeholderTextColor="#64748B" />
            </View>
            <Text style={styles.modalLabel}>DESIGNATION</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
              {['Shareholder','Director','Authorized Representative'].map(d => (
                <TouchableOpacity key={d} onPress={() => setNewDesignation(d)} style={{ flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: newDesignation===d ? '#EAB308' : 'rgba(255,255,255,0.1)', backgroundColor: newDesignation===d ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.04)', alignItems: 'center' }}>
                  <Text style={{ color: newDesignation===d ? '#EAB308' : '#94A3B8', fontSize: 11, fontWeight: '600' }}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalLabel}>ADDRESS</Text>
            <View style={[styles.modalInputBox, { height: 60 }]}>
              <TextInput style={[styles.modalInput, { textAlignVertical: 'top' }]} value={newAddress} onChangeText={setNewAddress} placeholder="Enter full address" placeholderTextColor="#64748B" multiline numberOfLines={2} />
            </View>
            <Text style={styles.modalLabel}>PINCODE</Text>
            <View style={styles.modalInputBox}>
              <TextInput style={styles.modalInput} value={newPincode} onChangeText={t => setNewPincode(t.replace(/[^0-9]/g,''))} placeholder="e.g. 110001" placeholderTextColor="#64748B" keyboardType="numeric" maxLength={6} />
            </View>
            <Text style={styles.modalLabel}>PASSPORT NUMBER</Text>
            <View style={styles.modalInputBox}>
              <TextInput style={styles.modalInput} value={newPassport} onChangeText={t => setNewPassport(t.replace(/[^a-zA-Z0-9]/g,'').toUpperCase())} placeholder="e.g. A1234567" placeholderTextColor="#64748B" autoCapitalize="characters" maxLength={12} />
            </View>
            {!companyId ? <Text style={{ color: '#EF4444', fontSize: 11, marginTop: 8 }}>Company ID missing — cannot save to backend</Text> : null}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={handleCloseModal} disabled={saving}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]} onPress={handleAddShareholder} disabled={saving}>
                <Text style={styles.modalSaveText}>{saving ? 'Saving...' : (editingId ? 'Update' : 'Add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ShareholdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C15',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 34 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(16),
    paddingVertical: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
  },
  brandTitle: {
    color: '#D1D5DB',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  brandSub: {
    color: '#6B7280',
    fontSize: 8,
    letterSpacing: 1.5,
  },
  stepProgressBar: {
    flexDirection: 'row',
    height: 3,
    width: '100%',
    backgroundColor: '#1E293B',
    marginVertical: 4,
  },
  stepActive: {
    flex: 1,
    backgroundColor: '#EAB308',
  },
  stepInactive: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  scrollContent: {
    paddingHorizontal: s(16),
    paddingVertical: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  ampersand: {
    color: '#EAB308',
    fontStyle: 'normal',
  },
  italicTitle: {
    fontStyle: 'italic',
    color: '#EAB308',
    fontFamily: 'serif',
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
  },
  allocatedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  allocatedText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  shareholderCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 14,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  userRole: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  userEmail: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 3,
  },
  userPhone: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  ownershipGroup: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  ownershipValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
  },
  ownershipLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: s(10),
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: s(10),
    paddingVertical: 4,
    borderRadius: 8,
  },
  completeBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  kycBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: s(10),
    paddingVertical: 5,
    borderRadius: 8,
  },
  kycBadgeText: {
    color: '#EAB308',
    fontSize: 11,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    marginVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  addButtonText: {
    color: '#EAB308',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0B132B',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: '#EAB308',
    borderRadius: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#070C15',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: s(20) },
  modalCard: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  modalLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginTop: 8 },
  modalInputBox: { backgroundColor: '#070C15', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: s(12), height: 44, justifyContent: 'center' },
  modalInput: { color: '#FFFFFF', fontSize: 14 },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalCancelBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modalCancelText: { color: '#94A3B8', fontWeight: '600' },
  modalSaveBtn: { flex: 1, backgroundColor: '#EAB308', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  modalSaveText: { color: '#070C15', fontWeight: '700' },
});

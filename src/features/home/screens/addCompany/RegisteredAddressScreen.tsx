import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { BackButton } from '../../../../components/buttons';
// import DirectorsShareholdersScreen from './DirectorsShareholdersScreen';

type HasAddressOption = 'yes' | 'no' | null;
type HasAgentOption = 'yes' | 'no' | null;

interface AddressFormState {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

type RegisteredAddressScreenProps = {
  onBackPress: () => void;
  onContinue: () => void;
};

export default function RegisteredAddressScreen({ onBackPress, onContinue }: RegisteredAddressScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;

  const [hasAddress, setHasAddress] = useState<HasAddressOption>(null);
  const [hasAgent, setHasAgent] = useState<HasAgentOption>(null);

  const [localAddress, setLocalAddress] = useState<AddressFormState>({
    line1: '', line2: '', city: '', state: '', postalCode: '', country: ''
  });

  const [agentDetails, setAgentDetails] = useState({
    firstName: '', lastName: '', idNumber: ''
  });

  const [agentAddress, setAgentAddress] = useState<AddressFormState>({
    line1: '', line2: '', city: '', state: '', postalCode: '', country: ''
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Registered address / Local representation</Text>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Registered address & <Text style={styles.titleAccent}>local representation</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Many jurisdictions require a registered address and/or a local agent or director. We'll add the right one for you.
          </Text>

          <Text style={[styles.sectionLabel, { color: colors.muted }]}>
            DO YOU ALREADY HAVE A REGISTERED/LOCAL BUSINESS ADDRESS IN THE JURISDICTION? ⓘ
          </Text>

          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioCard, { backgroundColor: colors.surface, borderColor: colors.border }, hasAddress === 'yes' && { borderColor: '#e6a82a' }]}
              onPress={() => setHasAddress('yes')}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, hasAddress === 'yes' && { borderColor: '#e6a82a' }]}>
                {hasAddress === 'yes' && <View style={styles.radioDot} />}
              </View>
              <View style={styles.radioTextWrap}>
                <Text style={[styles.radioTitle, { color: colors.text }]}>Yes, I'll provide one</Text>
                <Text style={[styles.radioDesc, { color: colors.subtle }]}>I have a local address to use</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.radioCard, { backgroundColor: colors.surface, borderColor: colors.border }, hasAddress === 'no' && { borderColor: '#e6a82a' }]}
              onPress={() => setHasAddress('no')}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, hasAddress === 'no' && { borderColor: '#e6a82a' }]}>
                {hasAddress === 'no' && <View style={styles.radioDot} />}
              </View>
              <View style={styles.radioTextWrap}>
                <Text style={[styles.radioTitle, { color: colors.text }]}>No, please arrange one for me</Text>
                <Text style={[styles.radioDesc, { color: colors.subtle }]}>Use CompanyVista's registered address service</Text>
              </View>
            </TouchableOpacity>
          </View>

          {hasAddress === 'yes' && (
            <View style={styles.formSection}>
              <Text style={[styles.subHeadingGold, { color: '#e6a82a' }]}>Local Business Address</Text>

              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  placeholder="Address Line 1 / P.O. box"
                  placeholderTextColor={colors.inputPlaceholder}
                  style={[styles.input, { color: colors.text }]}
                  value={localAddress.line1}
                  onChangeText={(text) => setLocalAddress({...localAddress, line1: text})}
                />
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  placeholder="Address Line 2 (optional)"
                  placeholderTextColor={colors.inputPlaceholder}
                  style={[styles.input, { color: colors.text }]}
                  value={localAddress.line2}
                  onChangeText={(text) => setLocalAddress({...localAddress, line2: text})}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput
                    placeholder="City"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[styles.input, { color: colors.text }]}
                    value={localAddress.city}
                    onChangeText={(text) => setLocalAddress({...localAddress, city: text})}
                  />
                </View>
                <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput
                    placeholder="State"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[styles.input, { color: colors.text }]}
                    value={localAddress.state}
                    onChangeText={(text) => setLocalAddress({...localAddress, state: text})}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput
                    placeholder="Postal / ZIP Code"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[styles.input, { color: colors.text }]}
                    value={localAddress.postalCode}
                    onChangeText={(text) => setLocalAddress({...localAddress, postalCode: text})}
                  />
                </View>
                <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput
                    placeholder="Country"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[styles.input, { color: colors.text }]}
                    value={localAddress.country}
                    onChangeText={(text) => setLocalAddress({...localAddress, country: text})}
                  />
                </View>
              </View>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 20 }]}>
            LOCAL REPRESENTATIVE / REGISTERED AGENT
          </Text>
          <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: -4 }]}>
            DO YOU WANT A LOCAL REPRESENTATIVE / REGISTERED AGENT? ⓘ
          </Text>

          <TouchableOpacity
            style={[styles.radioCard, { backgroundColor: colors.surface, borderColor: colors.border }, hasAgent === 'yes' && { borderColor: '#e6a82a' }]}
            onPress={() => setHasAgent('yes')}
            activeOpacity={0.8}
          >
            <View style={[styles.radioCircle, hasAgent === 'yes' && { borderColor: '#e6a82a' }]}>
              {hasAgent === 'yes' && <View style={styles.radioDot} />}
            </View>
            <View style={styles.radioTextWrap}>
              <Text style={[styles.radioTitle, { color: colors.text }]}>Yes, I'll provide my own</Text>
              <Text style={[styles.radioDesc, { color: colors.subtle }]}>Someone is already appointed for this role</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.radioCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 8 }, hasAgent === 'no' && { borderColor: '#e6a82a' }]}
            onPress={() => setHasAgent('no')}
            activeOpacity={0.8}
          >
            <View style={[styles.radioCircle, hasAgent === 'no' && { borderColor: '#e6a82a' }]}>
              {hasAgent === 'no' && <View style={styles.radioDot} />}
            </View>
            <View style={styles.radioTextWrap}>
              <Text style={[styles.radioTitle, { color: colors.text }]}>No, I don't have one</Text>
              <Text style={[styles.radioDesc, { color: colors.subtle }]}>Please arrange a registered agent for me as part of my package</Text>
            </View>
          </TouchableOpacity>

          {hasAgent === 'yes' && (
            <View style={styles.formSection}>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={[styles.fieldLabel, { color: colors.muted }]}>FIRST NAME <Text style={{color: '#e6a82a'}}>*</Text></Text>
                  <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={agentDetails.firstName}
                      onChangeText={(text) => setAgentDetails({...agentDetails, firstName: text})}
                    />
                  </View>
                </View>
                <View style={styles.halfInput}>
                  <Text style={[styles.fieldLabel, { color: colors.muted }]}>LAST NAME <Text style={{color: '#e6a82a'}}>*</Text></Text>
                  <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={agentDetails.lastName}
                      onChangeText={(text) => setAgentDetails({...agentDetails, lastName: text})}
                    />
                  </View>
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: colors.muted }]}>ID / REGISTRATION NUMBER</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={agentDetails.idNumber}
                  onChangeText={(text) => setAgentDetails({...agentDetails, idNumber: text})}
                />
              </View>
              <Text style={[styles.hintText, { color: colors.subtle }]}>optional</Text>

              <Text style={[styles.subHeadingGold, { color: '#e6a82a', marginTop: 16 }]}>Representative Address</Text>

              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  placeholder="Address Line 1 / P.O. box"
                  placeholderTextColor={colors.inputPlaceholder}
                  style={[styles.input, { color: colors.text }]}
                  value={agentAddress.line1}
                  onChangeText={(text) => setAgentAddress({...agentAddress, line1: text})}
                />
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  placeholder="Address Line 2 (optional)"
                  placeholderTextColor={colors.inputPlaceholder}
                  style={[styles.input, { color: colors.text }]}
                  value={agentAddress.line2}
                  onChangeText={(text) => setAgentAddress({...agentAddress, line2: text})}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput
                    placeholder="City"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[styles.input, { color: colors.text }]}
                    value={agentAddress.city}
                    onChangeText={(text) => setAgentAddress({...agentAddress, city: text})}
                  />
                </View>
                <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput
                    placeholder="State"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[styles.input, { color: colors.text }]}
                    value={agentAddress.state}
                    onChangeText={(text) => setAgentAddress({...agentAddress, state: text})}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput
                    placeholder="Postal / ZIP Code"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[styles.input, { color: colors.text }]}
                    value={agentAddress.postalCode}
                    onChangeText={(text) => setAgentAddress({...agentAddress, postalCode: text})}
                  />
                </View>
                <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput
                    placeholder="Country"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[styles.input, { color: colors.text }]}
                    value={agentAddress.country}
                    onChangeText={(text) => setAgentAddress({...agentAddress, country: text})}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footerColumn, { paddingBottom: safeAreaInsets.bottom + 8 }]}>
          <TouchableOpacity
            style={styles.continueButtonFull}
            onPress={onContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 12,
    gap: 2,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: font.xxl,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 18,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  title: {
    fontSize: font.large,
    fontWeight: '500',
    lineHeight: 23,
    marginBottom: 10,
  },
  titleAccent: {
    color: '#e6a82a',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: font.base,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: font.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  radioGroup: {
    gap: 8,
    marginBottom: 8,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#3a4258',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e6a82a',
  },
  radioTextWrap: {
    flex: 1,
  },
  radioTitle: {
    fontSize: font.base,
    fontWeight: '500',
    marginBottom: 2,
  },
  radioDesc: {
    fontSize: font.sm,
  },
  formSection: {
    marginTop: 8,
  },
  subHeadingGold: {
    fontSize: font.md,
    fontWeight: '500',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: font.xs,
    letterSpacing: 0.3,
    marginBottom: 6,
    marginTop: 12,
  },
  inputWrapper: {
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    fontSize: font.base,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  hintText: {
    fontSize: font.xs,
    fontStyle: 'italic',
    marginTop: -6,
    marginBottom: 8,
  },
  footerColumn: {
    gap: 8,
  },
  continueButtonFull: {
    backgroundColor: '#e6a82a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: font.base,
    fontWeight: '500',
    color: '#1a1204',
  },
});

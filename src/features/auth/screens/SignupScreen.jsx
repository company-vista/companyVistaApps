import { useState } from 'react';
import { Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Text, TextInput, View, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getAllCountries } from 'react-native-international-phone-number';
import Toast from 'react-native-toast-message';
import styles from './SignupScreen.styles';
import logoImage from '../../../assets/images/logoR.png';
import { clearSignupError, signupUser, resendVerification, } from '../../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useThemeColors } from '../../../theme/colors';
import EmailVerificationScreen from './EmailVerificationScreen';
import SetNewPasswordScreen from './SetNewPasswordScreen';
const socialLinks = {
    google: 'https://accounts.google.com',
    facebook: 'https://www.facebook.com/companyvista',
    instagram: 'https://www.instagram.com',
    linkedin: 'https://www.linkedin.com/company/companyvista/about',
};
function openSocialLink(url) {
    Linking.openURL(url);
}
function SignupScreen() {
    const navigation = useNavigation();
    const safeAreaInsets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const colors = useThemeColors();
    const { isLoading, signupErrors: errors } = useAppSelector(state => state.auth);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [companyName, setCompanyName] = useState('');
    const [registrationCountry, setRegistrationCountry] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [showSetPassword, setShowSetPassword] = useState(false);
    const [verifiedToken, setVerifiedToken] = useState('');
    const [verifiedClientId, setVerifiedClientId] = useState('');
    const [signupToken, setSignupToken] = useState('');
    const [signupClientId, setSignupClientId] = useState('');
    const [isResending, setIsResending] = useState(false);
    const firstNameBorderColor = errors.firstName ? '#f87171' : colors.inputBorder;
    const lastNameBorderColor = errors.lastName ? '#f87171' : colors.inputBorder;
    const emailBorderColor = errors.email ? '#f87171' : colors.inputBorder;
    const countryList = getAllCountries().map((c) => ({
        label: `${c.flag} ${c.name.common} (${c.idd.root})`,
        value: c.idd.root,
        key: c.cca2,
    }));
    async function handleResend() {
        setIsResending(true);
        const result = await dispatch(resendVerification({ email }));
        setIsResending(false);
        if (resendVerification.fulfilled.match(result)) {
            Toast.show({ type: 'success', text1: 'Email sent', text2: result.payload.message });
        }
        else if (resendVerification.rejected.match(result)) {
            Toast.show({ type: 'error', text1: 'Failed', text2: result.payload?.message || 'Could not resend email.' });
        }
    }
    async function handleSignup() {
        if (isLoading) {
            return;
        }
        const result = await dispatch(signupUser({
            firstName,
            lastName,
            email,
            phoneNumber,
            countryCode,
            companyName,
            registrationCountry,
        }));
        if (signupUser.fulfilled.match(result)) {
            setEmail(result.payload.email);
            setSignupToken(result.payload.token);
            setSignupClientId(result.payload.clientId);
            setShowVerification(true);
            Toast.show({ type: 'success', text1: 'Account created', text2: 'OTP sent to your email' });
        }
    }
    return (<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[
            styles.screen,
            { backgroundColor: colors.authBackground, paddingTop: safeAreaInsets.top },
        ]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.brandMark}>
            <Image source={logoImage} style={styles.brandLogo}/>
          </View>

          <View style={styles.header}/>

          <View style={styles.form}>
            {showSetPassword ? (<SetNewPasswordScreen email={email} clientId={verifiedClientId} token={verifiedToken} onPasswordSet={() => navigation.navigate('Login')} onBackPress={() => {
                setShowSetPassword(false);
                setShowVerification(false);
            }}/>) : showVerification ? (<EmailVerificationScreen email={email} signupToken={signupToken} signupClientId={signupClientId} onEditPress={() => setShowVerification(false)} onResend={handleResend} onOtpVerified={(data) => {
                setVerifiedToken(data.token);
                setVerifiedClientId(data.clientId);
                setShowSetPassword(true);
            }} isResending={isResending}/>) : (<>
                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <View style={[
                styles.inputWrap,
                {
                    backgroundColor: colors.inputBackground,
                    borderColor: firstNameBorderColor,
                },
            ]}>
                      <TextInput autoCapitalize="words" onChangeText={value => {
                setFirstName(value);
                dispatch(clearSignupError('firstName'));
            }} placeholder="First name" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.inputText }]} value={firstName}/>
                    </View>
                    {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <View style={[
                styles.inputWrap,
                {
                    backgroundColor: colors.inputBackground,
                    borderColor: lastNameBorderColor,
                },
            ]}>
                      <TextInput autoCapitalize="words" onChangeText={value => {
                setLastName(value);
                dispatch(clearSignupError('lastName'));
            }} placeholder="Last name" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.inputText }]} value={lastName}/>
                    </View>
                  </View>
                </View>

                <View style={styles.field}>
                  <View style={[
                styles.inputWrap,
                {
                    backgroundColor: colors.inputBackground,
                    borderColor: emailBorderColor,
                },
            ]}>
                    <FontAwesome name="envelope" size={16} color={colors.inputPlaceholder}/>
                    <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" onChangeText={value => {
                setEmail(value);
                dispatch(clearSignupError('email'));
            }} placeholder="name@example.com" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.inputText }]} value={email}/>
                  </View>
                  {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                </View>

                <View style={styles.row}>
                  <View style={{
                width: 130,
                height: 48,
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.inputBorder,
                borderRadius: 12,
                backgroundColor: colors.inputBackground,
                overflow: 'hidden',
            }}>
                    <Picker mode="dropdown" selectedValue={countryCode} onValueChange={(value) => setCountryCode(value)} style={{ color: colors.inputText }} dropdownIconColor={colors.inputPlaceholder}>
                      {countryList.map((c) => (<Picker.Item key={c.key} label={c.label} value={c.value}/>))}
                    </Picker>
                  </View>
                  <View style={[
                styles.inputWrap,
                {
                    flex: 1,
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                },
            ]}>
                    <TextInput autoCapitalize="none" keyboardType="number-pad" maxLength={15} onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))} placeholder="Phone number" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.inputText }]} value={phoneNumber}/>
                  </View>
                </View>

                <View style={styles.field}>
                  <View style={[
                styles.inputWrap,
                {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                },
            ]}>
                    <FontAwesome name="building" size={16} color={colors.inputPlaceholder}/>
                    <TextInput autoCapitalize="words" onChangeText={setCompanyName} placeholder="Company name" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.inputText }]} value={companyName}/>
                  </View>
                </View>

                <View style={styles.field}>
                  <View style={[
                styles.inputWrap,
                {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                },
            ]}>
                    <FontAwesome name="globe" size={18} color={colors.inputPlaceholder}/>
                    <TextInput autoCapitalize="words" onChangeText={setRegistrationCountry} placeholder="Registration country" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { color: colors.inputText }]} value={registrationCountry}/>
                  </View>
                </View>

                <Pressable disabled={isLoading} onPress={handleSignup} style={[
                styles.button,
                { backgroundColor: colors.primary },
                isLoading ? styles.buttonDisabled : null,
            ]}>
                  <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                    {isLoading ? 'Verify...' : 'Continue ->'}
                  </Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate('Login')}>
                  <Text style={[styles.authLinkText, { color: colors.subtle }]}>
                    Already have an account?{' '}
                    <Text style={[styles.authLink, { color: colors.accent }]}>Login</Text>
                  </Text>
                </Pressable>

                <View style={styles.socialSection}>
                  <Text style={[styles.socialTitle, { color: colors.inputPlaceholder }]}>
                    Continue with
                  </Text>
                  <View style={styles.socialRow}>
                    <Pressable onPress={() => openSocialLink(socialLinks.facebook)} style={[styles.socialButton, styles.facebookButton]}>
                      <FontAwesome name="facebook" size={15} color="#f8fafc"/>
                    </Pressable>
                    <Pressable onPress={() => openSocialLink(socialLinks.instagram)} style={[styles.socialButton, styles.instagramButton]}>
                      <FontAwesome name="instagram" size={15} color="#f8fafc"/>
                    </Pressable>
                    <Pressable onPress={() => openSocialLink(socialLinks.linkedin)} style={[styles.socialButton, styles.linkedinButton]}>
                      <FontAwesome name="linkedin" size={15} color="#f8fafc"/>
                    </Pressable>
                  </View>
                </View>
              </>)}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>);
}
export default SignupScreen;

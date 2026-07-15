import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import styles from './SignupScreen.styles';

import logoImage from '../../../assets/images/logoR.png';
import {
  clearSignupError,
  signupUser,
} from '../../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useThemeColors } from '../../../theme/colors';
import EmailVerificationScreen from './EmailVerificationScreen';

type SignupScreenProps = {
  onLoginPress: () => void;
};

const socialLinks = {
  facebook: 'https://www.facebook.com',
  instagram: 'https://www.instagram.com',
  linkedin: 'https://www.linkedin.com',
};

function openSocialLink(url: string) {
  Linking.openURL(url);
}

function SignupScreen({ onLoginPress }: SignupScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { isLoading, signupErrors: errors } = useAppSelector(state => state.auth);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [registrationCountry, setRegistrationCountry] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const firstNameBorderColor = errors.firstName ? '#f87171' : colors.inputBorder;
  const lastNameBorderColor = errors.lastName ? '#f87171' : colors.inputBorder;
  const emailBorderColor = errors.email ? '#f87171' : colors.inputBorder;

  async function handleSignup() {
    if (isLoading) {
      return;
    }

    const result = await dispatch(signupUser({ firstName, lastName, email, phoneNumber, countryCode, registrationCountry }));

    if (signupUser.fulfilled.match(result)) {
      setEmail(result.payload.email);
      setShowVerification(true);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.screen,
        { backgroundColor: colors.authBackground, paddingTop: safeAreaInsets.top },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.brandMark}>
          <Image source={logoImage} style={styles.brandLogo} />
        </View>

        <View style={styles.header}>
          {/* <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Sign up to start using Company Vista</Text> */}
        </View>

        <View style={styles.form}>
          {showVerification ? (
            <EmailVerificationScreen
              email={email}
              onEditPress={() => setShowVerification(false)}
            />
          ) : (
            <>
              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <View
                    style={[
                      styles.inputWrap,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: firstNameBorderColor,
                      },
                    ]}>
                    <TextInput
                      autoCapitalize="words"
                      onChangeText={value => {
                        setFirstName(value);
                        dispatch(clearSignupError('firstName'));
                      }}
                      placeholder="First name"
                      placeholderTextColor={colors.inputPlaceholder}
                      style={[styles.input, { color: colors.inputText }]}
                      value={firstName}
                    />
                  </View>
                  {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <View
                    style={[
                      styles.inputWrap,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: lastNameBorderColor,
                      },
                    ]}>
                    <TextInput
                      autoCapitalize="words"
                      onChangeText={value => {
                        setLastName(value);
                        dispatch(clearSignupError('lastName'));
                      }}
                      placeholder="Last name"
                      placeholderTextColor={colors.inputPlaceholder}
                      style={[styles.input, { color: colors.inputText }]}
                      value={lastName}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.field}>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: emailBorderColor,
                    },
                  ]}>
                  <FontAwesome name="envelope" size={16} color={colors.inputPlaceholder} />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    onChangeText={value => {
                      setEmail(value);
                      dispatch(clearSignupError('email'));
                    }}
                    placeholder="name@example.com"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[styles.input, { color: colors.inputText }]}
                    value={email}
                  />
                </View>
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              <View style={styles.field}>
                <View style={styles.row}>
                  <View
                    style={[
                      styles.inputWrap,
                      {
                        width: 90,
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}>
                    <TextInput
                      autoCapitalize="none"
                      keyboardType="phone-pad"
                      onChangeText={setCountryCode}
                      placeholder="+1"
                      placeholderTextColor={colors.inputPlaceholder}
                      style={[styles.input, { color: colors.inputText }]}
                      value={countryCode}
                    />
                  </View>
                  <View
                    style={[
                      styles.inputWrap,
                      {
                        flex: 1,
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}>
                    <TextInput
                      autoCapitalize="none"
                      keyboardType="phone-pad"
                      onChangeText={setPhoneNumber}
                      placeholder="Phone number"
                      placeholderTextColor={colors.inputPlaceholder}
                      style={[styles.input, { color: colors.inputText }]}
                      value={phoneNumber}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.field}>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                    },
                  ]}>
                  <FontAwesome name="globe" size={18} color={colors.inputPlaceholder} />
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={setRegistrationCountry}
                    placeholder="Registration country"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[styles.input, { color: colors.inputText }]}
                    value={registrationCountry}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <View
                    style={[
                      styles.inputWrap,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}>
                    <TextInput
                      autoCapitalize="words"
                      onChangeText={setCity}
                      placeholder="City"
                      placeholderTextColor={colors.inputPlaceholder}
                      style={[styles.input, { color: colors.inputText }]}
                      value={city}
                    />
                  </View>
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <View
                    style={[
                      styles.inputWrap,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}>
                    <TextInput
                      autoCapitalize="words"
                      onChangeText={setState}
                      placeholder="State"
                      placeholderTextColor={colors.inputPlaceholder}
                      style={[styles.input, { color: colors.inputText }]}
                      value={state}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <View
                    style={[
                      styles.inputWrap,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}>
                    <TextInput
                      autoCapitalize="none"
                      keyboardType="numeric"
                      onChangeText={setPostalCode}
                      placeholder="Postal code"
                      placeholderTextColor={colors.inputPlaceholder}
                      style={[styles.input, { color: colors.inputText }]}
                      value={postalCode}
                    />
                  </View>
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <View
                    style={[
                      styles.inputWrap,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}>
                    <TextInput
                      autoCapitalize="words"
                      onChangeText={setCountry}
                      placeholder="Country"
                      placeholderTextColor={colors.inputPlaceholder}
                      style={[styles.input, { color: colors.inputText }]}
                      value={country}
                    />
                  </View>
                </View>
              </View>

              <Pressable
                disabled={isLoading}
                onPress={handleSignup}
                style={[
                  styles.button,
                  { backgroundColor: colors.primary },
                  isLoading ? styles.buttonDisabled : null,
                ]}>
                <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                  {isLoading ? 'Verify...' : 'Continue ->'}
                </Text>
              </Pressable>

              <Pressable onPress={onLoginPress}>
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
                  <Pressable
                    onPress={() => openSocialLink(socialLinks.facebook)}
                    style={[styles.socialButton, styles.facebookButton]}>
                    <FontAwesome name="facebook" size={15} color="#f8fafc" />
                  </Pressable>
                  <Pressable
                    onPress={() => openSocialLink(socialLinks.instagram)}
                    style={[styles.socialButton, styles.instagramButton]}>
                    <FontAwesome name="instagram" size={15} color="#f8fafc" />
                  </Pressable>
                  <Pressable
                    onPress={() => openSocialLink(socialLinks.linkedin)}
                    style={[styles.socialButton, styles.linkedinButton]}>
                    <FontAwesome name="linkedin" size={15} color="#f8fafc" />
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default SignupScreen;

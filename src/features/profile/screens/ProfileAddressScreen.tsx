import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { BackButton, SaveButton } from '../../../components/buttons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateProfileUser } from '../../../store/slices/authSlice';
import { useThemeColors } from '../../../theme/colors';
import { updateClientProfile } from '../api/clientProfileDetailsApi';
import styles from './EditProfileScreen.styles';
import type { MainScreenProps } from '../../../navigation/types';

type Nav = MainScreenProps<'ProfileAddress'>['navigation'];

function ProfileAddressScreen() {
  const navigation = useNavigation<Nav>();
  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const user = useAppSelector(state => state.auth.user);
  const token = useAppSelector(state => state.auth.token);
  const [street, setStreet] = useState(
    user?.address?.addressLine1 ?? user?.address?.street ?? user?.addressLine1 ?? user?.street ?? '',
  );
  const initialCityState = [user?.address?.city, user?.address?.state]
    .filter(Boolean)
    .join(', ');
  const [cityState, setCityState] = useState(
    initialCityState || user?.state || '',
  );
  const [postalCode, setPostalCode] = useState(
    user?.address?.postalCode ?? user?.postalCode ?? '',
  );
  const [country, setCountry] = useState(user?.address?.country ?? user?.country ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePress = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const [city = '', ...stateParts] = cityState.split(',').map(part => part.trim());
      const state = stateParts.join(', ');
      const nextAddress = {
        addressLine1: street,
        city,
        country,
        postalCode,
        state,
        street,
      };
      const result = await updateClientProfile({
        payload: {
          address: nextAddress,
          addressLine1: street,
          city,
          company: user?.company ?? user?.companyName,
          country,
          countryCode: user?.countryCode,
          dateOfBirth: user?.dateOfBirth ?? user?.dob,
          email: user?.email ?? '',
          name: user?.name ?? [user?.firstName, user?.lastName].filter(Boolean).join(' '),
          passportNumber: user?.passportNumber ?? user?.passportNo,
          phone: user?.phone ?? user?.phoneNumber ?? user?.mobile ?? '',
          postalCode,
        },
        token,
      });

      if (!result.isSuccess) {
        Alert.alert('Update failed', result.error);
        return;
      }

      dispatch(updateProfileUser({
        ...result.user,
        address: nextAddress,
        addressLine1: street,
        country,
        postalCode,
        state,
        street,
      }));
      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to update address right now.';

      Alert.alert('Update failed', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.screen,
        { paddingTop: safeAreaInsets.top + 22 },
      ]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={[styles.title, { color: colors.text }]}>Address & Edit</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(safeAreaInsets.bottom, 24) },
        ]}>
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <AddressInput
            icon="map-marker"
            label="Street"
            onChangeText={setStreet}
            value={street}
          />
          <AddressInput
            icon="building-o"
            label="City & State"
            onChangeText={setCityState}
            placeholder="City, State"
            value={cityState}
          />
          <AddressInput
            icon="envelope-o"
            label="Postal Code"
            onChangeText={setPostalCode}
            value={postalCode}
          />
          <AddressInput
            icon="globe"
            label="Country"
            onChangeText={setCountry}
            value={country}
          />
        </View>

        <SaveButton isLoading={isSaving} onPress={handleSavePress} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type AddressInputProps = {
  icon: string;
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
};

function AddressInput({
  icon,
  label,
  onChangeText,
  placeholder,
  value,
}: AddressInputProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.subtle }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
        ]}>
        <FontAwesome name={icon} size={16} color={colors.accent} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text }]}
        />
      </View>
    </View>
  );
}

export default ProfileAddressScreen;

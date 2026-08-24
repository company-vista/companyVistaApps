import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SaveButton } from '../../../components/buttons';
import BackButton from '../../../components/buttons/BackButton';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateProfileUser } from '../../../store/slices/authSlice';
import { useThemeColors } from '../../../theme/colors';
import ProfileDatePickerModal from '../components/ProfileDatePickerModal';
import { uploadClientAvatar } from '../api/clientProfileAvatarApi';
import { updateClientProfile } from '../api/clientProfileDetailsApi';
import styles from './EditProfileScreen.styles';
function withImageCacheBust(uri) {
    if (!/^https?:\/\//i.test(uri)) {
        return uri;
    }
    const separator = uri.includes('?') ? '&' : '?';
    return `${uri}${separator}t=${Date.now()}`;
}
function getDateInputValue(value) {
    if (!value) {
        return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toISOString().slice(0, 10);
}
function EditProfileScreen() {
    const navigation = useNavigation();
    const safeAreaInsets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const colors = useThemeColors();
    const user = useAppSelector(state => state.auth.user);
    const token = useAppSelector(state => state.auth.token);
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [phone, setPhone] = useState(user?.phone ?? user?.phoneNumber ?? user?.mobile ?? '');
    const [dateOfBirth, setDateOfBirth] = useState(getDateInputValue(user?.dateOfBirth ?? user?.dob));
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [passportNumber, setPassportNumber] = useState(user?.passportNumber ?? user?.passportNo ?? '');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [localAvatarUri, setLocalAvatarUri] = useState(null);
    const profileImage = localAvatarUri ??
        user?.profileImage ??
        user?.profilePicture ??
        user?.avatar ??
        user?.image ??
        user?.photo;
    const handleSavePress = async () => {
        if (isSavingProfile) {
            return;
        }
        setIsSavingProfile(true);
        try {
            const result = await updateClientProfile({
                payload: {
                    address: user?.address,
                    addressLine1: user?.address?.addressLine1 ?? user?.addressLine1,
                    city: user?.address?.city,
                    country: user?.address?.country ?? user?.country,
                    countryCode: user?.countryCode,
                    dateOfBirth,
                    email,
                    name,
                    passportNumber,
                    phone,
                    postalCode: user?.address?.postalCode ?? user?.postalCode,
                },
                token,
            });
            if (!result.isSuccess) {
                Alert.alert('Update failed', result.error);
                return;
            }
            dispatch(updateProfileUser({
                ...result.user,
                dateOfBirth,
                dob: dateOfBirth,
                email,
                mobile: phone,
                name,
                passportNo: passportNumber,
                passportNumber,
                phone,
                phoneNumber: phone,
            }));
            navigation.goBack();
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Unable to update profile right now.';
            Alert.alert('Update failed', message);
        }
        finally {
            setIsSavingProfile(false);
        }
    };
    const handleAvatarPress = async () => {
        if (isUploadingAvatar) {
            return;
        }
        try {
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                // Android 13+ may prompt for media access before the picker opens.
            }
            const response = await launchImageLibrary({
                mediaType: 'photo',
                quality: 1,
                selectionLimit: 1,
            });
            if (response.didCancel) {
                return;
            }
            if (response.errorMessage) {
                Alert.alert('Gallery error', response.errorMessage);
                return;
            }
            const asset = response.assets?.[0];
            if (!asset?.uri) {
                Alert.alert('Image missing', 'Please select another image.');
                return;
            }
            setLocalAvatarUri(asset.uri);
            setIsUploadingAvatar(true);
            const result = await uploadClientAvatar({
                file: {
                    name: asset.fileName,
                    type: asset.type,
                    uri: asset.uri,
                },
                token,
            });
            if (!result.isSuccess) {
                Alert.alert('Upload failed', result.error);
                return;
            }
            const nextAvatar = withImageCacheBust(result.avatar ?? asset.uri);
            dispatch(updateProfileUser({
                ...(user ?? { email: '' }),
                avatar: nextAvatar,
                image: nextAvatar,
                photo: nextAvatar,
                profileImage: nextAvatar,
                profilePicture: nextAvatar,
            }));
            setLocalAvatarUri(nextAvatar);
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Unable to update profile image right now.';
            Alert.alert('Upload failed', message);
        }
        finally {
            setIsUploadingAvatar(false);
        }
    };
    const handleOpenDatePicker = () => {
        setIsDatePickerVisible(true);
    };
    const handleConfirmDate = (value) => {
        setDateOfBirth(value);
        setIsDatePickerVisible(false);
    };
    return (<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(safeAreaInsets.bottom, 24), paddingTop: safeAreaInsets.top + 12 },
        ]}>
            <View style={styles.titleRow}>
                <BackButton onPress={() => navigation.goBack()}/>
                <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
            </View>

            <View style={[styles.avatarCard, { backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight }]}>
                <View style={styles.avatarWrap}>
                    <View style={[
                        styles.avatar,
                        { backgroundColor: colors.cardHighlight, borderColor: colors.accentSoft },
                    ]}>
                        {profileImage ? (<Image onError={event => console.log('Edit profile avatar failed', event.nativeEvent.error, profileImage)} source={{ uri: profileImage }} style={styles.avatarImage} />) : (<FontAwesome name="user" size={42} color={colors.accent} />)}
                    </View>
                    <Pressable disabled={isUploadingAvatar} onPress={handleAvatarPress} style={[
                        styles.cameraButton,
                        { backgroundColor: colors.accent, borderColor: colors.surface },
                    ]}>
                        {isUploadingAvatar ? (<ActivityIndicator size="small" color="#ffffff" />) : (<FontAwesome name="camera" size={22} color="#ffffff" />)}
                    </Pressable>
                </View>
            </View>

            <View style={[styles.formCard, { backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight }]}>
                <ProfileInput icon="user-o" label="Name" onChangeText={setName} value={name} />
                <ProfileInput icon="envelope-o" label="Email" editable={false} keyboardType="email-address" onChangeText={setEmail} value={email} />
                <ProfileInput icon="phone" label="Phone" keyboardType="phone-pad" onChangeText={setPhone} value={phone} />
                <DateProfileInput icon="calendar-o" label="Date of Birth" onPress={handleOpenDatePicker} placeholder="YYYY-MM-DD" value={dateOfBirth} />
                <ProfileInput icon="id-card-o" label="Passport Number" autoCapitalize="characters" onChangeText={setPassportNumber} value={passportNumber} />
            </View>

            <SaveButton isLoading={isSavingProfile} label="Profile Update" onPress={handleSavePress} />
        </ScrollView>

        <ProfileDatePickerModal onClose={() => setIsDatePickerVisible(false)} onConfirm={handleConfirmDate} value={dateOfBirth} visible={isDatePickerVisible} />
    </KeyboardAvoidingView>);
}


function ProfileInput({ autoCapitalize = 'sentences', editable = true, icon, keyboardType = 'default', label, onChangeText, placeholder, value, }) {
    const colors = useThemeColors();
    return (<View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.subtle }]}>{label}</Text>
        <View style={[
            styles.inputRow,
            { backgroundColor: colors.cardHighlight, borderColor: colors.border },
        ]}>
            <FontAwesome name={icon} size={16} color={colors.accent} />
            <TextInput autoCapitalize={autoCapitalize} editable={editable} value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholder={placeholder} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text }]} />
        </View>
    </View>);
}

function DateProfileInput({ icon, label, onPress, placeholder, value, }) {
    const colors = useThemeColors();
    return (<Pressable accessibilityRole="button" onPress={onPress} style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.subtle }]}>{label}</Text>
        <View style={[
            styles.inputRow,
            { backgroundColor: colors.cardHighlight, borderColor: colors.border },
        ]}>
            <FontAwesome name={icon} size={16} color={colors.accent} />
            <Text numberOfLines={1} style={[
                styles.input,
                styles.dateInputText,
                { color: value ? colors.text : colors.muted },
            ]}>
                {value || placeholder}
            </Text>
            <FontAwesome name="angle-down" size={18} color={colors.muted} />
        </View>
    </Pressable>);
}
export default EditProfileScreen;

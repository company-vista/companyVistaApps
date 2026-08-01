import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';
import { BackButton } from '../../../components/buttons';
import { useThemeColors } from '../../../theme/colors';
import styles from './HelpFeedbackScreen.styles';
export default function SendFeedbackScreen({ onBackPress }) {
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useThemeColors();
    const [feedback, setFeedback] = useState('');
    const [selectedMediaUri, setSelectedMediaUri] = useState(null);
    const canSend = feedback.trim().length > 0;
    const handleAddMediaPress = async () => {
        try {
            if (typeof launchImageLibrary !== 'function') {
                Alert.alert('Gallery unavailable', 'Please rebuild the app once after installing the gallery picker.');
                return;
            }
            const response = await launchImageLibrary({
                mediaType: 'mixed',
                selectionLimit: 1,
            });
            if (response.didCancel) {
                return;
            }
            if (response.errorMessage) {
                Alert.alert('Gallery error', response.errorMessage);
                return;
            }
            const assetUri = response.assets?.[0]?.uri;
            if (assetUri) {
                setSelectedMediaUri(assetUri);
            }
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Unable to open gallery right now.';
            Alert.alert('Gallery error', message);
        }
    };
    return (<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[
            styles.screen,
            {
                paddingTop: safeAreaInsets.top,
            },
        ]}>
      <View style={[
            styles.feedbackHeader,
            { borderBottomColor: colors.border },
        ]}>
        <BackButton onPress={onBackPress}/>
        <Text style={[styles.feedbackHeaderTitle, { color: colors.text }]}>
          Send feedback
        </Text>
      </View>

      <View style={styles.feedbackContent}>
        <Text style={[styles.feedbackHelpText, { color: colors.muted }]}>
          For other issues like spam or scams, you can get help or contact
          support from the{' '}
          <Text style={[styles.linkText, { color: colors.accent }]}>
            Help centre.
          </Text>
        </Text>

        <TextInput multiline value={feedback} onChangeText={setFeedback} placeholder="Describe the technical issue" placeholderTextColor={colors.muted} style={[
            styles.issueInput,
            {
                borderColor: colors.muted,
                color: colors.text,
                backgroundColor: colors.surface,
            },
        ]} textAlignVertical="top"/>

        <View style={styles.mediaSection}>
          <Text style={[styles.mediaTitle, { color: colors.text }]}>
            Screenshots or recordings (optional)
          </Text>
          <Text style={[styles.mediaSubtitle, { color: colors.muted }]}>
            Tap screenshot to edit or remove sensitive info
          </Text>

          <Pressable accessibilityRole="button" accessibilityLabel="Add screenshot or recording" onPress={handleAddMediaPress} style={[
            styles.addMediaButton,
            {
                backgroundColor: colors.surface,
                borderColor: colors.border,
            },
        ]}>
            {selectedMediaUri ? (<Image source={{ uri: selectedMediaUri }} style={styles.selectedMediaPreview}/>) : (<View>
                <FontAwesome name="picture-o" size={27} color={colors.text}/>
                <View style={[
                styles.plusBadge,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.surface,
                },
            ]}>
                  <FontAwesome name="plus" size={10} color={colors.text}/>
                </View>
              </View>)}
          </Pressable>
        </View>
      </View>

      <View style={[
            styles.footer,
            { paddingBottom: Math.max(safeAreaInsets.bottom, 18) },
        ]}>
        <Text style={[styles.footerText, { color: colors.muted }]}>
          By sending, you allow Vista to review related technical info to help
          address your feedback.{' '}
          <Text style={[styles.linkText, { color: colors.accent }]}>
            Learn more
          </Text>
        </Text>
        <Pressable disabled={!canSend} style={[
            styles.sendButton,
            {
                backgroundColor: canSend ? colors.primary : colors.border,
            },
        ]}>
          <Text style={[
            styles.sendButtonText,
            { color: canSend ? colors.primaryText : colors.subtle },
        ]}>
            Send
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>);
}

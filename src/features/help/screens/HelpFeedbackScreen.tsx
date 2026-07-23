import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';
import styles from './HelpFeedbackScreen.styles';
import type { MainScreenProps } from '../../../navigation/types';

import logoImage from '../../../assets/images/logo.jpg';
import { BackButton } from '../../../components/buttons';
import { useThemeColors } from '../../../theme/colors';

const helpItems = [
  {
    icon: 'question-circle-o',
    title: 'Help centre',
    subtitle: 'Get help, contact us',
  },
  {
    icon: 'bug',
    title: 'Send feedback',
    subtitle: 'Report technical issues',
  },
  {
    icon: 'file-text-o',
    title: 'Terms and Privacy Policy',
  },
  {
    icon: 'exclamation-circle',
    title: 'Channel reports',
  },
  {
    icon: 'info-circle',
    title: 'App info',
  },
];

const appInfoItems = [
  { label: 'App name', value: 'Company Vista' },
  { label: 'Version', value: '0.0.1' },
  { label: 'Platform', value: Platform.OS === 'ios' ? 'iOS' : 'Android' },
  { label: 'React Native', value: '0.85.3' },
  { label: 'Support', value: 'support@companyvista.com' },
];

type Nav = MainScreenProps<'HelpFeedback'>['navigation'];

function HelpFeedbackScreen() {
  const navigation = useNavigation<Nav>();
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [activePage, setActivePage] = useState<
    'appInfo' | 'helpList' | 'sendFeedback'
  >('helpList');
  const [feedback, setFeedback] = useState('');
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | null>(null);
  const canSend = feedback.trim().length > 0;

  //----------------Send Feedback form---------------
  const handleAddMediaPress = async () => {
    try {
      if (typeof launchImageLibrary !== 'function') {
        Alert.alert(
          'Gallery unavailable',
          'Please rebuild the app once after installing the gallery picker.',
        );
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
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to open gallery right now.';

      Alert.alert('Gallery error', message);
    }
  };

  if (activePage === 'sendFeedback') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.screen,
          {
            paddingTop: safeAreaInsets.top,
          },
        ]}>
        <View
          style={[
            styles.feedbackHeader,
            { borderBottomColor: colors.border },
          ]}>
          <BackButton onPress={() => setActivePage('helpList')} />
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

          <TextInput
            multiline
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Describe the technical issue"
            placeholderTextColor={colors.muted}
            style={[
              styles.issueInput,
              {
                borderColor: colors.muted,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            textAlignVertical="top"
          />

          <View style={styles.mediaSection}>
            <Text style={[styles.mediaTitle, { color: colors.text }]}>
              Screenshots or recordings (optional)
            </Text>
            <Text style={[styles.mediaSubtitle, { color: colors.muted }]}>
              Tap screenshot to edit or remove sensitive info
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add screenshot or recording"
              onPress={handleAddMediaPress}
              style={[
                styles.addMediaButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}>
              {selectedMediaUri ? (
                <Image
                  source={{ uri: selectedMediaUri }}
                  style={styles.selectedMediaPreview}
                />
              ) : (
                <View>
                  <FontAwesome name="picture-o" size={27} color={colors.text} />
                  <View
                    style={[
                      styles.plusBadge,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.surface,
                      },
                    ]}>
                    <FontAwesome name="plus" size={10} color={colors.text} />
                  </View>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <View
          style={[
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
          <Pressable
            disabled={!canSend}
            style={[
              styles.sendButton,
              {
                backgroundColor: canSend ? colors.primary : colors.border,
              },
            ]}>
            <Text
              style={[
                styles.sendButtonText,
                { color: canSend ? colors.primaryText : colors.subtle },
              ]}>
              Send
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (activePage === 'appInfo') {
    return (
      <View
        style={[
          styles.screen,
          {
            paddingTop: safeAreaInsets.top,
          },
        ]}>
        <View
          style={[
            styles.feedbackHeader,
            { borderBottomColor: colors.border },
          ]}>
          <BackButton onPress={() => setActivePage('helpList')} />
          <Text style={[styles.feedbackHeaderTitle, { color: colors.text }]}>
            App info
          </Text>
        </View>

        <View style={styles.appInfoContent}>
          <View style={[styles.appInfoCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.appInfoIcon, { backgroundColor: colors.accentSoft }]}>
              <Image source={logoImage} style={styles.appInfoLogo} />
            </View>
            <Text style={[styles.appInfoTitle, { color: colors.text }]}>
              Company Vista
            </Text>
            <Text style={[styles.appInfoSubtitle, { color: colors.muted }]}>
              Client Portal Application
            </Text>
          </View>

          <View style={[styles.appInfoList, { backgroundColor: colors.surface }]}>
            {appInfoItems.map(item => (
              <View
                key={item.label}
                style={[styles.appInfoRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.appInfoLabel, { color: colors.muted }]}>
                  {item.label}
                </Text>
                <Text style={[styles.appInfoValue, { color: colors.text }]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: safeAreaInsets.top },
      ]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Help and feedback
        </Text>
      </View>

      <View style={styles.list}>
        {helpItems.map(item => (
          <Pressable
            key={item.title}
            onPress={() => {
              if (item.title === 'Send feedback') {
                setActivePage('sendFeedback');
                return;
              }

              if (item.title === 'App info') {
                setActivePage('appInfo');
              }
            }}
            style={styles.itemRow}>
            <View style={styles.itemIcon}>
              <FontAwesome name={item.icon} size={25} color={colors.muted} />
            </View>
            <View style={styles.itemCopy}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text style={[styles.itemSubtitle, { color: colors.muted }]}>
                  {item.subtitle}
                </Text>
              ) : null}
            </View>
            <FontAwesome name="angle-right" size={22} color={colors.subtle} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}



export default HelpFeedbackScreen;

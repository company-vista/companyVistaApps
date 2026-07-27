import { Image, Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '../../../components/buttons';
import { useThemeColors } from '../../../theme/colors';
import styles from './HelpFeedbackScreen.styles';
import logoImage from '../../../assets/images/logo.jpg';

const appInfoItems = [
  { label: 'App name', value: 'Company Vista' },
  { label: 'Version', value: '0.0.1' },
  { label: 'Platform', value: Platform.OS === 'ios' ? 'iOS' : 'Android' },
  { label: 'React Native', value: '0.85.3' },
  { label: 'Support', value: 'support@companyvista.com' },
];

type AppInfoScreenProps = {
  onBackPress: () => void;
};

export default function AppInfoScreen({ onBackPress }: AppInfoScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();

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
        <BackButton onPress={onBackPress} />
        <Text style={[styles.feedbackHeaderTitle, { color: colors.text }]}>
          App info
        </Text>
      </View>

      <View style={styles.appInfoContent}>
        <View style={[styles.appInfoCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
          <View style={[styles.appInfoIcon, { backgroundColor: colors.accentSoft }]}>
            <Image source={logoImage} style={styles.appInfoLogo} />
          </View>
          <Text style={[styles.appInfoTitle, { color: colors.text }]}>
            Company Vista
          </Text>
          <Text style={[styles.appInfoSubtitle, { color: colors.muted }]}>
            Client Application
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

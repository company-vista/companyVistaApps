import { useState, useMemo } from 'react';
import { Pressable, Text, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { createStyles } from './HelpFeedbackScreen.styles';
import AppInfoScreen from './AppInfoScreen';
import SendFeedbackScreen from './SendFeedbackScreen';
import { useThemeColors } from '../../../theme/colors';
import { useResponsive } from '../../../hooks/useResponsive';

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
        icon: 'exclamation-circle',
        title: 'Channel reports',
    },
    {
        icon: 'info-circle',
        title: 'App info',
    },
];
function HelpFeedbackScreen() {
    const colors = useThemeColors();
    const navigation = useNavigation();
    const { rs, rvs, rms, width, height, isLandscape } = useResponsive();
    const styles = useMemo(() => createStyles({ rs, rvs, rms, width, height }), [rs, rvs, rms, width, height]);
    const [activePage, setActivePage] = useState('helpList');
    if (activePage === 'sendFeedback') {
        return <SendFeedbackScreen onBackPress={() => {
            setActivePage('helpList');
            navigation.setOptions({ headerShown: true });
        }}/>;
    }
    if (activePage === 'appInfo') {
        return <AppInfoScreen onBackPress={() => {
            setActivePage('helpList');
            navigation.setOptions({ headerShown: true });
        }}/>;
    }
    return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
            {helpItems.map(item => (
            <Pressable key={item.title} onPress={() => {
                if (item.title === 'Send feedback') {
                    setActivePage('sendFeedback');
                    navigation.setOptions({ headerShown: false });
                    return;
                }
                if (item.title === 'App info') {
                    setActivePage('appInfo');
                    navigation.setOptions({ headerShown: false });
                }
            }} style={({ pressed }) => [styles.itemRow, { backgroundColor: pressed ? colors.surface : 'transparent', opacity: pressed ? 0.9 : 1 }]}>
            <View style={styles.itemIcon}>
              <FontAwesome name={item.icon} size={rms(25)} color={colors.muted}/>
            </View>
            <View style={styles.itemCopy}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              {item.subtitle ? (<Text style={[styles.itemSubtitle, { color: colors.muted }]}>
                  {item.subtitle}
                </Text>) : null}
            </View>
            <FontAwesome name="angle-right" size={rms(22)} color={colors.subtle}/>
          </Pressable>))}
        </View>
      </ScrollView>
    </View>);
}
export default HelpFeedbackScreen;

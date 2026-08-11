import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from './HelpFeedbackScreen.styles';
import AppInfoScreen from './AppInfoScreen';
import SendFeedbackScreen from './SendFeedbackScreen';
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
function HelpFeedbackScreen() {
    const colors = useThemeColors();
    const navigation = useNavigation();
    const isLight = colors.mode === 'light';
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
    return (<View style={styles.screen}>
      <View style={styles.list}>
        {helpItems.map(item => (<Pressable key={item.title} onPress={() => {
                if (item.title === 'Send feedback') {
                    setActivePage('sendFeedback');
                    navigation.setOptions({ headerShown: false });
                    return;
                }
                if (item.title === 'App info') {
                    setActivePage('appInfo');
                    navigation.setOptions({ headerShown: false });
                }
            }} style={[styles.itemRow, { backgroundColor: isLight ? 'rgba(229,231,235,0.5)' : 'rgba(255,255,255,0.07)' }]}>
            <View style={styles.itemIcon}>
              <FontAwesome name={item.icon} size={25} color={colors.muted}/>
            </View>
            <View style={styles.itemCopy}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              {item.subtitle ? (<Text style={[styles.itemSubtitle, { color: colors.muted }]}>
                  {item.subtitle}
                </Text>) : null}
            </View>
            <FontAwesome name="angle-right" size={22} color={colors.subtle}/>
          </Pressable>))}
      </View>
    </View>);
}
export default HelpFeedbackScreen;

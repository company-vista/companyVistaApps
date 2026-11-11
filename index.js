/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { displayPushNotification } from './src/features/notifications/services/pushNotifications';

if (Platform.OS === 'android') {
    setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
        if (!remoteMessage.notification) {
            await displayPushNotification(remoteMessage);
        }
    });
}

AppRegistry.registerComponent(appName, () => App);

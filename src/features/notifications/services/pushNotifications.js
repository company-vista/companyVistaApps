import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export const COMPANY_NOTIFICATION_CHANNEL_ID = 'companyvista_notifications';

export async function initializePushNotifications() {
    if (Platform.OS !== 'android') return null;

    await notifee.createChannel({
        id: COMPANY_NOTIFICATION_CHANNEL_ID,
        name: 'Company Vista notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
    });

    const permission = await notifee.requestPermission();
    if (permission.authorizationStatus === AuthorizationStatus.DENIED) return null;
    return getToken(getMessaging());
}

export async function displayPushNotification(remoteMessage) {
    const data = remoteMessage?.data ?? {};
    const title = remoteMessage?.notification?.title ?? data.title ?? 'Company Vista';
    const body = remoteMessage?.notification?.body ?? data.message ?? '';
    if (!body) return;

    await notifee.displayNotification({
        id: data.notificationId || undefined,
        title,
        body,
        data,
        android: {
            channelId: COMPANY_NOTIFICATION_CHANNEL_ID,
            pressAction: { id: 'default' },
        },
    });
}

export { getMessaging };

import React, { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { fetchClientProfile } from '../../../profile/api/clientProfileDetailsApi';
import { updateProfileUser } from '../../../../store/slices/authSlice';
import { useAppDispatch } from '../../../../store/hooks';
import { fetchNotifications } from '../../../notifications/api/notificationsApi';
export default function PullToRefresh({ token, selectedCompanyId, colors, onNotificationCountChange, progressViewOffset, children, ...scrollProps }) {
    const dispatch = useAppDispatch();
    const [isRefreshing, setIsRefreshing] = useState(false);
    async function onRefresh() {
        setIsRefreshing(true);
        const result = await fetchClientProfile(token);
        if (result.isSuccess && result.user) {
            dispatch(updateProfileUser(result.user));
        }
        const notifResult = await fetchNotifications({ token });
        if (notifResult.isSuccess) {
            const filtered = selectedCompanyId
                ? notifResult.notifications.filter(n => n.companyId === selectedCompanyId && !n.isRead)
                : notifResult.notifications.filter(n => !n.isRead);
            onNotificationCountChange?.(filtered.length);
        }
        setIsRefreshing(false);
    }
    return (<ScrollView refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} progressViewOffset={progressViewOffset} colors={[colors.primary]} tintColor={colors.primary}/>} {...scrollProps}>
      {children}
    </ScrollView>);
}

import React, { useState } from 'react';
import { RefreshControl, ScrollView, type ScrollViewProps } from 'react-native';
import { fetchClientProfile } from '../../../profile/api/clientProfileDetailsApi';
import { updateProfileUser } from '../../../../store/slices/authSlice';
import { useAppDispatch } from '../../../../store/hooks';
import { fetchNotifications } from '../../../notifications/api/notificationsApi';
import type { AppTheme } from '../../../../theme/colors';

type PullToRefreshProps = ScrollViewProps & {
  token: string | null;
  selectedCompanyId?: string | null;
  colors: AppTheme;
  onNotificationCountChange?: (count: number) => void;
  progressViewOffset?: number;
};

export default function PullToRefresh({
  token,
  selectedCompanyId,
  colors,
  onNotificationCountChange,
  progressViewOffset,
  children,
  ...scrollProps
}: PullToRefreshProps) {
  const dispatch = useAppDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function onRefresh() {
    setIsRefreshing(true);

    const result = await fetchClientProfile(token);
    if (result.isSuccess && result.user) {
      dispatch(updateProfileUser(result.user));
    }

    const notifResult = await fetchNotifications({ token, companyId: selectedCompanyId });
    if (notifResult.isSuccess) {
      onNotificationCountChange?.(notifResult.notifications.length);
    }

    setIsRefreshing(false);
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          progressViewOffset={progressViewOffset}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      {...scrollProps}
    >
      {children}
    </ScrollView>
  );
}
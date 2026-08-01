import { View } from 'react-native';
import { useThemeColors } from '../theme/colors';
import styles from './NotificationPageSkeleton.styles';
function NotificationPageSkeleton() {
    const colors = useThemeColors();
    return (<>
      <View style={styles.filterRow}>
        {[1, 2, 3].map(item => (<View key={item} style={[styles.filterPill, { backgroundColor: colors.skeleton }]}/>))}
      </View>

      <View style={[
            styles.listCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        {[1, 2, 3, 4, 5, 6, 7].map(item => (<View key={item} style={[styles.notificationRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.iconSkeleton, { backgroundColor: colors.skeleton }]}/>
            <View style={styles.copySkeleton}>
              <View style={[styles.titleSkeleton, { backgroundColor: colors.skeleton }]}/>
              <View style={[styles.messageSkeleton, { backgroundColor: colors.skeleton }]}/>
              <View style={[styles.timeSkeleton, { backgroundColor: colors.skeleton }]}/>
            </View>
          </View>))}
      </View>
    </>);
}
export default NotificationPageSkeleton;

// TabPlaceholder.styles.ts में ये प्रॉपर्टीज सुनिश्चित करें:
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    paddingTop: 16,
     padding: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 25,
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#256F46',
    borderWidth: 2,
    borderColor: '#F8F9FA',
  },
  userInfo: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
  },
  themeButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  healthCard: {
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthTitle: {
    fontSize: 14,
  },
  healthPercentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  healthSubtext: {
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mainCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextBlock: {
    flex: 1,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    marginLeft: 4,
  },
  rightBadgeWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  badgeWrap: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  renewButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  renewButtonText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  expandedDetails: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 8,
  },
  detailGrid: {
    flexDirection: 'row',
  },
  gridColumn: {
    flex: 1,
  },
});
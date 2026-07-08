import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 34,
    marginBottom: 16,
  },
  sectionTitleNoMargin: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  viewAll: {
    color: '#c2410c',
    fontSize: 15,
    fontWeight: '800',
  },
  horizontalList: {
    gap: 18,
    paddingRight: 18,
  },
  skeletonCard: {
    width: 335,
    height: 136,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  skeletonImage: {
    width: 126,
    height: 106,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  skeletonContent: {
    flex: 1,
    gap: 16,
    marginLeft: 14,
  },
  skeletonLineLarge: {
    height: 25,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
  },
  skeletonLineMedium: {
    width: '64%',
    height: 25,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
  },
  skeletonLineSmall: {
    width: '34%',
    height: 25,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
  },
});

export default styles;
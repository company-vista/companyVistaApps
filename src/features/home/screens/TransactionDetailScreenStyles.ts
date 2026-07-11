import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
  },
  amountCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
  },
  amountBreakdown: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  amountModeCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  amountModeLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountModeGateway: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountModeValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 0.4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    flex: 0.6,
    textAlign: 'right',
  },
  downloadRow: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: '600',
  },
});
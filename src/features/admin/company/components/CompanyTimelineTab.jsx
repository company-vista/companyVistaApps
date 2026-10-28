import React, { useMemo } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './companyDetailsStyles';
import {
  buildTimeline,
  formatDate,
  formatDateTime,
  formatLabel,
  getAddonComplianceItems,
  getAgentAddressItem,
  getFilingMeta,
} from '../utils/companyDetails';

const getItem = (compliance, keys = []) => {
  if (!compliance) return null;
  for (let i = 0; i < keys.length; i += 1) {
    const value = compliance[keys[i]];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (Object.keys(value).length) return value;
    }
  }
  return null;
};

const addOneYearToDate = dateStr => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    d.setFullYear(d.getFullYear() + 1);
    return d;
  } catch (e) {
    return null;
  }
};

const getStatusPillStyle = tone => {
  if (tone === 'green') {
    return {
      pill: styles.webPillGreen,
      text: styles.webPillTextGreen,
    };
  }
  if (tone === 'amber') {
    return {
      pill: styles.webPillAmber,
      text: styles.webPillTextAmber,
    };
  }
  if (tone === 'red') {
    return {
      pill: styles.webPillRed,
      text: styles.webPillTextRed,
    };
  }
  return {
    pill: styles.webPillGray,
    text: styles.webPillTextGray,
  };
};

const CompanyTimelineTab = ({ company, compliance }) => {
  const timeline = useMemo(() => buildTimeline(company), [company]);
  const addonCompliance = useMemo(
    () => getAddonComplianceItems(compliance),
    [compliance],
  );
  const addonItems = addonCompliance.filter(entry => entry.item);

  const federalItem = getItem(compliance, [
    'federalTaxFiling',
    'federalFiling',
  ]);
  const annualItem = getItem(compliance, ['annualFiling', 'stateFiling']);
  const agentItem = getAgentAddressItem(compliance);

  const handleAction = label => {
    Alert.alert(label, 'This action is available in the web app.');
  };

  const renderCoreCard = (config, index) => {
    const item = config.item;
    if (!item) return null;
    const meta = getFilingMeta(item);
    const pill = getStatusPillStyle(meta.tone);
    const statusKey = String(item?.status || '')
      .toLowerCase()
      .replace(/_/g, ' ');
    const isCompleted = statusKey.includes('completed');
    const isClientManaged =
      statusKey.includes('client') && statusKey.includes('managed');

    if (config.type === 'agent') {
      const dueDate = item?.dueDate || item?.renewalDueDate;
      return (
        <View
          key={config.key}
          style={[styles.webCard, index > 0 && styles.webCardSpacing]}
        >
          <View style={styles.webCardHeader}>
            <View style={styles.webCardTitleRow}>
              <View style={[styles.webIconCircle, styles.webIconCirclePurple]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#7C3AED"
                />
              </View>
              <View style={styles.webCardTitleWrap}>
                <Text style={styles.webCardTitle}>
                  Registered Agent & Address
                </Text>
                <Text style={styles.webCardSubtitle}>
                  Registered agent + address service
                </Text>
              </View>
            </View>
            <View style={[styles.webPill, pill.pill]}>
              <Text style={[styles.webPillText, pill.text]}>
                {isClientManaged ? 'Client-Managed' : meta.label}
              </Text>
            </View>
          </View>
          <View style={styles.webCardBody}>
            <View style={styles.webInfoRow}>
              <Text style={styles.webInfoLabel}>Applicable Year</Text>
              <Text style={styles.webInfoValue}>
                {item?.applicableYear || 'Not set'}
              </Text>
            </View>
            <View style={styles.webInfoRow}>
              <Text style={styles.webInfoLabel}>Renewal Due</Text>
              <Text style={styles.webInfoValue}>
                {dueDate ? formatDate(dueDate) : 'Not set'}
              </Text>
            </View>
          </View>
          <View style={styles.webCardActions}>
            <TouchableOpacity
              style={styles.webActionPrimary}
              activeOpacity={0.8}
              onPress={() => handleAction('Renew')}
            >
              <Text style={styles.webActionPrimaryText}>Renew</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.webActionSecondary}
              activeOpacity={0.8}
              onPress={() => handleAction('History')}
            >
              <Text style={styles.webActionSecondaryText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const dueDate = item?.dueDate;
    const nextDue = isCompleted && dueDate ? addOneYearToDate(dueDate) : null;

    return (
      <View
        key={config.key}
        style={[styles.webCard, index > 0 && styles.webCardSpacing]}
      >
        <View style={styles.webCardHeader}>
          <View style={styles.webCardTitleRow}>
            <View style={[styles.webIconCircle, styles.webIconCirclePurple]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#7C3AED"
              />
            </View>
            <View style={styles.webCardTitleWrap}>
              <Text style={styles.webCardTitle}>{config.title}</Text>
              <Text style={styles.webCardSubtitle}>{config.subtitle}</Text>
            </View>
          </View>
          <View style={[styles.webPill, pill.pill]}>
            <Text style={[styles.webPillText, pill.text]}>{meta.label}</Text>
          </View>
        </View>
        <View style={styles.webCardBody}>
          <View style={styles.webInfoRow}>
            <Text style={styles.webInfoLabel}>Applicable Year</Text>
            <Text style={styles.webInfoValue}>
              {item?.applicableYear || 'Not filed'}
            </Text>
          </View>
          <View style={styles.webInfoRow}>
            <Text style={styles.webInfoLabel}>
              {isCompleted ? 'Last Filed' : 'Due Date'}
            </Text>
            <Text
              style={[
                styles.webInfoValue,
                !isCompleted && dueDate && styles.webInfoValueWarn,
              ]}
            >
              {dueDate ? formatDate(dueDate) : 'Not set'}
            </Text>
          </View>
          {nextDue ? (
            <View style={styles.webInfoRow}>
              <Text style={styles.webInfoLabel}>Next Due</Text>
              <Text style={styles.webInfoValue}>{formatDate(nextDue)}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.webCardActions}>
          <TouchableOpacity
            style={styles.webActionPrimary}
            activeOpacity={0.8}
            onPress={() => handleAction('Renew')}
          >
            <Text style={styles.webActionPrimaryText}>Renew</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.webActionSecondary}
            activeOpacity={0.8}
            onPress={() => handleAction('History')}
          >
            <Text style={styles.webActionSecondaryText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAddonCard = entry => {
    const item = entry.item;
    if (!item) return null;
    const meta = getFilingMeta(item);
    const pill = getStatusPillStyle(meta.tone);
    const dueDate = item?.dueDate || item?.renewalDueDate;
    const filingYearLabel = 'Filing Year';
    const bottomLabel =
      entry.key === 'itin'
        ? 'ITIN number'
        : entry.key === 'personalTax'
        ? 'Renewal Date'
        : 'Renewal Date';

    return (
      <View key={entry.key} style={styles.webAddonCard}>
        <View style={styles.webCardHeader}>
          <View style={styles.webCardTitleRow}>
            <View style={[styles.webIconCircle, styles.webIconCirclePurple]}>
              <Ionicons
                name={
                  entry.key === 'itin'
                    ? 'key-outline'
                    : entry.key === 'personalTax'
                    ? 'receipt-outline'
                    : 'ribbon-outline'
                }
                size={18}
                color="#7C3AED"
              />
            </View>
            <View style={styles.webCardTitleWrap}>
              <Text style={styles.webCardTitle} numberOfLines={1}>
                {entry.title}
              </Text>
              <Text style={styles.webCardSubtitle} numberOfLines={1}>
                {entry.title === 'ITIN Application'
                  ? 'ITIN Application filing'
                  : entry.title === 'Personal Tax Filing'
                  ? 'Personal Tax Filing'
                  : entry.title === 'E-Verify & DUNS'
                  ? 'E-Verify & DUNS service'
                  : entry.title}
              </Text>
            </View>
          </View>
          <View style={[styles.webPill, pill.pill]}>
            <Text style={[styles.webPillText, pill.text]}>{meta.label}</Text>
          </View>
        </View>
        <View style={styles.webCardBody}>
          <View style={styles.webInfoRow}>
            <Text style={styles.webInfoLabel}>{filingYearLabel}</Text>
            <Text style={styles.webInfoValue}>
              {item?.applicableYear || 'Not filed'}
            </Text>
          </View>
          <View style={styles.webInfoRow}>
            <Text style={styles.webInfoLabel}>{bottomLabel}</Text>
            <Text style={styles.webInfoValue}>
              {entry.key === 'itin'
                ? item?.itinNumber || 'Not set'
                : dueDate
                ? formatDate(dueDate)
                : 'Not set'}
            </Text>
          </View>
        </View>
        <View style={styles.webCardActions}>
          <TouchableOpacity
            style={styles.webActionPrimary}
            activeOpacity={0.8}
            onPress={() => handleAction('Renew')}
          >
            <Text style={styles.webActionPrimaryText}>Renew</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.webActionSecondary}
            activeOpacity={0.8}
            onPress={() => handleAction('History')}
          >
            <Text style={styles.webActionSecondaryText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Timeline & Filings</Text>
        <TouchableOpacity onPress={() => handleAction('Edit History')}>
          <Text style={styles.linkText}>Edit History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timelineSectionHeader}>
        <Text style={styles.timelineSectionHeading}>
          Core Compliance Services
        </Text>
        <View style={styles.criticalPill}>
          <Text style={styles.criticalPillText}>Critical</Text>
        </View>
      </View>

      {(() => {
        const coreCards = [
          federalItem && {
            key: 'federal',
            type: 'federal',
            title: 'Federal Filing',
            subtitle: 'Annual compliance filing',
            item: federalItem,
          },
          annualItem && {
            key: 'annual',
            type: 'annual',
            title: 'State Filing',
            subtitle: 'State compliance filing',
            item: annualItem,
          },
          agentItem && {
            key: 'agent',
            type: 'agent',
            item: agentItem,
          },
        ].filter(Boolean);

        if (!coreCards.length) {
          return (
            <View style={styles.emptyBox}>
              <Ionicons
                name="document-text-outline"
                size={32}
                color="#94A3B8"
              />
              <Text style={styles.emptyText}>No compliance data available</Text>
            </View>
          );
        }

        return coreCards.map((config, index) => (
          <View
            key={config.key}
            style={index > 0 ? styles.webCardSpacing : null}
          >
            {renderCoreCard(config, index)}
          </View>
        ));
      })()}

      {addonItems.length > 0 ? (
        <View>
          <Text style={[styles.sectionTitle, styles.addonSectionTitle]}>
            Add-on Compliance Services
          </Text>
          <View>{addonItems.map(entry => renderAddonCard(entry))}</View>
        </View>
      ) : null}

      <View style={[styles.sectionHeaderRow, styles.detailsHeaderRow]}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
      </View>
      <View style={styles.recentActivityCard}>
        {company?.updatedAt ? (
          <View style={styles.recentActivityRow}>
            <View style={styles.recentActivityIconWrap}>
              <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            </View>
            <View style={styles.recentActivityTextWrap}>
              <Text style={styles.recentActivityTitle}>Last updated</Text>
              <Text style={styles.recentActivityDate}>
                {formatDateTime(company.updatedAt)}
              </Text>
            </View>
          </View>
        ) : null}
        {company?.createdAt ? (
          <View
            style={[styles.recentActivityRow, styles.recentActivityRowLast]}
          >
            <View style={styles.recentActivityIconWrap}>
              <Ionicons name="time-outline" size={18} color="#2563EB" />
            </View>
            <View style={styles.recentActivityTextWrap}>
              <Text style={styles.recentActivityTitle}>Created on</Text>
              <Text style={styles.recentActivityDate}>
                {formatDateTime(company.createdAt)}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={[styles.sectionHeaderRow, styles.detailsHeaderRow]}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>
      </View>

      {timeline.length ? (
        <View style={styles.timelineWrap}>
          {timeline.map((entry, index) => {
            const isLast = index === timeline.length - 1;
            return (
              <View key={entry.key} style={styles.timelineItem}>
                <View style={styles.timelineRail}>
                  <View style={styles.timelineDot} />
                  {!isLast ? <View style={styles.timelineLine} /> : null}
                </View>
                <View
                  style={[styles.webIconCircle, styles.webIconCirclePurple]}
                >
                  <View style={styles.timelineTopRow}>
                    <Text style={styles.timelineStatus}>
                      {formatLabel(entry.status)}
                    </Text>
                    <Text style={styles.timelineDate}>
                      {formatDateTime(entry.date) || '—'}
                    </Text>
                  </View>
                  {entry.note ? (
                    <Text style={styles.timelineNote}>{entry.note}</Text>
                  ) : null}
                  {entry.actor ? (
                    <Text style={styles.timelineActor}>By {entry.actor}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="time-outline" size={32} color="#94A3B8" />
          <Text style={styles.emptyText}>No status updates yet</Text>
        </View>
      )}
    </View>
  );
};

export default CompanyTimelineTab;

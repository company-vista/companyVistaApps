import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  DESIGNATION_OPTIONS,
  getShareholderName,
  getTotalSharePercentage,
} from '../../utils/editCompanyForm';
import FormField from './FormField';
import FormSelect from './FormSelect';
import SectionCard from './SectionCard';
import {
  editColors,
  sharedStyles,
  screenStyles,
} from './editCompanyStyles';

const getInitials = shareholder => {
  const initials = [shareholder.firstName, shareholder.lastName]
    .map(part => (part || '').trim().charAt(0))
    .filter(Boolean)
    .join('')
    .toUpperCase();
  return initials || (shareholder.email || '?').trim().charAt(0).toUpperCase();
};

const ShareholdersStep = ({ shareholders, onAdd, onRemove, onUpdate }) => {
  const total = getTotalSharePercentage(shareholders);
  const totalIsBalanced = total === 100;
  const hasMembers = shareholders.length > 0;

  return (
    <SectionCard
      icon="people-outline"
      title="Shareholders & Directors"
      subtitle="Manage ownership and leadership of the company">
      {hasMembers ? (
        <View
          style={[
            sharedStyles.totalCard,
            !totalIsBalanced && sharedStyles.totalCardWarning,
          ]}>
          <View>
            <Text style={sharedStyles.totalLabel}>Total ownership</Text>
            <Text style={sharedStyles.totalHint}>
              {totalIsBalanced
                ? 'Ownership is fully allocated.'
                : 'Shares should add up to 100%.'}
            </Text>
          </View>
          <Text
            style={[
              sharedStyles.totalValue,
              !totalIsBalanced && sharedStyles.totalValueWarning,
            ]}>
            {total}%
          </Text>
        </View>
      ) : null}

      {!hasMembers ? (
        <View style={sharedStyles.emptyState}>
          <Ionicons
            name="people-circle-outline"
            size={44}
            color={editColors.primaryBorder}
          />
          <Text style={sharedStyles.emptyTitle}>No shareholders yet</Text>
          <Text style={sharedStyles.emptyText}>
            Add the company owners or directors and assign their share
            percentage.
          </Text>
        </View>
      ) : (
        shareholders.map((shareholder, index) => (
          <View key={shareholder.id} style={sharedStyles.memberCard}>
            <View style={sharedStyles.memberHeader}>
              <View style={sharedStyles.memberIdentity}>
                <View style={sharedStyles.memberAvatar}>
                  <Text style={sharedStyles.memberName}>
                    {getInitials(shareholder)}
                  </Text>
                </View>
                <View style={sharedStyles.sectionTextWrap}>
                  <Text style={sharedStyles.memberName} numberOfLines={1}>
                    {getShareholderName(shareholder)}
                  </Text>
                  <Text style={sharedStyles.memberMeta} numberOfLines={1}>
                    {shareholder.designation}
                    {shareholder.sharePercentage
                      ? ` · ${shareholder.sharePercentage}%`
                      : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={sharedStyles.removeButton}
                onPress={() => onRemove(shareholder.id)}
                accessibilityRole="button"
                accessibilityLabel={`Remove member ${index + 1}`}>
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color={editColors.danger}
                />
              </TouchableOpacity>
            </View>

            <View style={sharedStyles.fieldRow}>
              <View style={sharedStyles.fieldHalf}>
                <FormField
                  label="First Name"
                  value={shareholder.firstName}
                  onChangeText={value =>
                    onUpdate(shareholder.id, 'firstName', value)
                  }
                  placeholder="First name"
                />
              </View>
              <View style={sharedStyles.fieldHalf}>
                <FormField
                  label="Last Name"
                  value={shareholder.lastName}
                  onChangeText={value =>
                    onUpdate(shareholder.id, 'lastName', value)
                  }
                  placeholder="Last name"
                />
              </View>
            </View>
            <FormField
              label="Email"
              value={shareholder.email}
              onChangeText={value => onUpdate(shareholder.id, 'email', value)}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={sharedStyles.fieldRow}>
              <View style={sharedStyles.fieldHalf}>
                <FormField
                  label="Share %"
                  value={shareholder.sharePercentage}
                  onChangeText={value =>
                    onUpdate(shareholder.id, 'sharePercentage', value)
                  }
                  placeholder="e.g. 25"
                  keyboardType="numeric"
                  autoCapitalize="none"
                  maxLength={5}
                />
              </View>
              <View style={sharedStyles.fieldHalf}>
                <FormSelect
                  label="Role"
                  value={shareholder.designation}
                  options={DESIGNATION_OPTIONS}
                  onChange={value =>
                    onUpdate(shareholder.id, 'designation', value)
                  }
                  placeholder="Select role"
                />
              </View>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity
        style={[sharedStyles.addButton, hasMembers && screenStyles.addButtonSpacing]}
        onPress={onAdd}
        activeOpacity={0.8}
        accessibilityRole="button">
        <Ionicons name="add-circle-outline" size={19} color={editColors.primary} />
        <Text style={sharedStyles.addButtonText}>
          {hasMembers ? 'Add another member' : 'Add shareholder'}
        </Text>
      </TouchableOpacity>
    </SectionCard>
  );
};

export default ShareholdersStep;

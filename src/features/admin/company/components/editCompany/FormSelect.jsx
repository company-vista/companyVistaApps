import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { editColors, sharedStyles } from './editCompanyStyles';

const FormSelect = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  required = false,
  error,
}) => {
  const [open, setOpen] = useState(false);

  const resolvedOptions = useMemo(() => {
    if (!value || options.some(option => option.value === value)) {
      return options;
    }
    return [{ label: value, value }, ...options];
  }, [options, value]);

  const selected = resolvedOptions.find(option => option.value === value);

  return (
    <View style={sharedStyles.field}>
      {label ? (
        <Text style={sharedStyles.label}>
          {label}
          {required ? <Text style={sharedStyles.required}> *</Text> : null}
        </Text>
      ) : null}
      <TouchableOpacity
        style={[sharedStyles.select, error && sharedStyles.inputError]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="button">
        <Text
          style={[
            sharedStyles.selectValue,
            !selected && sharedStyles.selectPlaceholder,
          ]}
          numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={editColors.textMuted}
        />
      </TouchableOpacity>
      {error ? (
        <Text style={[sharedStyles.helper, sharedStyles.helperError]}>
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}>
        <Pressable
          style={sharedStyles.modalBackdrop}
          onPress={() => setOpen(false)}>
          <Pressable style={sharedStyles.modalSheet} onPress={() => {}}>
            <View style={sharedStyles.modalHandle} />
            <Text style={sharedStyles.modalTitle}>
              {label || 'Select an option'}
            </Text>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {resolvedOptions.map(option => {
                const active = option.value === value;
                return (
                  <TouchableOpacity
                    key={`${option.value}-${option.label}`}
                    style={[
                      sharedStyles.modalOption,
                      active && sharedStyles.modalOptionActive,
                    ]}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}>
                    <Text
                      style={[
                        sharedStyles.modalOptionText,
                        active && sharedStyles.modalOptionTextActive,
                      ]}>
                      {option.label}
                    </Text>
                    {active ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={editColors.primary}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
              <View style={sharedStyles.modalBottomSpacer} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default FormSelect;

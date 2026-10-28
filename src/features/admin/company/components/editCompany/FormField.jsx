import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { editColors, sharedStyles } from './editCompanyStyles';

const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  error,
  helper,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'words',
  maxLength,
  editable = true,
  returnKeyType,
  onSubmitEditing,
}) => (
  <View style={sharedStyles.field}>
    {label ? (
      <Text style={sharedStyles.label}>
        {label}
        {required ? <Text style={sharedStyles.required}> *</Text> : null}
      </Text>
    ) : null}
    <TextInput
      style={[
        sharedStyles.input,
        multiline && sharedStyles.inputMultiline,
        error && sharedStyles.inputError,
        !editable && sharedStyles.inputDisabled,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={editColors.textSoft}
      multiline={multiline}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      maxLength={maxLength}
      editable={editable}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      selectionColor={editColors.primary}
    />
    {error ? (
      <Text style={[sharedStyles.helper, sharedStyles.helperError]}>{error}</Text>
    ) : helper ? (
      <Text style={sharedStyles.helper}>{helper}</Text>
    ) : null}
  </View>
);

export default FormField;

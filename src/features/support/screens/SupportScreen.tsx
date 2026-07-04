import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { pick, types } from '@react-native-documents/picker';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { useThemeColors } from '../../../theme/colors';
import { BackButton } from '../../../components/buttons';
import { useAppSelector } from '../../../store/hooks';
import { API_BASE_URL } from '../../../config/api';

interface InfoCardData {
  icon: string;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}

const infoCards: InfoCardData[] = [
  {
    icon: '\u{1F4AC}',
    label: 'Live Chat',
    value: 'Available 24/7',
    iconBg: 'rgba(90,110,230,0.15)',
    iconColor: '#7c8cf0',
  },
  {
    icon: '\u2709',
    label: 'Email',
    value: 'info@companyvista.com',
    iconBg: 'rgba(63,191,127,0.15)',
    iconColor: '#3fbf7f',
    valueColor: '#3fbf7f',
  },
  {
    icon: '\u260E',
    label: 'Phone',
    value: '+1 (800) 123-4567',
    iconBg: 'rgba(168,130,230,0.15)',
    iconColor: '#a882e6',
  },
];

const categoryOptions = ['General Inquiry', 'Billing', 'Technical Support', 'Feedback'];
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

function InfoCard({ data, colors }: { data: InfoCardData; colors: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.infoIconBox, { backgroundColor: data.iconBg }]}>
        <Text style={[styles.infoIconGlyph, { color: data.iconColor }]}>{data.icon}</Text>
      </View>
      <View>
        <Text style={[styles.infoLabel, { color: colors.muted }]}>{data.label}</Text>
        <Text style={[styles.infoValue, { color: colors.text }, data.valueColor ? { color: data.valueColor } : null]}>
          {data.value}
        </Text>
      </View>
    </View>
  );
}

function Dropdown({
  label,
  value,
  options,
  onSelect,
  colors,
  inputBg,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  colors: ReturnType<typeof useThemeColors>;
  inputBg: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity style={[styles.dropdown, { backgroundColor: inputBg, borderColor: colors.inputBorder }]} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={[styles.dropdownText, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.chevron, { color: colors.muted }]}>{'\u25BE'}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, { color: colors.text }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

type ContactSupportProps = {
  onBackPress?: () => void;
};

export default function ContactSupport({ onBackPress }: ContactSupportProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const token = useAppSelector(state => state.auth.token);
  const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(categoryOptions[0]);
  const [priority, setPriority] = useState(priorityOptions[1]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ uri: string; name: string; type: string }[]>([]);

  const handleUpload = async () => {
    try {
      const response = await pick({
        type: [types.pdf, types.images, types.docx, types.plainText],
        allowMultiSelection: true,
      });

      const files = response
        .filter(item => item?.uri)
        .map(item => ({
          uri: item.uri,
          name: item.name ?? `attachment-${Date.now()}`,
          type: item.type ?? 'application/octet-stream',
        }));

      if (files.length === 0) return;

      setSelectedFiles(prev => [...prev, ...files]);
      Toast.show({ type: 'success', text1: `${files.length} file(s) selected` });
    } catch (error: unknown) {
      const err = error as any;
      if (err?.code === 'DOCUMENT_PICKER_CANCELED' || err?.code === 'user_cancelled') return;
      Toast.show({ type: 'error', text1: err?.message ?? 'Unable to open document picker.' });
    }
  };

  const handleSend = async () => {
    const missing: string[] = [];
    if (!name.trim()) missing.push('Name');
    if (!email.trim()) missing.push('Email');
    if (!subject.trim()) missing.push('Subject');
    if (!message.trim()) missing.push('Message');

    if (missing.length > 0) {
      Toast.show({ type: 'error', text1: `Please fill in required fields: ${missing.join(', ')}` });
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/client/email/send-notification`,
        { name, email, category, priority, subject, message },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        },
      );

      Toast.show({ type: 'success', text1: 'Your message has been sent!' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to send message.' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Support</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
      <View style={{ flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}><InfoCard data={infoCards[0]} colors={colors} /></View>
          <View style={{ flex: 1 }}><InfoCard data={infoCards[2]} colors={colors} /></View>
        </View>
        <View style={{ flex: 1 }}><InfoCard data={infoCards[1]} colors={colors} /></View>
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.formTitle}>Send us a message</Text>
        <Text style={[styles.formSubtitle, { color: colors.muted }]}>We'll get back to you within 24 hours</Text>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Your Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <Text style={[styles.inputIcon, { color: colors.muted }]}>{'\u{1F464}'}</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="John Doe"
              placeholderTextColor={colors.inputPlaceholder}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Email Address <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <Text style={[styles.inputIcon, { color: colors.muted }]}>{'\u2709'}</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="john@example.com"
              placeholderTextColor={colors.inputPlaceholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <Dropdown
          label="Category"
          value={category}
          options={categoryOptions}
          onSelect={setCategory}
          colors={colors}
          inputBg={inputBg}
        />

        <Dropdown
          label="Priority"
          value={priority}
          options={priorityOptions}
          onSelect={setPriority}
          colors={colors}
          inputBg={inputBg}
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Subject <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.inputWrapperPlain, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Brief summary of your issue"
              placeholderTextColor={colors.inputPlaceholder}
              value={subject}
              onChangeText={setSubject}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Message <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.textareaWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              style={[styles.textarea, { color: colors.text }]}
              placeholder="Please describe your issue in detail..."
              placeholderTextColor={colors.inputPlaceholder}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
          <Text style={[styles.helperText, { color: colors.muted }]}>Minimum 10 characters</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Attachments (Optional)</Text>
          <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.border }]} onPress={handleUpload} activeOpacity={0.8}>
            <Text style={styles.uploadIcon}>{'\u{1F4C4}'}</Text>
            <Text style={styles.uploadTitle}>Click to upload</Text>
            <Text style={[styles.uploadHint, { color: colors.muted }]}>or drag and drop (Max 10MB)</Text>
          </TouchableOpacity>
          {selectedFiles.length > 0 && (
            <View style={{ marginTop: 8, gap: 4 }}>
              {selectedFiles.map((file, index) => (
                <Text key={index} numberOfLines={1} style={{ fontSize: 11, color: colors.text }}>{'\u2022'} {file.name}</Text>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.sendButton} onPress={handleSend} activeOpacity={0.85}>
          <Text style={styles.sendButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 14,
    paddingBottom: 40,
  },
  infoList: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  infoCard: {
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIconBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconGlyph: {
    fontSize: 12,
  },
  infoLabel: {
    fontSize: 8,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '500',
  },
  formCard: {
    borderWidth: 0.5,
    borderRadius: 14,
    padding: 16,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e6a82a',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 11,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  required: {
    color: '#e6a82a',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputWrapperPlain: {
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputIcon: {
    fontSize: 13,
  },
  input: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 12,
  },
  chevron: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 30,
  },
  modalContent: {
    borderRadius: 12,
    borderWidth: 0.5,
    paddingVertical: 6,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalOptionText: {
    fontSize: 13,
  },
  textareaWrapper: {
    borderWidth: 0.5,
    borderRadius: 8,
    minHeight: 100,
  },
  textarea: {
    flex: 1,
    fontSize: 12,
    padding: 10,
    minHeight: 100,
  },
  helperText: {
    fontSize: 9,
    marginTop: 4,
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  uploadTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#e6a82a',
    marginBottom: 2,
  },
  uploadHint: {
    fontSize: 9,
  },
  sendButton: {
    backgroundColor: '#e6a82a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 0,
  },
  sendButtonText: {
    color: '#1a1204',
    fontSize: 13,
    fontWeight: '600',
  },
});

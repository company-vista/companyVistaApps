import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { BackButton, ContinueButton } from '../../../../components/buttons';
import { useAppDispatch } from '../../../../store/hooks';
import { setAdditionalDocuments } from '../../../../store/slices/companyRegistrationSlice';
import Toast from 'react-native-toast-message';

type AdditionalDocumentsScreenProps = {
  onBackPress: () => void;
  onContinue: () => void;
};

export default function AdditionalDocumentsScreen({ onBackPress, onContinue }: AdditionalDocumentsScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const [holdingFiles, setHoldingFiles] = useState<{ name: string; uri: string }[]>([]);
  const [otherFiles, setOtherFiles] = useState<{ name: string; uri: string }[]>([]);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleUploadPress = async (boxType: 'holding' | 'other') => {
    try {
      const results = await pick({ type: [types.images, types.pdf], allowMultiSelection: true });
      const files = results.map(r => ({ name: r.name ?? 'file', uri: r.uri }));
      if (files.length > 0) {
        if (boxType === 'holding') {
          setHoldingFiles(prev => [...prev, ...files]);
        } else {
          setOtherFiles(prev => [...prev, ...files]);
        }
      }
    } catch (err: any) {
      if (err && err.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Additional documents</Text>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* <Text style={[styles.title, { color: colors.text }]}>
            Any <Text style={styles.titleAccent}>additional documents</Text>?
          </Text> */}
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Upload extra documents here (PDF, JPG, PNG, max 10MB).
          </Text>

          <Text style={[styles.sectionLabel, { color: colors.muted }]}>HOLDING COMPANY DOCUMENTS *</Text>

          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: attemptedSubmit && holdingFiles.length === 0 ? '#ef4444' : '#e6a82a', backgroundColor: colors.mode === 'dark' ? 'rgba(13,22,39,1)' : colors.surfaceAlt }]}
            activeOpacity={0.7}
            onPress={() => handleUploadPress('holding')}
          >
            <Text style={styles.uploadIcon}>{'\u21E7'}</Text>
            <Text style={[styles.uploadMainText, { color: colors.text }]}>Click or drag holding company documents</Text>
            <Text style={[styles.uploadSubText, { color: colors.subtle }]}>JPG, PNG, PDF — multiple files allowed</Text>
          </TouchableOpacity>

          {holdingFiles.length > 0 && (
            <View style={styles.selectedFilesContainer}>
              {holdingFiles.map((f, i) => (
                <Text key={i} style={[styles.selectedFileText, { color: colors.text }]}>
                  {'\u2713'} {f.name}
                </Text>
              ))}
            </View>
          )}

          <Text style={[styles.hintText, { color: colors.subtle }]}>
            Certificate of incorporation, register of directors/shareholders, etc.
          </Text>

          <Text style={[styles.sectionLabel, { color: colors.muted }]}>OTHER SUPPORTING DOCUMENTS *</Text>

          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: attemptedSubmit && otherFiles.length === 0 ? '#ef4444' : '#e6a82a', backgroundColor: colors.mode === 'dark' ? 'rgba(13,22,39,1)' : colors.surfaceAlt }]}
            activeOpacity={0.7}
            onPress={() => handleUploadPress('other')}
          >
            <Text style={styles.uploadIcon}>{'\u21E7'}</Text>
            <Text style={[styles.uploadMainText, { color: colors.text }]}>Click or drag other documents</Text>
            <Text style={[styles.uploadSubText, { color: colors.subtle }]}>JPG, PNG, PDF — multiple files allowed</Text>
          </TouchableOpacity>

          {otherFiles.length > 0 && (
            <View style={styles.selectedFilesContainer}>
              {otherFiles.map((f, i) => (
                <Text key={i} style={[styles.selectedFileText, { color: colors.text }]}>
                  {'\u2713'} {f.name}
                </Text>
              ))}
            </View>
          )}

          <Text style={[styles.hintText, { color: colors.subtle }]}>
            Anything else you'd like to share with us
          </Text>
        </ScrollView>

        <View style={[styles.footerColumn, { paddingBottom: safeAreaInsets.bottom + 8 }]}>
          <ContinueButton
            onPress={() => {
              setAttemptedSubmit(true);
              if (holdingFiles.length === 0 && otherFiles.length === 0) {
                Toast.show({ type: 'error', text1: 'Required fields missing', text2: 'Please upload at least one document' });
                return;
              }
              if (holdingFiles.length === 0) {
                Toast.show({ type: 'error', text1: 'Required field missing', text2: 'Holding company documents are required' });
                return;
              }
              if (otherFiles.length === 0) {
                Toast.show({ type: 'error', text1: 'Required field missing', text2: 'Other supporting documents are required' });
                return;
              }
              dispatch(setAdditionalDocuments({ holdingFiles, otherFiles }));
              onContinue();
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: font.heading,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 18,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  title: {
    fontSize: font.xxl,
    fontWeight: '500',
    lineHeight: 21,
    marginBottom: 4,
  },
  titleAccent: {
    color: '#e6a82a',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: font.base,
    marginBottom: 20,
    lineHeight: 17,
  },
  sectionLabel: {
    fontSize: font.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  uploadBox: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 6,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: font.heading,
    color: '#e6a82a',
    marginBottom: 10,
  },
  uploadMainText: {
    fontSize: font.base,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  uploadSubText: {
    fontSize: font.sm,
    textAlign: 'center',
  },
  selectedFilesContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  selectedFileText: {
    fontSize: font.sm,
    fontWeight: '500',
    marginBottom: 4,
  },
  hintText: {
    fontSize: font.sm,
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 14,
  },
  footerColumn: {
    gap: 8,
  },
  continueButtonFull: {
    backgroundColor: '#e6a82a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: font.base,
    fontWeight: '500',
    color: '#1a1204',
  },
});

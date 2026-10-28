import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { styles } from './formationDocumentsStyles';

const getClientDisplayName = client => {
  if (!client || typeof client !== 'object') return '';
  const fullName = (
    (client.firstName || '') +
    ' ' +
    (client.lastName || '')
  ).trim();
  return fullName || client.email || '';
};

const toDateInputValue = date => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const makeId = () => Math.random().toString(36).slice(2);

const buildInitialFormationFields = company => {
  const rd = company?.registrationRequestData || {};
  const directorsFromShareholders = (company?.shareholders || [])
    .filter(s => s?.designation === 'Director')
    .map(s => ({ id: makeId(), name: getClientDisplayName(s.clientId) }))
    .filter(d => d.name);

  return {
    companyName: company?.companyName || '',
    stateOfFormation: company?.stateOfRegistration || '',
    filingDate: toDateInputValue(
      company?.registrationDate || company?.approvedAt,
    ),
    filingNumber: company?.registrationNumber || '',
    incorporatorName: '',
    filingAgentName: 'Company Vista INC',
    filingAgentState: 'Wyorky',
    sealYear: String(new Date().getFullYear()),
    resolutionDate: toDateInputValue(new Date()),
    letterBody:
      'We are pleased to inform you that your company has been formed and is now in good standing.',
    officers: [
      { id: makeId(), role: 'President', name: rd.presidentName || '' },
      { id: makeId(), role: 'Secretary', name: rd.secretaryName || '' },
      { id: makeId(), role: 'Treasurer', name: rd.treasurerName || '' },
    ],
    directors: directorsFromShareholders.length
      ? directorsFromShareholders
      : [{ id: makeId(), name: '' }],
  };
};

const esc = s =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const FormationDocumentModal = ({ company, visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const [fields, setFields] = useState(() =>
    buildInitialFormationFields(company),
  );
  const [generating, setGenerating] = useState(false);

  const setField = (key, value) => setFields(f => ({ ...f, [key]: value }));
  const updateOfficer = (id, key, value) =>
    setFields(f => ({
      ...f,
      officers: f.officers.map(o => (o.id === id ? { ...o, [key]: value } : o)),
    }));
  const addOfficer = () =>
    setFields(f => ({
      ...f,
      officers: [...f.officers, { id: makeId(), role: '', name: '' }],
    }));
  const removeOfficer = id =>
    setFields(f => ({ ...f, officers: f.officers.filter(o => o.id !== id) }));
  const updateDirector = (id, value) =>
    setFields(f => ({
      ...f,
      directors: f.directors.map(d =>
        d.id === id ? { ...d, name: value } : d,
      ),
    }));
  const addDirector = () =>
    setFields(f => ({
      ...f,
      directors: [...f.directors, { id: makeId(), name: '' }],
    }));
  const removeDirector = id =>
    setFields(f => ({ ...f, directors: f.directors.filter(d => d.id !== id) }));

  const html = useMemo(() => {
    const officerRows = (fields.officers || [])
      .map(
        o =>
          '<tr><td>' + esc(o.role) + '</td><td>' + esc(o.name) + '</td></tr>',
      )
      .join('');
    const directorItems = (fields.directors || [])
      .map(d => '<li>' + esc(d.name) + '</li>')
      .join('');
    return [
      '<!DOCTYPE html><html><head><meta charset="utf-8" />',
      '<style>body{font-family:Times New Roman,serif;font-size:12pt;line-height:1.6;color:#111}.header{text-align:center;margin-bottom:40px}.company{font-size:18pt;font-weight:bold;text-transform:uppercase}.section{margin-bottom:24px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px;text-align:left}.sign{margin-top:60px}.line{border-bottom:1px solid #111;width:260px;margin-top:40px}</style>',
      '</head><body>',
      '<div class="header"><div class="company">' +
        esc(fields.companyName) +
        '</div><div>State of Formation: ' +
        esc(fields.stateOfFormation) +
        '</div></div>',
      '<div class="section"><p>' +
        esc(fields.letterBody).replace(/\n/g, '<br/>') +
        '</p><p>Filing Date: ' +
        (esc(fields.filingDate) || '-') +
        '</p><p>Filing Number: ' +
        (esc(fields.filingNumber) || '-') +
        '</p></div>',
      '<div class="section"><h3>Officers</h3><table><tr><th>Role</th><th>Name</th></tr>' +
        officerRows +
        '</table></div>',
      '<div class="section"><h3>Directors</h3><ul>' +
        directorItems +
        '</ul></div>',
      '<div class="sign"><div class="line"></div><div>Incorporator: ' +
        esc(fields.incorporatorName) +
        '</div><div>Filing Agent: ' +
        esc(fields.filingAgentName) +
        ', ' +
        esc(fields.filingAgentState) +
        '</div><div>Resolution Date: ' +
        (esc(fields.resolutionDate) || '-') +
        '</div></div>',
      '</body></html>',
    ].join('');
  }, [fields]);

  const handleGenerate = async () => {
    if (!fields.companyName) {
      Alert.alert('Missing', 'Company name is required.');
      return;
    }
    setGenerating(true);
    try {
      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: 'Formation_Documents_' + Date.now(),
        directory: 'Documents',
      });
      if (file?.filePath) {
        try {
          await Linking.openURL('file://' + file.filePath);
        } catch {
          Alert.alert('Generated', 'PDF saved at ' + file.filePath);
        }
      } else {
        Alert.alert('Generated', 'PDF generated successfully.');
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalWrap, { paddingTop: insets.top }]}>
        <View style={styles.modalHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalTitle}>Initial Resolution</Text>
            <Text style={styles.modalSubtitle}>
              Congratulations letter + Initial Resolutions
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#475569" />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.modalBody}
          contentContainerStyle={styles.formScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Company Details</Text>
          <View style={styles.row}>
            <View style={[styles.field, styles.fieldFull]}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                value={fields.companyName}
                onChangeText={v => setField('companyName', v)}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>State of Formation</Text>
              <TextInput
                style={styles.input}
                value={fields.stateOfFormation}
                onChangeText={v => setField('stateOfFormation', v)}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Filing Date</Text>
              <TextInput
                style={styles.input}
                value={fields.filingDate}
                onChangeText={v => setField('filingDate', v)}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Filing Number</Text>
              <TextInput
                style={styles.input}
                value={fields.filingNumber}
                onChangeText={v => setField('filingNumber', v)}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Resolution Date</Text>
              <TextInput
                style={styles.input}
                value={fields.resolutionDate}
                onChangeText={v => setField('resolutionDate', v)}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={[styles.field, styles.fieldFull]}>
              <Text style={styles.label}>Incorporator Name</Text>
              <TextInput
                style={styles.input}
                value={fields.incorporatorName}
                onChangeText={v => setField('incorporatorName', v)}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <View style={styles.fieldFull}>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={fields.letterBody}
              onChangeText={v => setField('letterBody', v)}
              multiline
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Text style={styles.sectionTitle}>Officers</Text>
            <TouchableOpacity style={styles.addBtn} onPress={addOfficer}>
              <Ionicons name="add" size={14} color="#4F46E5" />
              <Text style={styles.addBtnText}>Add Officer</Text>
            </TouchableOpacity>
          </View>
          {(fields.officers || []).map(o => (
            <View key={o.id} style={styles.listRow}>
              <TextInput
                style={[styles.input, styles.listInput, { flex: 0.4 }]}
                value={o.role}
                onChangeText={v => updateOfficer(o.id, 'role', v)}
                placeholder="Role"
              />
              <TextInput
                style={[styles.input, styles.listInput]}
                value={o.name}
                onChangeText={v => updateOfficer(o.id, 'name', v)}
                placeholder="Name"
              />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeOfficer(o.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              marginTop: 6,
            }}
          >
            <Text style={styles.sectionTitle}>Directors</Text>
            <TouchableOpacity style={styles.addBtn} onPress={addDirector}>
              <Ionicons name="add" size={14} color="#4F46E5" />
              <Text style={styles.addBtnText}>Add Director</Text>
            </TouchableOpacity>
          </View>
          {(fields.directors || []).map(d => (
            <View key={d.id} style={styles.listRow}>
              <TextInput
                style={[styles.input, styles.listInput]}
                value={d.name}
                onChangeText={v => updateDirector(d.id, v)}
                placeholder="Name"
              />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeDirector(d.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
        <View style={[styles.bottomBar, { paddingBottom: 10 + insets.bottom }]}>
          <TouchableOpacity style={styles.ghostBtn} onPress={onClose}>
            <Text style={styles.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, generating && styles.primaryBtnDisabled]}
            onPress={handleGenerate}
            disabled={generating}
          >
            <Text style={styles.primaryBtnText}>
              {generating ? 'Generating...' : 'Generate PDF'}
            </Text>
            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FormationDocumentModal;

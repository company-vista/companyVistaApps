import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { pick, types, keepLocalCopy, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import RNBlobUtil from 'react-native-blob-util';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font } from '../../../theme/typography';
import { useAppSelector } from '../../../store/hooks';
import {
  createAdminBlogPost,
  parseAdminBlogHtml,
  uploadAdminBlogImage,
} from './api/adminBlogsApi';

const CATEGORIES = [
  { value: 'company-formation', label: 'Company Formation' },
  { value: 'tax-structuring', label: 'Tax & Structuring' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'banking', label: 'Banking' },
  { value: 'us-entities', label: 'US Entities' },
  { value: 'uk-entities', label: 'UK Entities' },
  { value: 'ca-entities', label: 'Canada Entities' },
  { value: 'eu-entities', label: 'EU Entities' },
  { value: 'apac', label: 'APAC' },
  { value: 'offshore', label: 'Offshore & Holding' },
  { value: 'immigration', label: 'Visas & Immigration' },
];

const slugify = value =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const contentToHtml = value =>
  value
    .split(/\r?\n/)
    .map(line =>
      line
        .trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;'),
    )
    .filter(Boolean)
    .map(line => `<p>${line}</p>`)
    .join('');

const getBodyText = blocks =>
  blocks
    .map(block => block.text || block.html || block.title || '')
    .map(value =>
      String(value)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .trim(),
    )
    .filter(Boolean)
    .join('\n\n');

const ImageField = ({ label, hint, value, onChange, onUpload, uploading }) => (
  <View style={styles.imageField}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.imageFieldRow}>
      <TextInput
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        placeholder="https://... or upload"
        placeholderTextColor="#94A3B8"
        style={[styles.input, styles.imageUrlInput]}
      />
      <TouchableOpacity
        accessibilityRole="button"
        disabled={Boolean(uploading)}
        onPress={onUpload}
        style={styles.uploadButton}>
        {uploading ? (
          <ActivityIndicator size="small" color="#4F46E5" />
        ) : (
          <Text style={styles.uploadButtonText}>Upload</Text>
        )}
      </TouchableOpacity>
    </View>
    {value ? (
      <Image source={{ uri: value }} style={styles.imagePreview} />
    ) : (
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>No image yet</Text>
      </View>
    )}
    <Text style={styles.fieldHint}>{hint}</Text>
  </View>
);

const AdminCreateBlogForm = ({ onCancel, onCreated }) => {
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('CompanyVista Research Team');
  const [heroImage, setHeroImage] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [standfirst, setStandfirst] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [content, setContent] = useState('');
  const [importedBodyBlocks, setImportedBodyBlocks] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importedFileName, setImportedFileName] = useState('');
  const [uploadingImage, setUploadingImage] = useState('');

  const handleImportHtml = async () => {
    setImporting(true);
    try {
      const [file] = await pick({ type: [types.allFiles] });
      if (!file.name || !/\.html?$/i.test(file.name)) {
        throw new Error('Please select an .html file.');
      }

      const [copy] = await keepLocalCopy({
        files: [{ uri: file.uri, fileName: file.name }],
        destination: 'cachesDirectory',
      });
      if (copy.status !== 'success') {
        throw new Error(copy.copyError || 'Unable to read the selected file.');
      }

      const filePath = decodeURIComponent(
        copy.localUri.replace(/^file:\/\//, ''),
      );
      const html = await RNBlobUtil.fs.readFile(filePath, 'utf8');
      const result = await parseAdminBlogHtml({ token, html });
      const payload = result.payload;
      const bodyBlocks = Array.isArray(payload.body_blocks)
        ? payload.body_blocks
        : [];

      setTitle(payload.title || '');
      setSlug(payload.slug || slugify(payload.title || ''));
      setSlugEdited(Boolean(payload.slug));
      setMetaDescription(payload.meta_description || '');
      setKeywords(payload.meta_keywords || '');
      setAuthor(payload.author_name || 'CompanyVista Research Team');
      setHeroImage(payload.hero_image || '');
      setOgImage(payload.og_image || '');
      setStandfirst(payload.standfirst || '');
      if (CATEGORIES.some(item => item.value === payload.category)) {
        setCategory(payload.category);
      }
      setImportedBodyBlocks(bodyBlocks.length ? bodyBlocks : null);
      setContent(getBodyText(bodyBlocks));
      setImportedFileName(file.name);
      Alert.alert(
        'HTML imported',
        [
          'Review the imported fields before saving or publishing.',
          result.unresolvedAssets?.length
            ? `${result.unresolvedAssets.length} image(s) in the HTML were not uploaded.`
            : '',
          result.skipped?.length
            ? `${result.skipped.length} item(s) could not be imported.`
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      );
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      Alert.alert('Unable to import HTML', error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleUploadImage = async field => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });
      if (result.didCancel) return;
      if (result.errorMessage) throw new Error(result.errorMessage);

      const image = result.assets?.[0];
      if (!image?.uri) throw new Error('Unable to read the selected image.');
      if (image.type && !image.type.startsWith('image/')) {
        throw new Error('Please select a valid image.');
      }

      setUploadingImage(field);
      const url = await uploadAdminBlogImage({
        token,
        image: {
          uri: image.uri,
          fileName: image.fileName,
          type: image.type,
        },
      });
      if (field === 'hero') setHeroImage(url);
      else setOgImage(url);
    } catch (error) {
      Alert.alert('Unable to upload image', error.message);
    } finally {
      setUploadingImage('');
    }
  };

  const handleSave = async status => {
    if (!title.trim() || !metaDescription.trim() || !standfirst.trim()) {
      Alert.alert(
        'Required fields',
        'Title, meta description and standfirst are required.',
      );
      return;
    }
    if (!content.trim() && !importedBodyBlocks?.length) {
      Alert.alert('Content required', 'Add blog content before saving.');
      return;
    }

    setSaving(true);
    try {
      await createAdminBlogPost({
        token,
        post: {
          slug: slug || slugify(title),
          title: title.trim(),
          meta_description: metaDescription.trim(),
          meta_keywords: keywords.trim(),
          og_image: ogImage.trim(),
          category,
          hero_image: heroImage.trim(),
          standfirst: standfirst.trim(),
          author_name: author.trim(),
          status,
          cta_label: '',
          cta_url: '',
          cta_sidebar_title: '',
          cta_sidebar_sub: '',
          jurisdiction_tags: [],
          body_blocks: importedBodyBlocks || [
            { type: 'heading', text: title.trim() },
            { type: 'paragraph', html: contentToHtml(content) },
          ],
          faq: [],
          takeaways: [],
          related_slugs: [],
        },
      });
      Alert.alert(
        status === 'published' ? 'Post published' : 'Draft saved',
        status === 'published'
          ? 'Your blog post is now published.'
          : 'Your blog post was saved as a draft.',
      );
      await onCreated();
    } catch (error) {
      Alert.alert('Unable to save post', error.message);
    } finally {
      setSaving(false);
    }
  };

  const isBusy = saving || importing || Boolean(uploadingImage);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.formContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 24 },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Import from HTML file</Text>
          <Text style={styles.formIntro}>
            Import an article to pre-fill the fields below. Review it before
            saving or publishing.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={importing}
            onPress={handleImportHtml}
            style={styles.importButton}>
            {importing ? (
              <ActivityIndicator size="small" color="#0F766E" />
            ) : (
              <Text style={styles.importButtonText}>Choose HTML file</Text>
            )}
          </TouchableOpacity>
          {!!importedFileName && (
            <Text style={styles.fieldHint}>Imported: {importedFileName}</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>SEO & Meta</Text>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            value={title}
            onChangeText={value => {
              setTitle(value);
              if (!slugEdited) setSlug(slugify(value));
            }}
            placeholder="Blog post title"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <Text style={styles.label}>Slug</Text>
          <TextInput
            value={slug}
            onChangeText={value => {
              setSlugEdited(true);
              setSlug(slugify(value));
            }}
            autoCapitalize="none"
            placeholder="blog-post-url"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <Text style={styles.fieldHint}>
            Will publish at companyvista.com/blog/{slug || '...'}
          </Text>
          <Text style={styles.label}>Meta description *</Text>
          <TextInput
            value={metaDescription}
            onChangeText={setMetaDescription}
            placeholder="Short description for search engines"
            placeholderTextColor="#94A3B8"
            multiline
            style={[styles.input, styles.multilineSmall]}
          />
          <Text style={styles.label}>Keywords (comma-separated)</Text>
          <TextInput
            value={keywords}
            onChangeText={setKeywords}
            placeholder="Keywords"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}>
              {CATEGORIES.map(item => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
          </View>
          <Text style={styles.label}>Author</Text>
          <TextInput
            value={author}
            onChangeText={setAuthor}
            placeholder="Author name"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <ImageField
            label="Hero Image"
            hint="Shown at the top of the article"
            value={heroImage}
            onChange={setHeroImage}
            onUpload={() => handleUploadImage('hero')}
            uploading={uploadingImage === 'hero'}
          />
          <ImageField
            label="OG Image"
            hint="Used for social share previews"
            value={ogImage}
            onChange={setOgImage}
            onUpload={() => handleUploadImage('og')}
            uploading={uploadingImage === 'og'}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Article Header</Text>
          <Text style={styles.label}>Standfirst *</Text>
          <Text style={styles.fieldHint}>
            1-2 sentence excerpt shown under the title
          </Text>
          <TextInput
            value={standfirst}
            onChangeText={setStandfirst}
            placeholder="A short introduction to your blog post"
            placeholderTextColor="#94A3B8"
            multiline
            style={[styles.input, styles.multilineSmall]}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Article Content *</Text>
          <TextInput
            value={content}
            onChangeText={value => {
              setContent(value);
              setImportedBodyBlocks(null);
            }}
            placeholder="Write your blog post content"
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.contentInput]}
          />
        </View>
        <View style={styles.saveActions}>
          <TouchableOpacity
            disabled={isBusy}
            onPress={() => handleSave('draft')}
            style={[styles.saveButton, styles.draftButton]}>
            {saving ? (
              <ActivityIndicator color="#334155" />
            ) : (
              <Text style={styles.draftButtonText}>Save draft</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isBusy}
            onPress={() => handleSave('published')}
            style={[styles.saveButton, styles.publishButton]}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.publishButtonText}>Publish</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={saving}
          onPress={onCancel}
          style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdminCreateBlogForm;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  formContent: { padding: 16, gap: 14 },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: font.base,
    fontWeight: '700',
    marginBottom: 4,
  },
  formIntro: { color: '#64748B', fontSize: font.sm, marginBottom: 8 },
  label: {
    color: '#334155',
    fontSize: font.sm,
    fontWeight: '700',
    marginTop: 8,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    fontSize: font.sm,
  },
  multilineSmall: { minHeight: 82, textAlignVertical: 'top' },
  contentInput: { minHeight: 180, textAlignVertical: 'top' },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: { color: '#0F172A' },
  importButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#99F6E4',
    backgroundColor: '#F0FDFA',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  importButtonText: {
    color: '#0F766E',
    fontSize: font.sm,
    fontWeight: '700',
  },
  fieldHint: { color: '#64748B', fontSize: font.xs, marginTop: 2 },
  imageField: { gap: 7, marginTop: 8 },
  imageFieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  imageUrlInput: { flex: 1 },
  uploadButton: {
    minWidth: 72,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 9,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
  },
  uploadButtonText: {
    color: '#4338CA',
    fontSize: font.sm,
    fontWeight: '700',
  },
  imagePreview: {
    width: 76,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: 76,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  imagePlaceholderText: { color: '#94A3B8', fontSize: font.tiny },
  saveActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  saveButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  draftButton: { backgroundColor: '#E2E8F0' },
  publishButton: { backgroundColor: '#4F46E5' },
  draftButtonText: { color: '#334155', fontSize: font.sm, fontWeight: '700' },
  publishButtonText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '700' },
  cancelButton: { alignItems: 'center', paddingVertical: 12 },
  cancelButtonText: { color: '#64748B', fontSize: font.sm, fontWeight: '600' },
});

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font } from '../../../theme/typography';
import { useAppSelector } from '../../../store/hooks';
import AdminCreateBlogForm from './AdminCreateBlogForm';
import {
  deleteAdminBlogPost,
  fetchAdminBlogPost,
  fetchAdminBlogPosts,
} from './api/adminBlogsApi';

const getDateLabel = value => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

const AdminBlogsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loadingEditSlug, setLoadingEditSlug] = useState('');

  const loadPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await fetchAdminBlogPosts(token);
      setPosts(
        [...result].sort((first, second) => {
          const firstDate = new Date(
            first.updated_at || first.created_at || 0,
          ).getTime();
          const secondDate = new Date(
            second.updated_at || second.created_at || 0,
          ).getTime();
          return (
            (Number.isNaN(secondDate) ? 0 : secondDate) -
            (Number.isNaN(firstDate) ? 0 : firstDate)
          );
        }),
      );
    } catch (error) {
      Alert.alert('Unable to load blogs', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts]),
  );

  const openCreateForm = () => {
    setEditingPost(null);
    setShowCreateForm(true);
  };

  const openEditForm = async post => {
    if (!post.slug || loadingEditSlug) return;
    setLoadingEditSlug(post.slug);
    try {
      const fullPost = await fetchAdminBlogPost({ token, slug: post.slug });
      setEditingPost(fullPost);
      setShowCreateForm(true);
    } catch (error) {
      Alert.alert('Unable to load blog post', error.message);
    } finally {
      setLoadingEditSlug('');
    }
  };

  const confirmDelete = post => {
    Alert.alert('Delete blog post?', `Delete "${post.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAdminBlogPost({ token, slug: post.slug });
            setPosts(current => current.filter(item => item.slug !== post.slug));
          } catch (error) {
            Alert.alert('Unable to delete post', error.message);
          }
        },
      },
    ]);
  };

  const renderPost = ({ item }) => {
    const published = item.status === 'published';
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeading}>
          <View style={styles.postTitleWrap}>
            <Text style={styles.postTitle} numberOfLines={2}>
              {item.title || 'Untitled post'}
            </Text>
            <Text style={styles.postSlug} numberOfLines={1}>
              /{item.slug}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              published ? styles.publishedBadge : styles.draftBadge,
            ]}>
            <Text
              style={[
                styles.statusText,
                published ? styles.publishedText : styles.draftText,
              ]}>
              {item.status || 'draft'}
            </Text>
          </View>
        </View>
        <View style={styles.postFooter}>
          <View style={styles.postMeta}>
            <Text style={styles.categoryText}>{item.category || 'Uncategorized'}</Text>
            <Text style={styles.dateText}>
              Updated {getDateLabel(item.updated_at)}
            </Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Edit ${item.title || 'blog post'}`}
            onPress={() => openEditForm(item)}
            disabled={Boolean(loadingEditSlug)}
            style={styles.editButton}>
            {loadingEditSlug === item.slug ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Ionicons name="create-outline" size={18} color="#2563EB" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item.title || 'blog post'}`}
            onPress={() => confirmDelete(item)}
            style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => {
            if (showCreateForm) setShowCreateForm(false);
            else navigation.goBack();
          }}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>
            {showCreateForm
              ? editingPost
                ? 'Edit blog post'
                : 'Create blog post'
              : 'Blog'}
          </Text>
          {!showCreateForm && (
            <Text style={styles.headerSubtitle}>
              Manage your blog posts · Total: {posts.length}
            </Text>
          )}
        </View>
        {!showCreateForm && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={openCreateForm}
            style={styles.newPostButton}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.newPostText}>New</Text>
          </TouchableOpacity>
        )}
      </View>

      {showCreateForm ? (
        <AdminCreateBlogForm
          post={editingPost}
          onCancel={() => setShowCreateForm(false)}
          onCreated={async () => {
            setShowCreateForm(false);
            setEditingPost(null);
            await loadPosts();
          }}
        />
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.helperText}>Loading blog posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) => String(item.id || item.slug || index)}
          renderItem={renderPost}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
            posts.length === 0 && styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadPosts(true)}
              tintColor="#4F46E5"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="document-text-outline" size={30} color="#64748B" />
              </View>
              <Text style={styles.emptyTitle}>No blog posts yet</Text>
              <Text style={styles.emptyDescription}>
                Create a post to get started.
              </Text>
              <TouchableOpacity onPress={openCreateForm} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Create blog post</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

export default AdminBlogsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTextWrap: { flex: 1 },
  headerTitle: {
    color: '#0F172A',
    fontSize: font.lg,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: font.xs,
    marginTop: 2,
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  newPostText: {
    color: '#FFFFFF',
    fontSize: font.sm,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  emptyList: { flexGrow: 1 },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
  },
  postHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  postTitleWrap: { flex: 1 },
  postTitle: {
    color: '#0F172A',
    fontSize: font.base,
    fontWeight: '700',
  },
  postSlug: {
    color: '#94A3B8',
    fontSize: font.xs,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  publishedBadge: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  draftBadge: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' },
  statusText: {
    fontSize: font.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  publishedText: { color: '#047857' },
  draftText: { color: '#475569' },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 14,
    paddingTop: 12,
  },
  postMeta: { flex: 1, gap: 4, marginRight: 8 },
  categoryText: { color: '#334155', fontSize: font.xs, fontWeight: '600' },
  dateText: { color: '#94A3B8', fontSize: font.xs },
  editButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    marginRight: 8,
  },
  deleteButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  helperText: { color: '#64748B', fontSize: font.sm },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  emptyTitle: { color: '#0F172A', fontSize: font.base, fontWeight: '700' },
  emptyDescription: { color: '#64748B', fontSize: font.sm, marginTop: 5 },
  emptyButton: {
    marginTop: 18,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emptyButtonText: { color: '#FFFFFF', fontSize: font.sm, fontWeight: '700' },
});

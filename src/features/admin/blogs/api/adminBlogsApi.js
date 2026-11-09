import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const BLOGS_URL = `${API_BASE_URL}/api/blog`;

const getHeaders = token => {
  if (!token) throw new Error('Auth token missing. Please login again.');
  return {
    Authorization: `Bearer ${token}`,
    'x-auth-token': token,
  };
};

const getErrorMessage = error =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  'Something went wrong. Please try again.';

const request = async (config, token) => {
  try {
    return await axios({
      timeout: 20000,
      ...config,
      headers: { ...getHeaders(token), ...(config.headers || {}) },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export async function fetchAdminBlogPosts(token) {
  const response = await request({ method: 'get', url: BLOGS_URL }, token);
  const posts = response.data?.data;
  if (!Array.isArray(posts)) {
    throw new Error('Invalid blog posts response from the server.');
  }
  return posts;
}

export async function createAdminBlogPost({ token, post }) {
  const response = await request(
    { method: 'post', url: BLOGS_URL, data: post },
    token,
  );
  return response.data;
}

export async function uploadAdminBlogImage({ token, image }) {
  if (!image?.uri) throw new Error('Please select an image to upload.');

  const formData = new FormData();
  formData.append('image', {
    uri: image.uri,
    name: image.fileName || `blog-image-${Date.now()}.jpg`,
    type: image.type || 'image/jpeg',
  });

  const response = await request(
    {
      method: 'post',
      url: `${BLOGS_URL}/upload-image`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    },
    token,
  );
  if (typeof response.data?.url !== 'string' || !response.data.url) {
    throw new Error(response.data?.message || 'Image upload returned no URL.');
  }
  return response.data.url;
}

export async function parseAdminBlogHtml({ token, html }) {
  if (!html) throw new Error('The selected HTML file is empty.');
  const response = await request(
    {
      method: 'post',
      url: `${BLOGS_URL}/parse-html`,
      data: { html, assetMap: {} },
    },
    token,
  );
  if (!response.data?.payload) {
    throw new Error(response.data?.message || 'Invalid HTML import response.');
  }
  return response.data;
}

export async function deleteAdminBlogPost({ token, slug }) {
  if (!slug) throw new Error('Blog post slug is missing.');
  const response = await request(
    { method: 'delete', url: `${BLOGS_URL}/${encodeURIComponent(slug)}` },
    token,
  );
  return response.data;
}

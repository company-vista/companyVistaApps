import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const MESSAGES_URL = `${API_BASE_URL}/api/messages`;

export function getAdminMessageMediaUrl({ id, messageId }) {
  if (!id || !messageId) {
    throw new Error('Conversation and message IDs are required to load media.');
  }
  return `${MESSAGES_URL}/${encodeURIComponent(id)}/media/${encodeURIComponent(messageId)}`;
}

function getHeaders(token) {
  if (!token) {
    throw new Error('Authentication token is missing. Please log in again.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'x-auth-token': token,
  };
}

export async function fetchAdminConversations(token) {
  const response = await axios.get(MESSAGES_URL, { headers: getHeaders(token) });
  if (!Array.isArray(response.data?.data)) {
    throw new Error('Invalid conversations response from the server.');
  }
  return response.data.data;
}

export async function fetchAdminConversationThread({ id, token }) {
  if (!id) throw new Error('Conversation ID is missing.');
  const response = await axios.get(`${MESSAGES_URL}/${encodeURIComponent(id)}`, {
    headers: getHeaders(token),
  });
  if (!Array.isArray(response.data?.data)) {
    throw new Error('Invalid conversation response from the server.');
  }
  return response.data.data;
}

export async function sendAdminMessage({ id, text, token }) {
  if (!id) throw new Error('Conversation ID is missing.');
  const trimmedText = String(text || '').trim();
  if (!trimmedText) throw new Error('Message text is required.');
  const response = await axios.post(
    `${MESSAGES_URL}/${encodeURIComponent(id)}`,
    { text: trimmedText },
    { headers: getHeaders(token) },
  );
  const message = response.data?.data;
  if (!message) {
    throw new Error(response.data?.message || 'Message was not sent.');
  }
  return message;
}

export async function sendAdminMediaMessage({ id, file, caption = '', token }) {
  if (!id) throw new Error('Conversation ID is missing.');
  if (!file?.uri) throw new Error('Please choose a file to send.');

  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || `attachment-${Date.now()}`,
    type: file.type || 'application/octet-stream',
  });
  if (caption.trim()) {
    formData.append('caption', caption.trim());
  }

  const response = await axios.post(
    `${MESSAGES_URL}/${encodeURIComponent(id)}/media`,
    formData,
    {
      timeout: 60000,
      headers: {
        ...getHeaders(token),
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  const message = response.data?.data;
  if (!response.data?.success || !message) {
    throw new Error(response.data?.message || 'Attachment was not sent.');
  }
  return message;
}

export function getAdminMessagesError(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Unable to load messages. Please try again.'
  );
}

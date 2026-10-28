import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const MESSAGES_URL = `${API_BASE_URL}/api/messages`;

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
  return response.data;
}

export function getAdminMessagesError(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Unable to load messages. Please try again.'
  );
}

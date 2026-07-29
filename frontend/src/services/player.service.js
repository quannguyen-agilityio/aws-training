import axios from 'axios';
import { API_URL } from '@constants/config.js';
import { getAuthHeader } from '@utils/auth.util.js';

const getBaseUrl = () => {
  if (!API_URL) return '/players';
  return `${API_URL}/players`;
};

export async function fetchPlayers() {
  const url = getBaseUrl();
  const response = await axios.get(url);
  return Array.isArray(response.data) ? response.data : response.data.players || [];
}

export async function savePlayerRecord(playerData) {
  const headers = await getAuthHeader();
  const url = getBaseUrl();
  return axios.post(url, playerData, { headers });
}

export async function deletePlayerRecord(playerId, teamId) {
  const headers = await getAuthHeader();
  const baseUrl = API_URL ? `${API_URL}/players` : '/players';
  const url = playerId ? `${baseUrl}/${playerId}` : baseUrl;
  return axios.delete(url, {
    headers,
    data: { playerId, teamId },
  });
}

import axios from 'axios';
import { API_URL } from '@constants/config.js';
import { getAuthHeader } from '@utils/auth.util.js';

export async function fetchPlayers() {
  const response = await axios.get(`${API_URL}/v1/players`);
  return Array.isArray(response.data) ? response.data : response.data.players || [];
}

export async function savePlayerRecord(playerData) {
  const headers = await getAuthHeader();
  return axios.post(`${API_URL}/v1/players`, playerData, { headers });
}

export async function deletePlayerRecord(playerId, teamId) {
  const headers = await getAuthHeader();
  return axios.delete(`${API_URL}/v1/players`, {
    headers,
    data: { playerId, teamId },
  });
}

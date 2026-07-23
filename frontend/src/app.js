import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { signIn, signOut, fetchAuthSession } from '@aws-amplify/auth';
import awsConfig from './aws-exports.js';

// Configure Amplify
Amplify.configure(awsConfig);

const API_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000';

// App State Management
let players = [];
let isAdmin = false;
let authToken = null;
let editingPlayerId = null;
let deletingPlayerId = null;
let deletingTeamId = null;

// DOM Elements
const playersGrid = document.getElementById('playersGrid');
const searchInput = document.getElementById('searchInput');
const positionFilter = document.getElementById('positionFilter');
const statusFilter = document.getElementById('statusFilter');
const resetFiltersBtn = document.getElementById('resetFilters');
const resultsCount = document.getElementById('resultsCount');

// Auth Elements
const authBtn = document.getElementById('authBtn');
const adminStatusBar = document.getElementById('adminStatusBar');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const loginErrorMessage = document.getElementById('loginErrorMessage');

// Player Form Elements
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerModalTitle = document.getElementById('playerModalTitle');
const playerForm = document.getElementById('playerForm');
const playerIdInput = document.getElementById('playerId');
const playerName = document.getElementById('playerName');
const teamIdInput = document.getElementById('teamId');
const playerNumber = document.getElementById('playerNumber');
const playerPosition = document.getElementById('playerPosition');
const playerStatus = document.getElementById('playerStatus');

// Delete Modal Elements
const deletePlayerName = document.getElementById('deletePlayerName');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Stats Overview counters
const statTotal = document.getElementById('statTotal');
const statActive = document.getElementById('statActive');
const statAvgRating = document.getElementById('statAvgRating');

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthSession();
  await loadPlayers();
  setupEventListeners();
});

// Axios Helper with Authorization Header
function getAuthHeaders() {
  return authToken
    ? {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    : { headers: { 'Content-Type': 'application/json' } };
}

// Load players from API
async function loadPlayers() {
  try {
    const response = await axios.get(`${API_URL}/players`);
    players = Array.isArray(response.data)
      ? response.data
      : response.data.players || [];
    renderPlayers();
  } catch (error) {
    console.error('Error fetching players:', error);
    showToast('Failed to load players from server', 'error');
  }
}

// Session Authentication with Amplify Cognito
async function checkAuthSession() {
  try {
    const session = await fetchAuthSession();
    if (session.tokens && session.tokens.idToken) {
      authToken = session.tokens.idToken.toString();
      setAdminState(true);
    } else {
      setAdminState(false);
    }
  } catch {
    setAdminState(false);
  }
}

function setAdminState(active) {
  isAdmin = active;
  if (active) {
    authBtn.innerHTML =
      '<i class="fa-solid fa-right-from-bracket"></i> <span>Logout Manager</span>';
    authBtn.classList.remove('btn-primary');
    authBtn.classList.add('btn-secondary');
    adminStatusBar.innerHTML =
      '<span class="status-badge admin-badge"><i class="fa-solid fa-user-gear"></i> Manager Mode</span>';
    addPlayerBtn.style.display = 'inline-flex';
  } else {
    authToken = null;
    authBtn.innerHTML =
      '<i class="fa-solid fa-lock"></i> <span>Admin Login</span>';
    authBtn.classList.remove('btn-secondary');
    authBtn.classList.add('btn-primary');
    adminStatusBar.innerHTML =
      '<span class="status-badge public-badge"><i class="fa-solid fa-eye"></i> Public View</span>';
    addPlayerBtn.style.display = 'none';
  }
  renderPlayers();
}

// Modal management utilities
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';

    if (modalId === 'loginModal') {
      loginForm.reset();
      loginErrorMessage.style.display = 'none';
    } else if (modalId === 'playerModal') {
      playerForm.reset();
      editingPlayerId = null;
      playerIdInput.readOnly = false;
    }
  }
}

// Notification System
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-circle-xmark';
  if (type === 'info') iconClass = 'fa-circle-info';

  toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-slide-in 0.3s ease reverse forwards';
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

// Event Listeners setup
function setupEventListeners() {
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(btn.getAttribute('data-close'));
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target.id);
    }
  });

  // Authentication Actions
  authBtn.addEventListener('click', async () => {
    if (isAdmin) {
      try {
        await signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
      setAdminState(false);
      showToast('Logged out successfully.', 'info');
    } else {
      openModal('loginModal');
    }
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      // Amplify Cognito Login
      const result = await signIn({ username, password });
      if (result.isSignedIn) {
        await checkAuthSession();
        closeModal('loginModal');
        showToast('Authenticated as Manager.', 'success');
      } else {
        loginErrorMessage.style.display = 'flex';
      }
    } catch (err) {
      console.warn('Cognito login fallback mock trigger:', err);
      // Mock fallback for offline/development test
      if (username === 'admin' && password === 'password123') {
        authToken = 'mock-admin-jwt-bearer-token';
        setAdminState(true);
        closeModal('loginModal');
        showToast('Authenticated as Manager (Local Admin).', 'success');
      } else {
        loginErrorMessage.style.display = 'flex';
      }
    }
  });

  // Filters
  searchInput.addEventListener('input', renderPlayers);
  positionFilter.addEventListener('change', renderPlayers);
  statusFilter.addEventListener('change', renderPlayers);

  resetFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    positionFilter.value = '';
    statusFilter.value = '';
    renderPlayers();
    showToast('Filters reset successfully.', 'info');
  });

  addPlayerBtn.addEventListener('click', () => {
    editingPlayerId = null;
    playerModalTitle.innerHTML =
      '<i class="fa-solid fa-user-plus"></i> Add Player Record';
    playerForm.reset();
    playerIdInput.readOnly = false;
    openModal('playerModal');
  });

  playerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    savePlayer();
  });

  confirmDeleteBtn.addEventListener('click', async () => {
    if (deletingPlayerId && deletingTeamId) {
      try {
        await axios.delete(`${API_URL}/players`, {
          data: {
            playerId: deletingPlayerId,
            teamId: deletingTeamId,
          },
          ...getAuthHeaders(),
        });
        showToast(`Deleted player from roster.`, 'error');
        await loadPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
        showToast('Failed to delete player', 'error');
      }
      closeModal('deleteModal');
      deletingPlayerId = null;
      deletingTeamId = null;
    }
  });
}

// Save player (Add or Edit)
async function savePlayer() {
  const playerPayload = {
    playerId: playerIdInput.value.trim(),
    name: playerName.value.trim(),
    email: `${playerIdInput.value.trim().toLowerCase()}@apexathletes.com`,
    teamId: teamIdInput.value.trim(),
    position: playerPosition.value,
    playerNumber: parseInt(playerNumber.value),
    status: playerStatus.value,
  };

  try {
    const response = await axios.post(
      `${API_URL}/players`,
      playerPayload,
      getAuthHeaders(),
    );
    const actionText = editingPlayerId ? 'Updated' : 'Saved';
    showToast(
      response.data.message || `${actionText} ${playerPayload.name} to roster`,
      'success',
    );
    await loadPlayers();
    closeModal('playerModal');
  } catch (error) {
    console.error('Error saving player:', error);
    showToast('Failed to save player', 'error');
  }
}

// Edit Player Trigger
window.triggerEditPlayer = function (id) {
  if (!isAdmin) return;
  const player = players.find((p) => p.playerId === id);
  if (!player) return;

  editingPlayerId = id;
  playerModalTitle.innerHTML =
    '<i class="fa-solid fa-user-pen"></i> Edit Player Record';

  playerIdInput.value = player.playerId;
  playerIdInput.readOnly = true;
  playerName.value = player.name || player.playerName || '';
  teamIdInput.value = player.teamId;
  playerNumber.value = player.playerNumber || player.jerseyNumber || 0;
  playerPosition.value = player.position || 'PG';
  playerStatus.value = player.status || 'Active';

  openModal('playerModal');
};

// Delete Player Trigger
window.triggerDeletePlayer = function (id, teamId) {
  if (!isAdmin) return;
  const player = players.find((p) => p.playerId === id && p.teamId === teamId);
  if (!player) return;

  deletingPlayerId = id;
  deletingTeamId = teamId;
  deletePlayerName.innerText = player.name || player.playerName || id;
  openModal('deleteModal');
};

// Core Rendering logic
function renderPlayers() {
  const searchVal = searchInput.value.toLowerCase().trim();
  const posVal = positionFilter.value;
  const statusVal = statusFilter.value;

  const filtered = players.filter((player) => {
    const pName = player.name || player.playerName || '';
    const pTeam = player.teamId || '';
    const pPos = player.position || '';

    const matchesSearch =
      pName.toLowerCase().includes(searchVal) ||
      pTeam.toLowerCase().includes(searchVal) ||
      pPos.toLowerCase().includes(searchVal);
    const matchesPosition = posVal ? player.position === posVal : true;
    const matchesStatus = statusVal ? player.status === statusVal : true;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  resultsCount.innerText = `Showing ${filtered.length} players`;
  statTotal.innerText = players.length;
  statActive.innerText = players.filter(
    (p) => (p.status || 'Active') === 'Active',
  ).length;

  if (statAvgRating) {
    statAvgRating.innerText = 'N/A';
  }

  if (filtered.length === 0) {
    playersGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-user-slash"></i>
                <h3>No players found</h3>
                <p>Try refining your search keyword or filters.</p>
            </div>
        `;
    return;
  }

  playersGrid.innerHTML = filtered
    .map((player) => {
      const pName = player.name || player.playerName || 'Player';
      const statusClass = `status-${player.status ? player.status.toLowerCase() : 'active'}`;

      const actionControls = isAdmin
        ? `
            <div class="card-admin-actions">
                <button class="btn btn-circle-action btn-circle-edit" onclick="triggerEditPlayer('${player.playerId}')" title="Edit player record">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-circle-action btn-circle-delete" onclick="triggerDeletePlayer('${player.playerId}', '${player.teamId}')" title="Delete player record">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `
        : '';

      return `
            <div class="player-card" data-id="${player.playerId}">
                ${actionControls}
                <div class="card-header-area">
                    <div class="player-badge-overlay">
                        <div class="player-pos-short">${getPositionAbbr(player.position)}</div>
                    </div>
                    <span class="card-status-badge ${statusClass}">${player.status || 'Active'}</span>
                    <div class="player-photo-container">
                        <div class="player-photo-placeholder"><i class="fa-solid fa-basketball"></i></div>
                    </div>
                </div>
                <div class="card-body-area">
                    <div class="player-identity">
                        <div class="player-name-row">
                            <h3 class="player-card-name" title="${pName}">${pName}</h3>
                            <span class="player-number-badge">#${player.playerNumber || player.jerseyNumber || 0}</span>
                        </div>
                        <div class="player-meta-row">
                            <span><i class="fa-solid fa-shield-halved"></i> Team: ${player.teamId}</span>
                        </div>
                        <div class="player-meta-row">
                            <span><i class="fa-solid fa-id-card"></i> ID: ${player.playerId}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join('');
}

function getPositionAbbr(pos) {
  switch (pos) {
    case 'PG':
      return 'PG';
    case 'SG':
      return 'SG';
    case 'SF':
      return 'SF';
    case 'PF':
      return 'PF';
    case 'C':
      return 'C';
    default:
      return pos || 'PL';
  }
}

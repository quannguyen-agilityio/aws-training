import axios from 'axios';

const API_URL = import.meta.env.VITE_API_ENDPOINT;

// App State Management
let players = [];
let isAdmin = false;
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
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const loginErrorMessage = document.getElementById('loginErrorMessage');

// Player Form Elements
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerModal = document.getElementById('playerModal');
const playerModalTitle = document.getElementById('playerModalTitle');
const playerForm = document.getElementById('playerForm');
const playerIdInput = document.getElementById('playerId');
const playerName = document.getElementById('playerName');
const teamIdInput = document.getElementById('teamId');
const playerNumber = document.getElementById('playerNumber');
const playerPosition = document.getElementById('playerPosition');
const playerStatus = document.getElementById('playerStatus');

// Delete Modal Elements
const deleteModal = document.getElementById('deleteModal');
const deletePlayerName = document.getElementById('deletePlayerName');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Stats Overview counters
const statTotal = document.getElementById('statTotal');
const statActive = document.getElementById('statActive');
const statAvgRating = document.getElementById('statAvgRating'); // We might hide or change this since rating is gone

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadPlayers();
  checkAuthSession();
  setupEventListeners();
});

// Load players from API
async function loadPlayers() {
  try {
    const response = await axios.get(`${API_URL}/v1/players`);
    // Assuming API returns an array or an object with players array
    players = Array.isArray(response.data)
      ? response.data
      : response.data.players || [];
    renderPlayers();
  } catch (error) {
    console.error('Error fetching players:', error);
    showToast('Failed to load players from server', 'error');
  }
}

// Session Authentication
function checkAuthSession() {
  const sessionAuth = sessionStorage.getItem('apex_admin_auth');
  if (sessionAuth === 'true') {
    setAdminState(true);
  } else {
    setAdminState(false);
  }
}

function setAdminState(active) {
  isAdmin = active;
  if (active) {
    sessionStorage.setItem('apex_admin_auth', 'true');
    authBtn.innerHTML =
      '<i class="fa-solid fa-right-from-bracket"></i> <span>Logout Manager</span>';
    authBtn.classList.remove('btn-primary');
    authBtn.classList.add('btn-secondary');
    adminStatusBar.innerHTML =
      '<span class="status-badge admin-badge"><i class="fa-solid fa-user-gear"></i> Manager Mode</span>';
    addPlayerBtn.style.display = 'inline-flex';
  } else {
    sessionStorage.removeItem('apex_admin_auth');
    authBtn.innerHTML =
      '<i class="fa-solid fa-lock"></i> <span>Admin Login</span>';
    authBtn.classList.remove('btn-secondary');
    authBtn.classList.add('btn-primary');
    adminStatusBar.innerHTML =
      '<span class="status-badge public-badge"><i class="fa-solid fa-eye"></i> Public View</span>';
    addPlayerBtn.style.display = 'none';
  }
  renderPlayers(); // Rerender to show/hide edit actions
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

    // Reset forms if closing form modals
    if (modalId === 'loginModal') {
      loginForm.reset();
      loginErrorMessage.style.display = 'none';
    } else if (modalId === 'playerModal') {
      playerForm.reset();
      editingPlayerId = null;
      playerIdInput.readOnly = false; // allow editing playerId for new records
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

  // Automatically remove after 3s
  setTimeout(() => {
    toast.style.animation = 'toast-slide-in 0.3s ease reverse forwards';
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

// Event Listeners setup
function setupEventListeners() {
  // Modal Close buttons
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(btn.getAttribute('data-close'));
    });
  });

  // Close on clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target.id);
    }
  });

  // Authentication Actions
  authBtn.addEventListener('click', () => {
    if (isAdmin) {
      setAdminState(false);
      showToast('Logged out successfully.', 'info');
    } else {
      openModal('loginModal');
    }
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Simple mock credentials
    if (username === 'admin' && password === 'password123') {
      setAdminState(true);
      closeModal('loginModal');
      showToast('Authenticated as Manager.', 'success');
    } else {
      loginErrorMessage.style.display = 'flex';
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

  // Player Add Form Trigger
  addPlayerBtn.addEventListener('click', () => {
    editingPlayerId = null;
    playerModalTitle.innerHTML =
      '<i class="fa-solid fa-user-plus"></i> Add Player Record';
    playerForm.reset();
    playerIdInput.readOnly = false;
    openModal('playerModal');
  });

  // Player Save Form Submit
  playerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    savePlayer();
  });

  // Confirm Delete Click
  confirmDeleteBtn.addEventListener('click', async () => {
    if (deletingPlayerId && deletingTeamId) {
      try {
        await axios.delete(`${API_URL}/v1/players`, {
          data: {
            playerId: deletingPlayerId,
            teamId: deletingTeamId
          }
        });
        const playerIndex = players.findIndex(
          (p) => p.playerId === deletingPlayerId && p.teamId === deletingTeamId,
        );
        if (playerIndex > -1) {
          const deletedName = players[playerIndex].playerName;
          players.splice(playerIndex, 1);
          renderPlayers();
          showToast(`Deleted ${deletedName} from roster.`, 'error');
        }
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
  const newPlayer = {
    playerId: playerIdInput.value.trim(),
    playerName: playerName.value.trim(),
    teamId: teamIdInput.value.trim(),
    position: playerPosition.value,
    jerseyNumber: parseInt(playerNumber.value),
    status: playerStatus.value,
  };

  try {
    if (editingPlayerId) {
      // Assuming PUT for edit or we can use POST for both create and update
      // Based on instructions, we can just use POST if the API handles upsert, or you might need PUT.
      // Using POST as mentioned in standard prompt if there is no explicit PUT.
      await axios.post(`${API_URL}/v1/players`, newPlayer);
      const idx = players.findIndex((p) => p.playerId === editingPlayerId);
      if (idx > -1) {
        players[idx] = newPlayer;
      }
      showToast(`Updated profile for ${newPlayer.playerName}`, 'success');
    } else {
      await axios.post(`${API_URL}/v1/players`, newPlayer);
      players.push(newPlayer);
      showToast(`Added ${newPlayer.playerName} to roster`, 'success');
    }

    // Refresh list from server to ensure sync
    await loadPlayers();
    closeModal('playerModal');
  } catch (error) {
    console.error('Error saving player:', error);
    showToast('Failed to save player', 'error');
  }
}

// Edit Player Trigger (called from dynamic element)
window.triggerEditPlayer = function (id) {
  if (!isAdmin) return;
  const player = players.find((p) => p.playerId === id);
  if (!player) return;

  editingPlayerId = id;
  playerModalTitle.innerHTML =
    '<i class="fa-solid fa-user-pen"></i> Edit Player Record';

  // Populate fields
  playerIdInput.value = player.playerId;
  playerIdInput.readOnly = true; // prevent changing ID on edit
  playerName.value = player.playerName;
  teamIdInput.value = player.teamId;
  playerNumber.value = player.jerseyNumber;
  playerPosition.value = player.position;
  playerStatus.value = player.status;

  openModal('playerModal');
};

// Delete Player Trigger (called from dynamic element)
window.triggerDeletePlayer = function (id, teamId) {
  if (!isAdmin) return;
  const player = players.find((p) => p.playerId === id && p.teamId === teamId);
  if (!player) return;

  deletingPlayerId = id;
  deletingTeamId = teamId;
  deletePlayerName.innerText = player.playerName;
  openModal('deleteModal');
};

// Core Rendering logic
function renderPlayers() {
  const searchVal = searchInput.value.toLowerCase().trim();
  const posVal = positionFilter.value;
  const statusVal = statusFilter.value;

  // Filter roster
  const filtered = players.filter((player) => {
    const pName = player.playerName || '';
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

  // Update count labels
  resultsCount.innerText = `Showing ${filtered.length} players`;

  // Render Stats panel counters
  statTotal.innerText = players.length;
  statActive.innerText = players.filter((p) => p.status === 'Active').length;

  // Hide Avg Rating since it's removed from schema, just clear it or show N/A
  if (statAvgRating) {
    statAvgRating.innerText = 'N/A';
  }

  // Render grid
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
      const statusClass = `status-${player.status ? player.status.toLowerCase() : 'active'}`;

      // Render Action buttons if manager authenticated
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
                    <span class="card-status-badge ${statusClass}">${player.status}</span>
                    <div class="player-photo-container">
                        <div class="player-photo-placeholder"><i class="fa-solid fa-basketball"></i></div>
                    </div>
                </div>
                <div class="card-body-area">
                    <div class="player-identity">
                        <div class="player-name-row">
                            <h3 class="player-card-name" title="${player.playerName}">${player.playerName}</h3>
                            <span class="player-number-badge">#${player.jerseyNumber}</span>
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

// Short abbreviations helper
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

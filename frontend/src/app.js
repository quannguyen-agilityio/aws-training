import { Amplify } from 'aws-amplify';
import awsConfig from '@constants/aws-exports.js';
import { elements } from '@dom/elements.js';
import { renderPlayers } from '@dom/render.js';
import { openModal, closeModal } from '@utils/modal.util.js';
import { showToast } from '@utils/toast.util.js';
import { checkAuthSession, loginUser, logoutUser } from '@utils/auth.util.js';
import { fetchPlayers, savePlayerRecord, deletePlayerRecord } from '@services/player.service.js';

// Initialize Amplify
Amplify.configure(awsConfig);

// Application State
let players = [];
let isAdmin = false;
let editingPlayerId = null;
let deletingPlayerId = null;
let deletingTeamId = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayers();
  const isAuthenticated = await checkAuthSession();
  setAdminState(isAuthenticated);
  setupEventListeners();
});

// Load Players
async function loadPlayers() {
  try {
    players = await fetchPlayers();
    renderPlayers(players, isAdmin);
  } catch (error) {
    console.error('Error fetching players:', error);
    showToast('Failed to load players from server', 'error');
  }
}

// Admin State Handler
function setAdminState(active) {
  isAdmin = active;
  if (active) {
    sessionStorage.setItem('apex_admin_auth', 'true');
    if (elements.authBtn) {
      elements.authBtn.innerHTML =
        '<i class="fa-solid fa-right-from-bracket"></i> <span>Logout Manager</span>';
      elements.authBtn.classList.remove('btn-primary');
      elements.authBtn.classList.add('btn-secondary');
    }
    if (elements.adminStatusBar) {
      elements.adminStatusBar.innerHTML =
        '<span class="status-badge admin-badge"><i class="fa-solid fa-user-gear"></i> Manager Mode</span>';
    }
    if (elements.addPlayerBtn) {
      elements.addPlayerBtn.style.display = 'inline-flex';
    }
  } else {
    sessionStorage.removeItem('apex_admin_auth');
    if (elements.authBtn) {
      elements.authBtn.innerHTML = '<i class="fa-solid fa-lock"></i> <span>Admin Login</span>';
      elements.authBtn.classList.remove('btn-secondary');
      elements.authBtn.classList.add('btn-primary');
    }
    if (elements.adminStatusBar) {
      elements.adminStatusBar.innerHTML =
        '<span class="status-badge public-badge"><i class="fa-solid fa-eye"></i> Public View</span>';
    }
    if (elements.addPlayerBtn) {
      elements.addPlayerBtn.style.display = 'none';
    }
  }
  renderPlayers(players, isAdmin);
}

// Event Listeners Setup
function setupEventListeners() {
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(btn.getAttribute('data-close'), elements.loginForm, elements.playerForm, () => {
        editingPlayerId = null;
        if (elements.playerIdInput) elements.playerIdInput.readOnly = false;
      });
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target.id, elements.loginForm, elements.playerForm, () => {
        editingPlayerId = null;
        if (elements.playerIdInput) elements.playerIdInput.readOnly = false;
      });
    }
  });

  // Auth Button Click
  if (elements.authBtn) {
    elements.authBtn.addEventListener('click', async () => {
      if (isAdmin) {
        await logoutUser();
        setAdminState(false);
        showToast('Logged out successfully.', 'info');
      } else {
        openModal('loginModal');
      }
    });
  }

  // Login Form Submit
  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = elements.usernameInput?.value.trim() || '';
      const password = elements.passwordInput?.value.trim() || '';

      try {
        const result = await loginUser(username, password);
        setAdminState(true);
        closeModal('loginModal', elements.loginForm, elements.playerForm);
        showToast(
          result.mode === 'cognito'
            ? 'Authenticated via Cognito Manager.'
            : 'Authenticated as Manager (Demo Mode).',
          'success'
        );
      } catch (err) {
        console.error('Login error:', err);
        if (elements.loginErrorMessage) {
          elements.loginErrorMessage.innerText = err.message || 'Invalid email or password.';
          elements.loginErrorMessage.style.display = 'flex';
        }
      }
    });
  }

  // Filter Listeners
  elements.searchInput?.addEventListener('input', () => renderPlayers(players, isAdmin));
  elements.positionFilter?.addEventListener('change', () => renderPlayers(players, isAdmin));
  elements.statusFilter?.addEventListener('change', () => renderPlayers(players, isAdmin));

  elements.resetFiltersBtn?.addEventListener('click', () => {
    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.positionFilter) elements.positionFilter.value = '';
    if (elements.statusFilter) elements.statusFilter.value = '';
    renderPlayers(players, isAdmin);
    showToast('Filters reset successfully.', 'info');
  });

  // Add Player Trigger
  elements.addPlayerBtn?.addEventListener('click', () => {
    editingPlayerId = null;
    if (elements.playerModalTitle) {
      elements.playerModalTitle.innerHTML =
        '<i class="fa-solid fa-user-plus"></i> Add Player Record';
    }
    elements.playerForm?.reset();
    if (elements.playerIdInput) elements.playerIdInput.readOnly = false;
    openModal('playerModal');
  });

  // Save Player Form Submit
  elements.playerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    savePlayer();
  });

  // Confirm Delete Click
  elements.confirmDeleteBtn?.addEventListener('click', async () => {
    if (deletingPlayerId && deletingTeamId) {
      try {
        await deletePlayerRecord(deletingPlayerId, deletingTeamId);
        const playerIndex = players.findIndex(
          (p) => p.playerId === deletingPlayerId && p.teamId === deletingTeamId
        );
        if (playerIndex > -1) {
          const deletedName = players[playerIndex].playerName;
          players.splice(playerIndex, 1);
          renderPlayers(players, isAdmin);
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

// Save Player (Add or Edit)
async function savePlayer() {
  const newPlayer = {
    playerId: elements.playerIdInput?.value.trim(),
    name: elements.playerName?.value.trim(),
    playerName: elements.playerName?.value.trim(),
    email: elements.playerEmail?.value.trim(),
    teamId: elements.teamIdInput?.value.trim(),
    position: elements.playerPosition?.value,
    jerseyNumber: parseInt(elements.playerNumber?.value || '0', 10),
    status: elements.playerStatus?.value,
  };

  try {
    await savePlayerRecord(newPlayer);

    if (editingPlayerId) {
      const idx = players.findIndex((p) => p.playerId === editingPlayerId);
      if (idx > -1) {
        players[idx] = newPlayer;
      }
      showToast(`Updated profile for ${newPlayer.playerName}`, 'success');
    } else {
      players.push(newPlayer);
      showToast(`Added ${newPlayer.playerName} to roster`, 'success');
    }

    await loadPlayers();
    closeModal('playerModal', elements.loginForm, elements.playerForm, () => {
      editingPlayerId = null;
      if (elements.playerIdInput) elements.playerIdInput.readOnly = false;
    });
  } catch (error) {
    console.error('Error saving player:', error);
    showToast('Failed to save player', 'error');
  }
}

// Dynamic Edit & Delete Triggers attached to window
window.triggerEditPlayer = function (id) {
  if (!isAdmin) return;
  const player = players.find((p) => p.playerId === id);
  if (!player) return;

  editingPlayerId = id;
  if (elements.playerModalTitle) {
    elements.playerModalTitle.innerHTML = '<i class="fa-solid fa-user-pen"></i> Edit Player Record';
  }

  if (elements.playerIdInput) {
    elements.playerIdInput.value = player.playerId;
    elements.playerIdInput.readOnly = true;
  }
  if (elements.playerName) elements.playerName.value = player.playerName || player.name || '';
  if (elements.playerEmail) elements.playerEmail.value = player.email || '';
  if (elements.teamIdInput) elements.teamIdInput.value = player.teamId;
  if (elements.playerNumber) elements.playerNumber.value = player.jerseyNumber;
  if (elements.playerPosition) elements.playerPosition.value = player.position;
  if (elements.playerStatus) elements.playerStatus.value = player.status;

  openModal('playerModal');
};

window.triggerDeletePlayer = function (id, teamId) {
  if (!isAdmin) return;
  const player = players.find((p) => p.playerId === id && p.teamId === teamId);
  if (!player) return;

  deletingPlayerId = id;
  deletingTeamId = teamId;
  if (elements.deletePlayerName) {
    elements.deletePlayerName.innerText = player.playerName;
  }
  openModal('deleteModal');
};

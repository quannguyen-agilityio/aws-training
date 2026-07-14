// Seed data to initialize the roster if local storage is empty
const INITIAL_PLAYERS = [
  {
    id: '1',
    name: 'Cristiano Ronaldo',
    number: 7,
    position: 'Forward',
    age: 39,
    nationality: 'Portugal',
    rating: 91,
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 88,
      sho: 93,
      pas: 80,
      dri: 85,
      def: 35,
      phy: 78,
    },
  },
  {
    id: '2',
    name: 'Kevin De Bruyne',
    number: 17,
    position: 'Midfielder',
    age: 32,
    nationality: 'Belgium',
    rating: 91,
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 72,
      sho: 86,
      pas: 94,
      dri: 87,
      def: 65,
      phy: 78,
    },
  },
  {
    id: '3',
    name: 'Virgil van Dijk',
    number: 4,
    position: 'Defender',
    age: 32,
    nationality: 'Netherlands',
    rating: 89,
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 78,
      sho: 60,
      pas: 71,
      dri: 72,
      def: 89,
      phy: 86,
    },
  },
  {
    id: '4',
    name: 'Alisson Becker',
    number: 1,
    position: 'Goalkeeper',
    age: 31,
    nationality: 'Brazil',
    rating: 89,
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 86,
      sho: 85,
      pas: 85,
      dri: 89,
      def: 54,
      phy: 90, // (DIV, HAN, KIC, REF, SPD, POS for GK)
    },
  },
  {
    id: '5',
    name: 'Neymar Jr',
    number: 10,
    position: 'Forward',
    age: 32,
    nationality: 'Brazil',
    rating: 88,
    status: 'Injured',
    image:
      'https://images.unsplash.com/photo-1525640788966-69bdb028aa73?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 86,
      sho: 83,
      pas: 85,
      dri: 92,
      def: 37,
      phy: 61,
    },
  },
  {
    id: '6',
    name: 'Luka Modrić',
    number: 10,
    position: 'Midfielder',
    age: 38,
    nationality: 'Croatia',
    rating: 87,
    status: 'Suspended',
    image:
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 72,
      sho: 76,
      pas: 89,
      dri: 86,
      def: 72,
      phy: 66,
    },
  },
];

// App State Management
let players = [];
let isAdmin = false;
let editingPlayerId = null;
let deletingPlayerId = null;

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
const playerIdInput = document.getElementById('playerIdInput');
const playerName = document.getElementById('playerName');
const playerNumber = document.getElementById('playerNumber');
const playerPosition = document.getElementById('playerPosition');
const playerStatus = document.getElementById('playerStatus');
const playerAge = document.getElementById('playerAge');
const playerNationality = document.getElementById('playerNationality');
const playerRating = document.getElementById('playerRating');
const playerImage = document.getElementById('playerImage');

// Stat Labels for Goalkeeper vs Outfield
const statLabels = [
  document.getElementById('statLabel1'),
  document.getElementById('statLabel2'),
  document.getElementById('statLabel3'),
  document.getElementById('statLabel4'),
  document.getElementById('statLabel5'),
  document.getElementById('statLabel6'),
];

const statPace = document.getElementById('statPace');
const statShooting = document.getElementById('statShooting');
const statPassing = document.getElementById('statPassing');
const statDribbling = document.getElementById('statDribbling');
const statDefense = document.getElementById('statDefense');
const statPhysical = document.getElementById('statPhysical');

// Delete Modal Elements
const deleteModal = document.getElementById('deleteModal');
const deletePlayerName = document.getElementById('deletePlayerName');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Stats Overview counters
const statTotal = document.getElementById('statTotal');
const statActive = document.getElementById('statActive');
const statAvgRating = document.getElementById('statAvgRating');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadPlayers();
  checkAuthSession();
  setupEventListeners();
  renderPlayers();
});

// Load players from localStorage or seed them
function loadPlayers() {
  const stored = localStorage.getItem('apex_roster');
  if (stored) {
    players = JSON.parse(stored);
  } else {
    players = [...INITIAL_PLAYERS];
    savePlayersToStorage();
  }
}

function savePlayersToStorage() {
  localStorage.setItem('apex_roster', JSON.stringify(players));
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
      updateStatLabels('Forward'); // reset default labels
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

// Dynamic Stats labels depending on Goalkeeper or Outfield
function updateStatLabels(position) {
  if (position === 'Goalkeeper') {
    statLabels[0].innerText = 'DIV (Diving)';
    statLabels[1].innerText = 'HAN (Handling)';
    statLabels[2].innerText = 'KIC (Kicking)';
    statLabels[3].innerText = 'REF (Reflexes)';
    statLabels[4].innerText = 'SPD (Speed)';
    statLabels[5].innerText = 'POS (Positioning)';
  } else {
    statLabels[0].innerText = 'PAC (Pace)';
    statLabels[1].innerText = 'SHO (Shooting)';
    statLabels[2].innerText = 'PAS (Passing)';
    statLabels[3].innerText = 'DRI (Dribbling)';
    statLabels[4].innerText = 'DEF (Defense)';
    statLabels[5].innerText = 'PHY (Physicality)';
  }
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
    updateStatLabels('Forward');
    openModal('playerModal');
  });

  // Player Position Change changes stats labels
  playerPosition.addEventListener('change', (e) => {
    updateStatLabels(e.target.value);
  });

  // Player Save Form Submit
  playerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    savePlayer();
  });

  // Confirm Delete Click
  confirmDeleteBtn.addEventListener('click', () => {
    if (deletingPlayerId) {
      const playerIndex = players.findIndex((p) => p.id === deletingPlayerId);
      if (playerIndex > -1) {
        const deletedName = players[playerIndex].name;
        players.splice(playerIndex, 1);
        savePlayersToStorage();
        renderPlayers();
        showToast(`Deleted ${deletedName} from roster.`, 'error');
      }
      closeModal('deleteModal');
      deletingPlayerId = null;
    }
  });
}

// Save player (Add or Edit)
function savePlayer() {
  const id = editingPlayerId || Date.now().toString();
  const newPlayer = {
    id,
    name: playerName.value.trim(),
    number: parseInt(playerNumber.value),
    position: playerPosition.value,
    status: playerStatus.value,
    age: parseInt(playerAge.value),
    nationality: playerNationality.value.trim(),
    rating: parseInt(playerRating.value),
    image: playerImage.value.trim() || null,
    stats: {
      pac: parseInt(statPace.value) || 0,
      sho: parseInt(statShooting.value) || 0,
      pas: parseInt(statPassing.value) || 0,
      dri: parseInt(statDribbling.value) || 0,
      def: parseInt(statDefense.value) || 0,
      phy: parseInt(statPhysical.value) || 0,
    },
  };

  if (editingPlayerId) {
    // Edit existing
    const idx = players.findIndex((p) => p.id === editingPlayerId);
    if (idx > -1) {
      players[idx] = newPlayer;
      showToast(`Updated profile for ${newPlayer.name}`, 'success');
    }
  } else {
    // Add new
    players.push(newPlayer);
    showToast(`Added ${newPlayer.name} to roster`, 'success');
  }

  savePlayersToStorage();
  renderPlayers();
  closeModal('playerModal');
}

// Edit Player Trigger (called from dynamic element)
window.triggerEditPlayer = function (id) {
  if (!isAdmin) return;
  const player = players.find((p) => p.id === id);
  if (!player) return;

  editingPlayerId = id;
  playerModalTitle.innerHTML =
    '<i class="fa-solid fa-user-pen"></i> Edit Player Record';

  // Populate fields
  playerName.value = player.name;
  playerNumber.value = player.number;
  playerPosition.value = player.position;
  playerStatus.value = player.status;
  playerAge.value = player.age;
  playerNationality.value = player.nationality;
  playerRating.value = player.rating;
  playerImage.value = player.image || '';

  // Stats
  updateStatLabels(player.position);
  statPace.value = player.stats.pac;
  statShooting.value = player.stats.sho;
  statPassing.value = player.stats.pas;
  statDribbling.value = player.stats.dri;
  statDefense.value = player.stats.def;
  statPhysical.value = player.stats.phy;

  openModal('playerModal');
};

// Delete Player Trigger (called from dynamic element)
window.triggerDeletePlayer = function (id) {
  if (!isAdmin) return;
  const player = players.find((p) => p.id === id);
  if (!player) return;

  deletingPlayerId = id;
  deletePlayerName.innerText = player.name;
  openModal('deleteModal');
};

// Core Rendering logic
function renderPlayers() {
  const searchVal = searchInput.value.toLowerCase().trim();
  const posVal = positionFilter.value;
  const statusVal = statusFilter.value;

  // Filter roster
  const filtered = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchVal) ||
      player.nationality.toLowerCase().includes(searchVal) ||
      player.position.toLowerCase().includes(searchVal);
    const matchesPosition = posVal ? player.position === posVal : true;
    const matchesStatus = statusVal ? player.status === statusVal : true;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  // Update count labels
  resultsCount.innerText = `Showing ${filtered.length} players`;

  // Render Stats panel counters
  statTotal.innerText = players.length;
  statActive.innerText = players.filter((p) => p.status === 'Active').length;

  if (players.length > 0) {
    const avg = players.reduce((sum, p) => sum + p.rating, 0) / players.length;
    statAvgRating.innerText = Math.round(avg);
  } else {
    statAvgRating.innerText = '0';
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
      const statusClass = `status-${player.status.toLowerCase()}`;

      // Define statutory abbreviations for card stats
      let label1 = 'PAC',
        label2 = 'SHO',
        label3 = 'PAS';
      let label4 = 'DRI',
        label5 = 'DEF',
        label6 = 'PHY';

      if (player.position === 'Goalkeeper') {
        label1 = 'DIV';
        label2 = 'HAN';
        label3 = 'KIC';
        label4 = 'REF';
        label5 = 'SPD';
        label6 = 'POS';
      }

      const imageHtml = player.image
        ? `<img class="player-photo" src="${player.image}" alt="${player.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`
        : '';
      const placeholderHtml = `<div class="player-photo-placeholder" style="${player.image ? 'display:none;' : ''}"><i class="fa-solid fa-user-ninja"></i></div>`;

      // Render Action buttons if manager authenticated
      const actionControls = isAdmin
        ? `
            <div class="card-admin-actions">
                <button class="btn btn-circle-action btn-circle-edit" onclick="triggerEditPlayer('${player.id}')" title="Edit player record">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-circle-action btn-circle-delete" onclick="triggerDeletePlayer('${player.id}')" title="Delete player record">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `
        : '';

      return `
            <div class="player-card" data-id="${player.id}">
                ${actionControls}
                <div class="card-header-area">
                    <div class="player-badge-overlay">
                        <div class="player-ovr">${player.rating}</div>
                        <div class="player-pos-short">${getPositionAbbr(player.position)}</div>
                    </div>
                    <span class="card-status-badge ${statusClass}">${player.status}</span>
                    <div class="player-photo-container">
                        ${imageHtml}
                        ${placeholderHtml}
                    </div>
                </div>
                <div class="card-body-area">
                    <div class="player-identity">
                        <div class="player-name-row">
                            <h3 class="player-card-name" title="${player.name}">${player.name}</h3>
                            <span class="player-number-badge">#${player.number}</span>
                        </div>
                        <div class="player-meta-row">
                            <span><i class="fa-solid fa-earth-americas"></i> ${player.nationality}</span>
                            <span><i class="fa-solid fa-calendar"></i> ${player.age} yrs</span>
                        </div>
                    </div>
                    <div class="player-stats-grid">
                        <div class="stat-mini-box">
                            <span class="stat-mini-val">${player.stats.pac}</span>
                            <span class="stat-mini-lbl">${label1}</span>
                        </div>
                        <div class="stat-mini-box">
                            <span class="stat-mini-val">${player.stats.sho}</span>
                            <span class="stat-mini-lbl">${label2}</span>
                        </div>
                        <div class="stat-mini-box">
                            <span class="stat-mini-val">${player.stats.pas}</span>
                            <span class="stat-mini-lbl">${label3}</span>
                        </div>
                        <div class="stat-mini-box">
                            <span class="stat-mini-val">${player.stats.dri}</span>
                            <span class="stat-mini-lbl">${label4}</span>
                        </div>
                        <div class="stat-mini-box">
                            <span class="stat-mini-val">${player.stats.def}</span>
                            <span class="stat-mini-lbl">${label5}</span>
                        </div>
                        <div class="stat-mini-box">
                            <span class="stat-mini-val">${player.stats.phy}</span>
                            <span class="stat-mini-lbl">${label6}</span>
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
    case 'Goalkeeper':
      return 'GK';
    case 'Defender':
      return 'DF';
    case 'Midfielder':
      return 'MD';
    case 'Forward':
      return 'FW';
    default:
      return 'PL';
  }
}

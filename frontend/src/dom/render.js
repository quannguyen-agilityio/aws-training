import { elements } from '@dom/elements.js';
import { getPositionAbbr } from '@constants/positions.js';

export function renderPlayers(players, isAdmin) {
  const searchVal = elements.searchInput?.value.toLowerCase().trim() || '';
  const posVal = elements.positionFilter?.value || '';
  const statusVal = elements.statusFilter?.value || '';

  const filtered = players.filter((player) => {
    const pName = player.playerName || player.name || '';
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

  if (elements.resultsCount) {
    elements.resultsCount.innerText = `Showing ${filtered.length} players`;
  }
  if (elements.statTotal) {
    elements.statTotal.innerText = players.length;
  }
  if (elements.statActive) {
    elements.statActive.innerText = players.filter((p) => p.status === 'Active').length;
  }
  if (elements.statAvgRating) {
    elements.statAvgRating.innerText = 'N/A';
  }

  if (!elements.playersGrid) return;

  if (filtered.length === 0) {
    elements.playersGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-user-slash"></i>
                <h3>No players found</h3>
                <p>Try refining your search keyword or filters.</p>
            </div>
        `;
    return;
  }

  elements.playersGrid.innerHTML = filtered
    .map((player) => {
      const statusClass = `status-${player.status ? player.status.toLowerCase() : 'active'}`;
      const displayName = player.playerName || player.name || 'Unnamed Player';

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
                            <h3 class="player-card-name" title="${displayName}">${displayName}</h3>
                            <span class="player-number-badge">#${player.jerseyNumber || 0}</span>
                        </div>
                        <div class="player-meta-row">
                            <span><i class="fa-solid fa-shield-halved"></i> Team: ${player.teamId}</span>
                        </div>
                        <div class="player-meta-row">
                            <span><i class="fa-solid fa-id-card"></i> ID: ${player.playerId}</span>
                        </div>
                        ${
                          player.email
                            ? `<div class="player-meta-row"><span><i class="fa-solid fa-envelope"></i> ${player.email}</span></div>`
                            : ''
                        }
                    </div>
                </div>
            </div>
        `;
    })
    .join('');
}

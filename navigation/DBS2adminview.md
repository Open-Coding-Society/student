---
layout: page
title: "DBS2 Admin Panel"
permalink: /DBS2admin
---

<style>
/* Admin Panel Styles */
.admin-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #333;
}

.admin-header h1 {
    color: #f7931a;
    margin: 0;
    font-size: 28px;
}

.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 25px;
}

.stat-card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    border: 1px solid #333;
}

.stat-card .stat-value {
    font-size: 32px;
    font-weight: bold;
    color: #f7931a;
}

.stat-card .stat-label {
    color: #888;
    font-size: 14px;
    margin-top: 5px;
}

.controls-bar {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
}

.controls-bar input, .controls-bar select {
    padding: 10px 15px;
    border-radius: 6px;
    border: 1px solid #444;
    background: #1a1a2e;
    color: #fff;
    font-size: 14px;
}

.controls-bar input:focus, .controls-bar select:focus {
    outline: none;
    border-color: #f7931a;
}

.btn {
    padding: 10px 20px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;
}

.btn-primary {
    background: #f7931a;
    color: #000;
}

.btn-primary:hover {
    background: #ffa94d;
}

.btn-danger {
    background: #dc3545;
    color: #fff;
}

.btn-danger:hover {
    background: #c82333;
}

.btn-success {
    background: #28a745;
    color: #fff;
}

.btn-success:hover {
    background: #218838;
}

.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
}

/* Players Table */
.players-table-container {
    background: #1a1a2e;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #333;
}

.players-table {
    width: 100%;
    border-collapse: collapse;
}

.players-table th {
    background: #16213e;
    color: #f7931a;
    padding: 15px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #333;
}

.players-table td {
    padding: 12px 15px;
    border-bottom: 1px solid #2a2a4a;
    color: #ddd;
}

.players-table tr:hover {
    background: rgba(247, 147, 26, 0.1);
}

.players-table .rank {
    font-weight: bold;
    color: #f7931a;
    width: 50px;
}

.players-table .crypto-value {
    font-weight: bold;
    color: #4ade80;
}

.players-table .minigame-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 11px;
    margin: 2px;
    background: #333;
    color: #888;
}

.players-table .minigame-badge.completed {
    background: #166534;
    color: #4ade80;
}

/* Action buttons in table */
.action-buttons {
    display: flex;
    gap: 5px;
}

/* Modal Styles */
.modal-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 10000;
    justify-content: center;
    align-items: center;
}

.modal-overlay.active {
    display: flex;
}

.modal {
    background: #1a1a2e;
    border-radius: 12px;
    padding: 25px;
    min-width: 400px;
    max-width: 90vw;
    border: 1px solid #333;
}

.modal h2 {
    color: #f7931a;
    margin-top: 0;
    margin-bottom: 20px;
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.modal-form label {
    color: #888;
    font-size: 14px;
}

.modal-form input {
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #444;
    background: #16213e;
    color: #fff;
    font-size: 16px;
}

.modal-buttons {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

/* Loading state */
.loading {
    text-align: center;
    padding: 40px;
    color: #888;
}

.loading::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #f7931a;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
    margin-left: 10px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Error message */
.error-message {
    background: #dc3545;
    color: #fff;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 768px) {
    .players-table {
        font-size: 12px;
    }
    .players-table th, .players-table td {
        padding: 8px;
    }
    .action-buttons {
        flex-direction: column;
    }
}
</style>

<div class="admin-container">
    <div class="admin-header">
        <h1>🎮 DBS2 Game Admin Panel</h1>
        <button class="btn btn-primary" onclick="refreshData()">🔄 Refresh</button>
    </div>

    <!-- Error Display -->
    <div id="errorMessage" class="error-message" style="display: none;"></div>

    <!-- Statistics Cards -->
    <div class="stats-cards">
        <div class="stat-card">
            <div class="stat-value" id="totalPlayers">-</div>
            <div class="stat-label">Total Players</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="totalCrypto">-</div>
            <div class="stat-label">Total Crypto</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="avgCrypto">-</div>
            <div class="stat-label">Avg Crypto</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="minigameCompletions">-</div>
            <div class="stat-label">Total Minigame Completions</div>
        </div>
    </div>

    <!-- Controls -->
    <div class="controls-bar">
        <input type="text" id="searchInput" placeholder="🔍 Search by name or uid..." style="width: 250px;">
        <select id="sortSelect">
            <option value="crypto">Sort by Crypto (High→Low)</option>
            <option value="name">Sort by Name (A→Z)</option>
            <option value="updated">Sort by Last Active</option>
        </select>
        <button class="btn btn-success" onclick="openBulkModal()">💰 Bulk Add Crypto</button>
        <button class="btn btn-danger" onclick="confirmResetAll()">⚠️ Reset All Players</button>
    </div>

    <!-- Players Table -->
    <div class="players-table-container">
        <table class="players-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>User ID</th>
                    <th>Crypto</th>
                    <th>Minigames</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="playersTableBody">
                <tr>
                    <td colspan="7" class="loading">Loading players...</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Edit Player Modal -->
<div class="modal-overlay" id="editModal">
    <div class="modal">
        <h2>✏️ Edit Player: <span id="editPlayerName"></span></h2>
        <div class="modal-form">
            <div>
                <label>Current Crypto</label>
                <input type="text" id="currentCrypto" disabled>
            </div>
            <div>
                <label>Set Crypto To</label>
                <input type="number" id="newCrypto" placeholder="Enter new crypto amount">
            </div>
            <div>
                <label>Or Add/Subtract Crypto</label>
                <input type="number" id="addCrypto" placeholder="e.g., 100 or -50">
            </div>
            <input type="hidden" id="editUserId">
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="savePlayerChanges()">💾 Save Changes</button>
                <button class="btn" onclick="closeEditModal()" style="background:#444;color:#fff;">Cancel</button>
                <button class="btn btn-danger" onclick="resetPlayer()">🗑️ Reset Player</button>
            </div>
        </div>
    </div>
</div>

<!-- Bulk Update Modal -->
<div class="modal-overlay" id="bulkModal">
    <div class="modal">
        <h2>💰 Bulk Crypto Update</h2>
        <div class="modal-form">
            <div>
                <label>Amount to Add to ALL Players</label>
                <input type="number" id="bulkAmount" placeholder="e.g., 50">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-success" onclick="executeBulkAdd()">Add to All Players</button>
                <button class="btn" onclick="closeBulkModal()" style="background:#444;color:#fff;">Cancel</button>
            </div>
        </div>
    </div>
</div>

<script type="module">
import { pythonURI, fetchOptions } from '{{ site.baseurl }}/assets/js/api/config.js';

const API_BASE = `${pythonURI}/api/dbs2`;

// Store players data globally
let playersData = [];

// Fetch all players
async function fetchPlayers() {
    const sort = document.getElementById('sortSelect').value;
    try {
        const response = await fetch(`${API_BASE}/admin/players?sort=${sort}`, {
            ...fetchOptions,
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        playersData = data.players || [];
        return playersData;
    } catch (error) {
        console.error('Error fetching players:', error);
        showError('Failed to fetch players: ' + error.message);
        return [];
    }
}

// Fetch stats
async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`, {
            ...fetchOptions,
            method: 'GET'
        });
        
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

// Render statistics
function renderStats(stats) {
    if (!stats) return;
    
    document.getElementById('totalPlayers').textContent = stats.total_players || 0;
    document.getElementById('totalCrypto').textContent = (stats.total_crypto_in_circulation || 0).toLocaleString();
    document.getElementById('avgCrypto').textContent = Math.round(stats.average_crypto || 0).toLocaleString();
    
    // Count total minigame completions
    const completions = stats.minigame_completions || {};
    const totalCompletions = Object.values(completions).reduce((a, b) => a + b, 0);
    document.getElementById('minigameCompletions').textContent = totalCompletions;
}

// Render players table
function renderPlayers(players) {
    const tbody = document.getElementById('playersTableBody');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // Filter players
    const filtered = players.filter(p => {
        const name = (p.user_info?.name || '').toLowerCase();
        const uid = (p.user_info?.uid || '').toLowerCase();
        return name.includes(searchTerm) || uid.includes(searchTerm);
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#888;">No players found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map((player, index) => {
        const minigames = player.minigames_completed || {};
        const minigameBadges = ['crypto_miner', 'infinite_user', 'laundry', 'ash_trail']
            .map(game => {
                const completed = minigames[game] === true;
                return `<span class="minigame-badge ${completed ? 'completed' : ''}">${game.replace('_', ' ')}</span>`;
            }).join('');
        
        const lastActive = player.updated_at 
            ? new Date(player.updated_at).toLocaleDateString() 
            : 'Never';
        
        return `
            <tr>
                <td class="rank">${player.rank || index + 1}</td>
                <td><strong>${player.user_info?.name || 'Unknown'}</strong></td>
                <td><code>${player.user_info?.uid || 'N/A'}</code></td>
                <td class="crypto-value">₿ ${(player.crypto || 0).toLocaleString()}</td>
                <td>${minigameBadges}</td>
                <td>${lastActive}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm" onclick="openEditModal('${player.user_info?.uid}', '${player.user_info?.name}', ${player.crypto || 0})">✏️ Edit</button>
                        <button class="btn btn-success btn-sm" onclick="quickAddCrypto('${player.user_info?.uid}', 50)">+50</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Update player crypto
async function updatePlayerCrypto(userId, data) {
    try {
        const response = await fetch(`${API_BASE}/admin/player/${userId}`, {
            ...fetchOptions,
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Update failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating player:', error);
        showError('Failed to update player: ' + error.message);
        throw error;
    }
}

// Bulk update
async function bulkUpdate(action, amount) {
    try {
        const response = await fetch(`${API_BASE}/admin/bulk`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify({ action, amount })
        });
        
        if (!response.ok) throw new Error('Bulk update failed');
        
        return await response.json();
    } catch (error) {
        console.error('Error in bulk update:', error);
        showError('Bulk update failed: ' + error.message);
        throw error;
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}

// Refresh all data
async function refreshData() {
    document.getElementById('playersTableBody').innerHTML = '<tr><td colspan="7" class="loading">Loading players...</td></tr>';
    
    const [players, stats] = await Promise.all([
        fetchPlayers(),
        fetchStats()
    ]);
    
    renderPlayers(players);
    renderStats(stats);
}

// Modal functions
function openEditModal(userId, name, crypto) {
    document.getElementById('editPlayerName').textContent = name;
    document.getElementById('editUserId').value = userId;
    document.getElementById('currentCrypto').value = crypto;
    document.getElementById('newCrypto').value = '';
    document.getElementById('addCrypto').value = '';
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

async function savePlayerChanges() {
    const userId = document.getElementById('editUserId').value;
    const newCrypto = document.getElementById('newCrypto').value;
    const addCrypto = document.getElementById('addCrypto').value;
    
    let data = {};
    if (newCrypto !== '') {
        data.crypto = parseInt(newCrypto);
    } else if (addCrypto !== '') {
        data.add_crypto = parseInt(addCrypto);
    } else {
        showError('Please enter a value');
        return;
    }
    
    try {
        await updatePlayerCrypto(userId, data);
        closeEditModal();
        refreshData();
    } catch (e) {
        // Error already shown
    }
}

async function resetPlayer() {
    const userId = document.getElementById('editUserId').value;
    if (!confirm(`Reset ALL game data for ${userId}? This cannot be undone!`)) return;
    
    try {
        await updatePlayerCrypto(userId, { reset: true });
        closeEditModal();
        refreshData();
    } catch (e) {
        // Error already shown
    }
}

function openBulkModal() {
    document.getElementById('bulkAmount').value = '';
    document.getElementById('bulkModal').classList.add('active');
}

function closeBulkModal() {
    document.getElementById('bulkModal').classList.remove('active');
}

async function executeBulkAdd() {
    const amount = parseInt(document.getElementById('bulkAmount').value);
    if (isNaN(amount) || amount === 0) {
        showError('Please enter a valid amount');
        return;
    }
    
    if (!confirm(`Add ${amount} crypto to ALL players?`)) return;
    
    try {
        await bulkUpdate('add_crypto', amount);
        closeBulkModal();
        refreshData();
    } catch (e) {
        // Error already shown
    }
}

async function confirmResetAll() {
    if (!confirm('⚠️ WARNING: This will reset ALL players to 0 crypto and clear all progress! Are you sure?')) return;
    if (!confirm('This is your FINAL warning. All player progress will be PERMANENTLY deleted. Continue?')) return;
    
    try {
        await bulkUpdate('reset_all', 0);
        refreshData();
    } catch (e) {
        // Error already shown
    }
}

async function quickAddCrypto(userId, amount) {
    try {
        await updatePlayerCrypto(userId, { add_crypto: amount });
        refreshData();
    } catch (e) {
        // Error already shown
    }
}

// Expose functions globally
window.refreshData = refreshData;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.savePlayerChanges = savePlayerChanges;
window.resetPlayer = resetPlayer;
window.openBulkModal = openBulkModal;
window.closeBulkModal = closeBulkModal;
window.executeBulkAdd = executeBulkAdd;
window.confirmResetAll = confirmResetAll;
window.quickAddCrypto = quickAddCrypto;

// Event listeners
document.getElementById('searchInput').addEventListener('input', () => {
    renderPlayers(playersData);
});

document.getElementById('sortSelect').addEventListener('change', refreshData);

// Initial load
document.addEventListener('DOMContentLoaded', refreshData);

// Auto-refresh every 30 seconds
setInterval(refreshData, 3000);
</script>
// MCOC Master Companion Main Application Logic
let currentTab = 'nodes';
let searchQuery = '';
let selectedRosterClasses = new Set();
let selectedDbClasses = new Set();
let selectedDbTag = 'All';
let selectedDbCategory = 'All';
let selectedDbYear = 'All';
let selectedDbSort = 'name-asc';
let selectedDbMatchMode = 'all';
let selectedRarityFilter = 'All';
let ownedOnlyFilter = false;
let selectedImmunityFilter = 'All';
let glossarySearchQuery = '';

// Short-form / Acronym lookup map for badges
const ALIAS_LOOKUP = {
  "Cosmic Ghost Rider": "CGR",
  "Black Widow (Claire Voyant)": "BWCV",
  "Doctor Doom": "DOOM",
  "Absorbing Man": "ABS MAN",
  "Infamous Iron Man": "IDOOM",
  "Iron Man (Infamous)": "IDOOM",
  "Iron Man (Infinity War)": "IMIW",
  "Captain America (Infinity War)": "CAIW",
  "Immortal Abomination": "IBOM",
  "Immortal Hulk": "IHULK",
  "Spider-Man (Miles Morales)": "MILES",
  "Spider-Man (Stark Enhanced)": "SPARK",
  "Spider-Man (Stealth Suit)": "STEALTHY",
  "Magneto (House of X)": "WHITE MAGS",
  "Wolverine (Weapon X)": "WEAPON X",
  "Guillotine 2099": "G2099"
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderStatsOverview();
  renderRosterTab();
  renderDatabaseTab();
  renderTiersTab();
  renderAcademyTab();
  
  if (window.initNodeCounter) {
    window.initNodeCounter();
  }
  if (window.initClassWheel) {
    window.initClassWheel();
  }

  setupEventListeners();
  switchTab('nodes');
}

function setupEventListeners() {
  const searchInput = document.getElementById('main-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderDatabaseTab();
      renderRosterTab();
    });
  }

  const glossaryInput = document.getElementById('glossary-search-input');
  if (glossaryInput) {
    glossaryInput.addEventListener('input', (e) => {
      glossarySearchQuery = e.target.value.toLowerCase().trim();
      renderGlossaryItems();
    });
  }
}

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));

  const activeContent = document.getElementById(`tab-${tabId}`);
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeContent) activeContent.classList.remove('hidden');
  if (activeNav) activeNav.classList.add('active');

  if (tabId === 'academy' && window.initClassWheel) {
    window.initClassWheel();
  }
}

function renderStatsOverview() {
  const stats = window.MCOC_DATA.stats || {};
  const totalEl = document.getElementById('stat-total-champs');
  const ownedEl = document.getElementById('stat-owned-champs');
  const sevenEl = document.getElementById('stat-seven-stars');
  const sixEl = document.getElementById('stat-six-stars');

  if (totalEl) totalEl.innerText = stats.totalChampions || 327;
  if (ownedEl) ownedEl.innerText = stats.ownedChampions || 208;
  if (sevenEl) sevenEl.innerText = stats.sevenStars || 16;
  if (sixEl) sixEl.innerText = stats.sixStars || 192;
}

function renderChampionCard(champ, isRosterMode = false) {
  const clsData = window.MCOC_DATA.classes[champ.class] || { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)' };
  const isOwned = champ.isOwned;
  const ownedData = champ.owned || {};
  const rarity = ownedData.rarity || 6;
  const isAwakened = !!ownedData.awaken;
  const imgPath = `assets/images/${champ.image || 'default_avatar.png'}`;
  const aliasBadge = ALIAS_LOOKUP[champ.name] ? `<span class="text-[9px] font-black text-sky-400 bg-sky-950/80 px-1 py-0.2 rounded border border-sky-500/40">${ALIAS_LOOKUP[champ.name]}</span>` : '';

  // Star visual representation (Awakened: Silver Star, Unawakened: Gold Star)
  const starImg = isAwakened ? 'assets/images/Awaken-champion-star.png' : 'assets/images/Champion-star.png';
  const starCount = isOwned ? rarity : 6;
  const starsHtml = `
    <div class="champion-stars-row" title="${starCount}★ ${isAwakened ? 'Awakened' : 'Unawakened'}">
      ${Array.from({ length: starCount }).map(() => `
        <img src="${starImg}" alt="★" class="star-icon" />
      `).join('')}
    </div>
  `;

  // Status Badge: ONLY shown in Roster & Upgrade Tracker (R1, R2, R3...)
  const statusBadge = (isRosterMode && isOwned) ? `
    <div class="absolute top-2 left-2 ${rarity === 7 ? 'bg-rose-950/90 text-rose-300 border-rose-500/50' : 'bg-slate-900/90 text-amber-300 border-amber-500/50'} border px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-md z-10">
      ${ownedData.rank ? `R${ownedData.rank}` : 'OWNED'}
    </div>
  ` : '';

  const sTierBadge = champ.storyTier ? `
    <div class="absolute top-2 right-2 bg-amber-500/90 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider shadow z-10">
      S-TIER
    </div>
  ` : '';

  const immunitiesPreview = (champ.immunities && champ.immunities.length > 0) ? `
    <div class="flex flex-wrap gap-1 mt-1.5 overflow-hidden max-h-5">
      ${champ.immunities.slice(0, 2).map(imm => `
        <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-950/70 text-sky-300 border border-sky-500/30 truncate">
          ${imm.replace(' Immunity', '')}
        </span>
      `).join('')}
      ${champ.immunities.length > 2 ? `<span class="text-[9px] text-slate-400">+${champ.immunities.length - 2}</span>` : ''}
    </div>
  ` : '';

  // Upgrade pill: ONLY shown in Roster & Upgrade Tracker
  const upgradePill = (isRosterMode && isOwned && ownedData.futureRank && ownedData.futureRank > ownedData.rank) ? `
    <div class="mt-1 text-[10px] font-bold text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30 text-center">
      Upgrade: R${ownedData.rank} ➔ R${ownedData.futureRank}
    </div>
  ` : '';

  // Notes: ONLY shown in Roster & Upgrade Tracker
  const notesHtml = (isRosterMode && isOwned && ownedData.notes) ? `
    <span class="text-[9px] text-slate-400 truncate max-w-[70px] italic" title="${escapeHtml(ownedData.notes)}">${escapeHtml(ownedData.notes)}</span>
  ` : '';

  return `
    <div class="champion-card glass-panel border p-2.5 flex flex-col justify-between" 
         style="border-color: ${clsData.border};"
         onclick="openChampionModal('${champ.id}')">
      ${statusBadge}
      ${sTierBadge}
      
      <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-950/80 flex items-center justify-center border border-slate-800">
        <img src="${imgPath}" alt="${escapeHtml(champ.name)}" class="portrait-img w-full h-full object-contain p-1" onerror="this.src='assets/images/ascendable.svg'" />
      </div>

      ${starsHtml}

      <div>
        <div class="flex items-center justify-between gap-1">
          <h4 class="text-xs font-bold text-white truncate" title="${escapeHtml(champ.name)}">${champ.name}</h4>
          ${aliasBadge}
        </div>
        <div class="flex items-center justify-between text-[11px] mt-0.5">
          <span class="font-semibold" style="color: ${clsData.color};">${champ.class}</span>
          ${notesHtml}
        </div>
        ${immunitiesPreview}
        ${upgradePill}
      </div>
    </div>
  `;
}

function renderRosterTab() {
  const container = document.getElementById('roster-champions-grid');
  if (!container) return;

  const allChamps = window.MCOC_DATA.champions || [];
  let ownedChamps = allChamps.filter(c => c.isOwned);

  if (selectedRosterClasses.size > 0) {
    ownedChamps = ownedChamps.filter(c => selectedRosterClasses.has(c.class));
  }
  if (selectedRarityFilter !== 'All') {
    const rNum = parseInt(selectedRarityFilter);
    ownedChamps = ownedChamps.filter(c => c.owned?.rarity === rNum);
  }
  if (searchQuery) {
    ownedChamps = ownedChamps.filter(c => c.name.toLowerCase().includes(searchQuery) || (c.owned?.notes && c.owned.notes.toLowerCase().includes(searchQuery)));
  }

  ownedChamps.sort((a, b) => {
    const aRarity = a.owned?.rarity || 6;
    const bRarity = b.owned?.rarity || 6;
    if (bRarity !== aRarity) return bRarity - aRarity;
    const aRank = a.owned?.rank || 1;
    const bRank = b.owned?.rank || 1;
    if (bRank !== aRank) return bRank - aRank;
    return a.name.localeCompare(b.name);
  });

  const count7 = ownedChamps.filter(c => c.owned?.rarity === 7).length;
  const count6 = ownedChamps.filter(c => c.owned?.rarity === 6).length;

  const rosterHeader = document.getElementById('roster-filter-counts');
  if (rosterHeader) {
    rosterHeader.innerHTML = `Showing <span class="text-white font-bold">${ownedChamps.length}</span> champions (<span class="text-rose-400 font-bold">${count7}</span> 7★ &bull; <span class="text-amber-400 font-bold">${count6}</span> 6★)`;
  }

  if (ownedChamps.length === 0) {
    container.innerHTML = `<div class="col-span-full p-8 text-center glass-panel rounded-xl text-slate-400">No owned champions match the selected filters.</div>`;
    return;
  }

  container.innerHTML = ownedChamps.map(champ => renderChampionCard(champ, true)).join('');
}

function renderHubChampionCard(champ) {
  const clsData = window.MCOC_DATA.classes[champ.class] || { color: '#38bdf8', border: '#38bdf8', bg: 'rgba(56,189,248,0.15)' };
  const isOwned = champ.isOwned;
  const ownedData = champ.owned || {};
  const rarity = ownedData.rarity || 6;
  const isAwakened = !!ownedData.awaken;
  const isStoryTier = !!champ.storyTier;
  const hasImmunity = champ.immunities && champ.immunities.length > 0;
  const hasPowerOrBuff = champ.categories && (champ.categories.includes('Power Control') || champ.categories.includes('Buff Control & Nullify'));

  return `
    <div class="hub-champion-card group" 
         style="--card-border: ${clsData.border}; --card-bg: ${clsData.bg};" 
         onclick="openChampionModal('${champ.id}')"
         title="${escapeHtml(champ.name)} (${champ.class} Class)">
      
      <!-- Champion Portrait -->
      <img src="assets/images/${champ.image}" 
           alt="${escapeHtml(champ.name)}" 
           class="hub-portrait" 
           onerror="this.src='assets/images/ascendable.svg'" />
      
      <!-- Side Badges Column (Right Edge) -->
      <div class="hub-side-badges">
        <!-- Top badge: S-Tier / Crown / Star -->
        ${isStoryTier ? `
          <div class="hub-mini-badge bg-amber-950/90 border-amber-500/50" title="Story Quest S-Tier Pick">
            <span class="text-[9px]">👑</span>
          </div>
        ` : (isOwned ? `
          <div class="hub-mini-badge bg-slate-950/90" title="Owned ${rarity}★ ${isAwakened ? 'Awakened' : 'Unawakened'}">
            <span class="text-[8px] font-black ${rarity === 7 ? 'text-rose-400' : 'text-amber-400'}">★</span>
          </div>
        ` : '')}

        <!-- Middle badge: Class SVG logo -->
        <div class="hub-mini-badge" title="${champ.class} Class">
          <img src="assets/images/classes/${(champ.class || '').toLowerCase()}.svg" alt="" class="w-2.5 h-2.5 object-contain">
        </div>

        <!-- Bottom badge: Immunity / Defense Shield -->
        ${hasImmunity ? `
          <div class="hub-mini-badge bg-sky-950/90 border-sky-500/50" title="${champ.immunities.length} Active Immunities (${champ.immunities.slice(0, 2).join(', ')})">
            <span class="text-[8px] text-sky-300">🛡️</span>
          </div>
        ` : (hasPowerOrBuff ? `
          <div class="hub-mini-badge bg-purple-950/90 border-purple-500/50" title="Power / Buff Specialist">
            <span class="text-[8px] text-purple-300">⚡</span>
          </div>
        ` : '')}
      </div>

      <!-- Bottom Name Bar -->
      <div class="hub-name-bar">
        <span class="hub-name-text">${escapeHtml(champ.name)}</span>
      </div>
    </div>
  `;
}

function renderDatabaseTab() {
  const container = document.getElementById('database-champions-grid');
  if (!container) return;

  // 1. Populate Immunity Dropdown
  const immSelect = document.getElementById('immunity-filter-select');
  if (immSelect && immSelect.options.length <= 1) {
    const immList = Object.keys(window.MCOC_DATA.immunities || {}).sort();
    immList.forEach(imm => {
      const opt = document.createElement('option');
      opt.value = imm;
      opt.innerText = `${imm} (${window.MCOC_DATA.immunities[imm].count || 0})`;
      immSelect.appendChild(opt);
    });
  }
  if (immSelect) {
    immSelect.value = selectedImmunityFilter;
  }

  // Update other dropdown values if elements exist
  const tagSelect = document.getElementById('db-tag-select');
  if (tagSelect) tagSelect.value = selectedDbTag;

  const catSelect = document.getElementById('db-category-select');
  if (catSelect) catSelect.value = selectedDbCategory;

  const yearSelect = document.getElementById('db-year-select');
  if (yearSelect) yearSelect.value = selectedDbYear;

  const sortSelect = document.getElementById('db-sort-select');
  if (sortSelect) sortSelect.value = selectedDbSort;

  let champs = window.MCOC_DATA.champions || [];

  // Filter Champions based on Match Mode (All vs Any)
  if (selectedDbMatchMode === 'all') {
    if (selectedDbTag !== 'All') {
      champs = champs.filter(c => c.tags && c.tags.includes(selectedDbTag));
    }
    if (selectedDbCategory !== 'All') {
      champs = champs.filter(c => c.categories && c.categories.includes(selectedDbCategory));
    }
    if (selectedDbClasses.size > 0) {
      champs = champs.filter(c => selectedDbClasses.has(c.class));
    }
    if (selectedImmunityFilter !== 'All') {
      champs = champs.filter(c => c.immunities && c.immunities.includes(selectedImmunityFilter));
    }
  } else {
    // MATCH ANY MODE
    const hasAnyCriteria = (selectedDbTag !== 'All') || (selectedDbCategory !== 'All') || (selectedDbClasses.size > 0) || (selectedImmunityFilter !== 'All');
    if (hasAnyCriteria) {
      champs = champs.filter(c => {
        const tagMatch = selectedDbTag !== 'All' && c.tags && c.tags.includes(selectedDbTag);
        const catMatch = selectedDbCategory !== 'All' && c.categories && c.categories.includes(selectedDbCategory);
        const clsMatch = selectedDbClasses.size > 0 && selectedDbClasses.has(c.class);
        const immMatch = selectedImmunityFilter !== 'All' && c.immunities && c.immunities.includes(selectedImmunityFilter);
        return tagMatch || catMatch || clsMatch || immMatch;
      });
    }
  }

  // Owned Only
  if (ownedOnlyFilter) {
    champs = champs.filter(c => c.isOwned);
  }

  // Search input
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    champs = champs.filter(c => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const alias = ALIAS_LOOKUP[c.name] || '';
      const aliasMatch = alias.toLowerCase().includes(q);
      const tagMatch = c.tags && c.tags.some(t => t.toLowerCase().includes(q));
      const catMatch = c.categories && c.categories.some(cat => cat.toLowerCase().includes(q));
      return nameMatch || aliasMatch || tagMatch || catMatch;
    });
  }

  // Sort Champions
  champs = [...champs];
  if (selectedDbSort === 'name-asc') {
    champs.sort((a, b) => a.name.localeCompare(b.name));
  } else if (selectedDbSort === 'name-desc') {
    champs.sort((a, b) => b.name.localeCompare(a.name));
  } else if (selectedDbSort === 'class') {
    const order = { 'Cosmic': 1, 'Tech': 2, 'Mutant': 3, 'Skill': 4, 'Science': 5, 'Mystic': 6 };
    champs.sort((a, b) => (order[a.class] || 99) - (order[b.class] || 99) || a.name.localeCompare(b.name));
  } else if (selectedDbSort === 'owned') {
    champs.sort((a, b) => {
      if (b.isOwned !== a.isOwned) return (b.isOwned ? 1 : 0) - (a.isOwned ? 1 : 0);
      const aR = a.owned?.rarity || 0;
      const bR = b.owned?.rarity || 0;
      if (bR !== aR) return bR - aR;
      return a.name.localeCompare(b.name);
    });
  } else if (selectedDbSort === 'rarity') {
    champs.sort((a, b) => {
      const aR = a.owned?.rarity || (a.storyTier ? 5 : 4);
      const bR = b.owned?.rarity || (b.storyTier ? 5 : 4);
      if (bR !== aR) return bR - aR;
      return a.name.localeCompare(b.name);
    });
  }

  // Active filters summary bar
  const activeFiltersRow = document.getElementById('db-active-filters-row');
  const activeFiltersPills = document.getElementById('db-active-filters-pills');
  const hasActiveFilters = (selectedDbTag !== 'All') || (selectedDbCategory !== 'All') || (selectedDbClasses.size > 0) || (selectedImmunityFilter !== 'All') || (selectedDbYear !== 'All') || ownedOnlyFilter || !!searchQuery;

  if (activeFiltersRow && activeFiltersPills) {
    activeFiltersRow.classList.toggle('hidden', !hasActiveFilters);
    let pillsHtml = '';
    if (selectedDbTag !== 'All') {
      pillsHtml += `<span class="active-filter-pill">🏷️ Tag: ${selectedDbTag} <button onclick="filterDbByTag('All')">✕</button></span>`;
    }
    if (selectedDbCategory !== 'All') {
      pillsHtml += `<span class="active-filter-pill">🎯 Ability: ${selectedDbCategory} <button onclick="filterDbByCategory('All')">✕</button></span>`;
    }
    if (selectedDbClasses.size > 0) {
      selectedDbClasses.forEach(cls => {
        pillsHtml += `<span class="active-filter-pill">🧬 Class: ${cls} <button onclick="toggleDbClassSingle('${cls}')">✕</button></span>`;
      });
    }
    if (selectedImmunityFilter !== 'All') {
      pillsHtml += `<span class="active-filter-pill">🧪 Immunity: ${selectedImmunityFilter} <button onclick="filterByImmunity('All')">✕</button></span>`;
    }
    if (selectedDbYear !== 'All') {
      pillsHtml += `<span class="active-filter-pill">📅 Year: ${selectedDbYear} <button onclick="filterDbByYear('All')">✕</button></span>`;
    }
    if (ownedOnlyFilter) {
      pillsHtml += `<span class="active-filter-pill">★ Owned Only <button onclick="toggleOwnedOnly()">✕</button></span>`;
    }
    if (searchQuery) {
      pillsHtml += `<span class="active-filter-pill">🔍 "${escapeHtml(searchQuery)}" <button onclick="clearDbSearch()">✕</button></span>`;
    }
    activeFiltersPills.innerHTML = pillsHtml;
  }

  const dbCounts = document.getElementById('db-filter-counts');
  if (dbCounts) {
    dbCounts.innerHTML = `Showing <span class="text-sky-400 font-black">${champs.length}</span> / ${window.MCOC_DATA.champions.length}`;
  }

  if (champs.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-12 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
        <div class="text-3xl">🔍</div>
        <div class="text-sm font-bold text-slate-300">No champions matched the selected criteria.</div>
        <p class="text-xs text-slate-500">Try changing your filter settings or search query.</p>
        <button onclick="resetAllDbFilters()" class="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white hover:bg-sky-400 transition-all">
          Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = champs.map(champ => renderHubChampionCard(champ)).join('');
}

function renderTiersTab() {
  const container = document.getElementById('tier-lists-container');
  if (!container) return;

  const tiersData = window.MCOC_DATA.storyTiers || {};
  const classesList = ['Cosmic', 'Skill', 'Mutant', 'Mystic', 'Science', 'Tech'];

  let html = '';

  // Support & Pre-fight Banner
  html += `
    <div class="glass-panel p-5 rounded-2xl border border-indigo-500/40 mb-6 bg-indigo-950/20">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-black text-indigo-300 flex items-center gap-2">
          <span>🛡️</span> Quest Support & Pre-Fight Specialists
        </h3>
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          TEAM UTILITY
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        ${[
          { name: "Heimdall", role: "Cheat Death & Fury", desc: "Grants 1-time cheat death (Indestructible + Unstoppable) when knocked down, plus Fury buffs upon Dash Back + Block." },
          { name: "Hela", role: "Cheat Death Synergy", desc: "Synergy with Angela/Heimdall to create multiple cheat-death safety nets for clearing difficult story acts." },
          { name: "Odin", role: "Pre-Fight Buffs", desc: "Grants cross-fight permanent buffs (Aptitude, Protection, Energy Resist) to any teammate." },
          { name: "Galan", role: "Pre-Fight Planetary Mass", desc: "Grants Herald of Galan pre-fight bonus to Cosmic champions for massive energy burst damage." }
        ].map(item => {
          const champ = window.MCOC_DATA.champions.find(c => c.name.toLowerCase() === item.name.toLowerCase()) || { name: item.name, image: 'default_avatar.png' };
          return `
            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-400/40 transition-all flex flex-col justify-between cursor-pointer" onclick="openChampionModalByName('${escapeHtml(champ.name)}')">
              <div class="flex items-center gap-2.5 mb-2">
                <img src="assets/images/${champ.image}" class="w-10 h-10 rounded-lg object-contain bg-slate-950 p-1 border border-slate-700" onerror="this.src='assets/images/ascendable.svg'" />
                <div>
                  <h4 class="text-xs font-bold text-white">${champ.name}</h4>
                  <span class="text-[10px] text-amber-400 font-bold">${item.role}</span>
                </div>
              </div>
              <p class="text-[11px] text-slate-300 leading-relaxed">${item.desc}</p>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Class by class lists
  html += classesList.map(clsName => {
    const clsInfo = window.MCOC_DATA.classes[clsName] || { color: '#fff', border: '#444' };
    const sTiers = tiersData.sTier[clsName] || [];
    const bestChamps = tiersData.bestByClass[clsName] || [];

    return `
      <div class="glass-panel p-5 rounded-2xl border mb-6" style="border-color: ${clsInfo.border};">
        <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-slate-900 border p-1 flex items-center justify-center shadow-md" style="border-color: ${clsInfo.color};">
              <img src="assets/images/classes/${clsName.toLowerCase()}.svg" alt="${clsName}" class="w-full h-full object-contain">
            </div>
            <h3 class="text-xl font-black" style="color: ${clsInfo.color};">${clsName} Class Tier List</h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              STORY S-TIER PICKS
            </span>
          </div>
          <div class="text-xs text-slate-400">
            Crushes <strong class="text-emerald-400">${clsInfo.beats}</strong> &bull; Weak to <strong class="text-rose-400">${clsInfo.weakTo}</strong>
          </div>
        </div>

        <div class="mb-4">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">⭐ S-Tier Champions (Top Priority)</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            ${sTiers.map(cName => {
              const champ = window.MCOC_DATA.champions.find(c => c.name.toLowerCase() === cName.toLowerCase()) || { name: cName, class: clsName, image: 'default_avatar.png', isOwned: false };
              return renderChampionCard(champ);
            }).join('')}
          </div>
        </div>

        ${bestChamps.length > 0 ? `
          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🏆 Other Top Rated ${clsName} Picks</h4>
            <div class="flex flex-wrap gap-2">
              ${bestChamps.map(cName => {
                const champ = window.MCOC_DATA.champions.find(c => c.name.toLowerCase() === cName.toLowerCase());
                const alias = ALIAS_LOOKUP[cName] ? ` (${ALIAS_LOOKUP[cName]})` : '';
                return `
                  <button onclick="openChampionModalByName('${escapeHtml(cName)}')" class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-200 transition-all">
                    <span>${cName}</span>
                    ${alias ? `<span class="text-[10px] text-sky-400 font-bold">${alias}</span>` : ''}
                    ${champ?.isOwned ? `<span class="text-[10px] text-emerald-400 font-bold">✓ Owned</span>` : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function renderAcademyTab() {
  renderGlossaryItems();
  renderBeginnerGuides();
}

function renderGlossaryItems() {
  const container = document.getElementById('glossary-terms-grid');
  if (!container) return;

  let terms = window.MCOC_DATA.glossary || [];
  if (glossarySearchQuery) {
    terms = terms.filter(t => t.term.toLowerCase().includes(glossarySearchQuery) || t.definition.toLowerCase().includes(glossarySearchQuery));
  }

  container.innerHTML = terms.map(item => `
    <div class="p-4 rounded-xl glass-panel border border-slate-800 hover:border-sky-500/40 transition-all">
      <h4 class="text-sm font-bold text-sky-400 mb-1 flex items-center gap-2">
        <span>📖</span> ${item.term}
      </h4>
      <p class="text-xs text-slate-300 leading-relaxed">${item.definition}</p>
    </div>
  `).join('');
}

function renderBeginnerGuides() {
  const container = document.getElementById('beginner-guides-grid');
  if (!container) return;

  const champsWithGuides = (window.MCOC_DATA.champions || []).filter(c => c.guide && c.guide.whyStory);

  container.innerHTML = champsWithGuides.map(champ => {
    const clsData = window.MCOC_DATA.classes[champ.class] || { color: '#fff', border: '#444' };
    return `
      <div class="glass-panel p-4 rounded-xl border flex flex-col justify-between" style="border-color: ${clsData.border};">
        <div class="flex items-center gap-3 mb-3">
          <img src="assets/images/${champ.image}" class="w-12 h-12 rounded-lg object-contain bg-slate-950 p-1 border border-slate-700" onerror="this.src='assets/images/ascendable.svg'" />
          <div>
            <h4 class="text-sm font-bold text-white">${champ.name}</h4>
            <div class="flex items-center gap-1.5 mt-0.5">
              <img src="assets/images/classes/${champ.class.toLowerCase()}.svg" alt="${champ.class}" class="w-4 h-4 object-contain">
              <span class="text-xs font-semibold" style="color: ${clsData.color};">${champ.class} Class</span>
            </div>
          </div>
        </div>

        <div class="space-y-2 text-xs">
          <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <strong class="text-emerald-400 block mb-0.5">🌟 Why Great for Story:</strong>
            <span class="text-slate-300">${champ.guide.whyStory}</span>
          </div>
          <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <strong class="text-sky-400 block mb-0.5">🎮 Easy to Handle Rotation:</strong>
            <span class="text-slate-300">${champ.guide.easyToHandle}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openChampionModal(champId) {
  const champ = (window.MCOC_DATA.champions || []).find(c => c.id === champId);
  if (!champ) return;
  displayChampionModal(champ);
}

function openChampionModalByName(name) {
  const champ = (window.MCOC_DATA.champions || []).find(c => c.name.toLowerCase() === name.toLowerCase()) || {
    name, class: 'Unknown', image: 'default_avatar.png', immunities: [], isOwned: false
  };
  displayChampionModal(champ);
}

function displayChampionModal(champ) {
  const modal = document.getElementById('champion-detail-modal');
  const content = document.getElementById('champion-modal-body');
  if (!modal || !content) return;

  const clsData = window.MCOC_DATA.classes[champ.class] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: '#64748b' };
  const isOwned = champ.isOwned;
  const ownedData = champ.owned || {};
  const rarity = ownedData.rarity || 6;
  const isAwakened = !!ownedData.awaken;
  const alias = ALIAS_LOOKUP[champ.name] ? ` (${ALIAS_LOOKUP[champ.name]})` : '';

  const starImg = isAwakened ? 'assets/images/Awaken-champion-star.png' : 'assets/images/Champion-star.png';
  const starCount = isOwned ? rarity : 6;
  const modalStarsHtml = `
    <div class="modal-stars-row" title="${starCount}★ ${isAwakened ? 'Awakened' : 'Unawakened'}">
      ${Array.from({ length: starCount }).map(() => `
        <img src="${starImg}" alt="★" class="star-icon" />
      `).join('')}
    </div>
  `;

  content.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6">
      <div class="w-full md:w-48 flex flex-col items-center text-center">
        <div class="relative w-36 h-36 rounded-2xl overflow-hidden bg-slate-950 p-2 border-2 mb-1 shadow-xl" style="border-color: ${clsData.color};">
          <img src="assets/images/${champ.image}" alt="${escapeHtml(champ.name)}" class="w-full h-full object-contain" onerror="this.src='assets/images/ascendable.svg'" />
          ${champ.storyTier ? `<div class="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded">S-TIER</div>` : ''}
        </div>
        ${modalStarsHtml}

        <h3 class="text-base font-extrabold text-white mb-0.5">${champ.name}</h3>
        ${alias ? `<span class="text-xs text-sky-400 font-bold mb-1">${alias}</span>` : ''}
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-flex items-center gap-1.5" style="background: ${clsData.bg}; color: ${clsData.color}; border: 1px solid ${clsData.border};">
          <img src="assets/images/classes/${(champ.class || '').toLowerCase()}.svg" alt="${champ.class}" class="w-3.5 h-3.5 object-contain" onerror="this.style.display='none'">
          <span>${champ.class} Class</span>
        </span>

        ${isOwned ? `
          <div class="w-full p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs">
            <div class="font-bold text-emerald-400 flex items-center justify-center gap-1.5 mb-1">
              <span>✓ IN YOUR ROSTER</span>
            </div>
            <div class="flex justify-around items-center text-white font-semibold">
              <span class="${rarity === 7 ? 'text-rose-400' : 'text-amber-400'}">${rarity}★ Rarity</span>
              <span>${isAwakened ? '✪ Awakened' : '★ Unawakened'}</span>
            </div>
            ${ownedData.rank ? `
              <div class="mt-2 text-[11px] text-slate-300 font-bold bg-slate-900/80 py-1 rounded border border-slate-700">
                Rank: R${ownedData.rank} ${ownedData.futureRank && ownedData.futureRank > ownedData.rank ? `➔ Target R${ownedData.futureRank}` : ''}
              </div>
            ` : ''}
          </div>
        ` : `
          <div class="w-full p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            Not in Owned Roster
          </div>
        `}
      </div>

      <div class="flex-1 space-y-4">
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
            <span class="text-emerald-400 font-bold">⚔️ Advantage over:</span>
            <div class="font-semibold text-white">${clsData.beats || 'N/A'} (+40% Attack)</div>
          </div>
          <div class="p-2 rounded-lg bg-rose-950/20 border border-rose-500/30">
            <span class="text-rose-400 font-bold">🛡️ Weakness to:</span>
            <div class="font-semibold text-white">${clsData.weakTo || 'N/A'} (-20% Attack)</div>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>🛡️ Active Immunities & Resistances</span>
            <span class="text-sky-400 font-bold">${champ.immunities ? champ.immunities.length : 0} Total</span>
          </h4>
          ${champ.immunities && champ.immunities.length > 0 ? `
            <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              ${champ.immunities.map(imm => `
                <div class="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-950/50 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                  <span>🛡️</span> ${imm}
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="text-xs text-slate-500 italic bg-slate-900/40 p-2.5 rounded-lg">No direct baseline immunities recorded. Relies on offensive mechanics or kit passives.</p>
          `}
        </div>

        <!-- Champion Tags -->
        ${champ.tags && champ.tags.length > 0 ? `
          <div>
            <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>🏷️</span> Champion Tags
            </h4>
            <div class="flex flex-wrap gap-1.5">
              ${champ.tags.map(tag => `
                <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-900 border border-slate-700 text-sky-300">${tag}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Combat Categories & Roles -->
        ${champ.categories && champ.categories.length > 0 ? `
          <div>
            <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>🎯</span> Combat Categories & Utility Roles
            </h4>
            <div class="flex flex-wrap gap-1.5">
              ${champ.categories.map(cat => `
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950/40 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                  <span>★</span> ${cat}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${isOwned && ownedData.notes ? `
          <div class="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
            <span class="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1">
              <span>📋 Your Progression & Upgrade Notes</span>
            </span>
            <p class="text-xs text-slate-200 italic font-medium">"${escapeHtml(ownedData.notes)}"</p>
          </div>
        ` : ''}

        ${champ.guide ? `
          <div class="space-y-2 text-xs">
            <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <strong class="text-emerald-400 block mb-0.5">🌟 Why Good for Story / Quests:</strong>
              <p class="text-slate-300 leading-relaxed">${champ.guide.whyStory}</p>
            </div>
            <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <strong class="text-sky-400 block mb-0.5">🎮 How to Handle / Playstyle:</strong>
              <p class="text-slate-300 leading-relaxed">${champ.guide.easyToHandle}</p>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeChampionModal() {
  const modal = document.getElementById('champion-detail-modal');
  if (modal) modal.classList.add('hidden');
}

function handleRosterStarSlider(val) {
  val = parseInt(val);
  const slider = document.getElementById('roster-star-slider');
  if (slider) slider.value = val;

  const stats = window.MCOC_DATA.stats || {};
  const totalOwned = stats.ownedChampions || 183;
  const count6 = stats.sixStarChampions || 151;
  const count7 = stats.sevenStarChampions || 32;

  if (val === 0) {
    selectedRarityFilter = 'All';
    if (display) {
      display.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm';
      display.innerHTML = `<span>★ ALL (6★ & 7★)</span> <span class="text-[10px] text-slate-400 font-bold ml-1">${totalOwned} Total</span>`;
    }
  } else if (val === 1) {
    selectedRarityFilter = '6';
    if (display) {
      display.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-sm';
      display.innerHTML = `<span>6★</span> <div class="flex items-center gap-0.5">${Array.from({ length: 6 }).map(() => `<img src="assets/images/Champion-star.png" class="w-3.5 h-3.5 inline-block" />`).join('')}</div> <span class="text-[10px] text-amber-400 font-bold ml-1">(${count6} Champions)</span>`;
    }
  } else if (val === 2) {
    selectedRarityFilter = '7';
    if (display) {
      display.className = 'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-rose-950/60 text-rose-300 border border-rose-500/40 shadow-sm';
      display.innerHTML = `<span>7★</span> <div class="flex items-center gap-0.5">${Array.from({ length: 7 }).map(() => `<img src="assets/images/Champion-star.png" class="w-3.5 h-3.5 inline-block" />`).join('')}</div> <span class="text-[10px] text-rose-400 font-bold ml-1">(${count7} Mythics)</span>`;
    }
  }

  // Update tick labels active styling (0, 1, 2)
  const tick0 = document.getElementById('star-tick-0');
  const tick1 = document.getElementById('star-tick-1');
  const tick2 = document.getElementById('star-tick-2');

  if (tick0) {
    tick0.className = val === 0 
      ? 'cursor-pointer transition-all text-sky-400 font-black scale-110' 
      : 'cursor-pointer hover:text-sky-300 transition-all text-slate-400 font-bold';
  }
  if (tick1) {
    tick1.className = val === 1 
      ? 'cursor-pointer transition-all text-amber-300 font-black scale-110' 
      : 'cursor-pointer hover:text-amber-300 transition-all text-slate-400 font-bold';
  }
  if (tick2) {
    tick2.className = val === 2 
      ? 'cursor-pointer transition-all text-rose-400 font-black scale-110' 
      : 'cursor-pointer hover:text-rose-400 transition-all text-slate-400 font-bold';
  }

  renderRosterTab();
}

function setRosterStarSlider(val) {
  handleRosterStarSlider(val);
}

function filterByRarity(rarity) {
  if (rarity === 'All') {
    handleRosterStarSlider(0);
  } else if (rarity === '6' || rarity === 6) {
    handleRosterStarSlider(1);
  } else if (rarity === '7' || rarity === 7) {
    handleRosterStarSlider(2);
  }
}

function filterByImmunity(imm) {
  selectedImmunityFilter = imm;
  renderDatabaseTab();
}

function toggleOwnedOnly() {
  ownedOnlyFilter = !ownedOnlyFilter;
  const btn = document.getElementById('owned-only-toggle-btn');
  if (btn) {
    btn.classList.toggle('bg-emerald-500', ownedOnlyFilter);
    btn.classList.toggle('text-slate-950', ownedOnlyFilter);
    btn.classList.toggle('bg-slate-800', !ownedOnlyFilter);
    btn.classList.toggle('text-slate-300', !ownedOnlyFilter);
  }
  renderDatabaseTab();
}

// 1. Tag Filter Handler
function filterDbByTag(tag) {
  if (selectedDbTag === tag) {
    selectedDbTag = 'All';
  } else {
    selectedDbTag = tag;
  }
  renderDatabaseTab();
}

// 2. Category Filter Handler
function filterDbByCategory(cat) {
  if (selectedDbCategory === cat) {
    selectedDbCategory = 'All';
  } else {
    selectedDbCategory = cat;
  }
  renderDatabaseTab();
}

// 3. Database Class Filter Handlers
function handleDbClassToggle(checkbox) {
  if (checkbox.checked) {
    selectedDbClasses.add(checkbox.value);
  } else {
    selectedDbClasses.delete(checkbox.value);
  }
  const allBtn = document.getElementById('db-class-all-btn');
  if (allBtn) {
    const isAll = selectedDbClasses.size === 0;
    allBtn.classList.toggle('ring-2', isAll);
    allBtn.classList.toggle('ring-white', isAll);
    allBtn.classList.toggle('bg-sky-500', isAll);
    allBtn.classList.toggle('bg-slate-800', !isAll);
  }
  renderDatabaseTab();
}

function toggleDbClassSingle(cls) {
  selectedDbClasses.delete(cls);
  document.querySelectorAll('input[name="db_class[]"]').forEach(cb => {
    if (cb.value === cls) cb.checked = false;
  });
  const allBtn = document.getElementById('db-class-all-btn');
  if (allBtn) {
    const isAll = selectedDbClasses.size === 0;
    allBtn.classList.toggle('ring-2', isAll);
    allBtn.classList.toggle('ring-white', isAll);
    allBtn.classList.toggle('bg-sky-500', isAll);
    allBtn.classList.toggle('bg-slate-800', !isAll);
  }
  renderDatabaseTab();
}

function resetDbClassFilter() {
  selectedDbClasses.clear();
  document.querySelectorAll('input[name="db_class[]"]').forEach(cb => cb.checked = false);
  const allBtn = document.getElementById('db-class-all-btn');
  if (allBtn) {
    allBtn.classList.add('ring-2', 'ring-white', 'bg-sky-500');
    allBtn.classList.remove('bg-slate-800');
  }
  renderDatabaseTab();
}

// Roster Class Icon Filter Handlers
function handleRosterClassToggle(checkbox) {
  if (checkbox.checked) {
    selectedRosterClasses.add(checkbox.value);
  } else {
    selectedRosterClasses.delete(checkbox.value);
  }
  const allBtn = document.getElementById('roster-class-all-btn');
  if (allBtn) {
    const isAll = selectedRosterClasses.size === 0;
    allBtn.classList.toggle('ring-2', isAll);
    allBtn.classList.toggle('ring-white', isAll);
    allBtn.classList.toggle('bg-sky-500', isAll);
    allBtn.classList.toggle('bg-slate-800', !isAll);
  }
  renderRosterTab();
}

function resetRosterClassFilter() {
  selectedRosterClasses.clear();
  document.querySelectorAll('input[name="roster_class[]"]').forEach(cb => cb.checked = false);
  const allBtn = document.getElementById('roster-class-all-btn');
  if (allBtn) {
    allBtn.classList.add('ring-2', 'ring-white', 'bg-sky-500');
    allBtn.classList.remove('bg-slate-800');
  }
  renderRosterTab();
}

function clearDbSearch() {
  searchQuery = '';
  const input = document.getElementById('main-search-input');
  if (input) input.value = '';
  renderDatabaseTab();
}

// Match Mode (All vs Any)
function setDbMatchMode(mode) {
  selectedDbMatchMode = mode;
  const allBtn = document.getElementById('match-all-btn');
  const anyBtn = document.getElementById('match-any-btn');
  if (allBtn && anyBtn) {
    allBtn.classList.toggle('bg-purple-600', mode === 'all');
    allBtn.classList.toggle('text-white', mode === 'all');
    allBtn.classList.toggle('text-slate-400', mode !== 'all');
    anyBtn.classList.toggle('bg-purple-600', mode === 'any');
    anyBtn.classList.toggle('text-white', mode === 'any');
    anyBtn.classList.toggle('text-slate-400', mode !== 'any');
  }
  renderDatabaseTab();
}

function filterDbByYear(year) {
  selectedDbYear = year;
  renderDatabaseTab();
}

function filterDbBySort(sort) {
  selectedDbSort = sort;
  renderDatabaseTab();
}

// Reset ALL Hub Filters & Search
function resetAllDbFilters() {
  selectedDbClasses.clear();
  selectedDbTag = 'All';
  selectedDbCategory = 'All';
  selectedImmunityFilter = 'All';
  selectedDbYear = 'All';
  selectedDbSort = 'name-asc';
  selectedDbMatchMode = 'all';
  ownedOnlyFilter = false;
  searchQuery = '';

  const input = document.getElementById('main-search-input');
  if (input) input.value = '';

  const immSelect = document.getElementById('immunity-filter-select');
  if (immSelect) immSelect.value = 'All';

  const tagSelect = document.getElementById('db-tag-select');
  if (tagSelect) tagSelect.value = 'All';

  const catSelect = document.getElementById('db-category-select');
  if (catSelect) catSelect.value = 'All';

  const yearSelect = document.getElementById('db-year-select');
  if (yearSelect) yearSelect.value = 'All';

  const sortSelect = document.getElementById('db-sort-select');
  if (sortSelect) sortSelect.value = 'name-asc';

  const allMatchBtn = document.getElementById('match-all-btn');
  const anyMatchBtn = document.getElementById('match-any-btn');
  if (allMatchBtn && anyMatchBtn) {
    allMatchBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-black transition-all bg-purple-600 text-white shadow';
    anyMatchBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-black transition-all text-slate-400 hover:text-white';
  }

  const ownedBtn = document.getElementById('owned-only-toggle-btn');
  if (ownedBtn) {
    ownedBtn.classList.remove('bg-emerald-500', 'text-slate-950');
    ownedBtn.classList.add('bg-slate-900', 'text-slate-300');
  }

  document.querySelectorAll('input[name="db_class[]"]').forEach(cb => cb.checked = false);
  const allBtn = document.getElementById('db-class-all-btn');
  if (allBtn) {
    allBtn.classList.add('ring-1', 'ring-white', 'bg-sky-500');
    allBtn.classList.remove('bg-slate-800');
  }

  renderDatabaseTab();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
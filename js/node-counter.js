// Interactive Node & Hazard Counter Engine
let activeSelectedNodeId = "biohazard";
let activeCustomImmunities = new Set();

window.initNodeCounter = function() {
  renderNodePresets();
  renderCustomImmunityToggles();
  selectNodePreset("biohazard");
};

window.renderNodePresets = function() {
  const container = document.getElementById("node-presets-grid");
  if (!container) return;

  const presets = window.MCOC_DATA.nodePresets || [];
  container.innerHTML = presets.map(preset => `
    <div class="p-3.5 rounded-xl cursor-pointer transition-all border ${activeSelectedNodeId === preset.id ? 'bg-sky-500/20 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}"
         onclick="selectNodePreset('${preset.id}')">
      <div class="flex items-center gap-2 mb-1.5">
        <span class="text-xl">${preset.icon}</span>
        <span class="text-sm font-bold text-white leading-tight">${preset.name}</span>
      </div>
      <div class="text-[11px] text-slate-400 line-clamp-2">${preset.description}</div>
    </div>
  `).join('');
};

window.renderCustomImmunityToggles = function() {
  const container = document.getElementById("custom-immunities-pills");
  if (!container) return;

  const topImmunities = [
    "Bleed Immunity", "Poison Immunity", "Shock Immunity", "Incinerate Immunity",
    "Coldsnap Immunity", "Stun Immunity", "Power Drain Immunity", "Reverse Control Immunity",
    "Armor Break Immunity", "Buff immunity", "Fate Seal Immunity", "Slow Immunity"
  ];

  container.innerHTML = topImmunities.map(imm => {
    const isSelected = activeCustomImmunities.has(imm);
    return `
      <button onclick="toggleCustomImmunity('${escapeHtml(imm)}')" 
              class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${isSelected ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'}">
        ${isSelected ? '✓ ' : '+ '}${imm.replace(' Immunity', '')}
      </button>
    `;
  }).join('');
};

window.toggleCustomImmunity = function(immunityName) {
  if (activeCustomImmunities.has(immunityName)) {
    activeCustomImmunities.delete(immunityName);
  } else {
    activeCustomImmunities.add(immunityName);
  }
  activeSelectedNodeId = null; // switch to custom mode
  renderNodePresets();
  renderCustomImmunityToggles();
  calculateAndRenderCounters();
};

window.clearCustomImmunities = function() {
  activeCustomImmunities.clear();
  renderCustomImmunityToggles();
  selectNodePreset("biohazard");
};

window.selectNodePreset = function(nodeId) {
  activeSelectedNodeId = nodeId;
  activeCustomImmunities.clear();
  renderNodePresets();
  renderCustomImmunityToggles();
  calculateAndRenderCounters();
};

window.calculateAndRenderCounters = function() {
  const resultContainer = document.getElementById("node-counters-result");
  const nodeHeaderContainer = document.getElementById("node-active-header");
  if (!resultContainer) return;

  let requiredImms = [];
  let title = "";
  let description = "";
  let strategyAdvice = "";

  if (activeSelectedNodeId) {
    const preset = (window.MCOC_DATA.nodePresets || []).find(p => p.id === activeSelectedNodeId);
    if (preset) {
      title = `${preset.icon} ${preset.name}`;
      description = preset.description;
      strategyAdvice = preset.counterAdvice;
      requiredImms = preset.requiredImmunities || [];
    }
  } else if (activeCustomImmunities.size > 0) {
    requiredImms = Array.from(activeCustomImmunities);
    title = `Custom Multi-Hazard Filter (${requiredImms.map(i => i.replace(' Immunity', '')).join(' + ')})`;
    description = `Finding champions with: ${requiredImms.join(' AND ')}`;
    strategyAdvice = `Champions listed below meet all ${requiredImms.length} immunity requirements for maximum safety.`;
  } else {
    title = "Select a Node / Hazard Above";
    description = "Pick any quest node preset or select custom immunities to see the best counters.";
    resultContainer.innerHTML = `<div class="p-8 text-center text-slate-500">Please select a node or toggle immunities above.</div>`;
    return;
  }

  if (nodeHeaderContainer) {
    nodeHeaderContainer.innerHTML = `
      <div class="p-4 rounded-xl glass-panel border border-sky-500/30 mb-4 bg-sky-950/20">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
          <h3 class="text-base font-bold text-sky-400 flex items-center gap-2">${title}</h3>
          <div class="flex gap-1.5 flex-wrap">
            ${requiredImms.map(imm => `
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                ${imm}
              </span>
            `).join('')}
          </div>
        </div>
        <p class="text-xs text-slate-300 mb-2 leading-relaxed">${description}</p>
        <div class="text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/30 flex items-start gap-2">
          <span class="text-base">💡</span>
          <div><strong class="text-amber-200">Counter Strategy:</strong> ${strategyAdvice}</div>
        </div>
      </div>
    `;
  }

  // Filter champions
  const allChamps = window.MCOC_DATA.champions || [];
  
  const matchedChamps = allChamps.filter(champ => {
    const champImms = champ.immunities || [];
    // Check if champion has all required immunities
    return requiredImms.every(req => champImms.includes(req));
  });

  // Sort: Owned 7★ first, Owned 6★ second, S-Tier third, then alphabetically
  matchedChamps.sort((a, b) => {
    const aOwnedScore = a.isOwned ? (a.owned?.rarity === 7 ? 100 : 50) : 0;
    const bOwnedScore = b.isOwned ? (b.owned?.rarity === 7 ? 100 : 50) : 0;
    if (bOwnedScore !== aOwnedScore) return bOwnedScore - aOwnedScore;
    const aSTier = a.storyTier ? 10 : 0;
    const bSTier = b.storyTier ? 10 : 0;
    if (bSTier !== aSTier) return bSTier - aSTier;
    return a.name.localeCompare(b.name);
  });

  if (matchedChamps.length === 0) {
    resultContainer.innerHTML = `
      <div class="p-8 text-center glass-panel rounded-xl text-slate-400">
        <p class="text-base font-semibold text-slate-300 mb-1">No exact double/triple-immune champions match all selected criteria simultaneously.</p>
        <p class="text-xs text-slate-500">Try removing one of the custom immunity filters or check single hazard counters.</p>
      </div>
    `;
    return;
  }

  resultContainer.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <div class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Found <span class="text-sky-400 font-extrabold text-sm">${matchedChamps.length}</span> Counters 
        (<span class="text-emerald-400">${matchedChamps.filter(c => c.isOwned).length} in your owned roster</span>)
      </div>
    </div>
    
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      ${matchedChamps.map(champ => renderChampionCard(champ, true)).join('')}
    </div>
  `;
};
// Interactive Class Advantage Wheel
window.initClassWheel = function() {
  const container = document.getElementById('class-wheel-container');
  if (!container) return;

  const classes = [
    { name: 'Cosmic', angle: 0, color: '#00c8ff', icon: '🌌', beats: 'Tech', weakTo: 'Mystic', identity: 'Heavy Buffs, Armor Breaks, Raw Damage, True Damage' },
    { name: 'Tech', angle: 60, color: '#0070f3', icon: '🤖', beats: 'Mutant', weakTo: 'Cosmic', identity: 'Power Drain/Burn, Armor Up, Shock, Heal Block, Ability Control' },
    { name: 'Mutant', angle: 120, color: '#ffb703', icon: '🧬', beats: 'Skill', weakTo: 'Tech', identity: 'Prowess, High Special Damage, Regeneration, Bleeds' },
    { name: 'Skill', angle: 180, color: '#e63946', icon: '🎯', beats: 'Science', weakTo: 'Mutant', identity: 'Shrug-off / Cleanse, Critical Hits, Bleed, True Strike, Evade Counters' },
    { name: 'Science', angle: 240, color: '#2a9d8f', icon: '🧪', beats: 'Mystic', weakTo: 'Skill', identity: 'Debuff Stacking, Power Sting, Slow, Weakness, Passives' },
    { name: 'Mystic', angle: 300, color: '#9d4edd', icon: '🔮', beats: 'Cosmic', weakTo: 'Science', identity: 'Nullify, Stagger, Fate Seal, Power Steal, Mystic Dispersion' }
  ];

  const size = 380;
  const center = size / 2;
  const radius = 130;

  let nodesHtml = '';
  let arrowsHtml = '';

  classes.forEach((cls, i) => {
    const rad = (cls.angle - 90) * (Math.PI / 180);
    const x = center + radius * Math.cos(rad);
    const y = center + radius * Math.sin(rad);

    // Next class for arrow
    const nextCls = classes[(i + 1) % classes.length];
    const nextRad = (nextCls.angle - 90) * (Math.PI / 180);
    const nextX = center + radius * Math.cos(nextRad);
    const nextY = center + radius * Math.sin(nextRad);

    // Curve control point
    const midAngle = ((cls.angle + nextCls.angle + (i === 5 ? 360 : 0)) / 2 - 90) * (Math.PI / 180);
    const ctrlRadius = radius * 0.85;
    const ctrlX = center + ctrlRadius * Math.cos(midAngle);
    const ctrlY = center + ctrlRadius * Math.sin(midAngle);

    arrowsHtml += `
      <path d="M ${x} ${y} Q ${ctrlX} ${ctrlY} ${nextX} ${nextY}" 
            fill="none" 
            stroke="rgba(255,255,255,0.2)" 
            stroke-width="2.5" 
            stroke-dasharray="4,4"
            marker-end="url(#arrowhead)" 
            id="arrow-${cls.name}"
            class="transition-all duration-300"/>
    `;

    nodesHtml += `
      <g class="class-node cursor-pointer group" data-class="${cls.name}" onclick="selectClassWheel('${cls.name}')">
        <circle cx="${x}" cy="${y}" r="34" fill="#111726" stroke="${cls.color}" stroke-width="2.5" 
                class="transition-all duration-300 group-hover:r-[38] filter drop-shadow-[0_0_8px_${cls.color}]" />
        <text x="${x}" y="${y - 4}" text-anchor="middle" font-size="18" fill="#fff">${cls.icon}</text>
        <text x="${x}" y="${y + 16}" text-anchor="middle" font-size="11" font-weight="700" fill="${cls.color}" class="uppercase tracking-wider">${cls.name}</text>
      </g>
    `;
  });

  const svg = `
    <svg viewBox="0 0 ${size} ${size}" class="w-full max-w-[380px] mx-auto filter drop-shadow-xl select-none">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="#38bdf8" />
        </marker>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <!-- Central Hub Circle -->
      <circle cx="${center}" cy="${center}" r="50" fill="#0f172a" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
      <text x="${center}" y="${center - 6}" text-anchor="middle" font-size="12" font-weight="700" fill="#94a3b8">CLASS</text>
      <text x="${center}" y="${center + 12}" text-anchor="middle" font-size="11" font-weight="800" fill="#38bdf8">WHEEL</text>
      
      ${arrowsHtml}
      ${nodesHtml}
    </svg>
  `;

  container.innerHTML = svg;
  selectClassWheel('Cosmic');
};

window.selectClassWheel = function(className) {
  const data = window.MCOC_DATA.classes[className];
  if (!data) return;

  const detailEl = document.getElementById('class-wheel-detail');
  if (!detailEl) return;

  // Get S-tier and owned champions of this class
  const sTiers = (window.MCOC_DATA.storyTiers.sTier[className] || []).slice(0, 5);
  const ownedChamps = (window.MCOC_DATA.champions || []).filter(c => c.class === className && c.isOwned);

  detailEl.innerHTML = `
    <div class="p-6 rounded-2xl glass-panel border" style="border-color: ${data.border};">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div class="flex items-center gap-3">
          <span class="text-3xl font-extrabold" style="color: ${data.color};">${data.name}</span>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style="background: ${data.bg}; color: ${data.color}; border: 1px solid ${data.border}">
            Class Profile
          </span>
        </div>
        <div class="text-xs text-slate-400">
          Owned: <span class="text-white font-bold">${ownedChamps.length}</span> champions
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div class="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
          <div class="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
            <span>⚔️ Advantage (+40% Attack & +Crit/Pen)</span>
          </div>
          <div class="text-lg font-bold text-white flex items-center gap-2">
            CRUSHES: <span style="color: ${window.MCOC_DATA.classes[data.beats]?.color || '#fff'}">${data.beats}</span>
          </div>
          <div class="text-xs text-slate-300 mt-1">Gains high damage bonus and reduced ability resistance against ${data.beats}.</div>
        </div>

        <div class="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30">
          <div class="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-1">
            <span>🛡️ Weakness (-20% Attack & Vulnerability)</span>
          </div>
          <div class="text-lg font-bold text-white flex items-center gap-2">
            WEAK TO: <span style="color: ${window.MCOC_DATA.classes[data.weakTo]?.color || '#fff'}">${data.weakTo}</span>
          </div>
          <div class="text-xs text-slate-300 mt-1">Suffers reduced combat effectiveness against ${data.weakTo} defenders.</div>
        </div>
      </div>

      <div class="mb-5">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Mechanics & Specialty</h4>
        <p class="text-sm text-slate-200 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
          ${data.identity}
        </p>
      </div>

      <div>
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Top Recommended S-Tier Champions</h4>
        <div class="flex flex-wrap gap-2">
          ${sTiers.map(name => {
            const champ = window.MCOC_DATA.champions.find(c => c.name.toLowerCase() === name.toLowerCase()) || { name, image: 'default_avatar.png' };
            return `
              <div class="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 hover:border-sky-400/60 transition-all cursor-pointer" onclick="openChampionModalByName('${escapeHtml(champ.name)}')">
                <img src="assets/images/${champ.image}" class="w-7 h-7 rounded-lg object-cover border border-slate-600" onerror="this.src='assets/images/ascendable.svg'" />
                <span class="text-xs font-semibold text-white">${champ.name}</span>
                <span class="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">S-TIER</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
};
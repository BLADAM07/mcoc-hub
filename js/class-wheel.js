// Interactive Class Advantage Wheel
window.initClassWheel = function() {
  const container = document.getElementById('class-wheel-container');
  if (!container) return;

  const classes = [
    { name: 'Cosmic', angle: 0, color: '#00c8ff', beats: 'Tech', weakTo: 'Mystic', identity: 'Heavy Buffs, Armor Breaks, Raw Damage, True Damage' },
    { name: 'Tech', angle: 60, color: '#0070f3', beats: 'Mutant', weakTo: 'Cosmic', identity: 'Power Drain/Burn, Armor Up, Shock, Heal Block, Ability Control' },
    { name: 'Mutant', angle: 120, color: '#ffb703', beats: 'Skill', weakTo: 'Tech', identity: 'Prowess, High Special Damage, Regeneration, Bleeds' },
    { name: 'Skill', angle: 180, color: '#e63946', beats: 'Science', weakTo: 'Mutant', identity: 'Shrug-off / Cleanse, Critical Hits, Bleed, True Strike, Evade Counters' },
    { name: 'Science', angle: 240, color: '#2a9d8f', beats: 'Mystic', weakTo: 'Skill', identity: 'Debuff Stacking, Power Sting, Slow, Weakness, Passives' },
    { name: 'Mystic', angle: 300, color: '#9d4edd', beats: 'Cosmic', weakTo: 'Science', identity: 'Nullify, Stagger, Fate Seal, Power Steal, Mystic Dispersion' }
  ];

  const size = 380;
  const center = size / 2;
  const radius = 130;

  const isLight = document.documentElement.classList.contains('light');
  const nodeFill = isLight ? '#ffffff' : '#111726';
  const hubFill = isLight ? '#ffffff' : '#0f172a';
  const hubStroke = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)';
  const arrowStroke = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)';
  const hubTextColor = isLight ? '#475569' : '#94a3b8';

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
            stroke="${arrowStroke}" 
            stroke-width="2.5" 
            stroke-dasharray="4,4"
            marker-end="url(#arrowhead)" 
            id="arrow-${cls.name}"
            class="transition-all duration-300"/>
    `;

    nodesHtml += `
      <g class="class-node cursor-pointer group" data-class="${cls.name}" onclick="selectClassWheel('${cls.name}')">
        <circle cx="${x}" cy="${y}" r="35" fill="${nodeFill}" stroke="${cls.color}" stroke-width="2.5" 
                class="transition-all duration-300 group-hover:r-[39] filter drop-shadow-[0_0_10px_${cls.color}]" />
        <image href="assets/images/classes/${cls.name.toLowerCase()}.svg" x="${x - 13}" y="${y - 20}" width="26" height="26" class="pointer-events-none" />
        <text x="${x}" y="${y + 18}" text-anchor="middle" font-size="9.5" font-weight="900" fill="${cls.color}" class="uppercase tracking-wider select-none">${cls.name}</text>
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
      <circle cx="${center}" cy="${center}" r="50" fill="${hubFill}" stroke="${hubStroke}" stroke-width="2" />
      <text x="${center}" y="${center - 6}" text-anchor="middle" font-size="12" font-weight="700" fill="${hubTextColor}">CLASS</text>
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

  const beatCls = window.MCOC_DATA.classes[data.beats] || {};
  const weakCls = window.MCOC_DATA.classes[data.weakTo] || {};

  detailEl.innerHTML = `
    <div class="p-6 rounded-2xl glass-panel border" style="border-color: ${data.border};">
      <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div class="flex items-center gap-3.5">
          <div class="class-wheel-icon-box w-12 h-12 rounded-xl bg-slate-900 border-2 p-1.5 flex items-center justify-center shadow-lg" style="border-color: ${data.color};">
            <img src="assets/images/classes/${className.toLowerCase()}.svg" alt="${className}" class="w-full h-full object-contain">
          </div>
          <div>
            <h3 class="text-2xl font-black tracking-tight" style="color: ${data.color};">${data.name.toUpperCase()} CLASS</h3>
            <span class="text-xs text-slate-400 font-medium">Class Advantage Profile</span>
          </div>
        </div>
        <div class="class-wheel-owned-pill px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
          Owned: <span class="text-white font-bold">${ownedChamps.length}</span> champions
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div class="class-wheel-adv p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col justify-between">
          <div>
            <div class="class-wheel-adv-title text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
              <span>⚔️ ADVANTAGE (+40% Attack & Crit/Pen)</span>
            </div>
            <div class="class-wheel-crushes-label text-base font-black text-white flex items-center gap-2">
              <span>CRUSHES:</span>
              <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900 border" style="border-color: ${beatCls.color || '#fff'};">
                <img src="assets/images/classes/${data.beats.toLowerCase()}.svg" class="w-4 h-4 object-contain">
                <span style="color: ${beatCls.color || '#fff'}">${data.beats}</span>
              </div>
            </div>
          </div>
          <div class="class-wheel-desc text-xs text-slate-300 mt-2">Gains high damage bonus and reduced ability resistance against ${data.beats}.</div>
        </div>

        <div class="class-wheel-weak p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 flex flex-col justify-between">
          <div>
            <div class="class-wheel-weak-title text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-1.5">
              <span>🛡️ WEAKNESS (-20% Attack & Vulnerability)</span>
            </div>
            <div class="class-wheel-weak-label text-base font-black text-white flex items-center gap-2">
              <span>WEAK TO:</span>
              <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900 border" style="border-color: ${weakCls.color || '#fff'};">
                <img src="assets/images/classes/${data.weakTo.toLowerCase()}.svg" class="w-4 h-4 object-contain">
                <span style="color: ${weakCls.color || '#fff'}">${data.weakTo}</span>
              </div>
            </div>
          </div>
          <div class="class-wheel-desc text-xs text-slate-300 mt-2">Suffers reduced combat effectiveness against ${data.weakTo} defenders.</div>
        </div>
      </div>

      <div class="mb-5">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Mechanics & Kit Specialty</h4>
        <p class="class-wheel-identity text-sm text-slate-200 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
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
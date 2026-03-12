/* ============================================================
   AXIOM — Neural Network Canvas Animation + Form handling
   ============================================================ */

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;

  // ---- Config ----
  const LAYER_COUNTS   = [5, 8, 10, 8, 5];   // neurons per layer
  const NODE_RADIUS    = 4;
  const PULSE_SPEED    = 0.012;               // how fast pulses travel (0–1 per frame)
  const PULSE_INTERVAL = 60;                  // frames between new pulses
  const ORANGE         = '#FF6B35';
  const GOLD           = '#FFD700';
  const DIM_COLOR      = 'rgba(255, 107, 53, 0.12)';
  const CONN_COLOR     = 'rgba(255, 107, 53, 0.07)';

  let nodes  = [];   // { x, y, layer, index, glowAlpha }
  let conns  = [];   // { from, to }  (indices into nodes[])
  let pulses = [];   // { conn, t, color }
  let frame  = 0;

  // ---- Build network ----
  function buildNetwork() {
    nodes = [];
    conns = [];
    pulses = [];

    const layerCount = LAYER_COUNTS.length;
    const layerSpacingX = W / (layerCount + 1);

    LAYER_COUNTS.forEach((count, li) => {
      const x = layerSpacingX * (li + 1);
      const spacingY = H / (count + 1);
      for (let ni = 0; ni < count; ni++) {
        nodes.push({
          x,
          y: spacingY * (ni + 1),
          layer: li,
          index: ni,
          glowAlpha: 0,
        });
      }
    });

    // Connect every node in layer L to every node in layer L+1
    for (let li = 0; li < LAYER_COUNTS.length - 1; li++) {
      const fromNodes = nodes.filter(n => n.layer === li);
      const toNodes   = nodes.filter(n => n.layer === li + 1);
      fromNodes.forEach(fn => {
        toNodes.forEach(tn => {
          conns.push({ from: nodes.indexOf(fn), to: nodes.indexOf(tn) });
        });
      });
    }
  }

  // ---- Spawn a pulse on a random connection ----
  function spawnPulse() {
    if (conns.length === 0) return;
    const conn  = conns[Math.floor(Math.random() * conns.length)];
    const color = Math.random() > 0.4 ? ORANGE : GOLD;
    pulses.push({ conn, t: 0, color });
  }

  // ---- Draw ----
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    conns.forEach(c => {
      const a = nodes[c.from];
      const b = nodes[c.to];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = CONN_COLOR;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });

    // Draw pulses
    pulses.forEach(p => {
      const a = nodes[p.conn.from];
      const b = nodes[p.conn.to];
      const px = a.x + (b.x - a.x) * p.t;
      const py = a.y + (b.y - a.y) * p.t;

      // Glow trail
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 10);
      grad.addColorStop(0, p.color.replace(')', ', 0.9)').replace('rgb', 'rgba').replace('#FF6B35', 'rgba(255,107,53,0.9)').replace('#FFD700', 'rgba(255,215,0,0.9)'));
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Light up destination node when pulse arrives
      if (p.t >= 0.95) {
        nodes[p.conn.to].glowAlpha = Math.min(1, nodes[p.conn.to].glowAlpha + 0.4);
      }
    });

    // Draw nodes
    nodes.forEach(n => {
      // Outer glow when activated
      if (n.glowAlpha > 0.01) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 18);
        grad.addColorStop(0, `rgba(255, 107, 53, ${n.glowAlpha * 0.5})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        n.glowAlpha *= 0.94; // fade out
      }

      // Node ring
      ctx.beginPath();
      ctx.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 107, 53, ${0.25 + n.glowAlpha * 0.6})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Node fill
      ctx.beginPath();
      ctx.arc(n.x, n.y, NODE_RADIUS - 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 107, 53, ${0.08 + n.glowAlpha * 0.3})`;
      ctx.fill();
    });
  }

  // ---- Animate ----
  function animate() {
    frame++;

    // Spawn new pulses
    if (frame % PULSE_INTERVAL === 0) spawnPulse();
    if (frame % (PULSE_INTERVAL * 0.6 | 0) === 0) spawnPulse(); // extra density

    // Advance pulses
    pulses = pulses.filter(p => {
      p.t += PULSE_SPEED;
      return p.t <= 1;
    });

    draw();
    requestAnimationFrame(animate);
  }

  // ---- Init ----
  function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildNetwork();
  }

  init();
  animate();
  window.addEventListener('resize', () => { init(); });
})();

// ---- Email form ----
(function () {
  const form    = document.getElementById('interest-form');
  const input   = document.getElementById('email-input');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;

    const btn     = form.querySelector('.cta-btn');
    const btnText = btn.querySelector('.btn-text');
    btnText.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const existing = JSON.parse(localStorage.getItem('axiom_interests') || '[]');
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem('axiom_interests', JSON.stringify(existing));
      }
    } catch (_) {}

    await new Promise(r => setTimeout(r, 800));

    form.style.display = 'none';
    success.classList.add('visible');
  });
})();

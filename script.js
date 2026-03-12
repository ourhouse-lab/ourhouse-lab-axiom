/* ============================================================
   AXIOM — Animated background + form handling
   ============================================================ */

// ---- Animated particle/grid canvas ----
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], lines = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function initParticles() {
    particles = [];
    const count = Math.floor((W * H) / 18000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: randomBetween(0, W),
        y: randomBetween(0, H),
        vx: randomBetween(-0.15, 0.15),
        vy: randomBetween(-0.25, -0.05),
        r: randomBetween(1, 2.5),
        alpha: randomBetween(0.3, 0.9),
        color: Math.random() > 0.5 ? '#FF6B35' : '#FFD700',
      });
    }
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 107, 53, 0.04)';
    ctx.lineWidth = 0.5;
    const step = 60;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function drawConnections() {
    const maxDist = 140;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.strokeStyle = `rgba(255, 107, 53, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawConnections();

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = H + 10; p.x = randomBetween(0, W); }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();
  window.addEventListener('resize', () => { resize(); initParticles(); });
})();

// ---- Email form ----
(function () {
  const form = document.getElementById('interest-form');
  const input = document.getElementById('email-input');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;

    const btn = form.querySelector('.cta-btn');
    const btnText = btn.querySelector('.btn-text');
    btnText.textContent = 'Sending...';
    btn.disabled = true;

    // Store in localStorage as fallback (no backend yet)
    try {
      const existing = JSON.parse(localStorage.getItem('axiom_interests') || '[]');
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem('axiom_interests', JSON.stringify(existing));
      }
    } catch (_) {}

    // Simulate async
    await new Promise(r => setTimeout(r, 800));

    form.style.display = 'none';
    success.classList.add('visible');
  });
})();

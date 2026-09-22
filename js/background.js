/* ============================================================
   ПРИМЕНЕНИЕ ФОНА
   Все слушатели и animId хранятся в _bgState,
   чтобы корректно чистить при смене фона.
   ============================================================ */

var _bgState = {
  animId: null,
  resize: null,
  initParticles: null,
  canvas: null,
  img: null
};

function _bgCleanup() {
  if (_bgState.animId) {
    cancelAnimationFrame(_bgState.animId);
    _bgState.animId = null;
  }
  if (_bgState.resize) {
    window.removeEventListener('resize', _bgState.resize);
    _bgState.resize = null;
  }
  if (_bgState.initParticles) {
    window.removeEventListener('resize', _bgState.initParticles);
    _bgState.initParticles = null;
  }
  if (_bgState.canvas && _bgState.canvas.parentNode) {
    _bgState.canvas.parentNode.removeChild(_bgState.canvas);
    _bgState.canvas = null;
  }
  if (_bgState.img && _bgState.img.parentNode) {
    _bgState.img.parentNode.removeChild(_bgState.img);
    _bgState.img = null;
  }
}

function applyBackground(bgKey) {
  _bgCleanup();

  var bg = BACKGROUNDS[bgKey] || BACKGROUNDS.void;
  var body = document.body;

  /* ---- Тип image ---- */
  if (bg.type === 'image') {
    body.style.background = 'transparent';
    var img = document.createElement('img');
    img.id = 'bg-image';
    img.src = bg.image;
    img.style.cssText = [
      'position: fixed',
      'inset: 0',
      'width: 100%',
      'height: 100%',
      'object-fit: cover',
      'z-index: 0',
      'pointer-events: none',
      'filter: blur(' + (bg.blur || 8) + 'px) brightness(' + (1 - (bg.darken || 0.4)) + ')'
    ].join(';');
    document.body.appendChild(img);
    _bgState.img = img;
    return;
  }

  /* ---- Тип solid ---- */
  if (bg.type === 'solid') {
    body.style.background = bg.value;
    return;
  }

  /* ---- Анимационные типы ---- */
  body.style.background = bg.preview || '#1a1a2e';
  var canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.appendChild(canvas);
  _bgState.canvas = canvas;

  var ctx = canvas.getContext('2d');
  var w, h;

  _bgState.resize = function() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  };
  _bgState.resize();
  window.addEventListener('resize', _bgState.resize);

  var particles = [];

  _bgState.initParticles = function() {
    particles = [];
    if (bg.type === 'stars') {
      for (var i = 0; i < 120; i++) particles.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 0.5, alpha: Math.random() * 0.7 + 0.3 });
    } else if (bg.type === 'bubbles') {
      for (var i = 0; i < 40; i++) particles.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 30 + 10, speed: Math.random() * 0.5 + 0.2 });
    } else if (bg.type === 'waves') {
      for (var i = 0; i < 5; i++) particles.push({ y: h * 0.3 + i * 80, amp: 30 + i * 10, offset: Math.random() * Math.PI * 2, speed: 0.02 + i * 0.005 });
    } else if (bg.type === 'aurora') {
      for (var i = 0; i < 6; i++) particles.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 200 + 100, hue: 100 + Math.random() * 100, speed: 0.3 + Math.random() * 0.4 });
    } else if (bg.type === 'matrix') {
      var cols = Math.floor(w / 20);
      for (var i = 0; i < cols; i++) particles.push({ x: i * 20 + 10, y: Math.random() * -h, speed: 3 + Math.random() * 4, len: 5 + Math.floor(Math.random() * 10), chars: [] });
      particles.forEach(function(p) { for (var j = 0; j < p.len; j++) p.chars.push(String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))); });
    } else if (bg.type === 'nebula') {
      for (var i = 0; i < 8; i++) particles.push({ x: Math.random() * w, y: Math.random() * h, r: 200 + Math.random() * 150, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2, hue: Math.random() * 360 });
    } else if (bg.type === 'snow') {
      for (var i = 0; i < 80; i++) particles.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 3 + 1, vy: 0.3 + Math.random() * 0.7, vx: (Math.random() - 0.5) * 0.5, wobble: Math.random() * Math.PI * 2 });
    } else if (bg.type === 'neural') {
      var numNodes = 50;
      for (var i = 0; i < numNodes; i++) particles.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: 2 + Math.random() * 2 });
    }
  };
  _bgState.initParticles();
  window.addEventListener('resize', _bgState.initParticles);

  function draw() {
    ctx.clearRect(0, 0, w, h);

    if (bg.type === 'stars') {
      particles.forEach(function(p) { p.alpha += (Math.random() - 0.5) * 0.05; p.alpha = Math.max(0.1, Math.min(1, p.alpha)); ctx.fillStyle = 'rgba(255,255,255,' + p.alpha + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill(); });
    } else if (bg.type === 'bubbles') {
      particles.forEach(function(p) { p.y -= p.speed; if (p.y + p.r < 0) { p.y = h + p.r; p.x = Math.random() * w; } var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); g.addColorStop(0, 'rgba(100,200,255,0.15)'); g.addColorStop(1, 'rgba(100,200,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill(); });
    } else if (bg.type === 'waves') {
      particles.forEach(function(p, idx) { p.offset += p.speed; ctx.beginPath(); for (var x = 0; x <= w; x += 10) { var y = p.y + Math.sin(x * 0.01 + p.offset) * p.amp; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.strokeStyle = 'rgba(100,150,255,' + (0.3 - idx * 0.05) + ')'; ctx.lineWidth = 2; ctx.stroke(); });
    } else if (bg.type === 'aurora') {
      particles.forEach(function(p) {
        p.y -= p.speed; if (p.y + p.r < 0) p.y = h + p.r;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, 'hsla(' + p.hue + ', 70%, 50%, 0.25)');
        g.addColorStop(1, 'hsla(' + p.hue + ', 70%, 50%, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
    } else if (bg.type === 'matrix') {
      ctx.fillStyle = '#001100'; ctx.fillRect(0, 0, w, h);
      particles.forEach(function(p) {
        p.y += p.speed;
        if (p.y - p.len * 20 > h) { p.y = -p.len * 20; p.x = Math.random() * w; }
        p.chars.forEach(function(ch, i) {
          ctx.fillStyle = 'rgba(0,255,0,' + (1 - i / p.chars.length) + ')';
          ctx.font = 'bold 15px monospace';
          ctx.fillText(ch, p.x, p.y - i * 20);
        });
        if (Math.random() < 0.02) p.chars[Math.floor(Math.random() * p.chars.length)] = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
      });
    } else if (bg.type === 'nebula') {
      particles.forEach(function(p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -p.r) p.x = w + p.r; if (p.x > w + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = h + p.r; if (p.y > h + p.r) p.y = -p.r;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, 'hsla(' + p.hue + ', 80%, 60%, 0.15)');
        g.addColorStop(1, 'hsla(' + p.hue + ', 80%, 60%, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
    } else if (bg.type === 'snow') {
      particles.forEach(function(p) {
        p.wobble += 0.02;
        p.y += p.vy; p.x += p.vx + Math.sin(p.wobble) * 0.5;
        if (p.y > h + 5) { p.y = -5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w; if (p.x > w + 5) p.x = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
    } else if (bg.type === 'neural') {
      particles.forEach(function(p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = 'rgba(100,150,255,' + (0.3 - dist / 400) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
      }
      particles.forEach(function(p) {
        ctx.fillStyle = 'rgba(150,200,255,0.9)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
    }

    _bgState.animId = requestAnimationFrame(draw);
  }
  draw();
}

// Совместимость с ui.js (вызывает window._bgAnimCleanup)
window._bgAnimCleanup = _bgCleanup;
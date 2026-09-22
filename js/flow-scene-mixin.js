/* ============================================================
   FLOW SCENE MIXIN — общая логика игровых сцен
   (GameScene, EndlessScene, DuelScene)
   ============================================================ */

var FlowSceneMixin = {

  /* ============================================================
     ТЕМА И ТРЕЙЛ
     ============================================================ */

  applyThemeFromState: function(state) {
    var th = THEMES[state.currentTheme] || THEMES.default;
    this.palette = (th.colors || THEMES.default.colors).slice();
    this.themeGlow = th.glow;
    this.themeSoftGlow = th.softGlow || false;
    this.themeGradient = th.gradient;
    this.themeGlitch = th.glitch;
    this.themeMetallic = th.metallic;
    this.themeSparkle = th.sparkle;
    this.lineParticleType = th.lineParticle || null;
    this.trail = TRAILS[state.currentTrail] || TRAILS.default;
  },

  /* ============================================================
     ИНИЦИАЛИЗАЦИЯ ПОЛЯ И ГРАФИКИ
     ============================================================ */

  initGrid: function() {
  var w = this.scale.width, h = this.scale.height;

  // На мобилке padding меньше
  var isMobile = w < 768;
  this.boardPadding = this.boardPadding || (isMobile ? 16 : 32);

  // UI-зоны — берём из реальных DOM-элементов, если есть
  var topUI = document.querySelector('.ui-top');
  var bottomUI = document.querySelector('.ui-bottom');
  this.topUIHeight = topUI ? (topUI.offsetHeight + 20) : (isMobile ? 70 : 100);
  this.bottomUIHeight = bottomUI ? (bottomUI.offsetHeight + 20) : (isMobile ? 80 : 120);

  var availW = w - this.boardPadding * 2;
  var availH = h - this.boardPadding * 2 - this.topUIHeight - this.bottomUIHeight;

  // Считаем размер клетки — берём min от ширины и высоты
  var cellFromW = availW / this.level.width;
  var cellFromH = availH / this.level.height;
  var cell = Math.min(cellFromW, cellFromH);

  // П.1.6.2.2 — длинная сторона поля не больше чем в 2 раза длиннее короткой
  var boardW = cell * this.level.width;
  var boardH = cell * this.level.height;
  var longSide = Math.max(boardW, boardH);
  var shortSide = Math.min(boardW, boardH);
  if (longSide > shortSide * 2) {
    if (boardW > boardH) {
      cell = shortSide * 2 / this.level.width;
    } else {
      cell = shortSide * 2 / this.level.height;
    }
  }

  // Округляем до 1 знака — на retina важно
  this.cellSize = Math.floor(cell * 100) / 100;
  this.boardW = this.cellSize * this.level.width;
  this.boardH = this.cellSize * this.level.height;
  this.offsetX = (w - this.boardW) / 2;
  this.offsetY = this.topUIHeight + (availH - this.boardH) / 2 + this.boardPadding / 2;

  this.playerPaths = {};
  for (var i = 0; i < this.level.paths.length; i++) this.playerPaths[i] = [];

  this.playerGrid = [];
  for (var y = 0; y < this.level.height; y++) {
    this.playerGrid.push([]);
    for (var x = 0; x < this.level.width; x++) this.playerGrid[y].push(-1);
  }

  this.endpoints = [];
  this.endpointMap = {};
  for (var i = 0; i < this.level.paths.length; i++) {
    var path = this.level.paths[i];
    var first = path.cells[0];
    var last = path.cells[path.cells.length - 1];
    var color = this.palette[i % this.palette.length];
    this.endpoints.push({ x: first.x, y: first.y, colorIndex: i, color: color });
    this.endpoints.push({ x: last.x, y: last.y, colorIndex: i, color: color });
    this.endpointMap[first.x + ',' + first.y] = i;
    this.endpointMap[last.x + ',' + last.y] = i;
  }
},

  /* === PATCH п.6: пересчёт геометрии без потери прогресса === */
  computeGridGeometry: function() {
    var w = this.scale.width, h = this.scale.height;

    var isMobile = w < 768;
    this.boardPadding = this.boardPadding || (isMobile ? 16 : 32);

    var topUI = document.querySelector('.ui-top');
    var bottomUI = document.querySelector('.ui-bottom');
    this.topUIHeight = topUI ? (topUI.offsetHeight + 20) : (isMobile ? 70 : 100);
    this.bottomUIHeight = bottomUI ? (bottomUI.offsetHeight + 20) : (isMobile ? 80 : 120);

    var availW = w - this.boardPadding * 2;
    var availH = h - this.boardPadding * 2 - this.topUIHeight - this.bottomUIHeight;

    var cellFromW = availW / this.level.width;
    var cellFromH = availH / this.level.height;
    var cell = Math.min(cellFromW, cellFromH);

    var boardW = cell * this.level.width;
    var boardH = cell * this.level.height;
    var longSide = Math.max(boardW, boardH);
    var shortSide = Math.min(boardW, boardH);
    if (longSide > shortSide * 2) {
      if (boardW > boardH) {
        cell = shortSide * 2 / this.level.width;
      } else {
        cell = shortSide * 2 / this.level.height;
      }
    }

    this.cellSize = Math.floor(cell * 100) / 100;
    this.boardW = this.cellSize * this.level.width;
    this.boardH = this.cellSize * this.level.height;
    this.offsetX = (w - this.boardW) / 2;
    this.offsetY = this.topUIHeight + (availH - this.boardH) / 2 + this.boardPadding / 2;
  },

  /**
   * === PATCH п.6 ===
   * Пересчитать геометрию и перерисовать сцену после resize
   * БЕЗ рестарта и БЕЗ потери playerPaths / playerGrid / прогресса.
   *
   * Вызывается из GameScene / EndlessScene / DuelScene по событию
   * Phaser.Scale.Events.RESIZE (scale.on('resize', ...)).
   */
  relayoutGameField: function() {
    // Должны быть базовые данные
    if (!this.level || !this.boardGraphics) return;

    // 1. Пересчёт геометрии
    this.computeGridGeometry();

    // 2. Пересчёт canvas .paths-layer
    if (this.pathsCanvasEl) {
      var dpr = window.devicePixelRatio || 1;
      var w = window.innerWidth, h = window.innerHeight;
      this.pathsCanvasEl.width = w * dpr;
      this.pathsCanvasEl.height = h * dpr;
      this.pathsCanvasEl.style.width = w + 'px';
      this.pathsCanvasEl.style.height = h + 'px';
      if (this.pathCtx) {
        this.pathCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    // 3. Перерисовываем поле и точки
    this.drawBoard();
    this.drawEndpoints();

    // 4. Перерисовываем пути (использует текущие playerPaths)
    this.redrawPaths();

    // 5. Обновляем прогресс-бар (пересчёт не зависит от размеров, но
    //    вызываем для консистентности)
    this.updateProgressBar();
  },

  initGraphics: function() {
    this.boardGraphics = this.add.graphics();
    this.endpointGraphics = this.add.graphics();
    this.endpointSprites = [];
    this.trailGraphics = this.add.graphics();
    this.trailParticles = [];
    this.lineParticles = [];
    this.fireworksGraphics = this.add.graphics();
    this.sparklesGraphics = this.add.graphics();
    this.fireworks = [];
    this.sparkles = [];
    this.glitchJitter = 0;
    this.glitchTimer = 0;
    this.growAnimation = null;
    this.drawing = null;
  },

  initStandardScene: function(state) {
    this.applyThemeFromState(state);
    this.initGrid();
    this.initGraphics();
    this.drawBoard();
    this.drawEndpoints();
    this.setupPathsCanvas();
    this.setupInput();
  },

  /* ============================================================
     BOARD + ENDPOINTS
     ============================================================ */

  drawBoard: function() {
    var g = this.boardGraphics;
    g.clear();
    g.fillStyle(0x252540, 1);
    g.fillRoundedRect(this.offsetX - 4, this.offsetY - 4, this.boardW + 8, this.boardH + 8, 12);
    g.lineStyle(1, 0x3a3a5a, 1);
    for (var y = 0; y <= this.level.height; y++) {
      g.lineBetween(this.offsetX, this.offsetY + y * this.cellSize, this.offsetX + this.boardW, this.offsetY + y * this.cellSize);
    }
    for (var x = 0; x <= this.level.width; x++) {
      g.lineBetween(this.offsetX + x * this.cellSize, this.offsetY, this.offsetX + x * this.cellSize, this.offsetY + this.boardH);
    }
  },

  drawEndpoints: function() {
    var g = this.endpointGraphics;
    g.clear();

    if (this.endpointSprites && this.endpointSprites.length) {
      this.endpointSprites.forEach(function(s) { if (s && s.destroy) s.destroy(); });
    }
    this.endpointSprites = [];

    var r = this.cellSize * 0.3;
    var state = this.registry.get('state');
    var isAnimeTheme = (state && state.currentTheme === 'anime');
    var hasFaces = this.textures.exists('faces');
    var useFaces = isAnimeTheme && hasFaces;

    for (var i = 0; i < this.endpoints.length; i++) {
      var ep = this.endpoints[i];
      var cx = this.offsetX + ep.x * this.cellSize + this.cellSize / 2;
      var cy = this.offsetY + ep.y * this.cellSize + this.cellSize / 2;

      if (useFaces) {
        var frameIdx = ep.colorIndex % 8;
        var sprite = this.add.image(cx, cy, 'faces', frameIdx);
        sprite.setDisplaySize(r * 2, r * 2);

        var maskShape = this.make.graphics({ x: 0, y: 0, add: false });
        maskShape.fillStyle(0xffffff, 1);
        maskShape.fillCircle(cx, cy, r);
        sprite.setMask(maskShape.createGeometryMask());

        g.lineStyle(2.5, 0xffffff, 0.85);
        g.strokeCircle(cx, cy, r);

        if (this.themeGlow) {
          g.lineStyle(3, 0xffffff, 0.35);
          g.strokeCircle(cx, cy, r + 3);
        }
        this.endpointSprites.push(sprite);
      } else {
        if (this.themeGlow) { g.fillStyle(ep.color, 0.5); g.fillCircle(cx, cy, r + 8); }
        g.fillStyle(0x000000, 0.25); g.fillCircle(cx, cy + 2, r + 1);
        g.fillStyle(ep.color, 1); g.fillCircle(cx, cy, r);
        g.lineStyle(2.5, 0xffffff, 0.85); g.strokeCircle(cx, cy, r);
      }
    }
  },

  /* ============================================================
     CANVAS-СЛОЙ ДЛЯ ПУТЕЙ
     ============================================================ */

  setupPathsCanvas: function() {
    var parent = document.getElementById('game');
    if (!parent) return;
    var old = parent.querySelector('canvas.paths-layer');
    if (old) old.remove();
    var pc = document.createElement('canvas');
    pc.className = 'paths-layer';
    parent.appendChild(pc);
    var dpr = window.devicePixelRatio || 1;
    pc.width = window.innerWidth * dpr;
    pc.height = window.innerHeight * dpr;
    pc.style.width = window.innerWidth + 'px';
    pc.style.height = window.innerHeight + 'px';
    this.pathCtx = pc.getContext('2d');
    this.pathCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.pathsCanvasEl = pc;
    this.redrawPaths();
  },

  redrawPaths: function() {
    if (!this.pathCtx || !this.pathsCanvasEl) return;
    var ctx = this.pathCtx;
    var w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    var thickness = this.cellSize * 0.38;

    for (var ci in this.playerPaths) {
      var colorIdx = parseInt(ci);
      var cells = this.playerPaths[colorIdx];
      if (!cells || cells.length === 0) continue;

      var color = this.palette[colorIdx % this.palette.length];
      var colorHex = hexColor(color);
      var color2 = this.palette[(colorIdx + 4) % this.palette.length];
      var color2Hex = hexColor(color2);
      var total = cells.length;
      var drawCount = total;
      var partial = 0;

      if (this.growAnimation && this.growAnimation.colorIndex === colorIdx) {
        var shown = this.growAnimation.progress * total;
        drawCount = Math.max(2, Math.ceil(shown));
        partial = shown - Math.floor(shown);
      }

      if (drawCount < 2) continue;
      var points = [];
      for (var i = 0; i < Math.min(drawCount, total); i++) {
        var c = cells[i];
        points.push({
          x: this.offsetX + c.x * this.cellSize + this.cellSize / 2,
          y: this.offsetY + c.y * this.cellSize + this.cellSize / 2
        });
      }
      if (partial > 0 && drawCount < total) {
        var a = cells[drawCount - 1], b = cells[drawCount];
        var ax = this.offsetX + a.x * this.cellSize + this.cellSize / 2;
        var ay = this.offsetY + a.y * this.cellSize + this.cellSize / 2;
        var bx = this.offsetX + b.x * this.cellSize + this.cellSize / 2;
        var by = this.offsetY + b.y * this.cellSize + this.cellSize / 2;
        points.push({ x: ax + (bx - ax) * partial, y: ay + (by - ay) * partial });
      }

      this._renderPathStyled(ctx, points, thickness, colorHex, color2Hex);
    }
  },

  _renderPathStyled: function(ctx, points, thickness, colorHex, color2Hex) {
    if (this.themeMetallic) {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#3a3a3a'; ctx.globalAlpha = 1; ctx.lineWidth = thickness + 6;
      this.strokePath(ctx, points);
      ctx.restore();

      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      var grad = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
      grad.addColorStop(0, colorHex);
      grad.addColorStop(0.3, '#ffffff');
      grad.addColorStop(0.5, colorHex);
      grad.addColorStop(0.7, '#ffffff');
      grad.addColorStop(1, colorHex);
      ctx.strokeStyle = grad; ctx.globalAlpha = 1; ctx.lineWidth = thickness;
      this.strokePath(ctx, points);
      ctx.restore();

      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = 0.6; ctx.lineWidth = Math.max(1, thickness * 0.15);
      this.strokePath(ctx, points);
      ctx.restore();
      return;
    }

    if (this.themeGradient) {
      var grad = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
      grad.addColorStop(0, colorHex);
      grad.addColorStop(0.5, color2Hex);
      grad.addColorStop(1, colorHex);
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = grad; ctx.globalAlpha = 1; ctx.lineWidth = thickness;
      if (this.themeGlow) { ctx.shadowColor = colorHex; ctx.shadowBlur = 15; }
      this.strokePath(ctx, points);
      ctx.restore();
      return;
    }

    if (this.themeGlitch) {
      var jitter = (Math.random() < 0.3 ? (Math.random() - 0.5) * 6 : 0) + this.glitchJitter;
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = '#ff0040'; ctx.globalAlpha = 0.7; ctx.lineWidth = thickness;
      var pR = points.map(function(p) { return { x: p.x + jitter + 2, y: p.y + jitter + 1 }; });
      this.strokePath(ctx, pR);
      ctx.strokeStyle = '#00ffff'; ctx.globalAlpha = 0.7;
      var pC = points.map(function(p) { return { x: p.x - jitter - 2, y: p.y - jitter - 1 }; });
      this.strokePath(ctx, pC);
      ctx.strokeStyle = colorHex; ctx.globalAlpha = 1;
      if (this.themeGlow) { ctx.shadowColor = colorHex; ctx.shadowBlur = 15; }
      this.strokePath(ctx, points);
      ctx.restore();
      return;
    }

    if (this.themeSoftGlow) {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = thickness + 3; ctx.globalAlpha = 1;
      var shadow = points.map(function(p) { return { x: p.x + 1.5, y: p.y + 1.5 }; });
      this.strokePath(ctx, shadow);
      ctx.restore();

      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = colorHex; ctx.globalAlpha = 0.35;
      ctx.lineWidth = thickness + 8;
      ctx.shadowColor = colorHex; ctx.shadowBlur = 20;
      this.strokePath(ctx, points);
      ctx.restore();

      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = colorHex; ctx.globalAlpha = 1; ctx.lineWidth = thickness;
      ctx.shadowColor = colorHex; ctx.shadowBlur = 8;
      this.strokePath(ctx, points);
      ctx.restore();

      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = Math.max(1, thickness * 0.2);
      this.strokePath(ctx, points);
      ctx.restore();
      return;
    }

    // default
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = colorHex; ctx.globalAlpha = 0.22; ctx.lineWidth = thickness + 10;
    this.strokePath(ctx, points);
    ctx.restore();

    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = colorHex; ctx.globalAlpha = 1; ctx.lineWidth = thickness;
    if (this.themeGlow) { ctx.shadowColor = colorHex; ctx.shadowBlur = 15; }
    this.strokePath(ctx, points);
    ctx.restore();

    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = 0.15; ctx.lineWidth = Math.max(1, thickness * 0.25);
    this.strokePath(ctx, points);
    ctx.restore();
  },

  strokePath: function(ctx, points) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  },

  /* ============================================================
     ВВОД
     ============================================================ */

  setupInput: function() {
    var self = this;
    this.input.on('pointerdown', function(p) {
      if (!self.countdownActive && !self._ended) self.onPointerDown(p);
    });
    this.input.on('pointermove', function(p) {
      if (!self.countdownActive && !self._ended) self.onPointerMove(p);
    });
    this.input.on('pointerup', function() {
      if (!self.countdownActive && !self._ended) self.onPointerUp();
    });
    this.input.keyboard.on('keydown-ESC', function() {
      if (self.onEscPressed) self.onEscPressed();
      else if (window.goToMainMenu) goToMainMenu();
    });
  },

  screenToCell: function(px, py) {
    var x = Math.floor((px - this.offsetX) / this.cellSize);
    var y = Math.floor((py - this.offsetY) / this.cellSize);
    if (x < 0 || x >= this.level.width || y < 0 || y >= this.level.height) return null;
    return { x: x, y: y };
  },

  onPointerDown: function(pointer) {
    if (this.growAnimation || this._ended) return;
    if (this.duel && this.duel.winner) return;
    var cell = this.screenToCell(pointer.x, pointer.y);
    if (!cell) return;
    var ep = null;
    for (var i = 0; i < this.endpoints.length; i++) {
      if (this.endpoints[i].x === cell.x && this.endpoints[i].y === cell.y) { ep = this.endpoints[i]; break; }
    }
    if (ep) {
      SoundManager.click();
      this.clearColorPath(ep.colorIndex);
      this.playerPaths[ep.colorIndex] = [{ x: cell.x, y: cell.y }];
      this.playerGrid[cell.y][cell.x] = ep.colorIndex;
      this.drawing = { colorIndex: ep.colorIndex };
      this.redrawPaths();
      this.updateProgressBar();
      return;
    }
    var existing = this.playerGrid[cell.y][cell.x];
    if (existing !== -1) {
      var pathCells = this.playerPaths[existing];
      if (!pathCells) return;
      var idx = -1;
      for (var i = 0; i < pathCells.length; i++) {
        if (pathCells[i].x === cell.x && pathCells[i].y === cell.y) { idx = i; break; }
      }
      if (idx !== -1) {
        SoundManager.click();
        var removed = pathCells.splice(idx + 1);
        for (var i = 0; i < removed.length; i++) this.playerGrid[removed[i].y][removed[i].x] = -1;
        this.drawing = { colorIndex: existing };
        this.redrawPaths();
        this.updateProgressBar();
      }
    }
  },

  onPointerMove: function(pointer) {
    this.spawnTrail(pointer.x, pointer.y);
    if (!this.drawing || this.growAnimation || this._ended) return;
    if (this.duel && this.duel.winner) return;
    var cell = this.screenToCell(pointer.x, pointer.y);
    if (!cell) return;
    var colorIndex = this.drawing.colorIndex;
    var pathCells = this.playerPaths[colorIndex];
    if (!pathCells || pathCells.length === 0) return;
    var last = pathCells[pathCells.length - 1];
    if (last.x === cell.x && last.y === cell.y) return;
    if (Math.abs(last.x - cell.x) + Math.abs(last.y - cell.y) !== 1) return;

    var existingIdx = -1;
    for (var i = 0; i < pathCells.length; i++) {
      if (pathCells[i].x === cell.x && pathCells[i].y === cell.y) { existingIdx = i; break; }
    }
    if (existingIdx !== -1) {
      var removed = pathCells.splice(existingIdx + 1);
      for (var i = 0; i < removed.length; i++) this.playerGrid[removed[i].y][removed[i].x] = -1;
      SoundManager.disconnect();
      this.redrawPaths();
      this.updateProgressBar();
      return;
    }
    var occupied = this.playerGrid[cell.y][cell.x];
    if (occupied !== -1 && occupied !== colorIndex) { SoundManager.error(); return; }
    var endpointHere = this.endpointMap[cell.x + ',' + cell.y];
    if (typeof endpointHere !== 'undefined' && endpointHere !== colorIndex) { SoundManager.error(); return; }

    pathCells.push({ x: cell.x, y: cell.y });
    this.playerGrid[cell.y][cell.x] = colorIndex;
    SoundManager.click();
    this.redrawPaths();
    this.updateProgressBar();

    var targetEndpoint = null;
    for (var i = 0; i < this.endpoints.length; i++) {
      var e = this.endpoints[i];
      if (e.x === cell.x && e.y === cell.y && e.colorIndex === colorIndex && pathCells.length > 1) {
        var isStart = (pathCells[0].x === cell.x && pathCells[0].y === cell.y);
        if (!isStart) { targetEndpoint = e; break; }
      }
    }
    if (targetEndpoint) {
      this.drawing = null;
      this.onPathCompleted(colorIndex);
      this.animateGrow(colorIndex);
    }
  },

  onPointerUp: function() {
    if (this.drawing && !this.growAnimation && !this._ended) {
      this.drawing = null;
      this.checkVictory();
    }
  },

  // Хук для наследников (DailyTasks, bpStats)
  onPathCompleted: function(colorIndex) {},

  // Хук для ESC (в дуэли — выход из дуэли)
  onEscPressed: null,

  clearColorPath: function(colorIndex) {
    var cells = this.playerPaths[colorIndex] || [];
    for (var i = 0; i < cells.length; i++) this.playerGrid[cells[i].y][cells[i].x] = -1;
    this.playerPaths[colorIndex] = [];
  },

  animateGrow: function(colorIndex) {
    SoundManager.connect();
    var self = this;
    var cells = this.playerPaths[colorIndex];
    if (cells && cells.length > 0) {
      var lastCell = cells[cells.length - 1];
      this.spawnTrail(
        this.offsetX + lastCell.x * this.cellSize + this.cellSize / 2,
        this.offsetY + lastCell.y * this.cellSize + this.cellSize / 2
      );
    }
    this.growAnimation = { colorIndex: colorIndex, progress: 0 };
    this.tweens.addCounter({
      from: 0, to: 1, duration: 260, ease: 'Cubic.easeOut',
      onUpdate: function(tween) {
        if (self.growAnimation) {
          self.growAnimation.progress = tween.getValue();
          self.redrawPaths();
        }
      },
      onComplete: function() {
        self.growAnimation = null;
        self.redrawPaths();
        self.updateProgressBar();
        self.checkVictory();
      }
    });
  },

  /* ============================================================
     ПРОГРЕСС
     ============================================================ */

  updateProgressBar: function() {
    var total = this.level.width * this.level.height;
    var filled = 0;
    for (var y = 0; y < this.level.height; y++) {
      for (var x = 0; x < this.level.width; x++) {
        if (this.playerGrid[y][x] !== -1) filled++;
      }
    }
    this._progressFilled = filled;
    this._progressTotal = total;
    this.onProgressUpdated(filled, total);
  },

  // Дефолт: UI.setProgress. В Endless/Duel — переопределяется
  onProgressUpdated: function(filled, total) {
    UI.setProgress(filled, total);
  },

  checkVictory: function() {
    for (var y = 0; y < this.level.height; y++) {
      for (var x = 0; x < this.level.width; x++) {
        if (this.playerGrid[y][x] === -1) return;
      }
    }
    this.onVictory();
  },

  // Обязательно переопределяется в сцене
  onVictory: function() {},

  /* ============================================================
     TRAIL (СЛЕД ЗА ПАЛЬЦЕМ/МЫШКОЙ)
     ============================================================ */

  spawnTrail: function(x, y) {
    var t = this.trail;
    if (!t) return;
    var colorInt = parseInt(t.cursorColor.replace('#', ''), 16);
    var p = null;

    switch (t.type) {
      case 'dot':
        p = { x: x, y: y, life: 0.8, maxLife: 0.8, color: colorInt, size: 4, type: 'dot' };
        break;

      case 'fire':
        for (var i = 0; i < 2; i++) {
          this.trailParticles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 1, vy: -1 - Math.random(), life: 0.6, maxLife: 0.6, color: 0xff6600, size: 5, type: 'fire' });
        }
        return;

      case 'water':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, life: 0.7, maxLife: 0.7, color: 0x0099ff, size: 6, type: 'water' };
        break;

      case 'star':
        p = { x: x, y: y, life: 0.9, maxLife: 0.9, color: 0xf1c40f, size: 6, type: 'star' };
        break;

      case 'rainbow': {
        var hue = (Date.now() / 10) % 360;
        var r = Phaser.Display.Color.HSVToRGB(hue / 360, 1, 1);
        p = { x: x, y: y, life: 0.8, maxLife: 0.8, color: (r.r << 16) | (r.g << 8) | r.b, size: 5, type: 'rainbow' };
        break;
      }

      case 'sakura':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 1.5, vy: 0.5 + Math.random() * 0.5, life: 1.2, maxLife: 1.2, color: colorInt, size: 6, type: 'sakura', rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.1 };
        break;

      case 'snowflake':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 0.5, vy: 0.3 + Math.random() * 0.5, life: 1.5, maxLife: 1.5, color: 0xa8e6ff, size: 5, type: 'snowflake' };
        break;

      case 'lightning':
        if (Math.random() < 0.3) p = { x: x, y: y, life: 0.3, maxLife: 0.3, color: 0xffff00, size: 8, type: 'lightning' };
        break;

      case 'leaves':
        if (Math.random() < 0.4) p = { x: x, y: y, vx: (Math.random() - 0.5) * 1.2, vy: 0.3 + Math.random() * 0.5, life: 1.3, maxLife: 1.3, color: 0x7c9a5f, size: 7, type: 'leaves', rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.15 };
        break;

      case 'sparks':
        for (var i = 0; i < 2; i++) {
          this.trailParticles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 0.5, maxLife: 0.5, color: colorInt, size: 3, type: 'sparks' });
        }
        return;

      case 'bubbles_trail':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 0.8, vy: -0.5 - Math.random() * 0.5, life: 0.9, maxLife: 0.9, color: 0xa0d8ff, size: 8, type: 'bubbles_trail' };
        break;

      case 'spores':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 1, vy: -0.5 - Math.random() * 0.5, life: 1.4, maxLife: 1.4, color: 0x88ff88, size: 4, type: 'spores' };
        break;

      case 'butterflies':
        if (Math.random() < 0.3) p = { x: x, y: y, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, life: 1.6, maxLife: 1.6, color: 0xff88dd, size: 8, type: 'butterflies', rot: 0, rotSpeed: (Math.random() - 0.5) * 0.3 };
        break;

      case 'aurora': {
        var hue = (Date.now() / 15) % 360;
        var r = Phaser.Display.Color.HSVToRGB(hue / 360, 0.7, 1);
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 1.5, vy: -0.3 - Math.random() * 0.5, life: 1.5, maxLife: 1.5, color: (r.r << 16) | (r.g << 8) | r.b, size: 10, type: 'aurora' };
        break;
      }

      case 'comet': {
        this.trailParticles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, life: 0.8, maxLife: 0.8, color: 0xffffff, size: 8, type: 'comet_head' });
        for (var i = 0; i < 3; i++) {
          this.trailParticles.push({ x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1, life: 0.6, maxLife: 0.6, color: 0xffd93d, size: 4, type: 'comet_tail' });
        }
        return;
      }

      case 'magic': {
        var hue = (Date.now() / 20) % 60 + 260;
        var r = Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 1);
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1, life: 1.2, maxLife: 1.2, color: (r.r << 16) | (r.g << 8) | r.b, size: 6, type: 'magic' };
        break;
      }

      case 'ghosts':
        if (Math.random() < 0.4) p = { x: x, y: y, vx: (Math.random() - 0.5) * 0.5, vy: -0.5 - Math.random() * 0.5, life: 1.8, maxLife: 1.8, color: 0xffffff, size: 10, type: 'ghost' };
        break;

      case 'curse':
        for (var i = 0; i < 2; i++) {
          this.trailParticles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 0.8, vy: 1 + Math.random() * 1.5, life: 0.9, maxLife: 0.9, color: 0x8b0000, size: 5, type: 'curse' });
        }
        return;

      case 'shooting_star':
        if (Math.random() < 0.5) {
          var angle = Math.random() * Math.PI * 2;
          p = { x: x, y: y, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3, life: 0.7, maxLife: 0.7, color: 0xffd93d, size: 5, type: 'star_burst' };
        }
        break;

      case 'nebula': {
        var hue = (Date.now() / 30) % 360;
        var r = Phaser.Display.Color.HSVToRGB(hue / 360, 0.6, 1);
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6, life: 1.6, maxLife: 1.6, color: (r.r << 16) | (r.g << 8) | r.b, size: 14, type: 'nebula' };
        break;
      }

      case 'black_hole': {
        var colors = [0x1a1a2e, 0xffd93d, 0xffffff, 0x00d2ff, 0xb07fe0];
        var c = colors[Math.floor(Math.random() * colors.length)];
        var sz = 2 + Math.random() * 4;
        p = { x: x + (Math.random() - 0.5) * 60, y: y + (Math.random() - 0.5) * 60, vx: 0, vy: 0, targetX: x, targetY: y, life: 1.0, maxLife: 1.0, color: c, size: sz, type: 'black_hole', glow: c !== 0x1a1a2e };
        break;
      }

      case 'crystals':
        if (Math.random() < 0.5) {
          var hue = (Date.now() / 50) % 360;
          var r = Phaser.Display.Color.HSVToRGB(hue / 360, 0.7, 1);
          p = { x: x, y: y, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, life: 1.2, maxLife: 1.2, color: (r.r << 16) | (r.g << 8) | r.b, size: 7, type: 'crystal', rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.15 };
        }
        break;

      case 'paint':
        for (var i = 0; i < 2; i++) {
          var hue = Math.random() * 360;
          var r = Phaser.Display.Color.HSVToRGB(hue / 360, 0.9, 1);
          this.trailParticles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 1.0, maxLife: 1.0, color: (r.r << 16) | (r.g << 8) | r.b, size: 6, type: 'paint' });
        }
        return;

      case 'web':
        if (Math.random() < 0.15) p = { x: x, y: y, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, life: 1.5, maxLife: 1.5, color: 0xffffff, size: 2, type: 'web_node' };
        break;

      case 'constellation':
        if (Math.random() < 0.12) p = { x: x, y: y, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8, life: 2.0, maxLife: 2.0, color: 0xffffff, size: 3, type: 'constellation_star' };
        break;

      case 'quantum': {
        var hue = (Date.now() / 10) % 360;
        var r = Phaser.Display.Color.HSVToRGB(hue / 360, 0.7, 1);
        p = {
          x: x, y: y,
          life: 1.5, maxLife: 1.5,
          color: (r.r << 16) | (r.g << 8) | r.b,
          size: 8,
          type: 'quantum',
          teleportTimer: 0,
          teleportInterval: 0.25 + Math.random() * 0.2,
          phase: Math.random() * Math.PI * 2
        };
        break;
      }

      case 'anime_trail': {
        var rnd = Math.random();
        var shape = rnd < 0.33 ? 'heart' : (rnd < 0.66 ? 'ribbon' : 'bow');
        var animeColors = [0xffb7d5, 0xff9ec4, 0xffc8dd, 0xffaad0, 0xffd1e3];
        p = {
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6 - 0.3,
          life: 1.4, maxLife: 1.4,
          color: animeColors[Math.floor(Math.random() * animeColors.length)],
          size: 10,
          type: 'anime_' + shape,
          rot: (Math.random() - 0.5) * 0.5,
          rotSpeed: (Math.random() - 0.5) * 0.05
        };
        break;
      }
    }

    if (p) this.trailParticles.push(p);
  },

  /* ============================================================
     LINE PARTICLES (ПО ТЕМЕ)
     ============================================================ */

  spawnLineParticles: function() {
    if (!this.lineParticleType) return;
    if (Math.random() > 0.15) return;

    var keys = [];
    for (var ci in this.playerPaths) {
      if (this.playerPaths[ci] && this.playerPaths[ci].length > 1) keys.push(ci);
    }
    if (keys.length === 0) return;

    var key = keys[Math.floor(Math.random() * keys.length)];
    var cells = this.playerPaths[key];
    var cell = cells[Math.floor(Math.random() * cells.length)];
    var colorIdx = parseInt(key);
    var color = this.palette[colorIdx % this.palette.length];

    var x = this.offsetX + cell.x * this.cellSize + this.cellSize / 2;
    var y = this.offsetY + cell.y * this.cellSize + this.cellSize / 2;

    var t = this.lineParticleType;
    var p = null;

    switch (t) {
      case 'sakura_petal':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 1.5, vy: -0.5 - Math.random() * 0.8, life: 1.6, maxLife: 1.6, color: color, size: 12, type: 'petal', rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.15 };
        break;
      case 'lavender_petal':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 1.0, vy: -0.3 - Math.random() * 0.5, life: 1.8, maxLife: 1.8, color: color, size: 10, type: 'petal', rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.1 };
        break;
      case 'snowflake':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 0.4, vy: 0.5 + Math.random() * 0.6, life: 2.0, maxLife: 2.0, color: 0xffffff, size: 10, type: 'snowflake' };
        break;
      case 'confetti':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3 - 1, life: 1.2, maxLife: 1.2, color: color, size: 8, type: 'confetti', rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.4 };
        break;
      case 'fire_dot':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 0.8, vy: -1 - Math.random() * 1, life: 1.0, maxLife: 1.0, color: color, size: 10, type: 'fire_dot' };
        break;
      case 'leaf':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 1.2, vy: 0.4 + Math.random() * 0.6, life: 1.6, maxLife: 1.6, color: color, size: 12, type: 'leaf', rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.12 };
        break;
      case 'dust':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 2.5, vy: (Math.random() - 0.5) * 2.5, life: 1.0, maxLife: 1.0, color: color, size: 6, type: 'dust' };
        break;
      case 'bubble':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 0.5, vy: -0.5 - Math.random() * 0.5, life: 1.8, maxLife: 1.8, color: color, size: 16, type: 'bubble_line' };
        break;
      case 'neon_spark':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 3.5, vy: (Math.random() - 0.5) * 3.5, life: 0.8, maxLife: 0.8, color: color, size: 8, type: 'neon_spark' };
        break;
      case 'aurora_wisp':
        p = { x: x, y: y, vx: (Math.random() - 0.5) * 1.2, vy: -0.4 - Math.random() * 0.6, life: 1.8, maxLife: 1.8, color: color, size: 16, type: 'aurora_wisp' };
        break;
    }

    if (p) this.lineParticles.push(p);
  },

  /* ============================================================
     UPDATE — вся анимация частиц
     ============================================================ */

  update: function(time, delta) {
    if (this._ended) return;

    if (this.themeGlitch) {
      this.glitchTimer += delta;
      if (this.glitchTimer > 50) {
        this.glitchTimer = 0;
        this.glitchJitter = (Math.random() - 0.5) * 4;
        this.redrawPaths();
      }
    }

    this.spawnLineParticles();
    this._updateTrailParticles(delta);
    this._updateLineParticles(delta);
    this._updateSparkles(delta);
    this._updateFireworks(delta);
  },

  _updateTrailParticles: function(delta) {
    if (!this.trailParticles || !this.trailGraphics) return;
    this.trailGraphics.clear();

    for (var i = this.trailParticles.length - 1; i >= 0; i--) {
      var p = this.trailParticles[i];

      if (p.type === 'quantum') {
        p.life -= delta / 1000;
        if (p.life <= 0) { this.trailParticles.splice(i, 1); continue; }
        p.teleportTimer += delta / 1000;
        if (p.teleportTimer >= p.teleportInterval) {
          p.teleportTimer = 0;
          p.x += (Math.random() - 0.5) * 60;
          p.y += (Math.random() - 0.5) * 60;
          p.phase = Math.random() * Math.PI * 2;
        }
        var blink = Math.abs(Math.sin(Date.now() / 100 + p.phase));
        var alpha = (p.life / p.maxLife) * blink;
        this.trailGraphics.fillStyle(p.color, alpha * 0.4);
        this.trailGraphics.fillCircle(p.x, p.y, p.size * 2);
        this.trailGraphics.fillStyle(0xffffff, alpha * 0.8);
        this.trailGraphics.fillCircle(p.x, p.y, p.size * 0.5);
        this.trailGraphics.fillStyle(p.color, alpha);
        this.trailGraphics.fillCircle(p.x, p.y, p.size);
        continue;
      }

      if (p.type === 'anime_heart' || p.type === 'anime_ribbon' || p.type === 'anime_bow') {
        if (p.vx) p.x += p.vx;
        if (p.vy) p.y += p.vy;
        if (p.rot !== undefined && p.rotSpeed !== undefined) p.rot += p.rotSpeed;
        p.life -= delta / 1000;
        if (p.life <= 0) { this.trailParticles.splice(i, 1); continue; }
        var alpha = p.life / p.maxLife;
        var size = p.size * alpha;
        if (p.type === 'anime_heart') this.drawHeart(this.trailGraphics, p.x, p.y, size, p.color, alpha);
        else if (p.type === 'anime_ribbon') this.drawRibbon(this.trailGraphics, p.x, p.y, size, p.color, alpha, p.rot);
        else this.drawBow(this.trailGraphics, p.x, p.y, size, p.color, alpha, p.rot);
        continue;
      }

      if (p.vx) p.x += p.vx;
      if (p.vy) p.y += p.vy;
      if (p.rot !== undefined && p.rotSpeed !== undefined) p.rot += p.rotSpeed;
      p.life -= delta / 1000;
      if (p.life <= 0) { this.trailParticles.splice(i, 1); continue; }
      var alpha = p.life / p.maxLife;

      this._drawTrailParticle(p, alpha);
    }

    this._drawWebAndConstellation();
  },

  _drawTrailParticle: function(p, alpha) {
    var g = this.trailGraphics;

    switch (p.type) {
      case 'black_hole':
        if (p.targetX !== undefined) {
          var dx = p.targetX - p.x, dy = p.targetY - p.y;
          p.vx += dx * 0.08; p.vy += dy * 0.08;
          p.x += p.vx; p.y += p.vy;
        }
        if (p.glow) {
          g.fillStyle(p.color, alpha * 0.3);
          g.fillCircle(p.x, p.y, p.size * (1 - alpha + 0.3) * 2.2);
        }
        g.fillStyle(p.color, alpha);
        g.fillCircle(p.x, p.y, p.size * (1 - alpha + 0.3));
        return;

      case 'comet_head':
        g.fillStyle(0xffffff, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffd93d, alpha * 0.6); g.fillCircle(p.x, p.y, p.size * alpha * 1.5);
        return;

      case 'comet_tail':
        g.fillStyle(p.color, alpha * 0.8); g.fillCircle(p.x, p.y, p.size * alpha);
        return;

      case 'magic':
        g.fillStyle(p.color, alpha * 0.4); g.fillCircle(p.x, p.y, p.size * alpha * 2);
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
        return;

      case 'ghost':
        g.fillStyle(0xffffff, alpha * 0.5); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffffff, alpha * 0.3); g.fillCircle(p.x, p.y, p.size * alpha * 1.5);
        return;

      case 'curse':
      case 'paint':
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
        return;

      case 'star_burst':
        var s = p.size * alpha;
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, s);
        g.fillStyle(0xffffff, alpha * 0.7); g.fillCircle(p.x, p.y, s * 0.4);
        return;

      case 'nebula':
        g.fillStyle(p.color, alpha * 0.3); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(p.color, alpha * 0.5); g.fillCircle(p.x, p.y, p.size * alpha * 0.6);
        return;

      case 'crystal':
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffffff, alpha * 0.5);
        g.fillCircle(p.x - p.size * 0.2 * alpha, p.y - p.size * 0.2 * alpha, p.size * 0.3 * alpha);
        return;

      case 'web_node':
        g.fillStyle(p.color, alpha * 0.25); g.fillCircle(p.x, p.y, p.size * alpha);
        return;

      case 'constellation_star':
        var s = p.size * alpha;
        g.fillStyle(p.color, alpha * 0.3); g.fillCircle(p.x, p.y, s);
        g.fillStyle(0xffffff, alpha * 0.3); g.fillCircle(p.x, p.y, s * 0.4);
        return;

      case 'star':
      case 'lightning':
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffffff, alpha * 0.8); g.fillCircle(p.x, p.y, p.size * alpha * 0.4);
        return;

      case 'sakura':
      case 'leaves':
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffffff, alpha * 0.4);
        g.fillCircle(p.x - p.size * 0.2, p.y - p.size * 0.2, p.size * 0.3 * alpha);
        return;

      case 'snowflake':
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffffff, alpha * 0.9); g.fillCircle(p.x, p.y, p.size * alpha * 0.5);
        return;

      case 'butterflies':
        g.fillStyle(p.color, alpha);
        g.fillCircle(p.x - p.size * 0.4 * alpha, p.y, p.size * 0.5 * alpha);
        g.fillCircle(p.x + p.size * 0.4 * alpha, p.y, p.size * 0.5 * alpha);
        return;

      case 'bubbles_trail':
        g.strokeStyle = p.color; g.lineWidth = 2; g.globalAlpha = alpha;
        g.beginPath(); g.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); g.stroke();
        g.globalAlpha = 1;
        return;

      case 'aurora':
        g.fillStyle(p.color, alpha * 0.7); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffffff, alpha * 0.4); g.fillCircle(p.x, p.y, p.size * alpha * 0.5);
        return;

      default:
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
    }
  },

  _drawWebAndConstellation: function() {
    var webNodes = [], constNodes = [];
    for (var i = 0; i < this.trailParticles.length; i++) {
      var p = this.trailParticles[i];
      if (p.type === 'web_node') webNodes.push(p);
      if (p.type === 'constellation_star') constNodes.push(p);
    }
    if (webNodes.length > 1) {
      this.trailGraphics.lineStyle(0.5, 0xffffff, 0.25);
      for (var i = 0; i < webNodes.length; i++) {
        for (var j = i + 1; j < webNodes.length; j++) {
          var dx = webNodes[i].x - webNodes[j].x, dy = webNodes[i].y - webNodes[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < 45) {
            this.trailGraphics.lineBetween(webNodes[i].x, webNodes[i].y, webNodes[j].x, webNodes[j].y);
          }
        }
      }
    }
    if (constNodes.length > 1) {
      this.trailGraphics.lineStyle(0.5, 0xffd93d, 0.3);
      for (var i = 0; i < constNodes.length; i++) {
        for (var j = i + 1; j < constNodes.length; j++) {
          var dx = constNodes[i].x - constNodes[j].x, dy = constNodes[i].y - constNodes[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < 55) {
            this.trailGraphics.lineBetween(constNodes[i].x, constNodes[i].y, constNodes[j].x, constNodes[j].y);
          }
        }
      }
    }
  },

  _updateLineParticles: function(delta) {
    if (!this.lineParticles || !this.trailGraphics) return;
    for (var i = this.lineParticles.length - 1; i >= 0; i--) {
      var p = this.lineParticles[i];
      if (p.vx) p.x += p.vx;
      if (p.vy) p.y += p.vy;
      if (p.rot !== undefined && p.rotSpeed !== undefined) p.rot += p.rotSpeed;
      p.life -= delta / 1000;
      if (p.life <= 0) { this.lineParticles.splice(i, 1); continue; }
      var alpha = p.life / p.maxLife;
      var g = this.trailGraphics;

      if (p.type === 'petal') {
        g.fillStyle(p.color, alpha * 0.9); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffffff, alpha * 0.4);
        g.fillCircle(p.x - p.size * 0.2, p.y - p.size * 0.2, p.size * 0.3 * alpha);
      } else if (p.type === 'snowflake') {
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffffff, alpha * 0.9); g.fillCircle(p.x, p.y, p.size * alpha * 0.5);
      } else if (p.type === 'confetti') {
        g.fillStyle(p.color, alpha);
        g.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.3, p.size, p.size * 0.6);
      } else if (p.type === 'fire_dot') {
        g.fillStyle(p.color, alpha * 0.4); g.fillCircle(p.x, p.y, p.size * alpha * 1.8);
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffffff, alpha * 0.7); g.fillCircle(p.x, p.y, p.size * alpha * 0.4);
      } else if (p.type === 'leaf') {
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffffff, alpha * 0.3);
        g.fillCircle(p.x - p.size * 0.2, p.y - p.size * 0.2, p.size * 0.3 * alpha);
      } else if (p.type === 'dust') {
        g.fillStyle(p.color, alpha * 0.9); g.fillCircle(p.x, p.y, p.size * alpha);
      } else if (p.type === 'bubble_line') {
        g.strokeStyle = p.color; g.lineWidth = 2; g.globalAlpha = alpha * 0.7;
        g.beginPath(); g.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); g.stroke();
        g.fillStyle(0xffffff, alpha * 0.3);
        g.fillCircle(p.x - p.size * 0.3 * alpha, p.y - p.size * 0.3 * alpha, p.size * 0.2 * alpha);
        g.globalAlpha = 1;
      } else if (p.type === 'neon_spark') {
        g.fillStyle(p.color, alpha * 0.5); g.fillCircle(p.x, p.y, p.size * alpha * 2);
        g.fillStyle(p.color, alpha); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(0xffffff, alpha * 0.8); g.fillCircle(p.x, p.y, p.size * alpha * 0.4);
      } else if (p.type === 'aurora_wisp') {
        g.fillStyle(p.color, alpha * 0.5); g.fillCircle(p.x, p.y, p.size * alpha);
        g.fillStyle(p.color, alpha * 0.8); g.fillCircle(p.x, p.y, p.size * alpha * 0.6);
        g.fillStyle(0xffffff, alpha * 0.4); g.fillCircle(p.x, p.y, p.size * alpha * 0.3);
      }
    }
  },

  _updateSparkles: function(delta) {
    if (this.themeSparkle && this.playerPaths) {
      if (Math.random() < 0.08) {
        var self = this;
        var keys = Object.keys(this.playerPaths).filter(function(k) { return self.playerPaths[k].length > 1; });
        if (keys.length > 0) {
          var key = keys[Math.floor(Math.random() * keys.length)];
          var cells = this.playerPaths[key];
          var c = cells[Math.floor(Math.random() * cells.length)];
          this.sparkles.push({
            x: this.offsetX + c.x * this.cellSize + this.cellSize / 2,
            y: this.offsetY + c.y * this.cellSize + this.cellSize / 2,
            life: 0.6, maxLife: 0.6, size: 8
          });
        }
      }
    }
    if (!this.sparklesGraphics) return;
    this.sparklesGraphics.clear();
    for (var i = this.sparkles.length - 1; i >= 0; i--) {
      var sp = this.sparkles[i];
      sp.life -= delta / 1000;
      if (sp.life <= 0) { this.sparkles.splice(i, 1); continue; }
      var alpha = sp.life / sp.maxLife;
      var size = sp.size * alpha;
      this.sparklesGraphics.fillStyle(0xffffff, alpha);
      this.sparklesGraphics.fillCircle(sp.x, sp.y, size);
      this.sparklesGraphics.fillStyle(0xffffff, alpha * 0.5);
      for (var a = 0; a < 4; a++) {
        var angle = a * Math.PI / 2;
        this.sparklesGraphics.fillCircle(
          sp.x + Math.cos(angle) * size * 1.5,
          sp.y + Math.sin(angle) * size * 1.5,
          size * 0.4
        );
      }
    }
  },

  _updateFireworks: function(delta) {
    if (!this.fireworks || !this.fireworksGraphics) return;
    this.fireworksGraphics.clear();
    for (var i = this.fireworks.length - 1; i >= 0; i--) {
      var f = this.fireworks[i];
      f.x += f.vx; f.y += f.vy; f.vy += 0.08; f.vx *= 0.98;
      f.life -= delta / 1000;
      if (f.life <= 0) { this.fireworks.splice(i, 1); continue; }
      var alpha = f.life / f.maxLife;
      this.fireworksGraphics.fillStyle(f.color, alpha);
      this.fireworksGraphics.fillCircle(f.x, f.y, f.size * alpha);
    }
  },

  spawnFirework: function(x, y) {
    var colors = [0xff4757, 0x1e90ff, 0x2ed573, 0xffa502, 0xa55eea, 0x00d2d3, 0xff6b81, 0xfeca57];
    for (var i = 0; i < 30; i++) {
      var angle = (Math.PI * 2 / 30) * i + Math.random() * 0.2;
      var speed = 3 + Math.random() * 5;
      this.fireworks.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.5, maxLife: 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 3
      });
    }
  },

  /* ============================================================
     АНИМЕ-ФОРМЫ
     ============================================================ */

  drawHeart: function(g, x, y, size, color, alpha) {
    g.fillStyle(color, alpha);
    g.fillCircle(x - size * 0.3, y - size * 0.2, size * 0.45);
    g.fillCircle(x + size * 0.3, y - size * 0.2, size * 0.45);
    g.fillTriangle(x - size * 0.7, y, x + size * 0.7, y, x, y + size * 0.8);
    g.fillStyle(0xffffff, alpha * 0.4);
    g.fillCircle(x - size * 0.35, y - size * 0.3, size * 0.15);
  },

  drawRibbon: function(g, x, y, size, color, alpha, rot) {
    var c = Math.cos(rot || 0), s = Math.sin(rot || 0);
    function rp(dx, dy) { return { x: x + dx * c - dy * s, y: y + dx * s + dy * c }; }
    g.fillStyle(color, alpha);
    var p1 = rp(-size * 0.5, -size * 0.2), p2 = rp(size * 0.5, size * 0.2);
    var p3 = rp(size * 0.5, -size * 0.2), p4 = rp(-size * 0.5, size * 0.2);
    g.fillTriangle(p1.x, p1.y, p2.x, p2.y, x, y);
    g.fillTriangle(p3.x, p3.y, p4.x, p4.y, x, y);
    g.fillStyle(0xffffff, alpha * 0.3);
    g.fillCircle(x, y, size * 0.2);
  },

  drawBow: function(g, x, y, size, color, alpha, rot) {
    var c = Math.cos(rot || 0), s = Math.sin(rot || 0);
    function rp(dx, dy) { return { x: x + dx * c - dy * s, y: y + dx * s + dy * c }; }
    g.fillStyle(color, alpha);
    var l1 = rp(-size * 0.6, -size * 0.4), l2 = rp(-size * 0.1, 0), l3 = rp(-size * 0.6, size * 0.4);
    g.fillTriangle(l1.x, l1.y, l2.x, l2.y, l3.x, l3.y);
    var r1 = rp(size * 0.6, -size * 0.4), r2 = rp(size * 0.1, 0), r3 = rp(size * 0.6, size * 0.4);
    g.fillTriangle(r1.x, r1.y, r2.x, r2.y, r3.x, r3.y);
    g.fillCircle(x, y, size * 0.2);
    g.fillStyle(0xffffff, alpha * 0.4);
    g.fillCircle(x - size * 0.05, y - size * 0.05, size * 0.1);
  },

  /* ============================================================
     CLEANUP ДЛЯ shutdown
     ============================================================ */

  cleanupStandardScene: function() {
    if (this.pathsCanvasEl && this.pathsCanvasEl.parentNode) {
      this.pathsCanvasEl.parentNode.removeChild(this.pathsCanvasEl);
    }
    this.pathsCanvasEl = null;
    this.pathCtx = null;
    document.body.style.cursor = 'default';
    if (window.SoundManager) SoundManager.stopMusic();
  }
};

/* Применяет миксин, НЕ перезаписывая методы, определённые в сцене */
function applyFlowSceneMixin(Proto) {
  for (var k in FlowSceneMixin) {
    if (FlowSceneMixin.hasOwnProperty(k) && !Proto.hasOwnProperty(k)) {
      Proto[k] = FlowSceneMixin[k];
    }
  }
}

window.FlowSceneMixin = FlowSceneMixin;
window.applyFlowSceneMixin = applyFlowSceneMixin;
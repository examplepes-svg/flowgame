/* ============================================================
   КАРТА МИРА — данные и логика
   ============================================================ */

/* name — ключ локализации (region.japan, region.italy, ...) */
var WORLD_REGIONS = {
  japan:     { id: 'japan',     name: 'region.japan',     flag: '🇯🇵', x: 13.75, y: 23.24, wave: 1 },
  italy:     { id: 'italy',     name: 'region.italy',     flag: '🇮🇹', x: 37.92, y: 18.98, wave: 1 },
  france:    { id: 'france',    name: 'region.france',    flag: '🇫🇷', x: 14.17, y: 56.76, wave: 1 },
  russia:    { id: 'russia',    name: 'region.russia',    flag: '🇷🇺', x: 62.08, y: 19.72, wave: 2 },
  usa:       { id: 'usa',       name: 'region.usa',       flag: '🇺🇸', x: 87.81, y: 27.69, wave: 2 },
  brazil:    { id: 'brazil',    name: 'region.brazil',    flag: '🇧🇷', x: 42.40, y: 50.09, wave: 2 },
  china:     { id: 'china',     name: 'region.china',     flag: '🇨🇳', x: 67.50, y: 55.56, wave: 3 },
  germany:   { id: 'germany',   name: 'region.germany',   flag: '🇩🇪', x: 89.58, y: 62.96, wave: 3 },
  australia: { id: 'australia', name: 'region.australia', flag: '🇦🇺', x: 31.77, y: 83.06, wave: 3 },
  iceland:   { id: 'iceland',   name: 'region.iceland',   flag: '🇮🇸', x: 60.73, y: 84.72, wave: 3 }
};

var WAVE_UNLOCK = {
  1: { levelsRequired: 0 },
  2: { levelsRequired: 30 },
  3: { levelsRequired: 60 }
};

var MAP_FOGS = {
  russia:    { wave: 2, file: 'fog_russia.png' },
  usa:       { wave: 2, file: 'fog_usa.png' },
  brazil:    { wave: 2, file: 'fog_brazil.png' },
  china:     { wave: 3, file: 'fog_china.png' },
  germany:   { wave: 3, file: 'fog_germany.png' },
  australia: { wave: 3, file: 'fog_australia.png' },
  iceland:   { wave: 3, file: 'fog_iceland.png' }
};

/* Базовая пропорция фона карты.
   2000×1125 = 16:9, соответствует world_map.webp.
   Проценты регионов (x/y) посчитаны под эту пропорцию. */
var WORLD_MAP_BASE_W = 2000;
var WORLD_MAP_BASE_H = 1125;

/* ============================================================
   ПРОГРЕСС
   ============================================================ */

var WorldMapProgress = {
  get: function() {
    try {
      var raw = localStorage.getItem('flow_world_map');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { pawn: null, regionProgress: {}, totalLevels: 0, revealedWaves: [], currentRegion: null };
  },

  save: function(data) {
    try { localStorage.setItem('flow_world_map', JSON.stringify(data)); } catch (e) {}
  },

  setRegionProgress: function(regionId, completed) {
    var data = this.get();
    var capped = Math.min(completed, 10);
    data.regionProgress[regionId] = { completed: capped };
    data.totalLevels = Object.keys(data.regionProgress)
      .reduce(function(sum, key) { return sum + (data.regionProgress[key].completed || 0); }, 0);
    this.save(data);
    return data;
  },

  setPawn: function(pawn) {
    var data = this.get();
    data.pawn = pawn;
    this.save(data);
  },

  isRegionUnlocked: function(regionId) {
    var region = WORLD_REGIONS[regionId];
    if (!region) return false;
    var data = this.get();
    return data.totalLevels >= WAVE_UNLOCK[region.wave].levelsRequired;
  },

  getRegionCompleted: function(regionId) {
    var data = this.get();
    var completed = (data.regionProgress[regionId] && data.regionProgress[regionId].completed) || 0;
    return Math.min(completed, 10);
  },

  getCurrentRegion: function() {
    var data = this.get();
    if (data.currentRegion && WORLD_REGIONS[data.currentRegion]) {
      return data.currentRegion;
    }
    return null;
  },

  setCurrentRegion: function(regionId) {
    var data = this.get();
    data.currentRegion = regionId;
    this.save(data);
  },

  isWaveRevealed: function(wave) {
    var data = this.get();
    if (!data.revealedWaves) data.revealedWaves = [];
    return data.revealedWaves.indexOf(wave) !== -1;
  },

  markWaveRevealed: function(wave) {
    var data = this.get();
    if (!data.revealedWaves) data.revealedWaves = [];
    if (data.revealedWaves.indexOf(wave) === -1) {
      data.revealedWaves.push(wave);
      this.save(data);
    }
  }
};

/* ============================================================
   ХЕЛПЕР: получить локализованное имя региона
   ============================================================ */
function getRegionName(regionId) {
  var region = WORLD_REGIONS[regionId];
  if (!region) return regionId;
  return t(region.name, regionId);
}

/* ============================================================
   UI КАРТЫ
   ============================================================ */

var WorldMapUI = {

  /* Мобилка в портрете? */
  isPortraitMobile: function() {
    return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
  },

  /* ============================================================
     RENDER
     ============================================================ */
  render: function() {
    var overlay = document.getElementById('world-map-overlay');
    if (!overlay) return;

    // Снимаем слушатели предыдущего рендера (если были)
    if (WorldMapUI._portraitCleanup) {
      WorldMapUI._portraitCleanup();
    }

    var progress = WorldMapProgress.get();
    var totalLevels = progress.totalLevels;
    var isPortraitMobile = WorldMapUI.isPortraitMobile();

    // ---- Собираем «внутренности» карты (то, что движется) ----
    var innerHtml = '';

    // Фон
    innerHtml += '<img src="assets/map/world_map.webp" class="world-map-bg" alt="">';

    // Туманы
    Object.keys(MAP_FOGS).forEach(function(regionId) {
      var fog = MAP_FOGS[regionId];
      var region = WORLD_REGIONS[regionId];
      if (!region) return;
      if (WorldMapProgress.isRegionUnlocked(regionId)) return;

      innerHtml += '<img src="assets/fog/' + fog.file + '" ' +
                   'class="map-fog map-fog-wave-' + fog.wave + '" ' +
                   'data-region="' + regionId + '" ' +
                   'data-wave="' + fog.wave + '" ' +
                   'alt="">';
    });

    // Регионы
    Object.keys(WORLD_REGIONS).forEach(function(id) {
      innerHtml += WorldMapUI.renderRegion(WORLD_REGIONS[id]);
    });

    // Фишка игрока
    if (progress.pawn) {
      var pawnFile = progress.pawn === 'girl' ? 'pawn_girl.png' : 'pawn_boy.png';
      var currentRegionId = WorldMapProgress.getCurrentRegion();
      if (!currentRegionId) {
        currentRegionId = WorldMapUI.findLastUnlockedRegion();
        if (currentRegionId) WorldMapProgress.setCurrentRegion(currentRegionId);
      }
      if (currentRegionId && WORLD_REGIONS[currentRegionId]) {
        var cur = WORLD_REGIONS[currentRegionId];
        innerHtml += '<img src="assets/pawns/' + pawnFile + '" class="player-pawn" ' +
                     'style="left: ' + cur.x + '%; top: ' + (cur.y + 9) + '%;" alt="pawn">';
      }
    }

    // ---- Финальная сборка ----
    var html = '';

    // 1. Header
    html += '<div class="world-map-header">' +
            '<span class="world-map-title">' + t('region.travel', '🌍 ПУТЕШЕСТВИЕ') + '</span>' +
            '<span class="world-map-progress">' + t('region.progress', 'Пройдено: ') + totalLevels + ' / 100</span>' +
            '</div>';

    // 2. Карта — обёрнутая или нет
    if (isPortraitMobile) {
      html += '<div class="world-map-stage" id="world-map-stage">' +
              '<div class="world-map-canvas" id="world-map-canvas">' +
              innerHtml +
              '</div>' +
              '</div>';
    } else {
      html += innerHtml;
    }

    // 3. Кнопка назад
    html += '<div class="world-map-back" id="world-map-back">' +
            '<img src="assets/ui/btn_back.png" alt="' + t('common.back', 'Назад') + '">' +
            '</div>';

    overlay.innerHTML = html;
    WorldMapUI.attachEvents();

    // Для портретной мобилки — pan/центрирование
    if (isPortraitMobile) {
      WorldMapUI.setupPortraitStage();
    }
  },

  /* ============================================================
     РЕГИОН
     ============================================================ */
  renderRegion: function(region) {
    var unlocked = WorldMapProgress.isRegionUnlocked(region.id);
    var completed = WorldMapProgress.getRegionCompleted(region.id);
    var regionClass = 'region-node' + (unlocked ? '' : ' locked');
    var regionName = getRegionName(region.id);

    var html = '<div class="' + regionClass + '" ' +
               'data-region="' + region.id + '" ' +
               'style="left: ' + region.x + '%; top: ' + region.y + '%;">';

    if (unlocked) {
      html += '<div class="region-mini-map">';
      html += '<img src="assets/regions/' + region.id + '.webp" alt="' + regionName + '">';
      html += '</div>';

      html += '<div class="region-flag">' +
              '<img src="assets/flags/flag_' + region.id + '.png" alt="' + regionName + '">' +
              '</div>';

      html += '<div class="region-name">' + regionName + '</div>';
      html += '<div class="region-progress">' + completed + ' / 10</div>';
    } else {
      html += '<div class="region-mini-map region-mini-map-hidden"></div>';
      html += '<div class="region-flag region-flag-unknown">?</div>';
      html += '<img src="assets/ui/icon_lock.png" class="region-lock" alt="🔒">';
      html += '<div class="region-name region-name-unknown">?</div>';
    }

    html += '</div>';
    return html;
  },

  findLastUnlockedRegion: function() {
    var lastRegionId = null;
    var maxProgress = -1;

    Object.keys(WORLD_REGIONS).forEach(function(id) {
      var completed = WorldMapProgress.getRegionCompleted(id);
      var unlocked = WorldMapProgress.isRegionUnlocked(id);
      if (unlocked && completed > maxProgress) {
        maxProgress = completed;
        lastRegionId = id;
      }
    });

    if (!lastRegionId) {
      var regionIds = Object.keys(WORLD_REGIONS);
      for (var i = 0; i < regionIds.length; i++) {
        if (WorldMapProgress.isRegionUnlocked(regionIds[i])) {
          lastRegionId = regionIds[i];
          break;
        }
      }
    }

    if (!lastRegionId) lastRegionId = 'japan';
    return lastRegionId;
  },

  /* ============================================================
     СОБЫТИЯ
     ============================================================ */
  attachEvents: function() {
    document.querySelectorAll('.region-node').forEach(function(el) {
      el.addEventListener('click', function() {
        WorldMapUI.onRegionClick(el.dataset.region);
      });
    });

    var backBtn = document.getElementById('world-map-back');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        if (window.SoundManager) SoundManager.click();
        WorldMapUI.close();
        if (window.goToMainMenu) goToMainMenu();
      });
    }
  },

  onRegionClick: function(regionId) {
    var region = WORLD_REGIONS[regionId];
    if (!region) return;

    if (window.SoundManager) SoundManager.click();

    if (!WorldMapProgress.isRegionUnlocked(regionId)) {
      if (window.SoundManager) SoundManager.error();
      var required = WAVE_UNLOCK[region.wave].levelsRequired;
      var data = WorldMapProgress.get();
      var remaining = required - data.totalLevels;
      if (window.UI && UI.showToast) {
        UI.showToast(t('region.locked_wave', '🔒 Пройди ещё {n} уровней', { n: remaining }));
      }
      return;
    }

    WorldMapProgress.setCurrentRegion(regionId);
    RegionScreen.open(regionId);
  },

  /* ============================================================
     SHOW / CLOSE
     ============================================================ */
  show: function() {
    var overlay = document.getElementById('world-map-overlay');
    if (!overlay) return;

    var progress = WorldMapProgress.get();
    if (!progress.pawn) {
      WorldMapUI.showPawnSelection();
      return;
    }

    this.render();
    overlay.classList.add('active');

    WorldMapUI.checkWaveReveal();
  },

  close: function() {
    if (WorldMapUI._portraitCleanup) {
      WorldMapUI._portraitCleanup();
    }
    var overlay = document.getElementById('world-map-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  /* ============================================================
     ВОЛНЫ / ТУМАН
     ============================================================ */
  checkWaveReveal: function() {
    var data = WorldMapProgress.get();
    var levels = data.totalLevels;

    if (levels >= 30 && !WorldMapProgress.isWaveRevealed(2)) {
      setTimeout(function() { WorldMapUI.revealWave(2); }, 500);
    }
    if (levels >= 60 && !WorldMapProgress.isWaveRevealed(3)) {
      setTimeout(function() { WorldMapUI.revealWave(3); }, 1000);
    }
  },

  revealWave: function(wave) {
    var fogs = document.querySelectorAll('.map-fog-wave-' + wave);
    if (fogs.length === 0) return;

    WorldMapProgress.markWaveRevealed(wave);

    if (window.SoundManager) SoundManager.victory();

    fogs.forEach(function(fog) { fog.classList.add('revealing'); });

    setTimeout(function() { WorldMapUI.render(); }, 2500);

    setTimeout(function() {
      if (window.UI && UI.showToast) {
        UI.showToast(t('region.wave_opened', '🎉 ВОЛНА {n} ОТКРЫТА!', { n: wave }), 2500);
      }
    }, 1000);
  },

  /* ============================================================
     ВЫБОР ФИШКИ
     ============================================================ */
  showPawnSelection: function() {
    var overlay = document.getElementById('world-map-overlay');
    if (!overlay) return;

    var html = '<div class="pawn-select-overlay active" id="pawn-select-overlay">' +
               '<div class="pawn-select-title">' + t('region.select_pawn', 'Выбери путешественника') + '</div>' +
               '<div class="pawn-select-subtitle">' + t('region.select_pawn_sub', 'Он будет двигаться по карте мира') + '</div>' +
               '<div class="pawn-select-choices">' +
               '<div class="pawn-choice" data-pawn="boy">' +
               '<img src="assets/pawns/pawn_boy.png" alt="' + t('region.pawn_boy', 'Макс') + '">' +
               '<div class="pawn-choice-name">' + t('region.pawn_boy', 'Макс') + '</div>' +
               '</div>' +
               '<div class="pawn-choice" data-pawn="girl">' +
               '<img src="assets/pawns/pawn_girl.png" alt="' + t('region.pawn_girl', 'Ая') + '">' +
               '<div class="pawn-choice-name">' + t('region.pawn_girl', 'Ая') + '</div>' +
               '</div>' +
               '</div>' +
               '</div>';

    overlay.innerHTML = html;
    overlay.classList.add('active');

    document.querySelectorAll('.pawn-choice').forEach(function(el) {
      el.addEventListener('click', function() {
        var pawn = el.dataset.pawn;
        if (window.SoundManager) SoundManager.victory();
        WorldMapProgress.setPawn(pawn);

        var firstRegion = WorldMapUI.findLastUnlockedRegion();
        if (firstRegion) WorldMapProgress.setCurrentRegion(firstRegion);

        WorldMapUI.show();
      });
    });
  },

  /* ============================================================
     МОБИЛЬНЫЙ ПОРТРЕТ — PAN + PINCH + ЦЕНТРИРОВАНИЕ
     ============================================================ */
    /* ============================================================
     МОБИЛЬНЫЙ ПОРТРЕТ — PAN + PINCH + ЦЕНТРИРОВАНИЕ
     ============================================================ */
  setupPortraitStage: function() {
    var stage = document.getElementById('world-map-stage');
    var canvas = document.getElementById('world-map-canvas');
    if (!stage || !canvas) return;

    var BASE_W = WORLD_MAP_BASE_W;
    var BASE_H = WORLD_MAP_BASE_H;

    canvas.style.width  = BASE_W + 'px';
    canvas.style.height = BASE_H + 'px';

    var scale = 1, minScale = 1, maxScale = 1;
    var tx = 0, ty = 0;

    // Карта должна ПОКРЫВАТЬ экран целиком (по большей оси),
    // чтобы не было пустых полос по краям. Тогда по одной оси
    // всегда будет что скроллить пальцем.
    function computeBaseScale() {
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      return Math.max(vw / BASE_W, vh / BASE_H);
    }

    function clampPan() {
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var contentW = BASE_W * scale;
      var contentH = BASE_H * scale;

      // Если контент больше viewport — не даём уехать за края
      // (нельзя показать пустоту за пределами карты).
      if (contentW <= vw) {
        tx = (vw - contentW) / 2;
      } else {
        var minTx = vw - contentW;
        if (tx < minTx) tx = minTx;
        if (tx > 0) tx = 0;
      }
      if (contentH <= vh) {
        ty = (vh - contentH) / 2;
      } else {
        var minTy = vh - contentH;
        if (ty < minTy) ty = minTy;
        if (ty > 0) ty = 0;
      }
    }

    function applyTransform() {
      canvas.style.transform =
        'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    }

    function centerOnRegion(regionId) {
      var region = WORLD_REGIONS[regionId];
      if (!region) return;
      var cx = (region.x / 100) * BASE_W * scale;
      var cy = (region.y / 100) * BASE_H * scale;
      tx = window.innerWidth / 2 - cx;
      ty = window.innerHeight / 2 - cy;
      clampPan();
      applyTransform();
    }

    // Init
    scale = computeBaseScale();
    minScale = scale;
    maxScale = scale * 3;
    applyTransform();

    // Стартовое центрирование на текущем регионе
    var focusRegion = WorldMapProgress.getCurrentRegion() ||
                      WorldMapUI.findLastUnlockedRegion();
    if (focusRegion) {
      setTimeout(function() { centerOnRegion(focusRegion); }, 50);
    }

    // === Жесты ===
    var dragging = false;
    var startX = 0, startY = 0, startTx = 0, startTy = 0;
    var pinchDist = 0, pinchScale = 1;
    var movedDistance = 0;

    function onDown(e) {
      var p = e.touches ? e.touches[0] : e;
      startX = p.clientX;
      startY = p.clientY;
      startTx = tx;
      startTy = ty;
      movedDistance = 0;

      if (e.touches && e.touches.length === 2) {
        dragging = false;
        pinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        pinchScale = scale;
      } else {
        dragging = true;
      }
    }

    function onMove(e) {
      // Pinch-zoom
      if (e.touches && e.touches.length === 2) {
        var d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (pinchDist > 0) {
          scale = Math.max(minScale, Math.min(maxScale, pinchScale * (d / pinchDist)));
          clampPan();
          applyTransform();
        }
        e.preventDefault();
        return;
      }
      if (!dragging) return;
      var p = e.touches ? e.touches[0] : e;
      var dx = p.clientX - startX;
      var dy = p.clientY - startY;
      movedDistance = Math.max(movedDistance, Math.hypot(dx, dy));
      tx = startTx + dx;
      ty = startTy + dy;
      clampPan();
      applyTransform();
      e.preventDefault();
    }

    function onUp() {
      dragging = false;
      pinchDist = 0;
    }

    // Отменяем клик по региону, если был drag
    function onClickCapture(e) {
      if (movedDistance > 8) {
        e.stopPropagation();
        e.preventDefault();
      }
    }

    // Resize / поворот экрана
    function onResize() {
      var oldScale = scale;
      var newScale = computeBaseScale();

      // Сохраняем визуальный центр карты при смене масштаба
      var vw = window.innerWidth;
      var vh = window.innerHeight;

      // Точка на карте, которая была в центре экрана
      var centerMapX = (vw / 2 - tx) / oldScale;
      var centerMapY = (vh / 2 - ty) / oldScale;

      scale = newScale;
      minScale = scale;
      maxScale = scale * 3;

      // Возвращаем ту же точку в центр экрана
      tx = vw / 2 - centerMapX * scale;
      ty = vh / 2 - centerMapY * scale;

      clampPan();
      applyTransform();
    }

    stage.addEventListener('touchstart', onDown, { passive: false });
    stage.addEventListener('touchmove', onMove, { passive: false });
    stage.addEventListener('touchend', onUp);
    stage.addEventListener('touchcancel', onUp);
    stage.addEventListener('click', onClickCapture, true);

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // Cleanup
    WorldMapUI._portraitCleanup = function() {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      stage.removeEventListener('touchstart', onDown);
      stage.removeEventListener('touchmove', onMove);
      stage.removeEventListener('touchend', onUp);
      stage.removeEventListener('touchcancel', onUp);
      stage.removeEventListener('click', onClickCapture, true);
      WorldMapUI._portraitCleanup = null;
    };
  }
};

window.WorldMapUI = WorldMapUI;
window.WorldMapProgress = WorldMapProgress;
window.WORLD_REGIONS = WORLD_REGIONS;
window.getRegionName = getRegionName;
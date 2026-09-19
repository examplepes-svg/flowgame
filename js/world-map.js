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
  render: function() {
    var overlay = document.getElementById('world-map-overlay');
    if (!overlay) return;

    var progress = WorldMapProgress.get();
    var totalLevels = progress.totalLevels;

    var html = '';

    // 1. Фон карты
    html += '<img src="assets/map/world_map.webp" class="world-map-bg" alt="">';

    // 2. Туманы
    Object.keys(MAP_FOGS).forEach(function(regionId) {
      var fog = MAP_FOGS[regionId];
      var region = WORLD_REGIONS[regionId];
      if (!region) return;

      var unlocked = WorldMapProgress.isRegionUnlocked(regionId);
      if (unlocked) return;

      html += '<img src="assets/fog/' + fog.file + '" ' +
              'class="map-fog map-fog-wave-' + fog.wave + '" ' +
              'data-region="' + regionId + '" ' +
              'data-wave="' + fog.wave + '" ' +
              'alt="">';
    });

    // 3. Регионы
    Object.keys(WORLD_REGIONS).forEach(function(id) {
      html += WorldMapUI.renderRegion(WORLD_REGIONS[id]);
    });

    // 4. Фишка игрока
    if (progress.pawn) {
      var pawnFile = progress.pawn === 'girl' ? 'pawn_girl.png' : 'pawn_boy.png';
      var currentRegionId = WorldMapProgress.getCurrentRegion();

      // Если нет — ищем последний открытый регион
      if (!currentRegionId) {
        currentRegionId = WorldMapUI.findLastUnlockedRegion();
        if (currentRegionId) {
          WorldMapProgress.setCurrentRegion(currentRegionId);
        }
      }

      if (currentRegionId && WORLD_REGIONS[currentRegionId]) {
        var currentRegion = WORLD_REGIONS[currentRegionId];
        html += '<img src="assets/pawns/' + pawnFile + '" class="player-pawn" ' +
                'style="left: ' + currentRegion.x + '%; top: ' + (currentRegion.y + 9) + '%;" alt="pawn">';
      }
    }

    // 5. Верхняя панель
    html += '<div class="world-map-header">' +
            '<span class="world-map-title">' + t('region.travel', '🌍 ПУТЕШЕСТВИЕ') + '</span>' +
            '<span class="world-map-progress">' + t('region.progress', 'Пройдено: ') + totalLevels + ' / 100</span>' +
            '</div>';

    // 6. Кнопка назад
    html += '<div class="world-map-back" id="world-map-back">' +
            '<img src="assets/ui/btn_back.png" alt="' + t('common.back', 'Назад') + '">' +
            '</div>';

    overlay.innerHTML = html;
    WorldMapUI.attachEvents();
  },

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

    // 1. Ищем регион с максимальным прогрессом
    Object.keys(WORLD_REGIONS).forEach(function(id) {
      var completed = WorldMapProgress.getRegionCompleted(id);
      var unlocked = WorldMapProgress.isRegionUnlocked(id);
      if (unlocked && completed > maxProgress) {
        maxProgress = completed;
        lastRegionId = id;
      }
    });

    // 2. Если ничего не нашли — берём первый открытый
    if (!lastRegionId) {
      var regionIds = Object.keys(WORLD_REGIONS);
      for (var i = 0; i < regionIds.length; i++) {
        if (WorldMapProgress.isRegionUnlocked(regionIds[i])) {
          lastRegionId = regionIds[i];
          break;
        }
      }
    }

    // 3. Fallback — Япония
    if (!lastRegionId) lastRegionId = 'japan';

    return lastRegionId;
  },

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

    // Обновляем текущий регион для фишки
    WorldMapProgress.setCurrentRegion(regionId);

    RegionScreen.open(regionId);
  },

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
    var overlay = document.getElementById('world-map-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  checkWaveReveal: function() {
    var data = WorldMapProgress.get();
    var levels = data.totalLevels;

    if (levels >= 30 && !WorldMapProgress.isWaveRevealed(2)) {
      setTimeout(function() {
        WorldMapUI.revealWave(2);
      }, 500);
    }

    if (levels >= 60 && !WorldMapProgress.isWaveRevealed(3)) {
      setTimeout(function() {
        WorldMapUI.revealWave(3);
      }, 1000);
    }
  },

  revealWave: function(wave) {
    var fogs = document.querySelectorAll('.map-fog-wave-' + wave);
    if (fogs.length === 0) return;

    WorldMapProgress.markWaveRevealed(wave);

    if (window.SoundManager) SoundManager.victory();

    fogs.forEach(function(fog) {
      fog.classList.add('revealing');
    });

    setTimeout(function() {
      WorldMapUI.render();
    }, 2500);

    setTimeout(function() {
      if (window.UI && UI.showToast) {
        UI.showToast(t('region.wave_opened', '🎉 ВОЛНА {n} ОТКРЫТА!', { n: wave }), 2500);
      }
    }, 1000);
  },

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

        // Ставим фишку на первый открытый регион
        var firstRegion = WorldMapUI.findLastUnlockedRegion();
        if (firstRegion) WorldMapProgress.setCurrentRegion(firstRegion);

        WorldMapUI.show();
      });
    });
  }
};

window.WorldMapUI = WorldMapUI;
window.WorldMapProgress = WorldMapProgress;
window.WORLD_REGIONS = WORLD_REGIONS;
window.getRegionName = getRegionName;
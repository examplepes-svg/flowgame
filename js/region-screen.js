/* ============================================================
   ЭКРАН РЕГИОНА — 10 нодов извилистой тропой
   ============================================================ */

var RegionScreen = {
  currentRegion: null,

  open: function(regionId) {
    var region = WORLD_REGIONS[regionId];
    if (!region) return;

    this.currentRegion = region;
    WorldMapUI.close();
    this.render(region);

    var overlay = document.getElementById('region-overlay');
    if (overlay) overlay.classList.add('active');
  },

  /* ============================================================
     РЕНДЕР ЭКРАНА
     ============================================================ */
  render: function(region) {
    var overlay = document.getElementById('region-overlay');
    if (!overlay) return;

    var completed = WorldMapProgress.getRegionCompleted(region.id);
    var regionName = getRegionName(region.id);
    var isPortrait = this.isPortraitLayout();
    var rewardClaimed = localStorage.getItem('flow_region_victory_' + region.id) === 'true';

    var html = '';
    html += '<img src="assets/regions/' + region.id + '.webp" class="region-screen-bg" alt="">';
    html += '<div class="region-screen-dim"></div>';

    // Шапка — без флага
    html += '<div class="region-screen-header">' +
            '<span class="region-screen-title">' + regionName + '</span>' +
            '<span class="region-screen-progress">' + completed + ' / 10</span>' +
            '</div>';

    // Кнопка подарка — отдельно, справа сверху
    var giftClass = 'region-rewards-btn' + (rewardClaimed ? ' claimed' : ' pulsing');
    html += '<button class="' + giftClass + '" id="region-rewards-btn" ' +
            'aria-label="' + t('region.rewards_btn', 'Награды региона') + '">🎁</button>';

    // SVG-слой для пунктира + слой нод
    var coords = this.computeAllNodeCoords(region.id, isPortrait);

    html += '<svg class="region-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">';
    html += this.renderPathSegments(coords, completed);
    html += '</svg>';

    html += '<div class="region-nodes">';
    for (var i = 0; i < 10; i++) {
      html += this.renderNode(i + 1, completed, coords[i]);
    }
    html += '</div>';

    html += '<div class="region-screen-back" id="region-back">' +
            '<img src="assets/ui/btn_back.png" alt="' + t('common.back', 'Назад') + '">' +
            '</div>';

    overlay.innerHTML = html;
    this.attachEvents(region);
  },

  /* ============================================================
     ОПРЕДЕЛЕНИЕ ОРИЕНТАЦИИ РАСКЛАДКИ
     ============================================================ */
  isPortraitLayout: function() {
    return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
  },

  /* ============================================================
     КООРДИНАТЫ НОД
     Десктоп / ландшафт — горизонтальная змейка (слева-направо, зигзаг сверху-вниз)
     Портрет — вертикальная змейка (снизу-вверх, зигзаг слева-направо)
     ============================================================ */
  computeAllNodeCoords: function(regionId, isPortrait) {
    var seed = this.hashString(regionId);
    var rng = this.mulberry32(seed);
    var coords = [];

    for (var i = 0; i < 10; i++) {
      var p = i / 9;  // 0..1
      var x, y;

      if (isPortrait) {
        // Снизу-вверх, зигзаг слева-направо
        y = 85 - p * 70;                                 // 85% → 15%
        x = 50 + Math.sin(p * Math.PI * 2) * 30;         // зигзаг ±30%
      } else {
        // Слева-направо, зигзаг сверху-вниз
        x = 8 + p * 84;                                  // 8% → 92%
        y = 50 + Math.sin(p * Math.PI * 2) * 18;         // зигзаг ±18%
      }

      // Лёгкий рандом, кроме крайних точек (1 и 10)
      if (i > 0 && i < 9) {
        x += (rng() - 0.5) * 5;   // ±2.5%
        y += (rng() - 0.5) * 5;
      }

      // Ограничения, чтобы не улететь за пределы
      x = Math.max(5, Math.min(95, x));
      y = Math.max(5, Math.min(95, y));

      coords.push({ x: x, y: y });
    }

    return coords;
  },

  /* Детерминированный хеш строки для seed */
  hashString: function(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  },

  /* Быстрый PRNG с seed */
  mulberry32: function(a) {
    return function() {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  },

  /* ============================================================
     ПУНКТИРНАЯ ЛИНИЯ МЕЖДУ НОДАМИ
     Пройденные сегменты — золотые, будущие — серые.
     ============================================================ */
  renderPathSegments: function(coords, completed) {
    var html = '';
    // coords.length = 10, сегментов = 9
    // Сегмент i соединяет coords[i] и coords[i+1]
    // Сегмент считается "пройденным", если обе точки пройдены,
    // т.е. если i+1 <= completed (тогда уровень i+1 и i+2 пройдены)
    // Уровень N пройден, если N <= completed
    // Сегмент между уровнем i+1 и i+2 — пройден, если i+2 <= completed
    for (var i = 0; i < coords.length - 1; i++) {
      var a = coords[i];
      var b = coords[i + 1];
      var segCompleted = (i + 2) <= completed;
      var cls = segCompleted ? 'region-path-segment completed' : 'region-path-segment';
      html += '<line class="' + cls + '" x1="' + a.x + '" y1="' + a.y + '" ' +
              'x2="' + b.x + '" y2="' + b.y + '" vector-effect="non-scaling-stroke" />';
    }
    return html;
  },

  /* ============================================================
     РЕНДЕР ОДНОГО НОДА
     ============================================================ */
  renderNode: function(levelNum, completed, coord) {
    if (levelNum > 10) return '';

    var isBoss = levelNum === 10;
    var isCompleted = levelNum <= completed;
    var isCurrent = levelNum === completed + 1 && completed < 10;

    var state = 'locked';
    if (isCompleted) state = 'completed';
    else if (isCurrent) state = 'current';

    var nodeFile = 'node_' + state + '.png';
    if (isBoss) nodeFile = 'node_boss.png'; // всегда одна иконка для босса

    var extraClass = isBoss ? ' boss' : '';

    return '<div class="region-node-level ' + state + extraClass + '" ' +
           'data-level="' + levelNum + '" ' +
           'style="left: ' + coord.x + '%; top: ' + coord.y + '%;">' +
           '<span class="node-glow"></span>' +
           '<img src="assets/nodes/' + nodeFile + '" class="node-img" alt="">' +
           '<span class="node-number">' + levelNum + '</span>' +
           '</div>';
  },

  /* ============================================================
     СОБЫТИЯ
     ============================================================ */
  attachEvents: function(region) {
    document.querySelectorAll('.region-node-level').forEach(function(el) {
      el.addEventListener('click', function() {
        var levelNum = parseInt(el.dataset.level, 10);
        var completed = WorldMapProgress.getRegionCompleted(region.id);

        if (levelNum > 10) {
          if (window.UI) UI.showToast(t('region.completed', '🏆 Регион пройден!'));
          return;
        }

        if (levelNum <= completed + 1 || completed >= 10) {
          if (window.SoundManager) SoundManager.click();
          RegionScreen.startLevel(region, levelNum);
          return;
        }

        if (window.SoundManager) SoundManager.error();
        if (window.UI) UI.showToast(t('region.locked', '🔒 Пройди предыдущий уровень'));
      });
    });

    var backBtn = document.getElementById('region-back');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        if (window.SoundManager) SoundManager.click();
        RegionScreen.close();
        WorldMapUI.show();
      });
    }

    var giftBtn = document.getElementById('region-rewards-btn');
    if (giftBtn) {
      giftBtn.addEventListener('click', function() {
        if (window.SoundManager) SoundManager.click();
        RegionScreen.openRewardsModal(region);
      });
    }
  },

  /* ============================================================
     МОДАЛКА НАГРАД РЕГИОНА
     ============================================================ */
  openRewardsModal: function(region) {
    var rewards = (window.REGION_REWARDS && REGION_REWARDS[region.id]) || null;
    if (!rewards) return;

    var theme = THEMES[rewards.theme];
    var trail = TRAILS[rewards.trail];
    var regionName = getRegionName(region.id);
    var gems = rewards.regionGems || 10;
    var claimed = localStorage.getItem('flow_region_victory_' + region.id) === 'true';

    // Убираем старую модалку, если была
    var old = document.getElementById('region-rewards-overlay');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay region-rewards-overlay active';
    overlay.id = 'region-rewards-overlay';

    var html = '';
    html += '<div class="modal-panel region-rewards-panel">';
    html += '<h3>' + t('region.rewards_title', 'Награды региона «{name}»', { name: regionName }) + '</h3>';

    html += '<div class="region-reward-item">';
    html += '<div class="region-reward-icon">🎨</div>';
    html += '<div class="region-reward-text">' + t('region.reward_theme', 'Тема «{name}»', { name: theme ? theme.name : '—' }) + '</div>';
    html += '</div>';

    html += '<div class="region-reward-item">';
    html += '<div class="region-reward-icon">✨</div>';
    html += '<div class="region-reward-text">' + t('region.reward_trail', 'След «{name}»', { name: trail ? trail.name : '—' }) + '</div>';
    html += '</div>';

    html += '<div class="region-reward-item">';
    html += '<div class="region-reward-icon"><span class="gem-icon"></span></div>';
    html += '<div class="region-reward-text">' + t('region.reward_gems', '+{n} алмазов', { n: gems }) + '</div>';
    html += '</div>';

    if (claimed) {
      html += '<div class="region-rewards-claimed">' + t('region.rewards_claimed', '✓ Награда получена') + '</div>';
    } else {
      html += '<div class="region-rewards-pending">' + t('region.rewards_pending', 'Пройди все 10 уровней региона, чтобы получить награды') + '</div>';
    }

    html += '<button class="modal-btn secondary" id="region-rewards-close">' + t('common.close', 'Закрыть') + '</button>';
    html += '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    var closeBtn = document.getElementById('region-rewards-close');
    if (closeBtn) {
      closeBtn.onclick = function() {
        if (window.SoundManager) SoundManager.click();
        overlay.remove();
      };
    }
    overlay.onclick = function(e) {
      if (e.target === overlay) overlay.remove();
    };
  },

  /* ============================================================
     СТАРТ УРОВНЯ
     ============================================================ */
  startLevel: function(region, levelNum) {
    if (levelNum > 10) levelNum = 10;

    this.close();
    if (window.game) {
      window.game.scene.start('Game', {
        level: levelNum,
        mode: 'normal',
        region: region.id
      });
    }
  },

  close: function() {
    var overlay = document.getElementById('region-overlay');
    if (overlay) overlay.classList.remove('active');
    var r = document.getElementById('region-rewards-overlay');
    if (r) r.remove();
  }
};

window.RegionScreen = RegionScreen;
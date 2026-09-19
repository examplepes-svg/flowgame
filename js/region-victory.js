/* ============================================================
   ЭКРАН ПОБЕДЫ НАД РЕГИОНОМ — 10/10
   ============================================================ */

var RegionVictory = {
  show: function(regionId, onComplete) {
    var region = WORLD_REGIONS[regionId];
    if (!region) { if (onComplete) onComplete(); return; }

    var rewards = REGION_REWARDS[regionId];
    if (!rewards) { if (onComplete) onComplete(); return; }

    var theme = THEMES[rewards.theme];
    var trail = TRAILS[rewards.trail];
    var achievement = ACHIEVEMENTS.find(function(a) { return a.id === rewards.achievement; });

    var overlay = document.getElementById('region-victory-overlay');
    if (!overlay) { if (onComplete) onComplete(); return; }

    // Звук фанфар
    if (window.SoundManager) SoundManager.victory();

    var regionGems = rewards.regionGems || 50;
    var regionName = getRegionName(regionId);

    var html = '';
    html += '<div class="region-victory-bg" style="background-image: url(assets/regions/' + regionId + '.webp);"></div>';
    html += '<div class="region-victory-dim"></div>';

    // Конфетти
    html += '<div class="region-victory-confetti" id="region-confetti"></div>';

    html += '<div class="region-victory-content">';
    html += '<div class="region-victory-title">' + t('region.victory_title', '🏆 {name} ПРОЙДЕНА!', { name: regionName.toUpperCase() }) + '</div>';
    html += '<div class="region-victory-subtitle">' + t('region.victory_sub', 'Ты прошёл все 10 уровней региона') + '</div>';

    html += '<div class="region-victory-rewards">';
    html += '<div class="region-victory-rewards-title">' + t('region.victory_rewards', 'Получены награды:') + '</div>';

    html += '<div class="region-victory-reward">';
    html += '<span class="region-victory-reward-icon">🎨</span>';
    html += '<div class="region-victory-reward-info">';
    html += '<div class="region-victory-reward-name">' + t('region.victory_theme', 'Тема «{name}»', { name: theme.name }) + '</div>';
    html += '<div class="region-victory-reward-desc">' + t('region.victory_theme_desc', 'Уникальная тема региона') + '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="region-victory-reward">';
    html += '<span class="region-victory-reward-icon">✨</span>';
    html += '<div class="region-victory-reward-info">';
    html += '<div class="region-victory-reward-name">' + t('region.victory_trail', 'След «{name}»', { name: trail.name }) + '</div>';
    html += '<div class="region-victory-reward-desc">' + t('region.victory_trail_desc', 'Уникальный след региона') + '</div>';
    html += '</div>';
    html += '</div>';

    if (achievement) {
      html += '<div class="region-victory-reward">';
      html += '<span class="region-victory-reward-icon">' + achievement.icon + '</span>';
      html += '<div class="region-victory-reward-info">';
      html += '<div class="region-victory-reward-name">' + t('region.victory_ach', 'Достижение «{name}»', { name: achievement.name }) + '</div>';
      html += '<div class="region-victory-reward-desc">' + achievement.desc + '</div>';
      html += '</div>';
      html += '</div>';
    }

    html += '<div class="region-victory-reward">';
    html += '<span class="region-victory-reward-icon"><span class="gem-icon"></span></span>';
    html += '<div class="region-victory-reward-info">';
    html += '<div class="region-victory-reward-name">' + t('region.victory_gems', '+{n} алмазов', { n: regionGems }) + '</div>';
    html += '<div class="region-victory-reward-desc">' + t('region.victory_gems_desc', 'Бонус за полное прохождение') + '</div>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    html += '<button class="region-victory-btn" id="region-victory-continue">' + t('region.victory_continue', 'Продолжить') + '</button>';
    html += '</div>';

    overlay.innerHTML = html;
    overlay.classList.add('active');

    // Спавним конфетти
    RegionVictory.spawnConfetti();

    var self = this;
    setTimeout(function() {
      var btn = document.getElementById('region-victory-continue');
      if (btn) {
        btn.onclick = function() {
          if (window.SoundManager) SoundManager.click();
          RegionVictory.close();
          if (onComplete) onComplete();
        };
      }
    }, 100);

    // Выдаём награды
    this.grantRewards(regionId, rewards);
  },

  close: function() {
    var overlay = document.getElementById('region-victory-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  /**
   * Выдать награды за регион
   */
  grantRewards: function(regionId, rewards) {
    if (!window.game) return;
    var scene = window.game.scene.getScene('Menu') || window.game.scene.getScene('Game');
    if (!scene) return;
    var state = scene.registry.get('state');
    if (!state) return;

    // Тема
    if (state.ownedThemes.indexOf(rewards.theme) === -1) {
      state.ownedThemes.push(rewards.theme);
    }

    // След
    if (state.ownedTrails.indexOf(rewards.trail) === -1) {
      state.ownedTrails.push(rewards.trail);
    }

    // Достижение
    if (state.achievements.indexOf(rewards.achievement) === -1) {
      state.achievements.push(rewards.achievement);
    }

    scene.registry.set('state', state);
    if (window.YandexSDK) YandexSDK.saveProgress(state);

    // Выдаём алмазы
    var regionGems = rewards.regionGems || 50;
    if (regionGems > 0) {
      giveGems(regionGems);
    }
  },

  /**
   * Спавн конфетти
   */
  spawnConfetti: function() {
    var container = document.getElementById('region-confetti');
    if (!container) return;
    container.innerHTML = '';

    var colors = ['#ff4757', '#1e90ff', '#2ed573', '#ffa502', '#a55eea', '#00d2d3', '#ff6b81', '#feca57'];
    for (var i = 0; i < 60; i++) {
      var conf = document.createElement('div');
      conf.className = 'confetti-piece';
      conf.style.left = Math.random() * 100 + '%';
      conf.style.background = colors[Math.floor(Math.random() * colors.length)];
      conf.style.animationDelay = (Math.random() * 3) + 's';
      conf.style.animationDuration = (3 + Math.random() * 2) + 's';
      conf.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      container.appendChild(conf);
    }
  }
};

window.RegionVictory = RegionVictory;
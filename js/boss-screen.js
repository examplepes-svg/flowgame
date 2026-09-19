/* ============================================================
   ЭКРАН БОССА — показывается после победы над 10-м уровнем
   ============================================================ */

var BossScreen = {
  currentRegion: null,
  onComplete: null,

  show: function(regionId, onComplete) {
    this.currentRegion = regionId;
    this.onComplete = onComplete || function() {};

    var region = WORLD_REGIONS[regionId];
    if (!region) { this.onComplete(); return; }

    var bossFile = this.getBossFile(regionId);
    var bossName = this.getBossName(regionId);
    var rewards = this.getBossRewards(region.wave);
    var regionName = getRegionName(regionId);

    var overlay = document.getElementById('boss-overlay');
    if (!overlay) { this.onComplete(); return; }

    if (window.SoundManager) SoundManager.victory();

    var html = '';
    html += '<div class="boss-bg" style="background-image: url(assets/regions/' + regionId + '.webp);"></div>';
    html += '<div class="boss-dim"></div>';

    html += '<div class="boss-content">';
    html += '<div class="boss-image-wrap">';
    html += '<img src="assets/bosses/' + bossFile + '" class="boss-image" alt="' + bossName + '">';
    html += '</div>';

    html += '<div class="boss-title">' + t('boss.defeated', '{name} ПОБЕЖДЁН!', { name: bossName }) + '</div>';
    html += '<div class="boss-subtitle">' + t('boss.region', 'Регион: {flag} {name}', { flag: region.flag, name: regionName }) + '</div>';

    html += '<div class="boss-rewards">';
    html += '<div class="boss-rewards-title">' + t('boss.rewards', 'Награды:') + '</div>';
    html += '<div class="boss-rewards-list">';
    html += '<div class="boss-reward-item">' +
            '<span class="boss-reward-icon"><span class="coin-icon"></span></span>' +
            '<span class="boss-reward-text">' + t('boss.reward_coins', '+{n} монет', { n: rewards.coins }) + '</span>' +
            '</div>';
    html += '<div class="boss-reward-item">' +
            '<span class="boss-reward-icon">⭐</span>' +
            '<span class="boss-reward-text">' + t('boss.reward_xp', '+{n} XP', { n: rewards.xp }) + '</span>' +
            '</div>';
    html += '<div class="boss-reward-item">' +
            '<span class="boss-reward-icon"><span class="gem-icon"></span></span>' +
            '<span class="boss-reward-text">' + t('boss.reward_gems', '+{n} алмазов', { n: rewards.gems }) + '</span>' +
            '</div>';
    html += '</div>';
    html += '</div>';

    html += '<button class="boss-claim-btn" id="boss-claim">' + t('boss.claim', 'Забрать награды') + '</button>';
    html += '</div>';

    overlay.innerHTML = html;
    overlay.classList.add('active');

    var self = this;
    setTimeout(function() {
      var claimBtn = document.getElementById('boss-claim');
      if (claimBtn) {
        claimBtn.onclick = function() {
          if (window.SoundManager) SoundManager.click();
          BossScreen.close();
          self.grantBossRewards(region, rewards);
          if (window.ChestReward) {
            ChestReward.open(function() {
              self.onComplete();
            });
          } else {
            self.onComplete();
          }
        };
      }
    }, 100);
  },

  close: function() {
    var overlay = document.getElementById('boss-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  grantBossRewards: function(region, rewards) {
    if (!window.game) return;
    var scene = window.game.scene.getScene('Menu') || window.game.scene.getScene('Game');
    if (!scene) return;
    var state = scene.registry.get('state');
    if (!state) return;

    state.coins += rewards.coins;
    state.stats.totalCoins += rewards.coins;
    state.totalXp += rewards.xp;

    // === BP ===
    if (state.bpStats) {
      state.bpStats.defeat_bosses = (state.bpStats.defeat_bosses || 0) + 1;
      state.bpStats.earn_coins = (state.bpStats.earn_coins || 0) + rewards.coins;
      if (window.BPTasks) {
        BPTasks.updateProgress('defeat_bosses', 1);
        BPTasks.updateProgress('earn_coins', rewards.coins);
      }
    }

    scene.registry.set('state', state);
    if (window.YandexSDK) YandexSDK.saveProgress(state);

    if (rewards.gems && rewards.gems > 0) {
      giveGems(rewards.gems);
    }
  },

  getBossFile: function(regionId) {
    var files = {
      japan:     '01_dragon_yamato.webp',
      italy:     '02_colosseum.webp',
      france:    '03_louvre_spirit.webp',
      russia:    '04_bear_russia.webp',
      usa:       '05_eagle_usa.webp',
      brazil:    '06_macaw_brazil.webp',
      china:     '07_chinese_dragon.webp',
      germany:   '08_stag_germany.webp',
      australia: '09_crocodile.webp',
      iceland:   '10_ice_spirit.webp'
    };
    return files[regionId] || '01_dragon_yamato.webp';
  },

  /* Возвращает локализованное имя босса по ключу boss.name_<regionId> */
  getBossName: function(regionId) {
    var keys = {
      japan:     'boss.name_japan',
      italy:     'boss.name_italy',
      france:    'boss.name_france',
      russia:    'boss.name_russia',
      usa:       'boss.name_usa',
      brazil:    'boss.name_brazil',
      china:     'boss.name_china',
      germany:   'boss.name_germany',
      australia: 'boss.name_australia',
      iceland:   'boss.name_iceland'
    };
    var key = keys[regionId];
    if (!key) return t('boss.name_default', 'БОСС');
    return t(key, 'БОСС');
  },

  getBossRewards: function(wave) {
    if (wave === 1) return { coins: 100, xp: 60,  gems: 25 };
    if (wave === 2) return { coins: 150, xp: 80,  gems: 25 };
    if (wave === 3) return { coins: 200, xp: 100, gems: 25 };
    return { coins: 100, xp: 60, gems: 25 };
  }
};

window.BossScreen = BossScreen;
/* ============================================================
   PLAYER LEVELS, CHALLENGE, LEADERBOARD, YANDEX SDK
   ============================================================ */
var PlayerLevels = {
  xpForLevel: function(level) { if (level <= 1) return 0; return 100 * (level - 1) + ((level - 1) * (level - 2) / 2) * 50; },
  getLevel: function(totalXp) { var level = 1; while (this.xpForLevel(level + 1) <= totalXp) level++; return level; },
  getProgress: function(totalXp) { var level = this.getLevel(totalXp); var cur = this.xpForLevel(level), next = this.xpForLevel(level + 1); return { level: level, progress: (totalXp - cur) / (next - cur), currentXp: totalXp - cur, neededXp: next - cur }; },
  getRewards: function(level) { var r = { coins: 0 }; if (level % 5 === 0) r.coins = 50; return r; },
  xpForGameLevel: function(l, isEndless) { var b = 10 + Math.min(l, 30); if (isEndless) b = Math.floor(b * 1.5); return b; }
};

var DailyChallenge = {
  getTodaySeed: function() { var d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); },
  getConfig: function() { return { w: 7, h: 7, colors: 6, time: 120 }; },
  getState: function() { var saved = localStorage.getItem('flow_challenge'); if (saved) { var data = JSON.parse(saved); if (data.date === todayStr()) return data; } return { date: todayStr(), completed: false, bestTime: 0, attempts: 0 }; },
  save: function(state) { localStorage.setItem('flow_challenge', JSON.stringify(state)); },
  markCompleted: function(time) { var s = this.getState(); s.completed = true; s.attempts = (s.attempts || 0) + 1; if (s.bestTime === 0 || time < s.bestTime) s.bestTime = time; this.save(s); return s; },
  markAttempt: function() { var s = this.getState(); s.attempts = (s.attempts || 0) + 1; this.save(s); }
};

var Leaderboard = {
  MAX_SIZE: 250,
  getLocalData: function(type) {
    var key = 'flow_lb_' + type;
    var saved = localStorage.getItem(key);
    if (saved) { try { var arr = JSON.parse(saved); if (arr && arr.length >= 200) return arr; } catch(e) {} }
    var bots = [];
    // Имена ботов локализованы через TRANSLATIONS — берём список из i18n
    // Если ключа нет, используются нейтральные имена
    var names = (function() {
      var lang = (window.YandexSDK && YandexSDK.lang) || 'ru';
      if (lang === 'en') {
        return ['Alex', 'Mary', 'John', 'Olga', 'Dmitry', 'Kate', 'Sergey', 'Anna', 'Nick', 'Julia',
                'Paul', 'Helen', 'Max', 'Tanya', 'Artem', 'Ksenia', 'Vlad', 'Daria', 'Andrew', 'Natalie',
                'Michael', 'Oksana', 'Roman', 'Irina', 'Denis', 'Alice', 'Boris', 'Vera', 'Gleb', 'Diana',
                'Egor', 'Jeanne', 'Zakhar', 'Igor', 'Christina', 'Leonid', 'Marina', 'Nikita', 'Oleg', 'Polina',
                'Ruslan', 'Svetlana', 'Timur', 'Ulyana', 'Fedor', 'Christina', 'Tsvetan', 'Cheslav', 'Shamil', 'Elvira'];
      }
      return ['Алекс', 'Мария', 'Иван', 'Ольга', 'Дмитрий', 'Екатерина', 'Сергей', 'Анна', 'Николай', 'Юлия',
              'Павел', 'Елена', 'Максим', 'Татьяна', 'Артём', 'Ксения', 'Владимир', 'Дарья', 'Андрей', 'Наталья',
              'Михаил', 'Оксана', 'Роман', 'Ирина', 'Денис', 'Алиса', 'Борис', 'Вера', 'Глеб', 'Диана',
              'Егор', 'Жанна', 'Захар', 'Игорь', 'Кристина', 'Леонид', 'Марина', 'Никита', 'Олег', 'Полина',
              'Руслан', 'Светлана', 'Тимур', 'Ульяна', 'Фёдор', 'Христина', 'Цветан', 'Чеслав', 'Шамиль', 'Эльвира'];
    })();
    for (var i = 0; i < 250; i++) {
      var score;
      if (type === 'levels') score = Math.max(1, 250 - i + Math.floor(Math.random() * 5));
      else if (type === 'endless') score = Math.max(1, 60 - Math.floor(i / 4) + Math.floor(Math.random() * 3));
      else score = Math.max(10, 10000 - i * 30 + Math.floor(Math.random() * 200));
      bots.push({ name: names[i % names.length] + (i >= names.length ? ' ' + Math.floor(i / names.length) : ''), score: score, isBot: true });
    }
    bots.sort(function(a, b) { return b.score - a.score; });
    localStorage.setItem(key, JSON.stringify(bots));
    return bots;
  },
  getLeaderboard: function(type, playerName, playerScore) { return Promise.resolve(this.getLocalWithPlayer(type, playerName, playerScore)); },
  getLocalWithPlayer: function(type, playerName, playerScore) {
    var data = this.getLocalData(type).slice();
    data.push({ name: playerName, score: playerScore, isMe: true });
    data.sort(function(a, b) { return b.score - a.score; });
    return data;
  }
};

/* ============================================================
   YANDEX SDK — реальная интеграция с fallback на localStorage
   Работает в двух режимах:
     - SDK доступен (загружен <script src=".../sdk/v2">): используем YaGames
     - SDK недоступен (локальная разработка): fallback на localStorage
   ============================================================ */
var YandexSDK = {
  ysdk: null,
  player: null,
  playerName: null,
  lang: 'ru',
  _available: false,
  _initPromise: null,

  /* ============================================================
     ИНИЦИАЛИЗАЦИЯ
     ============================================================ */
  init: function() {
    var self = this;

    if (this._initPromise) return this._initPromise;

    this._initPromise = new Promise(function(resolve) {
      // SDK не загружен — fallback
      if (typeof YaGames === 'undefined') {
        console.log('ℹ️ YaGames SDK не загружен — offline-режим (localStorage)');
        self._initFallback();
        resolve(false);
        return;
      }

      YaGames.init()
        .then(function(ysdk) {
          self.ysdk = ysdk;
          self._available = true;
          console.log('✅ Yandex SDK инициализирован');

          // Язык
          try {
            self.lang = ysdk.environment.i18n.lang || 'ru';
          } catch (e) {
            self.lang = 'ru';
          }

          // Игрок (гостевой профиль без запроса авторизации)
          return ysdk.getPlayer({ scopes: false })
            .then(function(player) {
              self.player = player;
              self.playerName = player.getName() || '';
              if (self.playerName) {
                localStorage.setItem('flow_local_name', self.playerName);
              }
              resolve(true);
            })
            .catch(function(err) {
              console.warn('⚠️ getPlayer failed, играем как гость:', err);
              self.player = null;
              resolve(true);
            });
        })
        .catch(function(err) {
          console.error('❌ YaGames.init() failed:', err);
          self._initFallback();
          resolve(false);
        });
    });

    return this._initPromise;
  },

  _initFallback: function() {
    this._available = false;
    var savedName = localStorage.getItem('flow_local_name');
    if (savedName) this.playerName = savedName;
    else {
      this.playerName = generateRandomName();
      localStorage.setItem('flow_local_name', this.playerName);
    }
    var navLang = (navigator.language || 'ru').substring(0, 2).toLowerCase();
    this.lang = (navLang === 'ru') ? 'ru' : 'en';
  },

  /* ============================================================
     READY / GAMEPLAY API
     ============================================================ */
  ready: function() {
    if (this._available && this.ysdk && this.ysdk.features && this.ysdk.features.LoadingAPI) {
      try {
        this.ysdk.features.LoadingAPI.ready();
        console.log('✅ LoadingAPI.ready()');
      } catch (e) {}
    } else {
      console.log('ℹ️ LoadingAPI.ready() — заглушка (offline)');
    }
  },

  gameplayStart: function() {
    if (this._available && this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI) {
      try { this.ysdk.features.GameplayAPI.start(); } catch (e) {}
    }
  },

  gameplayStop: function() {
    if (this._available && this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI) {
      try { this.ysdk.features.GameplayAPI.stop(); } catch (e) {}
    }
  },

  /* ============================================================
     РЕКЛАМА
     ============================================================ */

  // Межстраничная (между уровнями, в логических паузах)
  showFullscreenAdv: function() {
    var self = this;

    if (!this._available || !this.ysdk) {
      console.log('ℹ️ showFullscreenAdv — заглушка (offline), пропуск');
      return Promise.resolve(false);
    }

    return new Promise(function(resolve) {
      if (window.SoundManager) SoundManager.pauseAll();

      // Ставим Phaser-сцены на паузу
      var scenesToPause = [];
      if (window.game && window.game.scene) {
        scenesToPause = window.game.scene.getScenes(true);
        scenesToPause.forEach(function(s) { s.scene.pause(); });
      }

      self.ysdk.adv.showFullscreenAdv({
        callbacks: {
          onOpen: function() {
            if (window.SoundManager) SoundManager.pauseAll();
          },
          onClose: function(wasShown) {
            if (window.SoundManager) SoundManager.resumeAll();
            scenesToPause.forEach(function(s) {
              if (s.scene.isPaused()) s.scene.resume();
            });
            resolve(wasShown);
          },
          onError: function(err) {
            console.warn('Fullscreen adv error:', err);
            if (window.SoundManager) SoundManager.resumeAll();
            scenesToPause.forEach(function(s) {
              if (s.scene.isPaused()) s.scene.resume();
            });
            resolve(false);
          }
        }
      });
    });
  },

  // За вознаграждение
  showRewardedVideo: function() {
    var self = this;

    // В offline — старая заглушка
    if (!this._available || !this.ysdk) {
      return this._stubRewarded();
    }

    return new Promise(function(resolve) {
      if (window.SoundManager) SoundManager.pauseAll();

      var scenesToPause = [];
      if (window.game && window.game.scene) {
        scenesToPause = window.game.scene.getScenes(true);
        scenesToPause.forEach(function(s) { s.scene.pause(); });
      }

      var rewarded = false;

      self.ysdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: function() {
            if (window.SoundManager) SoundManager.pauseAll();
          },
          onRewarded: function() {
            rewarded = true;
          },
          onClose: function() {
            if (window.SoundManager) SoundManager.resumeAll();
            scenesToPause.forEach(function(s) {
              if (s.scene.isPaused()) s.scene.resume();
            });
            resolve(rewarded);
          },
          onError: function(err) {
            console.warn('Rewarded video error:', err);
            if (window.SoundManager) SoundManager.resumeAll();
            scenesToPause.forEach(function(s) {
              if (s.scene.isPaused()) s.scene.resume();
            });
            resolve(false);
          }
        }
      });
    });
  },

  // Заглушка для offline-теста (когда SDK недоступен)
  _stubRewarded: function() {
    return new Promise(function(resolve) {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;color:white;font-size:18px;text-align:center;flex-direction:column;gap:16px;font-family:sans-serif;';
      // ВАЖНО: не переводим — это технический тупик для разработчика, не для игрока.
      // В проде эта функция не вызывается (SDK всегда доступен).
      overlay.innerHTML =
        '<div style="font-size:50px;">⏳</div>' +
        '<div>Реклама (offline-заглушка)</div>' +
        '<div style="font-size:13px;color:#aaa;max-width:300px;line-height:1.4;">' +
          'В финальной версии здесь будет реклама Яндекс Игр.<br>Награда начислится через 2 секунды.' +
        '</div>';
      document.body.appendChild(overlay);

      if (window.SoundManager) SoundManager.pauseAll();

      var finished = false;
      var finish = function() {
        if (finished) return;
        finished = true;
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
        if (window.SoundManager) SoundManager.resumeAll();
        resolve(true);
      };

      setTimeout(finish, 2000);
    });
  },

  /* ============================================================
     СОХРАНЕНИЯ
     ============================================================ */

  saveProgress: function(data) {
    if (!data) return Promise.resolve(false);

    // Метка времени — для разрешения конфликтов с облаком
    data._savedAt = Date.now();

    // Всегда пишем локально
    try {
      localStorage.setItem('flow_progress', JSON.stringify(data));
      localStorage.setItem('flow_progress_time', data._savedAt.toString());
    } catch (e) {}

    // Если облако доступно — пишем туда
    if (this._available && this.player) {
      return this.player.setData({ save: data })
        .then(function() { return true; })
        .catch(function(err) {
          console.warn('Cloud save failed:', err);
          return false;
        });
    }

    return Promise.resolve(false);
  },

  loadProgress: function() {
    var self = this;

    // Локальная версия
    var localData = null;
    var localTime = 0;
    try {
      var raw = localStorage.getItem('flow_progress');
      if (raw) localData = JSON.parse(raw);
      var t = localStorage.getItem('flow_progress_time');
      if (t) localTime = parseInt(t, 10) || 0;
    } catch (e) {}

    if (!this._available || !this.player) {
      return Promise.resolve(localData);
    }

    // Облако
    return this.player.getData(['save'])
      .then(function(data) {
        var cloudData = data && data.save ? data.save : null;

        if (!cloudData && !localData) return null;
        if (!cloudData) return localData;
        if (!localData) return cloudData;

        var cloudTime = cloudData._savedAt || 0;
        if (cloudTime > localTime) {
          console.log('☁️ Загружено из облака');
          return cloudData;
        }
        console.log('💾 Загружено локально');
        return localData;
      })
      .catch(function(err) {
        console.warn('Cloud load failed, using local:', err);
        return localData;
      });
  }
};

/* ============================================================
   СОСТОЯНИЕ ПО УМОЛЧАНИЮ
   ============================================================ */
var DEFAULT_STATE = {
  currentLevel: 1, coins: 0, gems: 0, totalXp: 0, playerLevel: 1,
  currentTheme: 'default', ownedThemes: ['default'],
  currentBackground: 'void', ownedBackgrounds: ['void'],
  currentTrail: 'default', ownedTrails: ['default'],

  // === FallPass 2026 ===
  battlepassXp: 0,
  claimedBpLevels: [],
  claimedBpPremiumLevels: [],
  leaves: 0,
  bpPremium: false,
  bpPremiumAdsWatched: 0,
  bpVersion: 2,
  bpStats: {
    play_levels: 0,
    connect_lines: 0,
    use_hints: 0,
    earn_coins: 0,
    spend_coins: 0,
    open_chests: 0,
    play_duels: 0,
    win_duels: 0,
    endless_levels: 0,
    defeat_bosses: 0,
    no_hint_levels: 0,
    fast_levels: 0,
    buy_themes: 0,
    buy_trails: 0,
    buy_backgrounds: 0
  },

  boosters: { time: 0, reveal: 0, skip: 0 },
  activeBoosts: { xp: 0, coins: 0 },
  achievements: [], levelsCompleted: 0, levelsNoHint: 0,
  bestTime: 0, streak: 0, lastVisit: '',
  tasksCompleted: 0, endlessBest: 0, tutorialShown: false,
  challengesCompleted: 0,
  stats: { totalTime: 0, totalCoins: 0, totalLevels: 0, gamesPlayed: 0 }
};

function mergeState(saved) {
  var s = JSON.parse(JSON.stringify(DEFAULT_STATE));
  if (saved) {
    for (var k in saved) {
      if (k === 'stats' && saved.stats) { for (var sk in saved.stats) s.stats[sk] = saved.stats[sk]; }
      else if (k === 'boosters' && saved.boosters) { for (var bk in saved.boosters) s.boosters[bk] = saved.boosters[bk]; }
      else if (k === 'activeBoosts' && saved.activeBoosts) { for (var ak in saved.activeBoosts) s.activeBoosts[ak] = saved.activeBoosts[ak]; }
      else if (k === 'bpStats' && saved.bpStats) { for (var bsk in saved.bpStats) s.bpStats[bsk] = saved.bpStats[bsk]; }
      else if (typeof s[k] !== 'undefined') s[k] = saved[k];
    }
  }
  if (!s.claimedBpPremiumLevels) s.claimedBpPremiumLevels = [];
  return s;
}

/* ============================================================
   XP
   ============================================================ */
function addXp(amount) {
  var game = window.game; if (!game) return;
  var scene = game.scene.getScene('Game') || game.scene.getScene('Endless') || game.scene.getScene('Menu'); if (!scene) return;
  var state = scene.registry.get('state');

  if (state.activeBoosts && state.activeBoosts.xp && state.activeBoosts.xp > Date.now()) {
    amount = Math.floor(amount * 2);
  }

  var oldLevel = PlayerLevels.getLevel(state.totalXp);
  state.totalXp += amount;
  var newLevel = PlayerLevels.getLevel(state.totalXp);
  state.playerLevel = newLevel;
  if (newLevel > oldLevel) {
    var rewards = PlayerLevels.getRewards(newLevel);
    state.coins += rewards.coins;
    SoundManager.levelUp();
    UI.showToast(t('toast.level_up', '⭐ Уровень {n}!', { n: newLevel }), 3000);
  }
  scene.registry.set('state', state); YandexSDK.saveProgress(state);
}

/* ============================================================
   ВЫДАЧА АЛМАЗОВ
   ============================================================ */
function giveGems(amount) {
  if (!amount || amount <= 0) return;
  var game = window.game; if (!game) return;
  var scene = game.scene.getScene('Game') || game.scene.getScene('Endless') || game.scene.getScene('Menu');
  if (!scene) return;
  var state = scene.registry.get('state');
  state.gems += amount;
  scene.registry.set('state', state);
  YandexSDK.saveProgress(state);
  if (window.UI) UI.showToast(t('toast.gems_added', '💎 +{n} алмазов!', { n: amount }), 2000);
}

/* ============================================================
   ПОКУПКА ТОВАРА
   ============================================================ */
function buyItem(itemType, key, preferredCurrency) {
  var game = window.game; if (!game) return false;
  var scene = game.scene.getScene('Menu'); if (!scene) return false;
  var state = scene.registry.get('state');

  var item = null;
  var ownedList = null;

  if (itemType === 'theme') { item = THEMES[key]; ownedList = state.ownedThemes; }
  else if (itemType === 'trail') { item = TRAILS[key]; ownedList = state.ownedTrails; }
  else if (itemType === 'background') { item = BACKGROUNDS[key]; ownedList = state.ownedBackgrounds; }
  else return false;

  if (!item) { if (window.UI) UI.showToast(t('toast.item_not_found', 'Товар не найден')); return false; }
  if (ownedList.indexOf(key) !== -1) { if (window.UI) UI.showToast(t('toast.already_owned', 'Уже куплено')); return false; }

  var priceCoins = item.price || 0;
  var priceGems = item.priceGems || 0;
  var canCoins = priceCoins > 0 && state.coins >= priceCoins;
  var canGems = priceGems > 0 && state.gems >= priceGems;

  // Ничего не хватает
  if (!canCoins && !canGems) {
    if (window.SoundManager) SoundManager.error();
    if (window.UI) UI.showToast(t('toast.no_funds', 'Недостаточно средств'));
    return false;
  }

  // Если валюта задана явно и хватает — покупаем за неё
  if (preferredCurrency === 'coins' && canCoins) {
    return doBuyItem(state, scene, item, itemType, key, ownedList, 'coins', priceCoins);
  }
  if (preferredCurrency === 'gems' && canGems) {
    return doBuyItem(state, scene, item, itemType, key, ownedList, 'gems', priceGems);
  }

  // Хватает только одного — покупаем сразу
  if (canCoins && !canGems) {
    return doBuyItem(state, scene, item, itemType, key, ownedList, 'coins', priceCoins);
  }
  if (!canCoins && canGems) {
    return doBuyItem(state, scene, item, itemType, key, ownedList, 'gems', priceGems);
  }

  // Хватает обоих и валюта не задана — спрашиваем
  if (window.UI) {
    UI.confirm(
      t('dialog.pay_with_title', 'Чем платить?'),
      t('dialog.pay_with_text', 'У тебя хватает и монет, и алмазов.<br><br>Монеты: <b>{coins} <span class="coin-icon"></span></b><br>Алмазы: <b>{gems} <span class="gem-icon"></span></b>', { coins: priceCoins, gems: priceGems }),
      [
        { label: priceCoins + ' 🪙', class: 'yes', action: function() {
            doBuyItem(state, scene, item, itemType, key, ownedList, 'coins', priceCoins);
        }},
        { label: priceGems + ' 💎', class: 'ad', action: function() {
            doBuyItem(state, scene, item, itemType, key, ownedList, 'gems', priceGems);
        }},
        { label: t('common.cancel', 'Отмена'), class: 'no', action: function() {} }
      ]
    );
  }
  return true;
}

/* ============================================================
   ВНУТРЕННЯЯ ФУНКЦИЯ ПОКУПКИ
   ============================================================ */
function doBuyItem(state, scene, item, itemType, key, ownedList, currency, price) {
  var spentCoins = 0;

  if (currency === 'coins') {
    state.coins -= price;
    spentCoins = price;
    if (window.UI) UI.showToast(t('toast.bought_coins', 'Куплено за {n} 🪙', { n: price }));
  } else {
    state.gems -= price;
    if (window.UI) UI.showToast(t('toast.bought_gems', 'Куплено за {n} 💎', { n: price }));
  }

  ownedList.push(key);
  if (itemType === 'theme') state.currentTheme = key;
  if (itemType === 'trail') state.currentTrail = key;
  if (itemType === 'background') {
    state.currentBackground = key;
    if (window.applyBackground) applyBackground(key);
  }

  // === BP STATS ===
  if (state.bpStats) {
    if (itemType === 'theme') {
      state.bpStats.buy_themes = (state.bpStats.buy_themes || 0) + 1;
      if (window.BPTasks) BPTasks.updateProgress('buy_themes', 1);
    }
    if (itemType === 'trail') {
      state.bpStats.buy_trails = (state.bpStats.buy_trails || 0) + 1;
      if (window.BPTasks) BPTasks.updateProgress('buy_trails', 1);
    }
    if (itemType === 'background') {
      state.bpStats.buy_backgrounds = (state.bpStats.buy_backgrounds || 0) + 1;
      if (window.BPTasks) BPTasks.updateProgress('buy_backgrounds', 1);
    }
    if (spentCoins > 0) {
      state.bpStats.spend_coins = (state.bpStats.spend_coins || 0) + spentCoins;
      if (window.BPTasks) BPTasks.updateProgress('spend_coins', spentCoins);
    }
  }

  DailyTasks.updateProgress('buy1', 1);
  DailyTasks.updateProgress('buy3', 1);

  scene.registry.set('state', state);
  if (window.YandexSDK) YandexSDK.saveProgress(state);
  if (window.SoundManager) SoundManager.victory();
  return true;
}

window.doBuyItem = doBuyItem;

/* ============================================================
   АКТИВАЦИЯ БУСТЕРА
   ============================================================ */
function activateBoost(type, durationMs) {
  var game = window.game; if (!game) return;
  var scene = game.scene.getScene('Menu') || game.scene.getScene('Game') || game.scene.getScene('Endless');
  if (!scene) return;
  var state = scene.registry.get('state');
  if (!state.activeBoosts) state.activeBoosts = { xp: 0, coins: 0 };
  state.activeBoosts[type] = Date.now() + durationMs;
  scene.registry.set('state', state);
  YandexSDK.saveProgress(state);
}

function isBoostActive(type) {
  var game = window.game; if (!game) return false;
  var scene = game.scene.getScene('Menu') || game.scene.getScene('Game') || game.scene.getScene('Endless');
  if (!scene) return false;
  var state = scene.registry.get('state');
  if (!state.activeBoosts) return false;
  return state.activeBoosts[type] > Date.now();
}

function applyCoinBoost(amount) {
  if (isBoostActive('coins')) {
    return Math.floor(amount * 1.5);
  }
  return amount;
}

window.giveGems = giveGems;
window.buyItem = buyItem;
window.activateBoost = activateBoost;
window.isBoostActive = isBoostActive;
window.applyCoinBoost = applyCoinBoost;
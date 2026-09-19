/* ============================================================
   SCENE: Duel — дуэль
   ============================================================ */
var DuelScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function DuelScene() { Phaser.Scene.call(this, { key: 'Duel' }); },

  /* ============================================================
     ИНИЦИАЛИЗАЦИЯ
     ============================================================ */

  init: function(data) {
    this.levelNumber = 1;
    this.mode = 'duel';
    this.isTraining = data && data.training ? true : false;
    this.timeLeft = DUEL_CONFIG.MAX_TIME;
    this.timeElapsed = 0;
    this.hintUsed = false;
    this.duel = null;
    this.botProgress = 0;
    this.playerProgress = 0;
    this.floatMessages = [];
    this.startCountdown = DUEL_CONFIG.COUNTDOWN;
    this.countdownActive = true;
    this.playerDisconnected = false;
    this.disconnectTimer = 0;
    this._ended = false;

    var st = this.registry.get('state');
    this.applyThemeFromState(st);
    document.body.style.cursor = 'crosshair';
  },

  create: function() {
    var self = this;
    UI.hideAll();
    UI.hideDashboard();

    var state = this.registry.get('state');
    applyBackground(state.currentBackground);
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
    SoundManager.init();
    if (SoundManager.musicEnabled) SoundManager.startMusic();

    this.duel = DuelLogic.start();
    this.level = this.duel.level;
    this.solution = this.level.paths;

    this.boardPadding = 20;
    this.topUIHeight = 160;
    this.bottomUIHeight = 80;

    this.setupHTMLUI();
    this.initStandardScene(state);
    this.setupFloatMessages();
    this.startDisconnectTimer();

    this.timerEvent = this.time.addEvent({
      delay: 1000, loop: true,
      callback: function() {
        if (self._ended) return;
        self.timeElapsed++;
        self.timeLeft--;
        self.updateDuelUI();
        if (self.timeLeft <= 0) {
          self.timerEvent.remove();
          self.onTimeUp();
        }
      }
    });

    this.scale.on('resize', function() {
      self.scene.restart();
    });

    this.events.on('shutdown', function() {
      DuelLogic.stop();
      if (window._duelVisibilityHandler) {
        document.removeEventListener('visibilitychange', window._duelVisibilityHandler);
        window._duelVisibilityHandler = null;
      }
      if (self.timerEvent) self.timerEvent.remove();
      if (self.countdownInterval) clearInterval(self.countdownInterval);
      var ids = ['duel-panel', 'duel-floats', 'duel-countdown', 'duel-result-overlay', 'duel-search-overlay'];
      ids.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.remove();
      });
      self.cleanupStandardScene();
      if (window.YandexSDK && YandexSDK.gameplayStop) YandexSDK.gameplayStop();
    });

    this.startCountdownTimer();

    if (window.YandexSDK && YandexSDK.gameplayStart) YandexSDK.gameplayStart();
  },

  /* ============================================================
     ХУКИ МИКСИНА
     ============================================================ */

  onProgressUpdated: function(filled, total) {
    this.playerProgress = filled / total;
    this.updateDuelUI();
  },

  onVictory: function() {
    if (this._ended) return;
    if (this.duel && !this.duel.playerFinished) {
      DuelLogic.playerFinished();
    }
  },

  onEscPressed: function() {
    this.exitDuel();
  },

  onPathCompleted: function(colorIndex) {
    DailyTasks.updateProgress('connect20', 1);
    DailyTasks.updateProgress('connect50', 1);
    WeeklyTasks.updateProgress('w_connect200', 1);

    var state = this.registry.get('state');
    if (state && state.bpStats) {
      state.bpStats.connect_lines = (state.bpStats.connect_lines || 0) + 1;
      if (window.BPTasks) BPTasks.updateProgress('connect_lines', 1);
    }
    this.registry.set('state', state);
  },

  /* ============================================================
     HTML UI
     ============================================================ */

  setupHTMLUI: function() {
    var self = this;
    UI.show();

    var uiLevel = document.getElementById('ui-level');
    if (uiLevel) uiLevel.textContent = this.isTraining
      ? t('ui.training', '🎯 ТРЕНИРОВКА')
      : t('ui.duel', '⚔️ ДУЭЛЬ');

    var uiTimer = document.getElementById('ui-timer');
    if (uiTimer) {
      uiTimer.style.display = '';
      uiTimer.textContent = '⏱ ' + formatTime(DUEL_CONFIG.MAX_TIME);
    }

    var uiCoins = document.getElementById('ui-coins');
    if (uiCoins) uiCoins.style.display = 'none';
    var uiGems = document.getElementById('ui-gems');
    if (uiGems) uiGems.style.display = 'none';
    var uiReset = document.getElementById('ui-reset');
    if (uiReset) uiReset.style.display = 'none';

    var uiHint = document.getElementById('ui-hint');
    if (uiHint) uiHint.style.display = 'none';
    var uiBoostTime = document.getElementById('ui-boost-time');
    if (uiBoostTime) uiBoostTime.style.display = 'none';
    var uiBoostReveal = document.getElementById('ui-boost-reveal');
    if (uiBoostReveal) uiBoostReveal.style.display = 'none';
    var uiBoostSkip = document.getElementById('ui-boost-skip');
    if (uiBoostSkip) uiBoostSkip.style.display = 'none';

    safeBind('ui-back', function() {
      SoundManager.click();
      self.exitDuel();
    });
    safeBind('ui-reset', function() {});

    var duelPanel = document.getElementById('duel-panel');
    if (!duelPanel) {
      duelPanel = document.createElement('div');
      duelPanel.id = 'duel-panel';
      duelPanel.className = 'duel-panel';
      document.getElementById('game').appendChild(duelPanel);
    }
    duelPanel.innerHTML =
      '<div class="duel-player-block">' +
        '<div class="duel-player-label">' + t('duel.you', '👤 ТЫ') + '</div>' +
        '<div class="duel-progress-bar"><div class="duel-progress-fill duel-player-fill" id="duel-player-fill"></div></div>' +
        '<div class="duel-progress-text" id="duel-player-progress">0%</div>' +
      '</div>' +
      '<div class="duel-vs">' + t('duel.vs', 'VS') + '</div>' +
      '<div class="duel-bot-block">' +
        '<div class="duel-player-label">' + t('duel.opponent', '👤 СОПЕРНИК') + '</div>' +
        '<div class="duel-progress-bar"><div class="duel-progress-fill duel-bot-fill" id="duel-bot-fill"></div></div>' +
        '<div class="duel-progress-text" id="duel-bot-progress">0%</div>' +
      '</div>';
  },

  setupFloatMessages: function() {
    var self = this;
    var container = document.getElementById('duel-floats');
    if (!container) {
      container = document.createElement('div');
      container.id = 'duel-floats';
      container.className = 'duel-floats';
      document.getElementById('game').appendChild(container);
    }

    DuelLogic.setCallbacks(
      function(action) {
        if (self._ended) return;
        if (action.type === 'line') self.onBotLine();
        else if (action.type === 'error') self.onBotError();
      },
      function() {
        if (self._ended) return;
        self.onBotFinish();
      },
      function(winner) {
        if (self._ended) return;
        self.onDuelEnd(winner);
      }
    );

    DuelLogic.startBot();
  },

  /* ============================================================
     ОТСЧЁТ СТАРТА
     ============================================================ */

  startCountdownTimer: function() {
    var self = this;
    var countdownEl = document.createElement('div');
    countdownEl.className = 'duel-countdown';
    countdownEl.id = 'duel-countdown';
    document.getElementById('game').appendChild(countdownEl);

    function updateCountdown() {
      if (self._ended) {
        if (self.countdownInterval) clearInterval(self.countdownInterval);
        return;
      }
      if (self.startCountdown > 0) {
        countdownEl.textContent = self.startCountdown;
        countdownEl.classList.remove('go');
        SoundManager.tick();
      } else if (self.startCountdown === 0) {
        countdownEl.textContent = t('duel.start_countdown', 'СТАРТ!');
        countdownEl.classList.add('go');
        SoundManager.victory();
        self.countdownActive = false;
        self.duel.startTime = Date.now();
      } else {
        countdownEl.style.display = 'none';
        if (self.countdownInterval) clearInterval(self.countdownInterval);
      }
      self.startCountdown--;
    }
    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  },

  /* ============================================================
     ОТСЛЕЖИВАНИЕ ВРЕМЕННОГО ОТКЛЮЧЕНИЯ
     ============================================================ */

  startDisconnectTimer: function() {
    var self = this;

    if (window._duelVisibilityHandler) {
      document.removeEventListener('visibilitychange', window._duelVisibilityHandler);
    }

    window._duelVisibilityHandler = function() {
      if (!self.duel || self.duel.winner || self._ended) return;
      if (document.hidden) {
        self.disconnectTimer = Date.now();
      } else {
        if (self.disconnectTimer) {
          var elapsed = (Date.now() - self.disconnectTimer) / 1000;
          if (elapsed >= DUEL_CONFIG.DISCONNECT_TIME) {
            self.onDisconnectLose();
          }
          self.disconnectTimer = 0;
        }
      }
    };

    document.addEventListener('visibilitychange', window._duelVisibilityHandler);
  },

  /* ============================================================
     UI ДУЭЛИ
     ============================================================ */

  updateDuelUI: function() {
    var uiTimer = document.getElementById('ui-timer');
    if (uiTimer) uiTimer.textContent = '⏱ ' + formatTime(this.timeLeft);

    var playerFill = document.getElementById('duel-player-fill');
    if (playerFill) playerFill.style.width = (this.playerProgress * 100) + '%';
    var playerText = document.getElementById('duel-player-progress');
    if (playerText) playerText.textContent = Math.floor(this.playerProgress * 100) + '%';

    var botFill = document.getElementById('duel-bot-fill');
    if (botFill) botFill.style.width = (this.botProgress * 100) + '%';
    var botText = document.getElementById('duel-bot-progress');
    if (botText) botText.textContent = Math.floor(this.botProgress * 100) + '%';
  },

  onBotLine: function() {
    if (this._ended) return;
    this.botProgress = this.duel.bot.progress;
    this.updateDuelUI();
    var messages = [
      t('duel.search_msg_1', '🤖 Соперник соединил линию'),
      t('duel.search_msg_2', '🔥 Соперник ускоряется!'),
      t('duel.search_msg_3', '⚡ Соперник близко!'),
      t('duel.search_msg_4', '👀 Соперник не отстаёт')
    ];
    this.showFloat(messages[Math.floor(Math.random() * messages.length)]);
    if (this.botProgress > this.playerProgress + 0.2) {
      this.showFloat(t('duel.opponent_ahead', '⚠️ Соперник впереди!'));
    }
    SoundManager.tick();
  },

  onBotError: function() {
    if (this._ended) return;
    this.showFloat(t('duel.opponent_error', '❌ Соперник ошибся!'));
    SoundManager.disconnect();
  },

  onBotFinish: function() {
    if (this._ended) return;
    this.showFloat(t('duel.opponent_finished', '🏁 Соперник финишировал!'));
  },

  showFloat: function(text) {
    if (this._ended) return;
    var container = document.getElementById('duel-floats');
    if (!container) return;

    while (container.children.length >= 3) {
      container.removeChild(container.firstChild);
    }

    var el = document.createElement('div');
    el.className = 'duel-float';
    el.textContent = text;
    container.appendChild(el);

    setTimeout(function() {
      el.classList.add('fading');
      setTimeout(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 2000);
    }, 5000);
  },

  /* ============================================================
     ЗАВЕРШЕНИЕ ДУЭЛИ
     ============================================================ */

  onDuelEnd: function(winner) {
    var self = this;

    if (this._ended) return;
    this._ended = true;

    if (!this.scene.isActive()) return;

    if (this.timerEvent) this.timerEvent.remove();
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    this.input.removeAllListeners();
    SoundManager.stopMusic();

    if (winner === 'player') SoundManager.victory();
    else SoundManager.error();

    for (var i = 0; i < 8; i++) {
      var fx = this.offsetX + Math.random() * this.boardW;
      var fy = this.offsetY + Math.random() * this.boardH;
      this.spawnFirework(fx, fy);
    }

    setTimeout(function() {
      if (!self.scene.isActive()) return;
      self.showDuelResult(winner);
    }, 1500);
  },

  showDuelResult: function(winner) {
    var self = this;
    var state = this.registry.get('state');
    var duelTime = this.timeElapsed;

    var stats;
    var rewardCoins, rewardStars;
    var streakBonus = null;

    if (this.isTraining) {
      rewardCoins = 0;
      rewardStars = 0;
      stats = DuelStats.get();
    } else if (winner === 'player') {
      stats = DuelStats.addWin();
      rewardCoins = DUEL_CONFIG.WIN_COINS;
      rewardStars = DUEL_CONFIG.WIN_STARS;
      if (stats.winStreak === 3 || stats.winStreak === 5 || stats.winStreak === 10) {
        streakBonus = DuelStats.applyStreakBonus(stats.winStreak);
      }
    } else {
      stats = DuelStats.addLose();
      rewardCoins = DUEL_CONFIG.LOSE_COINS;
      rewardStars = DUEL_CONFIG.LOSE_STARS;
    }

    if (!this.isTraining) {
      state.coins += rewardCoins;
      state.stats.totalCoins += rewardCoins;

      DailyTasks.updateProgress('earn50', rewardCoins);
      DailyTasks.updateProgress('earn100', rewardCoins);
      DailyTasks.updateProgress('earn250', rewardCoins);
      WeeklyTasks.updateProgress('w_earn1000', rewardCoins);
      WeeklyTasks.updateProgress('w_earn3000', rewardCoins);

      if (state.bpStats) {
        state.bpStats.play_duels = (state.bpStats.play_duels || 0) + 1;
        if (winner === 'player') {
          state.bpStats.win_duels = (state.bpStats.win_duels || 0) + 1;
        }
        state.bpStats.earn_coins = (state.bpStats.earn_coins || 0) + rewardCoins;

        if (window.BPTasks) {
          BPTasks.updateProgress('play_duels', 1);
          if (winner === 'player') BPTasks.updateProgress('win_duels', 1);
          BPTasks.updateProgress('earn_coins', rewardCoins);
        }
      }

      if (window.addBpXp) addBpXp(BP_XP_PER_GAME_LEVEL);

      this.registry.set('state', state);
      YandexSDK.saveProgress(state);
    }

    var place = DuelLeaderboard.getPlayerPlace(stats.stars);

    var oldOverlay = document.getElementById('duel-result-overlay');
    if (oldOverlay) oldOverlay.remove();

    var overlay = document.createElement('div');
    overlay.id = 'duel-result-overlay';
    overlay.className = 'duel-result-overlay';
    document.body.appendChild(overlay);

    var isWin = winner === 'player';
    var title = isWin ? t('duel.win', '🏆 ПОБЕДА!') : t('duel.lose', '🥈 ПОРАЖЕНИЕ');
    var titleClass = isWin ? 'win' : 'lose';

    var html = '';
    html += '<div class="duel-result-content ' + titleClass + '">';
    html += '<div class="duel-result-title">' + title + '</div>';

    html += '<div class="duel-result-times">';
    html += '<div class="duel-result-time-item">' +
              '<span class="duel-result-time-label">' + t('duel.time', '⏱ Время дуэли:') + '</span>' +
              '<span class="duel-result-time-value">' + t('duel.time_sec', '{n} сек', { n: Math.floor(duelTime) }) + '</span>' +
            '</div>';
    html += '</div>';

    if (this.isTraining) {
      html += '<div class="duel-result-rewards">';
      html += '<div class="duel-result-rewards-title">' + t('duel.training_label', '🎯 Тренировка') + '</div>';
      html += '<div style="color:#aaa;font-size:13px;text-align:center;">' + t('duel.training_no_rewards', 'Без наград — только практика') + '</div>';
      html += '</div>';
    } else {
      html += '<div class="duel-result-rewards">';
      html += '<div class="duel-result-rewards-title">' + t('duel.rewards', 'Награды:') + '</div>';
      html += '<div class="duel-result-reward">' +
              '<span class="duel-result-reward-icon"><span class="coin-icon"></span></span>' +
              '<span class="duel-result-reward-text">' + t('duel.reward_coins', '+{n} монет', { n: rewardCoins }) + '</span>' +
              '</div>';
      html += '<div class="duel-result-reward">' +
              '<span class="duel-result-reward-icon">⭐</span>' +
              '<span class="duel-result-reward-text">' + t('duel.reward_stars', '{sign}{n} звёзд', { sign: rewardStars > 0 ? '+' : '', n: rewardStars }) + '</span>' +
              '</div>';
      if (streakBonus) {
        html += '<div class="duel-result-reward bonus">' +
                '<span class="duel-result-reward-icon">🔥</span>' +
                '<span class="duel-result-reward-text">' + t('duel.streak_bonus', 'Серия! +{stars} ⭐ +{coins} монет', { stars: streakBonus.stars, coins: streakBonus.coins }) + '</span>' +
                '</div>';
      }
      html += '</div>';

      var rankName = DuelRanks.getRankName(stats.stars);

      html += '<div class="duel-result-rank">';
      html += '<div class="duel-result-rank-icon" id="duel-result-rank-icon"></div>';
      html += '<div class="duel-result-rank-info">';
      html += '<div class="duel-result-rank-name">' + rankName + '</div>';
      html += '<div class="duel-result-rank-stars">' + stats.stars + ' ⭐ • #' + place + '</div>';
      html += '</div>';
      html += '</div>';
    }

    html += '<div class="duel-result-buttons">';
    html += '<button class="duel-result-btn primary" id="duel-again">' + t('duel.play_again', '⚔️ Ещё дуэль') + '</button>';
    html += '<button class="duel-result-btn secondary" id="duel-to-menu">' + t('duel.to_menu', '← В меню дуэлей') + '</button>';
    html += '</div>';
    html += '</div>';

    overlay.innerHTML = html;
    overlay.classList.add('active');

    if (!this.isTraining) {
      var rankIcon = document.getElementById('duel-result-rank-icon');
      if (rankIcon) DuelRanks.setIcon(rankIcon, stats.stars);
    }

    safeBind('duel-again', function() {
      SoundManager.click();
      overlay.classList.remove('active');
      overlay.remove();
      self._ended = true;
      self.scene.stop('Duel');
      UI.hideAll();
      setTimeout(function() { DuelSearch.start(false); }, 150);
    });

    safeBind('duel-to-menu', function() {
      SoundManager.click();
      overlay.classList.remove('active');
      overlay.remove();
      self._ended = true;
      self.scene.stop('Duel');
      UI.hideAll();
      setTimeout(function() { DuelMenu.show(); }, 150);
    });

    DailyTasks.updateProgress('duel1', 1);
    DailyTasks.updateProgress('duelPlay3', 1);
    WeeklyTasks.updateProgress('w_duelPlay15', 1);

    if (winner === 'player') {
      DailyTasks.updateProgress('duelWin1', 1);
      DailyTasks.updateProgress('duelWin3', 1);
      DailyTasks.updateProgress('duelWin5', 1);
      WeeklyTasks.updateProgress('w_duelWin10', 1);
      WeeklyTasks.updateProgress('w_duelWin30', 1);
    }
  },

  exitDuel: function() {
    if (!this.duel || this.duel.winner || this._ended) {
      if (this.timerEvent) this.timerEvent.remove();
      this._ended = true;
      this.scene.stop('Duel');
      UI.hideAll();
      setTimeout(function() { DuelMenu.show(); }, 150);
      return;
    }
    this.duel.winner = 'bot';
    this.onDuelEnd('bot');
  },

  onDisconnectLose: function() {
    if (!this.duel || this.duel.winner || this._ended) return;
    this.duel.winner = 'bot';
    this.onDuelEnd('bot');
  },

  onTimeUp: function() {
    if (!this.duel || this.duel.winner || this._ended) return;
    if (this.playerProgress > this.botProgress) {
      this.duel.winner = 'player';
      this.onDuelEnd('player');
    } else {
      this.duel.winner = 'bot';
      this.onDuelEnd('bot');
    }
  }
});

applyFlowSceneMixin(DuelScene.prototype);
window.DuelScene = DuelScene;
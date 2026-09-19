/* ============================================================
   SCENE: Endless — бесконечный режим
   ============================================================ */
var EndlessScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function EndlessScene() { Phaser.Scene.call(this, { key: 'Endless' }); },

  /* ============================================================
     ИНИЦИАЛИЗАЦИЯ
     ============================================================ */

  init: function(data) {
    this.levelNumber = data.level || 1;
    this.mode = 'endless';
    this.region = null;
    this.config = EndlessMode.getConfig(this.levelNumber);
    this.timeLeft = this.config.time || 60;
    this.timeElapsed = 0;
    this.hintUsed = false;
    this.resetUsed = false;
    this.countdownActive = false;
    this._ended = false;

    this.sessionCoins = 0;
    this.sessionXp = 0;

    if (data.resume) {
      var session = EndlessMode.loadSession();
      if (session) {
        this.sessionCoins = session.sessionCoins || 0;
        this.sessionXp = session.sessionXp || 0;
      }
    }

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

    this.applyThemeFromState(state);

    var seed = undefined;
    this.level = LevelGenerator.generate(this.config.w, this.config.h, this.config.colors, seed);
    this.solution = this.level.paths;

    this.setupHTMLUI();
    this.initStandardScene(state);

    // Обратный отсчёт
    this.timerEvent = this.time.addEvent({
      delay: 1000, loop: true,
      callback: function() {
        self.timeLeft--;
        UI.setTimer(self.timeLeft);
        if (self.timeLeft <= 0) {
          self.timerEvent.remove();
          self.onTimeUp();
        }
      }
    });

    // Счётчик прошедшего времени
    this.timeTracker = this.time.addEvent({
      delay: 1000, loop: true,
      callback: function() { self.timeElapsed++; }
    });

    this.scale.on('resize', function() {
      self.scene.restart({ level: self.levelNumber, resume: false });
    });

    this.events.on('shutdown', function() {
      if (self.timerEvent) self.timerEvent.remove();
      if (self.timeTracker) self.timeTracker.remove();
      if (self.levelNumber > 1) {
        EndlessMode.saveSession(self.levelNumber - 1, self.sessionCoins, self.sessionXp);
      }
      self.cleanupStandardScene();
      if (window.YandexSDK && YandexSDK.gameplayStop) YandexSDK.gameplayStop();
    });

    if (window.YandexSDK && YandexSDK.gameplayStart) YandexSDK.gameplayStart();
  },

  /* ============================================================
     HTML UI
     ============================================================ */

  setupHTMLUI: function() {
    var self = this;
    var state = this.registry.get('state');

    var uiReset = document.getElementById('ui-reset');
    if (uiReset) uiReset.style.display = '';
    var uiCoins = document.getElementById('ui-coins');
    if (uiCoins) uiCoins.style.display = '';
    var uiGems = document.getElementById('ui-gems');
    if (uiGems) uiGems.style.display = '';
    var uiHint = document.getElementById('ui-hint');
    if (uiHint) uiHint.style.display = '';
    var uiBoostReveal = document.getElementById('ui-boost-reveal');
    if (uiBoostReveal) uiBoostReveal.style.display = '';
    var uiBoostSkip = document.getElementById('ui-boost-skip');
    if (uiBoostSkip) uiBoostSkip.style.display = '';

    safeText('ui-level', t('ui.endless_level', '♾ Уровень ') + this.levelNumber);
    UI.setCoins(state.coins);
    UI.setGems(state.gems);
    UI.setProgress(0, this.level.width * this.level.height);
    UI.setTimer(this.timeLeft);
    UI.show();

    var boostTimeBtn = document.getElementById('ui-boost-time');
    var boostRevealBtn = document.getElementById('ui-boost-reveal');
    var boostSkipBtn = document.getElementById('ui-boost-skip');

    if (boostTimeBtn) {
      boostTimeBtn.style.display = '';
      boostTimeBtn.textContent = t('ui.boost_time', '🕐 +45 сек') + ' ×' + (state.boosters.time || 0);
      boostTimeBtn.onclick = function() {
        if ((state.boosters.time || 0) <= 0) { SoundManager.error(); UI.showToast(t('toast.no_boosters', 'Нет бустеров')); return; }
        state.boosters.time--;
        self.timeLeft += 45;
        DailyTasks.updateProgress('useBooster1', 1);
        UI.setTimer(self.timeLeft);
        self.registry.set('state', state);
        YandexSDK.saveProgress(state);
        SoundManager.victory();
        UI.showToast(t('toast.time_added', '+45 секунд!'));
        boostTimeBtn.textContent = t('ui.boost_time', '🕐 +45 сек') + ' ×' + state.boosters.time;
      };
    }

    if (boostRevealBtn) {
      boostRevealBtn.textContent = t('ui.boost_reveal', '👁 Решение') + ' ×' + (state.boosters.reveal || 0);
      boostRevealBtn.onclick = function() {
        if ((state.boosters.reveal || 0) <= 0) { SoundManager.error(); UI.showToast(t('toast.no_boosters', 'Нет бустеров')); return; }
        state.boosters.reveal--;
        DailyTasks.updateProgress('useBooster1', 1);
        self.registry.set('state', state);
        YandexSDK.saveProgress(state);
        self.showReveal();
        boostRevealBtn.textContent = t('ui.boost_reveal', '👁 Решение') + ' ×' + state.boosters.reveal;
      };
    }

    if (boostSkipBtn) {
      boostSkipBtn.textContent = t('ui.boost_skip', '⏭ Пропуск') + ' ×' + (state.boosters.skip || 0);
      boostSkipBtn.onclick = function() {
        if ((state.boosters.skip || 0) <= 0) { SoundManager.error(); UI.showToast(t('toast.no_boosters', 'Нет бустеров')); return; }
        UI.confirm(
          t('dialog.skip_title', 'Пропустить уровень?'),
          t('dialog.skip_text_endless', 'Будет использован <b>1 бустер «Пропуск»</b>.<br>Уровень засчитается как пройденный.'),
          [
            { label: t('dialog.skip_yes', '⏭ Пропустить'), class: 'yes', action: function() {
              state.boosters.skip--;
              DailyTasks.updateProgress('useBooster1', 1);
              self.registry.set('state', state);
              YandexSDK.saveProgress(state);
              SoundManager.victory();
              self.skipLevelWithBooster();
            }},
            { label: t('common.cancel', 'Отмена'), class: 'no', action: function() {} }
          ]
        );
      };
    }

    safeBind('ui-back', function() { SoundManager.click(); self.exitEndless(); });
    safeBind('ui-reset', function() {
      SoundManager.disconnect();
      self.resetUsed = true;
      for (var i = 0; i < self.level.paths.length; i++) self.playerPaths[i] = [];
      for (var y = 0; y < self.level.height; y++) {
        for (var x = 0; x < self.level.width; x++) self.playerGrid[y][x] = -1;
      }
      self.lineParticles = [];
      self.redrawPaths();
      UI.setProgress(0, self.level.width * self.level.height);
    });
    safeBind('ui-hint', function() { self.showHint(); });
  },

  /* ============================================================
     ХУКИ МИКСИНА
     ============================================================ */

  onEscPressed: function() {
    this.exitEndless();
  },

  onPathCompleted: function(colorIndex) {
    DailyTasks.updateProgress('connect20', 1);
    DailyTasks.updateProgress('connect50', 1);
    WeeklyTasks.updateProgress('w_connect200', 1);

    var state = this.registry.get('state');
    if (state.bpStats) {
      state.bpStats.connect_lines = (state.bpStats.connect_lines || 0) + 1;
      if (window.BPTasks) BPTasks.updateProgress('connect_lines', 1);
    }
    this.registry.set('state', state);
  },

  /* ============================================================
     ВЫХОД / РЕШЕНИЕ / ПОДСКАЗКА
     ============================================================ */

  exitEndless: function() {
    if (this.levelNumber > 1) {
      EndlessMode.saveSession(this.levelNumber - 1, this.sessionCoins, this.sessionXp);
    }
    goToMainMenu();
  },

  showReveal: function() {
    var self = this;
    SoundManager.hint();
    var revealGraphics = this.add.graphics();
    var thickness = this.cellSize * 0.38;
    this.solution.forEach(function(path, idx) {
      var color = self.palette[idx % self.palette.length];
      revealGraphics.lineStyle(thickness, color, 0.85);
      revealGraphics.beginPath();
      path.cells.forEach(function(cell, i) {
        var x = self.offsetX + cell.x * self.cellSize + self.cellSize / 2;
        var y = self.offsetY + cell.y * self.cellSize + self.cellSize / 2;
        if (i === 0) revealGraphics.moveTo(x, y); else revealGraphics.lineTo(x, y);
      });
      revealGraphics.strokePath();
    });
    UI.showToast(t('toast.reveal', '👁 Решение на 3 секунды...'), 1500);
    setTimeout(function() { revealGraphics.destroy(); }, 3000);
  },

  showHint: function() {
    var self = this;
    if (this.growAnimation || this.drawing) return;
    var doHint = function() {
      self.hintUsed = true;
      var hint = self.findNextHintPath();
      if (!hint) { UI.showToast(t('toast.all_connected', 'Всё уже соединено!')); return; }
      SoundManager.hint();
      self.clearColorPath(hint.colorIndex);
      self.playerPaths[hint.colorIndex] = hint.cells.slice();
      for (var i = 0; i < hint.cells.length; i++) {
        self.playerGrid[hint.cells[i].y][hint.cells[i].x] = hint.colorIndex;
      }
      self.animateGrow(hint.colorIndex);
      DailyTasks.updateProgress('useHint', 1);

      var state = self.registry.get('state');
      if (state.bpStats) {
        state.bpStats.use_hints = (state.bpStats.use_hints || 0) + 1;
        if (window.BPTasks) BPTasks.updateProgress('use_hints', 1);
      }
      self.registry.set('state', state);
    };

    var state = this.registry.get('state');
    if (state.coins >= 50) {
      UI.confirm(
        t('dialog.hint_title', 'Подсказка'),
        t('dialog.hint_text', 'Использовать подсказку?<br><br>Списать <b>50 <span class="coin-icon"></span></b> или посмотреть рекламу?'),
        [
          { label: t('dialog.hint_coins', '50 монет'), class: 'yes', action: function() {
            state.coins -= 50;
            self.registry.set('state', state);
            YandexSDK.saveProgress(state);
            UI.setCoins(state.coins);
            doHint();
          }},
          { label: t('dialog.hint_ad', '📺 Реклама'), class: 'ad', action: function() {
            YandexSDK.showRewardedVideo().then(doHint);
          }},
          { label: t('dialog.hint_cancel', 'Отмена'), class: 'no', action: function() {} }
        ]
      );
    } else {
      YandexSDK.showRewardedVideo().then(doHint);
    }
  },

  findNextHintPath: function() {
    for (var p = 0; p < this.solution.length; p++) {
      var path = this.solution[p];
      var ci = path.colorIndex;
      var cells = path.cells;
      var playerCells = this.playerPaths[ci] || [];
      var fullyDrawn = (playerCells.length === cells.length);
      if (fullyDrawn) {
        for (var i = 0; i < cells.length; i++) {
          if (playerCells[i].x !== cells[i].x || playerCells[i].y !== cells[i].y) { fullyDrawn = false; break; }
        }
      }
      if (fullyDrawn) continue;

      var valid = true;
      for (var i = 0; i < cells.length; i++) {
        var occ = this.playerGrid[cells[i].y][cells[i].x];
        if (occ !== -1 && occ !== ci) { valid = false; break; }
      }
      if (!valid) continue;
      return { colorIndex: ci, cells: cells };
    }
    return null;
  },

  /* ============================================================
     ПРОПУСК БУСТЕРОМ
     ============================================================ */

  skipLevelWithBooster: function() {
    var self = this;
    var state = this.registry.get('state');

    var reward = applyCoinBoost(EndlessMode.getReward(this.levelNumber));
    state.coins += reward;
    state.stats.totalCoins += reward;
    this.sessionCoins += reward;

    var bonus = EndlessMode.getBonus(this.levelNumber);
    if (bonus > 0) {
      bonus = applyCoinBoost(bonus);
      state.coins += bonus;
      state.stats.totalCoins += bonus;
      this.sessionCoins += bonus;
    }

    var xpReward = PlayerLevels.xpForGameLevel(this.levelNumber, true);
    state.totalXp += xpReward;
    state.playerLevel = PlayerLevels.getLevel(state.totalXp);
    this.sessionXp += xpReward;

    // === Daily задания — общие для любого режима ===
    DailyTasks.updateProgress('play3', 1);
    DailyTasks.updateProgress('play5', 1);
    DailyTasks.updateProgress('play10', 1);
    DailyTasks.updateProgress('earn50', reward);
    DailyTasks.updateProgress('earn100', reward);
    DailyTasks.updateProgress('earn250', reward);

    // === Daily задания — специфичные для бесконечного ===
    DailyTasks.updateProgress('endless3', 1);
    DailyTasks.updateProgress('endless5', 1);
    DailyTasks.updateProgress('endless10', 1);
    DailyTasks.updateProgress('endless15', 1);

    // === Weekly задания — общие ===
    WeeklyTasks.updateProgress('w_play50', 1);
    WeeklyTasks.updateProgress('w_play150', 1);
    WeeklyTasks.updateProgress('w_play300', 1);
    WeeklyTasks.updateProgress('w_earn1000', reward);
    WeeklyTasks.updateProgress('w_earn3000', reward);

    // === Weekly задания — специфичные для бесконечного ===
    WeeklyTasks.updateProgress('w_endless50', 1);
    WeeklyTasks.updateProgress('w_endless100', 1);
    WeeklyTasks.updateProgress('w_endless250', 1);

    if (state.bpStats) {
      state.bpStats.play_levels = (state.bpStats.play_levels || 0) + 1;
      state.bpStats.endless_levels = (state.bpStats.endless_levels || 0) + 1;
      state.bpStats.earn_coins = (state.bpStats.earn_coins || 0) + reward + (bonus > 0 ? bonus : 0);
      if (window.BPTasks) {
        BPTasks.updateProgress('play_levels', 1);
        BPTasks.updateProgress('endless_levels', 1);
        BPTasks.updateProgress('earn_coins', reward + (bonus > 0 ? bonus : 0));
      }
    }
    if (window.addBpXp) addBpXp(BP_XP_PER_GAME_LEVEL);

    this.registry.set('state', state);
    YandexSDK.saveProgress(state);
    EndlessMode.saveSession(this.levelNumber, this.sessionCoins, this.sessionXp);

    if ((state.endlessBest || 0) < this.levelNumber) {
      state.endlessBest = this.levelNumber;
      this.registry.set('state', state);
      YandexSDK.saveProgress(state);
    }

    var skipToast = t('toast.endless_skipped', '⏭ Пропущено! +{coins} <span class="coin-icon"></span>', { coins: reward });
    if (bonus > 0) skipToast += ' (+' + bonus + ')';
    skipToast += ' + ' + xpReward + ' XP';
    UI.showToast(skipToast, 2000);

    if (this.timerEvent) this.timerEvent.remove();
    if (this.timeTracker) this.timeTracker.remove();
    this.scene.start('Endless', { level: this.levelNumber + 1 });
  },

  /* ============================================================
     ПОБЕДА / ВРЕМЯ ВЫШЛО
     ============================================================ */

  onVictory: function() {
    var self = this;
    this.input.enabled = false;
    if (this.timerEvent) this.timerEvent.remove();
    if (this.timeTracker) this.timeTracker.remove();
    SoundManager.victory();

    for (var i = 0; i < 5; i++) {
      var fx = this.offsetX + Math.random() * this.boardW;
      var fy = this.offsetY + Math.random() * this.boardH;
      this.spawnFirework(fx, fy);
    }

    var state = this.registry.get('state');
    var reward = applyCoinBoost(EndlessMode.getReward(this.levelNumber));
    state.coins += reward;
    state.stats.totalCoins += reward;
    this.sessionCoins += reward;

    var bonus = EndlessMode.getBonus(this.levelNumber);
    if (bonus > 0) {
      bonus = applyCoinBoost(bonus);
      state.coins += bonus;
      state.stats.totalCoins += bonus;
      this.sessionCoins += bonus;
      UI.showToast(t('toast.bonus_coins', '🎉 Бонус +{n} <span class="coin-icon"></span>!', { n: bonus }), 2000);
    }

    var xpReward = PlayerLevels.xpForGameLevel(this.levelNumber, true);
    state.totalXp += xpReward;
    state.playerLevel = PlayerLevels.getLevel(state.totalXp);
    this.sessionXp += xpReward;

    // === Daily задания — общие для любого режима ===
    DailyTasks.updateProgress('play3', 1);
    DailyTasks.updateProgress('play5', 1);
    DailyTasks.updateProgress('play10', 1);
    DailyTasks.updateProgress('earn50', reward);
    DailyTasks.updateProgress('earn100', reward);
    DailyTasks.updateProgress('earn250', reward);

    // === Daily задания — специфичные для бесконечного ===
    DailyTasks.updateProgress('endless3', 1);
    DailyTasks.updateProgress('endless5', 1);
    DailyTasks.updateProgress('endless10', 1);
    DailyTasks.updateProgress('endless15', 1);

    // === Weekly задания — общие ===
    WeeklyTasks.updateProgress('w_play50', 1);
    WeeklyTasks.updateProgress('w_play150', 1);
    WeeklyTasks.updateProgress('w_play300', 1);
    WeeklyTasks.updateProgress('w_earn1000', reward);
    WeeklyTasks.updateProgress('w_earn3000', reward);

    // === Weekly задания — специфичные для бесконечного ===
    WeeklyTasks.updateProgress('w_endless50', 1);
    WeeklyTasks.updateProgress('w_endless100', 1);
    WeeklyTasks.updateProgress('w_endless250', 1);

    if (state.bpStats) {
      state.bpStats.play_levels = (state.bpStats.play_levels || 0) + 1;
      state.bpStats.endless_levels = (state.bpStats.endless_levels || 0) + 1;
      state.bpStats.earn_coins = (state.bpStats.earn_coins || 0) + reward + (bonus > 0 ? bonus : 0);
      if (window.BPTasks) {
        BPTasks.updateProgress('play_levels', 1);
        BPTasks.updateProgress('endless_levels', 1);
        BPTasks.updateProgress('earn_coins', reward + (bonus > 0 ? bonus : 0));
      }
    }
    if (window.addBpXp) addBpXp(BP_XP_PER_GAME_LEVEL);

    this.registry.set('state', state);
    YandexSDK.saveProgress(state);

    EndlessMode.saveSession(this.levelNumber, this.sessionCoins, this.sessionXp);

    if ((state.endlessBest || 0) < this.levelNumber) {
      state.endlessBest = this.levelNumber;
      this.registry.set('state', state);
      YandexSDK.saveProgress(state);
    }

    var rewardEl = document.getElementById('win-reward-text');
    if (rewardEl) {
      var rewardText = '+' + reward + ' <span class="coin-icon"></span>';
      if (bonus > 0) rewardText += ' (+' + bonus + ' ' + t('win.bonus_label', 'бонус') + ')';
      rewardText += ' + ' + xpReward + ' XP ⭐';
      rewardEl.innerHTML = rewardText;
    }
    safeText('win-bonus-info', t('profile.level_short', 'Уровень') + ' ' + this.levelNumber);
    UI.winOverlay.classList.add('active');
  },

  onTimeUp: function() {
    var self = this;
    this.input.enabled = false;
    if (this.timerEvent) this.timerEvent.remove();
    if (this.timeTracker) this.timeTracker.remove();
    SoundManager.error();

    var completed = this.levelNumber - 1;
    if (completed > 0) {
      EndlessMode.saveResult(completed);
    }
    EndlessMode.clearSession();

    safeText('lose-info', t('lose.progress_n', 'Пройдено уровней: {n}', { n: completed }));
    UI.loseOverlay.classList.add('active');
  }
});

applyFlowSceneMixin(EndlessScene.prototype);
window.EndlessScene = EndlessScene;
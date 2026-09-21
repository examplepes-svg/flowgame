/* ============================================================
   SCENE: Game — обычные уровни, режим путешествия, испытание
   ============================================================ */
var GameScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function GameScene() { Phaser.Scene.call(this, { key: 'Game' }); },

  /* ============================================================
     ИНИЦИАЛИЗАЦИЯ
     ============================================================ */

  init: function(data) {
    this.levelNumber = data.level || 1;
    this.mode = data.mode || 'normal';
    this.region = data.region || null;
    this.config = this.mode === 'challenge'
      ? DailyChallenge.getConfig()
      : LevelGenerator.getConfig(this.levelNumber);
    this.timeLeft = this.config.time || 60;
    this.timeElapsed = 0;
    this.hintUsed = false;
    this.resetUsed = false;
    this.countdownActive = false;
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

    this.applyThemeFromState(state);

    var seed = (this.mode === 'challenge') ? DailyChallenge.getTodaySeed() : undefined;
    this.level = LevelGenerator.generate(this.config.w, this.config.h, this.config.colors, seed);
    this.solution = this.level.paths;

    this.setupHTMLUI();
    this.initStandardScene(state);

    // Таймер обратного отсчёта (только бесконечный/испытание — но на всякий случай)
    if (this.mode === 'endless' || this.mode === 'challenge') {
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
    }

    // Таймер подсчёта времени
    this.timeTracker = this.time.addEvent({
      delay: 1000, loop: true,
      callback: function() {
        self.timeElapsed++;
        if (self.mode === 'normal') UI.setTimer(self.timeElapsed);
      }
    });

    this.scale.on('resize', function() {
      self.scene.restart({ level: self.levelNumber, mode: self.mode, region: self.region });
    });

    this.events.on('shutdown', function() {
      if (self.timerEvent) self.timerEvent.remove();
      if (self.timeTracker) self.timeTracker.remove();
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

    UI.setLevel(this.levelNumber, this.mode);
    UI.setCoins(state.coins);
    UI.setGems(state.gems);
    UI.setProgress(0, this.solution.length);
    UI.show();
    if (this.mode === 'endless' || this.mode === 'challenge') UI.setTimer(this.timeLeft);
    else UI.setTimer(0);

    var boostTimeBtn = document.getElementById('ui-boost-time');
    var boostRevealBtn = document.getElementById('ui-boost-reveal');
    var boostSkipBtn = document.getElementById('ui-boost-skip');

    if (boostTimeBtn) {
      if (this.mode === 'endless' || this.mode === 'challenge') {
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
      } else {
        boostTimeBtn.style.display = 'none';
      }
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
      if (this.mode === 'normal' && this.levelNumber === 10) {
        boostSkipBtn.style.display = 'none';
      } else {
        boostSkipBtn.style.display = '';
        boostSkipBtn.textContent = t('ui.boost_skip', '⏭ Пропуск') + ' ×' + (state.boosters.skip || 0);
        boostSkipBtn.onclick = function() {
          if ((state.boosters.skip || 0) <= 0) { SoundManager.error(); UI.showToast(t('toast.no_boosters', 'Нет бустеров')); return; }
          UI.confirm(
            t('dialog.skip_title', 'Пропустить уровень?'),
            t('dialog.skip_text', 'Будет использован <b>1 бустер «Пропуск»</b>.<br>Уровень засчитается как пройденный, вы получите награду.'),
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
    }

    safeBind('ui-back', function() { SoundManager.click(); goToMainMenu(); });
    safeBind('ui-reset', function() {
      SoundManager.disconnect();
      self.resetUsed = true;
      for (var i = 0; i < self.level.paths.length; i++) self.playerPaths[i] = [];
      for (var y = 0; y < self.level.height; y++) {
        for (var x = 0; x < self.level.width; x++) self.playerGrid[y][x] = -1;
      }
      self.lineParticles = [];
      self.redrawPaths();
      UI.setProgress(0, self.solution.length);
    });
    safeBind('ui-hint', function() { self.showHint(); });
  },

  /* ============================================================
     ХУКИ МИКСИНА
     ============================================================ */

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
     ПОДСКАЗКА / РЕШЕНИЕ
     ============================================================ */

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
     ПРОПУСК УРОВНЯ БУСТЕРОМ
     ============================================================ */

  skipLevelWithBooster: function() {
    var self = this;
    var state = this.registry.get('state');

    if (this.mode === 'normal' && this.region) {
      var regionId = this.region;
      var completed = WorldMapProgress.getRegionCompleted(regionId);

      if (completed >= this.levelNumber) {
        UI.hideAll();
        window.game.scene.stop('Game');
        setTimeout(function() { RegionScreen.open(regionId); }, 100);
        return;
      }

      WorldMapProgress.setRegionProgress(regionId, this.levelNumber);
      WorldMapProgress.setCurrentRegion(regionId);

      var baseReward = 10;
      var reward = applyCoinBoost(baseReward);
      state.coins += reward;
      state.stats.totalCoins += reward;
      var xpReward = PlayerLevels.xpForGameLevel(this.levelNumber, false);
      state.totalXp += xpReward;
      state.playerLevel = PlayerLevels.getLevel(state.totalXp);
      state.levelsCompleted++;
      state.stats.totalLevels++;
      state.currentLevel = this.levelNumber + 1;

      DailyTasks.updateProgress('play3', 1);
      DailyTasks.updateProgress('playRegion1', 1);
      if (this.region) {
        DailyTasks.updateProgress('region3', 1);
        DailyTasks.updateProgress('region10', 1);
      }
      DailyTasks.updateProgress('play5', 1);
      DailyTasks.updateProgress('play10', 1);
      DailyTasks.updateProgress('earn50', reward);
      DailyTasks.updateProgress('earn100', reward);
      DailyTasks.updateProgress('earn250', reward);

      WeeklyTasks.updateProgress('w_play50', 1);
      WeeklyTasks.updateProgress('w_play150', 1);
      WeeklyTasks.updateProgress('w_play300', 1);
      WeeklyTasks.updateProgress('w_region50', 1);
      WeeklyTasks.updateProgress('w_earn1000', reward);
      WeeklyTasks.updateProgress('w_earn3000', reward);

      if (state.bpStats) {
        state.bpStats.play_levels = (state.bpStats.play_levels || 0) + 1;
        state.bpStats.earn_coins = (state.bpStats.earn_coins || 0) + reward;
        if (window.BPTasks) {
          BPTasks.updateProgress('play_levels', 1);
          BPTasks.updateProgress('earn_coins', reward);
        }
      }
      if (window.addBpXp) addBpXp(BP_XP_PER_GAME_LEVEL);

      AchievementManager.check(state);
      this.registry.set('state', state);
      YandexSDK.saveProgress(state);

      UI.showToast(t('toast.level_skipped_full', '⏭ Уровень пропущен! +{coins} <span class="coin-icon"></span> + {xp} XP', { coins: reward, xp: xpReward }), 2000);

      UI.hideAll();
      if (this.timerEvent) this.timerEvent.remove();
      if (this.timeTracker) this.timeTracker.remove();
      window.game.scene.stop('Game');
      setTimeout(function() { RegionScreen.open(regionId); }, 150);
      return;
    }

    if (this.mode === 'normal') state.currentLevel = this.levelNumber + 1;
    this.registry.set('state', state);
    YandexSDK.saveProgress(state);
    UI.showToast(t('toast.level_skipped', '⏭ Уровень пропущен!'));

    if (this.mode === 'challenge') goToMainMenu();
    else this.scene.start('Game', { level: this.levelNumber + 1, mode: this.mode, region: this.region });
  },

  /* ============================================================
     ПОБЕДА / ВРЕМЯ ВЫШЛО
     ============================================================ */

  onVictory: function() {
    var self = this;

    if (this.levelNumber > 10) {
      this.input.enabled = false;
      if (this.timerEvent) this.timerEvent.remove();
      if (this.timeTracker) this.timeTracker.remove();
      if (window.WorldMapUI) WorldMapUI.show();
      return;
    }

    this.input.enabled = false;
    if (this.timerEvent) this.timerEvent.remove();
    if (this.timeTracker) this.timeTracker.remove();
    SoundManager.victory();

    var alreadyCompleted = false;
    if (this.region && this.mode === 'normal') {
      var currentCompleted = WorldMapProgress.getRegionCompleted(this.region);
      alreadyCompleted = (currentCompleted >= this.levelNumber);
    }

    for (var i = 0; i < 5; i++) {
      var fx = this.offsetX + Math.random() * this.boardW;
      var fy = this.offsetY + Math.random() * this.boardH;
      this.spawnFirework(fx, fy);
    }

    var state = this.registry.get('state');
    var reward = 0, speedBonus = 0, xpReward = 0;

    if (!alreadyCompleted && this.mode === 'normal') {
      // === Уровень 10 региона (БОСС) ===
      if (this.levelNumber === 10) {
        WorldMapProgress.setRegionProgress(this.region, 10);
        WorldMapProgress.setCurrentRegion(this.region);
        state.levelsCompleted++;
        state.stats.totalLevels++;

        // === Daily / Weekly задания — те же, что и за обычный уровень ===
        if (this.region) {
          DailyTasks.updateProgress('region3', 1);
          DailyTasks.updateProgress('region10', 1);
          DailyTasks.updateProgress('playRegion1', 1);
        }
        DailyTasks.updateProgress('play3', 1);
        DailyTasks.updateProgress('play5', 1);
        DailyTasks.updateProgress('play10', 1);

        WeeklyTasks.updateProgress('w_play50', 1);
        WeeklyTasks.updateProgress('w_play150', 1);
        WeeklyTasks.updateProgress('w_play300', 1);
        if (this.region) WeeklyTasks.updateProgress('w_region50', 1);

        if (state.bpStats) {
          state.bpStats.play_levels = (state.bpStats.play_levels || 0) + 1;
          if (window.BPTasks) BPTasks.updateProgress('play_levels', 1);
        }
        if (window.addBpXp) addBpXp(BP_XP_PER_GAME_LEVEL);

        AchievementManager.check(state);
        this.registry.set('state', state);
        YandexSDK.saveProgress(state);

        setTimeout(function() {
          BossScreen.show(self.region, function() {
            RegionVictoryHelper.checkAndShow(self.region, function() {
              if (window.WorldMapUI) WorldMapUI.show();
            });
          });
        }, 500);
        return;
      }

      // === Обычный уровень 1–9 ===
      reward = 10;
      if (this.timeElapsed > 0 && this.timeElapsed < 30 && this.config.time) {
        speedBonus = 5;
        reward += speedBonus;
      }
      xpReward = PlayerLevels.xpForGameLevel(this.levelNumber, false);
      if (!this.hintUsed) state.levelsNoHint++;
      state.currentLevel = this.levelNumber + 1;

      if (this.region) {
        DailyTasks.updateProgress('region3', 1);
        DailyTasks.updateProgress('region10', 1);
        DailyTasks.updateProgress('playRegion1', 1);
      }
      DailyTasks.updateProgress('play3', 1);
      DailyTasks.updateProgress('play5', 1);
      DailyTasks.updateProgress('play10', 1);
      if (!this.hintUsed) {
        DailyTasks.updateProgress('noHint3', 1);
        DailyTasks.updateProgress('perfect5', 1);
      }
      if (this.timeElapsed < 60) DailyTasks.updateProgress('fast3', 1);
      DailyTasks.updateProgress('earn50', reward);
      DailyTasks.updateProgress('earn100', reward);
      DailyTasks.updateProgress('earn250', reward);

      WeeklyTasks.updateProgress('w_play50', 1);
      WeeklyTasks.updateProgress('w_play150', 1);
      WeeklyTasks.updateProgress('w_play300', 1);
      if (this.region) WeeklyTasks.updateProgress('w_region50', 1);
      WeeklyTasks.updateProgress('w_earn1000', reward);
      WeeklyTasks.updateProgress('w_earn3000', reward);

      reward = applyCoinBoost(reward);

      state.coins += reward;
      state.stats.totalCoins += reward;
      state.levelsCompleted++;
      state.stats.totalLevels++;
      if (this.timeElapsed > 0 && (state.bestTime === 0 || this.timeElapsed < state.bestTime)) {
        state.bestTime = this.timeElapsed;
      }

      if (state.bpStats) {
        state.bpStats.play_levels = (state.bpStats.play_levels || 0) + 1;
        state.bpStats.earn_coins = (state.bpStats.earn_coins || 0) + reward;

        if (!this.hintUsed) {
          state.bpStats.no_hint_levels = (state.bpStats.no_hint_levels || 0) + 1;
        }
        if (this.timeElapsed > 0 && this.timeElapsed < 60) {
          state.bpStats.fast_levels = (state.bpStats.fast_levels || 0) + 1;
        }

        if (window.BPTasks) {
          BPTasks.updateProgress('play_levels', 1);
          BPTasks.updateProgress('earn_coins', reward);
          if (!this.hintUsed) BPTasks.updateProgress('no_hint_levels', 1);
          if (this.timeElapsed > 0 && this.timeElapsed < 60) BPTasks.updateProgress('fast_levels', 1);
        }
      }
      if (window.addBpXp) addBpXp(BP_XP_PER_GAME_LEVEL);

      var oldLevel = PlayerLevels.getLevel(state.totalXp);
      state.totalXp += xpReward;
      var newLevel = PlayerLevels.getLevel(state.totalXp);
      state.playerLevel = newLevel;

      if (this.region) {
        var completed = WorldMapProgress.getRegionCompleted(this.region);
        var newCompleted = Math.min(this.levelNumber, 10);
        if (newCompleted > completed) WorldMapProgress.setRegionProgress(this.region, newCompleted);
      }

      this.registry.set('state', state);
      var unlocked = AchievementManager.check(state);
      YandexSDK.saveProgress(state);

      var rewardEl = document.getElementById('win-reward-text');
      if (rewardEl) {
        var rewardText = t('win.reward_coins', '+{n} монет', { n: reward }) + ' <span class="coin-icon"></span>';
        if (speedBonus > 0) rewardText += ' ' + t('win.reward_speed', '(+{n} за скорость)', { n: speedBonus });
        rewardText += ' + ' + xpReward + ' XP ⭐';
        rewardEl.innerHTML = rewardText;
      }
      safeText('win-bonus-info', '');
      UI.winOverlay.classList.add('active');

      if (newLevel > oldLevel) {
        setTimeout(function() { SoundManager.levelUp(); UI.showToast(t('toast.level_up', '⭐ Уровень {n}!', { n: newLevel }), 3000); }, 800);
      }
      if (unlocked.length > 0) {
        setTimeout(function() {
          UI.showToast('🏆 ' + unlocked[0].name + ' (+' + unlocked[0].coins + ' <span class="coin-icon"></span>)', 2500);
        }, 1500);
      }
      return;
    }

    // Уже пройден
    var rewardEl2 = document.getElementById('win-reward-text');
    if (rewardEl2) rewardEl2.innerHTML = t('win.already_done', 'Уровень уже пройден');
    safeText('win-bonus-info', t('win.no_reward_repeat', 'Без наград за повтор'));
    UI.winOverlay.classList.add('active');
  },

  onTimeUp: function() {
    var self = this;
    this.input.enabled = false;
    if (this.timeTracker) this.timeTracker.remove();
    SoundManager.error();

    if (this.mode === 'endless' || this.mode === 'challenge') {
      safeText('lose-info', this.mode === 'challenge'
        ? t('lose.challenge_fail', 'Испытание не пройдено')
        : t('lose.progress_n', 'Пройдено уровней: {n}', { n: (this.levelNumber - 1) }));
      UI.loseOverlay.classList.add('active');
      if (this.mode === 'challenge') DailyChallenge.markAttempt();
    }
  }
});

applyFlowSceneMixin(GameScene.prototype);
window.GameScene = GameScene;
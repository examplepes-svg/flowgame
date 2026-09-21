/* ============================================================
   DRAG-SCROLL для списка достижений (как в BP)
   ============================================================ */
var AchListDrag = {
  _bound: null,

  enable: function(el) {
    if (!el) return;
    if (this._bound && this._bound.el === el) return;
    if (this._bound) {
      this._bound.el.removeEventListener('mousedown', this._bound.onDown);
      document.removeEventListener('mousemove', this._bound.onMove);
      document.removeEventListener('mouseup', this._bound.onUp);
      el.removeEventListener('touchstart', this._bound.onTouchStart);
      el.removeEventListener('touchmove', this._bound.onTouchMove);
      el.removeEventListener('touchend', this._bound.onTouchEnd);
    }

    var isDown = false;
    var startX = 0;
    var startY = 0;
    var startScroll = 0;

    var onDown = function(e) {
      isDown = true;
      startX = e.pageX;
      startY = e.pageY;
      startScroll = el.scrollTop;
      el.classList.add('dragging');
      e.preventDefault();
    };
    var onMove = function(e) {
      if (!isDown) return;
      var walkY = e.pageY - startY;
      el.scrollTop = startScroll - walkY;
      e.preventDefault();
    };
    var onUp = function() {
      isDown = false;
      el.classList.remove('dragging');
    };

    var onTouchStart = function(e) {
      isDown = true;
      startX = e.touches[0].pageX;
      startY = e.touches[0].pageY;
      startScroll = el.scrollTop;
    };
    var onTouchMove = function(e) {
      if (!isDown) return;
      var walkY = e.touches[0].pageY - startY;
      el.scrollTop = startScroll - walkY;
    };
    var onTouchEnd = function() {
      isDown = false;
    };

    el.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    this._bound = { el: el, onDown: onDown, onMove: onMove, onUp: onUp,
                    onTouchStart: onTouchStart, onTouchMove: onTouchMove, onTouchEnd: onTouchEnd };
  }
};

/* ============================================================
   SCENE: Menu
   ============================================================ */
var MenuScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function MenuScene() { Phaser.Scene.call(this, { key: 'Menu' }); },
  create: function() {
    var self = this;
    var state = this.registry.get('state') || {};
    try { applyBackground(state.currentBackground || 'void'); } catch(e) {}
    UI.hideAll();
    UI.showDashboard();
    var parent = document.getElementById('game');
    if (parent) { var old = parent.querySelector('canvas.paths-layer'); if (old) old.remove(); }
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
    this.setupDashboard();
    if (!state.tutorialShown) { this.time.delayedCall(300, function() { self.startTutorial(); }); }
    this.events.once('shutdown', function() {
      if (self._tasksResetTimerInterval) {
        clearInterval(self._tasksResetTimerInterval);
        self._tasksResetTimerInterval = null;
      }
      if (self._bpTasksTimerInterval) {
        clearInterval(self._bpTasksTimerInterval);
        self._bpTasksTimerInterval = null;
      }
      var tm = document.getElementById('tasks-modal-overlay');
      if (tm) tm.classList.remove('active');
      self._tasksModalInit = false;
    });
  },

  setupDashboard: function() {
    var self = this;
    var state = this.registry.get('state');
    var lvlInfo = PlayerLevels.getProgress(state.totalXp);

    safeText('dash-username', YandexSDK.playerName || t('common.player', 'Игрок'));
    safeText('dash-userlevel', t('profile.level_short', 'Уровень') + ' ' + lvlInfo.level);
    safeText('dash-userxp', lvlInfo.currentXp + '/' + lvlInfo.neededXp + ' XP');

    var xpRing = document.getElementById('dash-xp-ring');
    if (xpRing) { var cl = 2 * Math.PI * 25; xpRing.setAttribute('stroke-dasharray', cl); xpRing.setAttribute('stroke-dashoffset', cl * (1 - lvlInfo.progress)); }

    safeText('dash-coins', state.coins);
    safeText('dash-gems', state.gems);

    // Кнопка «Ежедневные задания» — открывает модалку
    var toggle = document.getElementById('tasks-toggle');
    if (toggle) {
      toggle.onclick = function(e) {
        e.stopPropagation();
        SoundManager.click();
        self.openTasksModal();
      };
    }

    safeBind('dash-profile', function() { SoundManager.click(); self.openProfile(); });
    safeBind('dash-shop', function() { SoundManager.click(); self.openShop(); });
    safeBind('dash-inventory', function() { SoundManager.click(); self.openInventory(); });
    safeBind('battlepass-btn', function() { SoundManager.click(); self.openBattlePass(); });

    safeBind('dash-leaderboard', function() {
      SoundManager.click();
      self.openLeaderboardExpanded();
    });

    safeBind('btn-big-play', function() {
      SoundManager.click();
      self.openModeSelect();
    });
    safeBind('btn-achievements', function() { SoundManager.click(); self.openAchievements(); });
    safeBind('btn-help', function() { SoundManager.click(); self.startTutorial(); });
    safeBind('btn-settings', function() { SoundManager.click(); self.openSettings(); });

    var endlessBest = EndlessMode.getActualBest();
    if ((state.endlessBest || 0) < endlessBest) {
      state.endlessBest = endlessBest;
      self.registry.set('state', state);
      if (window.YandexSDK) YandexSDK.saveProgress(state);
    }
    var endlessRec = document.getElementById('endless-record');
    if (endlessRec) endlessRec.textContent = endlessBest;

    var duelProgress = EndlessMode.getDuelProgress();
    var duelStatus = document.getElementById('mode-duel-status');
    if (duelStatus) {
      if (duelProgress.unlocked) duelStatus.textContent = t('mode.duel_open', '✓ Открыто');
      else duelStatus.textContent = '🔒 ' + duelProgress.current + '/' + duelProgress.needed;
    }

    this.time.delayedCall(1000, function() { self.checkDailyBonus(); });
  },

  /* ============================================================
     МОДАЛКА ЕЖЕДНЕВНЫХ / ЕЖЕНЕДЕЛЬНЫХ ЗАДАНИЙ
     ============================================================ */

  openTasksModal: function() {
    var self = this;
    var overlay = document.getElementById('tasks-modal-overlay');
    if (!overlay) return;

    // Один раз навешиваем обработчики на табы и кнопку закрытия
    if (!this._tasksModalInit) {
      this._tasksModalInit = true;

      var tabs = overlay.querySelectorAll('.tasks-tab');
      tabs.forEach(function(tab) {
        tab.onclick = function(e) {
          e.stopPropagation();
          SoundManager.click();
          tabs.forEach(function(t) { t.classList.remove('active'); });
          tab.classList.add('active');
          var tabName = tab.dataset.tasksTab;
          self._tasksActiveTab = tabName;
          var listDaily = document.getElementById('tasks-list-daily');
          var listWeekly = document.getElementById('tasks-list-weekly');
          if (listDaily) listDaily.style.display = tabName === 'daily' ? '' : 'none';
          if (listWeekly) listWeekly.style.display = tabName === 'weekly' ? '' : 'none';
          self._renderTasksTab(tabName);
        };
      });

      safeBind('tasks-modal-close', function() {
        SoundManager.click();
        self.closeTasksModal();
      });
    }

    this._tasksActiveTab = this._tasksActiveTab || 'daily';

    // Синхронизируем активный таб
    var allTabs = overlay.querySelectorAll('.tasks-tab');
    allTabs.forEach(function(t) {
      t.classList.toggle('active', t.dataset.tasksTab === self._tasksActiveTab);
    });
    var listDaily = document.getElementById('tasks-list-daily');
    var listWeekly = document.getElementById('tasks-list-weekly');
    if (listDaily) listDaily.style.display = this._tasksActiveTab === 'daily' ? '' : 'none';
    if (listWeekly) listWeekly.style.display = this._tasksActiveTab === 'weekly' ? '' : 'none';

    this._renderTasksTab(this._tasksActiveTab);

    this.input.enabled = false;
    overlay.classList.add('active');
  },

  closeTasksModal: function() {
    var overlay = document.getElementById('tasks-modal-overlay');
    if (overlay) overlay.classList.remove('active');
    if (this._tasksResetTimerInterval) {
      clearInterval(this._tasksResetTimerInterval);
      this._tasksResetTimerInterval = null;
    }
    this.input.enabled = true;
  },

  _renderTasksTab: function(tabName) {
    this._renderResetTimer(tabName);
    if (tabName === 'daily') this._renderDailyTasks();
    else if (tabName === 'weekly') this._renderWeeklyTasks();
  },

  _renderResetTimer: function(tabName) {
    var self = this;
    var el = document.getElementById('tasks-reset-timer');
    if (!el) return;

    if (this._tasksResetTimerInterval) {
      clearInterval(this._tasksResetTimerInterval);
      this._tasksResetTimerInterval = null;
    }

    var update = function() {
      var nowMs = Date.now();
      var MSK_OFFSET = 3 * 60 * 60 * 1000;
      var nowMskMs = nowMs + MSK_OFFSET;
      var diff;

      if (tabName === 'daily') {
        var dayMs = 24 * 60 * 60 * 1000;
        var todayStartMskMs = Math.floor(nowMskMs / dayMs) * dayMs;
        var nextMidnightMskMs = todayStartMskMs + dayMs;
        diff = nextMidnightMskMs - nowMskMs;

        var totalSec = Math.floor(diff / 1000);
        var h = Math.floor(totalSec / 3600);
        var m = Math.floor((totalSec % 3600) / 60);
        var s = totalSec % 60;
        var pad = function(n) { return n < 10 ? '0' + n : '' + n; };

        el.className = 'tasks-reset-timer';
        el.innerHTML = '<span class="reset-timer-label">' + t('menu.reset_timer', '⏱ До сброса:') + '</span>' +
                       '<span class="reset-timer-value">' + pad(h) + ':' + pad(m) + ':' + pad(s) + '</span>';
      } else {
        var d = new Date(nowMskMs);
        var currentDay = d.getUTCDay();
        var daysUntilMonday = (8 - currentDay) % 7;
        if (daysUntilMonday === 0) daysUntilMonday = 7;
        var dayMs2 = 24 * 60 * 60 * 1000;
        var todayStartMskMs2 = Math.floor(nowMskMs / dayMs2) * dayMs2;
        var nextMondayMskMs = todayStartMskMs2 + daysUntilMonday * dayMs2;
        diff = nextMondayMskMs - nowMskMs;

        var totalSec2 = Math.floor(diff / 1000);
        var days = Math.floor(totalSec2 / 86400);
        var h2 = Math.floor((totalSec2 % 86400) / 3600);
        var m2 = Math.floor((totalSec2 % 3600) / 60);
        var s2 = totalSec2 % 60;
        var pad2 = function(n) { return n < 10 ? '0' + n : '' + n; };
        var daysLabel = days > 0 ? (days + t('common.days_short', 'д') + ' ') : '';

        el.className = 'tasks-reset-timer weekly';
        el.innerHTML = '<span class="reset-timer-label">' + t('menu.reset_timer', '⏱ До сброса:') + '</span>' +
                       '<span class="reset-timer-value">' +
                         daysLabel +
                         pad2(h2) + ':' + pad2(m2) + ':' + pad2(s2) +
                       '</span>';
      }
    };

    update();
    this._tasksResetTimerInterval = setInterval(update, 1000);
  },

  _renderDailyTasks: function() {
    var self = this;
    var state = this.registry.get('state');
    var list = document.getElementById('tasks-list-daily');
    if (!list) return;

    // getForRender() возвращает desc/target/reward, вычисленные через t() СЕЙЧАС
    var tasks = DailyTasks.getForRender();
    var streak = DailyStreak.get();
    var allDone = tasks.easy && tasks.medium && tasks.hard &&
                  tasks.easy.completed && tasks.medium.completed && tasks.hard.completed;
    var allClaimed = tasks.allBonusClaimed;

    list.innerHTML = '';

    var streakRow = document.createElement('div');
    streakRow.className = 'tasks-streak';
    streakRow.innerHTML = t('task.streak', '🔥 Серия: <b>{s}</b> дн. · Рекорд: <b>{b}</b>', { s: streak.streak, b: streak.best });
    list.appendChild(streakRow);

    var difficultyLabels = {
      easy:   t('task.easy', 'Простое'),
      medium: t('task.medium', 'Среднее'),
      hard:   t('task.hard', 'Тяжёлое')
    };

    ['easy', 'medium', 'hard'].forEach(function(diff) {
      var tsk = tasks[diff];
      if (!tsk) return;
      var row = document.createElement('div');
      row.className = 'task-item-mini' + (tsk.completed ? ' done' : '');
      var progressText = Math.min(tsk.progress, tsk.target) + '/' + tsk.target;
      var claimHtml = '';
      if (tsk.completed && !tsk.claimed) claimHtml = '<button class="claim-btn">' + t('task.claim', 'Забрать') + '</button>';
      row.innerHTML = '<div class="info"><div class="name">' + tsk.desc + '</div><div class="diff">' + difficultyLabels[diff] + '</div></div>' +
                      '<span class="progress">' + progressText + '</span>' +
                      '<span class="reward">' + tsk.reward + ' <span class="coin-icon"></span></span>' + claimHtml;
      var claimBtn = row.querySelector('.claim-btn');
      if (claimBtn) {
        claimBtn.onclick = function(e) {
          e.stopPropagation();
          var reward = DailyTasks.claim(diff);
          if (reward > 0) {
            state.coins += reward;
            state.tasksCompleted = (state.tasksCompleted || 0) + 1;
            state.stats.totalCoins += reward;
            self.registry.set('state', state);
            YandexSDK.saveProgress(state);
            SoundManager.victory();
            UI.showToast('+' + reward + ' <span class="coin-icon"></span>');
            safeText('dash-coins', state.coins);
            self._renderDailyTasks();
          }
        };
      }
      list.appendChild(row);
    });

    if (allDone && !allClaimed) {
      var bonusBtn = document.createElement('button');
      bonusBtn.className = 'tasks-all-bonus';
      bonusBtn.innerHTML = t('task.all_bonus_daily', '🎁 Бонус за 3 задания: +20 ') + '<span class="gem-icon"></span>';
      bonusBtn.onclick = function(e) {
        e.stopPropagation();
        var result = DailyTasks.claimAllBonus();
        if (!result) return;
        state.gems += result.gems;
        var msg = '+20 <span class="gem-icon"></span>';
        if (result.streak) {
          var m = result.streak.reward;
          state.coins += m.coins;
          state.gems += m.gems;
          state.stats.totalCoins += m.coins;
          msg += ' · 🔥 ' + result.streak.day + ' ' + t('common.days_short', 'дн') + ': +' + m.coins + ' <span class="coin-icon"></span> +' + m.gems + ' <span class="gem-icon"></span>';
        }
        self.registry.set('state', state);
        YandexSDK.saveProgress(state);
        SoundManager.victory();
        UI.showToast(msg, 3000);
        safeText('dash-coins', state.coins);
        safeText('dash-gems', state.gems);
        self._renderDailyTasks();
      };
      list.appendChild(bonusBtn);
    } else if (allClaimed) {
      var doneRow = document.createElement('div');
      doneRow.className = 'tasks-done';
      doneRow.innerHTML = t('task.all_done_daily', '✅ Все задания выполнены!');
      list.appendChild(doneRow);
    }
  },

  _renderWeeklyTasks: function() {
    var self = this;
    var state = this.registry.get('state');
    var list = document.getElementById('tasks-list-weekly');
    if (!list) return;

    // getForRender() — актуальные переводы
    var tasks = WeeklyTasks.getForRender();
    var allDone = tasks.easy && tasks.medium && tasks.hard &&
                  tasks.easy.completed && tasks.medium.completed && tasks.hard.completed;
    var allClaimed = tasks.allBonusClaimed;

    list.innerHTML = '';

    var difficultyLabels = {
      easy:   t('task.easy', 'Простое'),
      medium: t('task.medium', 'Среднее'),
      hard:   t('task.hard', 'Тяжёлое')
    };

    ['easy', 'medium', 'hard'].forEach(function(diff) {
      var tsk = tasks[diff];
      if (!tsk) return;
      var row = document.createElement('div');
      row.className = 'task-item-mini' + (tsk.completed ? ' done' : '');
      var progressText = Math.min(tsk.progress, tsk.target) + '/' + tsk.target;
      var claimHtml = '';
      if (tsk.completed && !tsk.claimed) claimHtml = '<button class="claim-btn">' + t('task.claim', 'Забрать') + '</button>';
      row.innerHTML = '<div class="info"><div class="name">' + tsk.desc + '</div><div class="diff">' + difficultyLabels[diff] + t('task.week_suffix', ' · неделя') + '</div></div>' +
                      '<span class="progress">' + progressText + '</span>' +
                      '<span class="reward">' + tsk.reward + ' <span class="coin-icon"></span></span>' + claimHtml;
      var claimBtn = row.querySelector('.claim-btn');
      if (claimBtn) {
        claimBtn.onclick = function(e) {
          e.stopPropagation();
          var reward = WeeklyTasks.claim(diff);
          if (reward > 0) {
            state.coins += reward;
            state.tasksCompleted = (state.tasksCompleted || 0) + 1;
            state.stats.totalCoins += reward;
            self.registry.set('state', state);
            YandexSDK.saveProgress(state);
            SoundManager.victory();
            UI.showToast('+' + reward + ' <span class="coin-icon"></span>');
            safeText('dash-coins', state.coins);
            self._renderWeeklyTasks();
          }
        };
      }
      list.appendChild(row);
    });

    if (allDone && !allClaimed) {
      var bonusBtn = document.createElement('button');
      bonusBtn.className = 'tasks-all-bonus';
      bonusBtn.innerHTML = t('task.all_bonus_weekly', '🎁 Бонус за 3 задания: +100 ') + '<span class="gem-icon"></span>';
      bonusBtn.onclick = function(e) {
        e.stopPropagation();
        var result = WeeklyTasks.claimAllBonus();
        if (!result) return;
        state.gems += result.gems;
        self.registry.set('state', state);
        YandexSDK.saveProgress(state);
        SoundManager.victory();
        UI.showToast('+' + result.gems + ' <span class="gem-icon"></span>', 2000);
        safeText('dash-gems', state.gems);
        self._renderWeeklyTasks();
      };
      list.appendChild(bonusBtn);
    } else if (allClaimed) {
      var doneRow = document.createElement('div');
      doneRow.className = 'tasks-done';
      doneRow.innerHTML = t('task.all_done_weekly', '✅ Все недельные задания выполнены!');
      list.appendChild(doneRow);
    }
  },

    openModeSelect: function() {
    var self = this;
    this.input.enabled = false;
    UI.modeOverlay.classList.add('active');

    var state = this.registry.get('state');
    var duelProgress = EndlessMode.getDuelProgress();

    var endlessRec = document.getElementById('endless-record');
    if (endlessRec) endlessRec.textContent = EndlessMode.getActualBest();

    // Статус дуэлей: если открыто — показываем ранг + звёзды, иначе — прогресс
    var duelStatus = document.getElementById('mode-duel-status');
    if (duelStatus) {
      if (duelProgress.unlocked) {
        var stars = DuelStats.getStars();
        var rankName = DuelRanks.getRankName(stars);

        duelStatus.innerHTML =
          '<span class="duel-rank-mini" id="mode-duel-rank-icon"></span>' +
          '<span class="duel-rank-mini-name">' + rankName + '</span>' +
          '<span class="duel-rank-mini-stars">' + stars + ' ⭐</span>';

        var rankIconEl = document.getElementById('mode-duel-rank-icon');
        if (rankIconEl) DuelRanks.setIcon(rankIconEl, stars);
      } else {
        duelStatus.textContent = '🔒 ' + duelProgress.current + '/' + duelProgress.needed;
      }
    }

    safeBind('mode-normal', function() {
      SoundManager.click();
      UI.modeOverlay.classList.remove('active');
      self.input.enabled = true;
      WorldMapUI.show();
    });

    safeBind('mode-endless', function() {
      SoundManager.click();
      UI.modeOverlay.classList.remove('active');
      self.input.enabled = true;

      if (EndlessMode.hasSavedSession()) {
        var session = EndlessMode.loadSession();

        var modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'endless-resume-overlay';
        modal.style.zIndex = '500';

        var html = '';
        html += '<div class="modal-panel" style="max-width:400px;">';
        html += '<h3>' + t('endless.saved_title', '♾ Бесконечный режим') + '</h3>';
        html += '<p style="text-align:center;color:#aaa;font-size:14px;margin-bottom:15px;">';
        html += t('endless.saved_text', 'У тебя есть сохранённая игра.') + '<br>';
        html += '<b style="color:#ffd93d;">' + t('profile.level_short', 'Уровень') + ' ' + session.currentLevel + '</b> · ';
        html += '<b style="color:#ffd93d;">' + session.sessionCoins + ' <span class="coin-icon"></span></b> · ';
        html += '<b style="color:#00d2ff;">' + session.sessionXp + ' XP</b>';
        html += '</p>';
        html += '<button class="modal-btn" id="endless-resume">' + t('endless.resume', '▶ Продолжить') + '</button>';
        html += '<button class="modal-btn secondary" id="endless-new">' + t('endless.new_game', '🆕 Новая игра') + '</button>';
        html += '<button class="modal-btn secondary" id="endless-cancel">' + t('common.cancel', 'Отмена') + '</button>';
        html += '</div>';

        modal.innerHTML = html;
        document.body.appendChild(modal);

        safeBind('endless-resume', function() {
          SoundManager.click();
          modal.remove();
          window.game.scene.start('Endless', { level: session.currentLevel + 1, resume: true });
        });

        safeBind('endless-new', function() {
          SoundManager.click();
          EndlessMode.clearSession();
          modal.remove();
          window.game.scene.start('Endless', { level: 1 });
        });

        safeBind('endless-cancel', function() {
          SoundManager.click();
          modal.remove();
          self.openModeSelect();
        });
      } else {
        window.game.scene.start('Endless', { level: 1 });
      }
    });

    safeBind('mode-challenge', function() {
      if (!duelProgress.unlocked) {
        SoundManager.error();
        var remaining = duelProgress.needed - duelProgress.current;
        UI.showToast(t('mode.duel_locked_msg', '🔒 Пройди ещё {n} уровней в бесконечном!', { n: remaining }), 2500);
        return;
      }
      SoundManager.click();
      UI.modeOverlay.classList.remove('active');
      self.input.enabled = true;
      DuelMenu.show();
    });

    safeBind('mode-close', function() {
      SoundManager.click();
      UI.modeOverlay.classList.remove('active');
      self.input.enabled = true;
    });
  },

    openLeaderboardExpanded: function(type, options) {
    var self = this;
    options = options || {};
    this.input.enabled = false;
    UI.lbOverlay.classList.add('active');

    var savedTab = localStorage.getItem('flow_lb_last_tab') || 'levels';
    var initialTab = type || savedTab;

    // Если вызвано из дуэлей — прячем весь блок табов целиком
    var tabsContainer = UI.lbOverlay.querySelector('.lb-tabs');
    if (tabsContainer) {
      if (options.duelOnly) {
        tabsContainer.style.display = 'none';
        initialTab = 'duel';
      } else {
        tabsContainer.style.display = '';
      }
    }

    var tabExists = !!document.querySelector('#lb-overlay .lb-tab[data-lb="' + initialTab + '"]');
    if (!tabExists) initialTab = 'levels';

    document.querySelectorAll('#lb-overlay .lb-tab').forEach(function(t) { t.classList.remove('active'); });
    var activeBtn = document.querySelector('#lb-overlay .lb-tab[data-lb="' + initialTab + '"]');
    if (activeBtn) activeBtn.classList.add('active');

    self.renderExpandedLeaderboard(initialTab);

    document.querySelectorAll('#lb-overlay .lb-tab').forEach(function(tab) {
      tab.onclick = function() {
        document.querySelectorAll('#lb-overlay .lb-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        localStorage.setItem('flow_lb_last_tab', tab.dataset.lb);
        self.renderExpandedLeaderboard(tab.dataset.lb);
      };
    });

    safeBind('lb-close', function() {
      UI.lbOverlay.classList.remove('active');
      self.input.enabled = true;

      // Восстанавливаем видимость табов на будущее
      if (tabsContainer) {
        tabsContainer.style.display = '';
      }

      if (typeof options.onClose === 'function') {
        options.onClose();
      }
    });
  },

  renderExpandedLeaderboard: function(type) {
    var state = this.registry.get('state');
    var playerName = YandexSDK.playerName || t('common.player', 'Игрок');

    var playerScore = 0;
    if (type === 'levels') {
      playerScore = state.levelsCompleted;
    } else if (type === 'endless') {
      var bestFromState = state.endlessBest || 0;
      var actualBest = (window.EndlessMode && EndlessMode.getActualBest) ? EndlessMode.getActualBest() : 0;
      playerScore = Math.max(bestFromState, actualBest);
    } else if (type === 'duel') {
      playerScore = DuelStats.getStars();
    }

    var list = document.getElementById('lb-list');
    var floatingWrap = document.getElementById('lb-me-floating-wrap');
    if (!list) return;
    list.innerHTML = '';
    if (floatingWrap) floatingWrap.innerHTML = '';

    list.style.opacity = '0';
    list.style.transform = 'translateY(8px)';
    list.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    var self = this;
    var isDuel = type === 'duel';
    var youSuffix = t('lb.you', ' (вы)');
    var getLB = isDuel
      ? DuelLeaderboard.getLeaderboard(playerName, playerScore)
      : Leaderboard.getLeaderboard(type, playerName, playerScore);

    getLB.then(function(entries) {
      list.innerHTML = '';
      var meIndex = entries.findIndex(function(e) { return e.isMe; });
      var meEntry = meIndex >= 0 ? entries[meIndex] : null;

      var top10 = entries.slice(0, 10);
      top10.forEach(function(e, idx) {
        var rank = idx + 1;
        var rankClass = rank === 1 ? 'gold' : (rank === 2 ? 'silver' : (rank === 3 ? 'bronze' : ''));
        var medal = rank === 1 ? '🥇' : (rank === 2 ? '🥈' : (rank === 3 ? '🥉' : rank));
        var topClass = rank <= 3 ? (' top-' + rank) : '';
        var div = document.createElement('div');
        div.className = 'lb-row' + (e.isMe ? ' me' : '') + topClass;
        div.innerHTML = '<div class="lb-rank ' + rankClass + '">' + medal + '</div>' +
                        '<div class="lb-name">' + e.name + (e.isMe ? youSuffix : '') + '</div>' +
                        '<div class="lb-score">' + e.score + (isDuel ? ' ⭐' : '') + '</div>';
        list.appendChild(div);
      });

      var sep = document.createElement('div');
      sep.className = 'lb-sep';
      sep.textContent = '• • •';
      list.appendChild(sep);

      entries.slice(10, 250).forEach(function(e, idx) {
        if (e.isMe) return;
        var rank = idx + 11;
        var div = document.createElement('div');
        div.className = 'lb-row';
        div.innerHTML = '<div class="lb-rank">' + rank + '</div>' +
                        '<div class="lb-name">' + e.name + '</div>' +
                        '<div class="lb-score">' + e.score + (isDuel ? ' ⭐' : '') + '</div>';
        list.appendChild(div);
      });

      if (floatingWrap && meIndex >= 10) {
        var meDiv = document.createElement('div');
        meDiv.className = 'lb-me-floating';
        meDiv.innerHTML = '<div class="lb-me-floating-label">' + t('lb.your_place', 'Ваша позиция:') + '</div>' +
          '<div class="lb-me-floating-row">' +
            '<div class="lb-rank gold" style="font-size:22px;">' + (meIndex + 1) + '</div>' +
            '<div class="lb-name" style="font-size:15px;">' + (meEntry ? meEntry.name : playerName) + youSuffix + '</div>' +
            '<div class="lb-score" style="font-size:16px;">' + (meEntry ? meEntry.score : playerScore) + (isDuel ? ' ⭐' : '') + '</div>' +
          '</div>';
        floatingWrap.appendChild(meDiv);
      }

      requestAnimationFrame(function() {
        list.style.opacity = '1';
        list.style.transform = 'translateY(0)';
      });
    });

    list.addEventListener('wheel', function(e) {
      list.scrollTop += e.deltaY;
      e.preventDefault();
    }, { passive: false });
  },

  startTutorial: function() {
    var self = this;
    var overlay = document.getElementById('tut-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
    var canvas = document.getElementById('tut-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var GRID = 3; var CELL = 140; var OFFSET = 40;
    function center(row, col) { return { x: OFFSET + col * CELL + CELL / 2, y: OFFSET + row * CELL + CELL / 2 }; }
    function drawGrid() {
      ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, 500, 500);
      ctx.fillStyle = '#252540'; ctx.fillRect(OFFSET - 4, OFFSET - 4, GRID * CELL + 8, GRID * CELL + 8);
      ctx.strokeStyle = '#3a3a5a'; ctx.lineWidth = 1.5;
      for (var i = 0; i <= GRID; i++) {
        ctx.beginPath(); ctx.moveTo(OFFSET + i * CELL, OFFSET); ctx.lineTo(OFFSET + i * CELL, OFFSET + GRID * CELL); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(OFFSET, OFFSET + i * CELL); ctx.lineTo(OFFSET + GRID * CELL, OFFSET + i * CELL); ctx.stroke();
      }
    }
    function drawDot(row, col, color) {
      var c = center(row, col); var r = CELL * 0.3;
      ctx.beginPath(); ctx.arc(c.x, c.y + 2, r + 1, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.5; ctx.stroke();
    }
    function drawLine(points, color) {
      if (points.length < 2) return;
      var thickness = CELL * 0.38;
      ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
      for (var i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.strokeStyle = color; ctx.globalAlpha = 0.22; ctx.lineWidth = thickness + 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineWidth = thickness; ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = 0.15; ctx.lineWidth = Math.max(1, thickness * 0.25); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    function drawBigX(x, y) {
      var s = 45;
      ctx.strokeStyle = '#000'; ctx.lineWidth = 20; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke();
    }
    function drawSmallX(row, col) {
      var c = center(row, col); var s = 20;
      ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(c.x - s, c.y - s); ctx.lineTo(c.x + s, c.y + s); ctx.moveTo(c.x + s, c.y - s); ctx.lineTo(c.x - s, c.y + s); ctx.stroke();
    }
    var RED = '#ff4757'; var BLUE = '#1e90ff';
    var steps = [
      { hint: t('tut.hint1', '🎯<span class="space"></span><b>Задача игры:</b><span class="space"></span>соедини пары точек одного цвета линиями.'), draw: function() { drawGrid(); drawDot(0, 0, BLUE); drawDot(0, 2, BLUE); drawDot(2, 0, RED); drawDot(1, 2, RED); } },
      { hint: t('tut.hint2', '👆<span class="space"></span><b>Веди линию</b><span class="space"></span>от точки к точке того же цвета.'), draw: function() { drawGrid(); drawLine([center(0,0), center(0,1), center(0,2)], BLUE); drawDot(0, 0, BLUE); drawDot(0, 2, BLUE); drawDot(2, 0, RED); drawDot(1, 2, RED); } },
      { hint: t('tut.hint3', '⚠️<span class="space"></span><b>Главное правило:</b><span class="space"></span>линия должна заполнить ВСЕ клетки.'), draw: function() { drawGrid(); drawLine([center(0,0), center(0,1), center(0,2)], BLUE); drawLine([center(2,0), center(1,0), center(1,1), center(1,2)], RED); drawDot(0, 0, BLUE); drawDot(0, 2, BLUE); drawDot(2, 0, RED); drawDot(1, 2, RED); drawSmallX(2, 1); } },
      { hint: t('tut.hint4', '🚫<span class="space"></span><b>Линии не должны пересекаться.</b>'), draw: function() { drawGrid(); drawLine([center(0,0), center(1,0), center(1,1), center(0,1), center(0,2)], BLUE); drawLine([center(2,0), center(2,1), center(1,1), center(1,2)], RED); drawDot(0, 0, BLUE); drawDot(0, 2, BLUE); drawDot(2, 0, RED); drawDot(1, 2, RED); var c = center(1, 1); drawBigX(c.x, c.y); } },
      { hint: t('tut.hint5', '✅<span class="space"></span><b>Готово!</b><span class="space"></span>Удачи!'), draw: function() { drawGrid(); drawLine([center(0,0), center(0,1), center(0,2)], BLUE); drawLine([center(2,0), center(1,0), center(1,1), center(2,1), center(2,2), center(1,2)], RED); drawDot(0, 0, BLUE); drawDot(0, 2, BLUE); drawDot(2, 0, RED); drawDot(1, 2, RED); } }
    ];
    var stepIdx = 0;
    var stepEl = document.getElementById('tut-step');
    var hintEl = document.getElementById('tut-hint');
    var nextBtn = document.getElementById('tut-next');
    var skipBtn = document.getElementById('tut-skip');
    function renderStep() {
      stepEl.textContent = stepIdx + 1;
      hintEl.innerHTML = steps[stepIdx].hint;
      steps[stepIdx].draw();
      nextBtn.textContent = (stepIdx === steps.length - 1) ? t('tut.finish', '🎮 Начать играть') : t('tut.next', 'Далее →');
    }
    function closeTutorial() {
      overlay.classList.remove('active');
      var st = self.registry.get('state');
      st.tutorialShown = true;
      self.registry.set('state', st);
      YandexSDK.saveProgress(st);
      self.input.enabled = true;
    }
    nextBtn.onclick = function() { SoundManager.click(); stepIdx++; if (stepIdx >= steps.length) closeTutorial(); else renderStep(); };
    skipBtn.onclick = function() { SoundManager.click(); closeTutorial(); };
    renderStep();
  },

  openProfile: function() {
    var state = this.registry.get('state');
    var lvl = PlayerLevels.getProgress(state.totalXp);
    safeText('profile-name', YandexSDK.playerName || t('common.player', 'Игрок'));
    safeText('profile-level', t('profile.level_short', 'Уровень') + ' ' + lvl.level);
    safeText('profile-rewards', lvl.currentXp + '/' + lvl.neededXp + ' XP');
    var ring = document.getElementById('profile-xp-ring');
    if (ring) { var cl = 2 * Math.PI * 36; ring.setAttribute('stroke-dasharray', cl); ring.setAttribute('stroke-dashoffset', cl * (1 - lvl.progress)); }
    var list = document.getElementById('profile-list');
    if (list) {
      list.innerHTML = '';
      var rows = [
        [t('profile.total_xp', 'Всего XP'), state.totalXp],
        [t('profile.level', 'Уровень игрока'), lvl.level],
        [t('profile.levels_done', 'Пройдено уровней'), state.levelsCompleted],
        [t('profile.challenges', 'Испытаний'), state.challengesCompleted],
        [t('profile.endless_best', 'Рекорд бесконечного'), state.endlessBest],
        [t('profile.achievements', 'Достижений'), state.achievements.length + ' / ' + ACHIEVEMENTS.length],
        [t('profile.total_coins', 'Монет всего'), state.stats.totalCoins],
        [t('profile.time', 'Время в игре'), formatTime(Math.floor(state.stats.totalTime))],
        [t('profile.leaves', 'Листиков'), state.leaves || 0]
      ];
      rows.forEach(function(r) {
        var div = document.createElement('div'); div.className = 'stat-row';
        div.innerHTML = '<span class="stat-label">' + r[0] + '</span><span class="stat-value">' + r[1] + '</span>';
        list.appendChild(div);
      });
    }

    var duelStatsEl = document.getElementById('profile-duel-stats');
    if (duelStatsEl) {
      var ds = DuelStats.get();
      var rank = DuelRanks.getRank(ds.stars);
      var rankName = rank.rank === 'legend'
        ? ('👑 ' + t('rank.legend', 'Легенда'))
        : (t('rank.' + rank.rank, rank.rankName) + ' ' + (rank.row + 1));
      var winRate = ds.totalGames > 0 ? Math.round((ds.wins / ds.totalGames) * 100) : 0;

      duelStatsEl.innerHTML =
        '<h3 style="color:#ffd93d;font-size:16px;margin:16px 0 10px;text-align:center;">' + t('profile.duel_title', '⚔️ СТАТИСТИКА ДУЭЛЕЙ') + '</h3>' +
        '<div class="stat-row"><span class="stat-label">' + t('profile.duel_rank', 'Ранг') + '</span><span class="stat-value" style="color:#ffd93d;">' + rankName + '</span></div>' +
        '<div class="stat-row"><span class="stat-label">' + t('profile.duel_stars', 'Звёзды') + '</span><span class="stat-value">' + ds.stars + ' ⭐</span></div>' +
        '<div class="stat-row"><span class="stat-label">' + t('profile.duel_total', 'Всего игр') + '</span><span class="stat-value">' + ds.totalGames + '</span></div>' +
        '<div class="stat-row"><span class="stat-label">' + t('profile.duel_wins', 'Побед') + '</span><span class="stat-value" style="color:#2ed573;">' + ds.wins + '</span></div>' +
        '<div class="stat-row"><span class="stat-label">' + t('profile.duel_loses', 'Поражений') + '</span><span class="stat-value" style="color:#e74c3c;">' + ds.loses + '</span></div>' +
        '<div class="stat-row"><span class="stat-label">' + t('profile.duel_winrate', 'Процент побед') + '</span><span class="stat-value">' + winRate + '%</span></div>' +
        '<div class="stat-row"><span class="stat-label">' + t('profile.duel_best_streak', 'Лучшая серия') + '</span><span class="stat-value">🔥 ' + ds.bestStreak + '</span></div>';
    }

    this.input.enabled = false;
    UI.profileOverlay.classList.add('active');
  },

  checkDailyBonus: function() {
    var self = this;
    var state = this.registry.get('state');
    var today = todayStr();
    if (state.lastVisit === today) return;
    var yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    var yesterdayStr = yesterday.getFullYear() + '-' + (yesterday.getMonth()+1) + '-' + yesterday.getDate();
    if (state.lastVisit === yesterdayStr) state.streak = (state.streak || 0) + 1;
    else state.streak = 1;
    if (state.streak > 7) state.streak = 1;
    state.lastVisit = today;
    this.registry.set('state', state);
    YandexSDK.saveProgress(state);
    this.showDailyOverlay();
  },

  showDailyOverlay: function() {
    var self = this;
    var state = this.registry.get('state');

    var grid = document.getElementById('daily-grid');
    if (!grid) return;
    grid.innerHTML = '';
    var rewards = [30, 50, 70, 100, 150, 200, 300];
    for (var i = 0; i < 7; i++) {
      var div = document.createElement('div'); div.className = 'daily-day';
      if (i + 1 < state.streak) div.classList.add('claimed');
      if (i + 1 === state.streak) div.classList.add('today');
      div.innerHTML = t('daily.day', 'День {n}', { n: i + 1 }) + '<div class="reward">' + rewards[i] + ' <span class="coin-icon"></span></div>';
      grid.appendChild(div);
    }
    safeText('daily-streak', t('daily.streak', 'Серия: {n} дней подряд', { n: state.streak }));

    var oldReset = document.getElementById('daily-reset-btn');
    if (oldReset) oldReset.remove();

    var resetBtn = document.createElement('button');
    resetBtn.id = 'daily-reset-btn';
    resetBtn.className = 'modal-btn secondary';
    resetBtn.style.cssText = 'margin-top:8px;font-size:14px;';
    resetBtn.innerHTML = t('daily.reset', '🔄 Сбросить серию (30 ') + '<span class="gem-icon"></span>)';
    resetBtn.onclick = function() {
      if (state.gems < 30) { SoundManager.error(); UI.showToast(t('toast.no_gems', 'Недостаточно алмазов')); return; }
      state.gems -= 30;
      state.streak = 1;
      state.lastVisit = '';
      self.registry.set('state', state);
      YandexSDK.saveProgress(state);
      SoundManager.victory();
      UI.showToast(t('daily.reset_toast', 'Серия сброшена!'));
      self.showDailyOverlay();
    };
    var claimBtn = document.getElementById('daily-claim');
    if (claimBtn && claimBtn.parentNode) claimBtn.parentNode.insertBefore(resetBtn, claimBtn.nextSibling);

    this.input.enabled = false;
    UI.dailyOverlay.classList.add('active');

    safeBind('daily-claim', function() {
      var reward = rewards[state.streak - 1];
      state.coins += reward;
      state.stats.totalCoins += reward;
      this.registry.set('state', state);
      YandexSDK.saveProgress(state);
      SoundManager.victory();
      UI.dailyOverlay.classList.remove('active');
      this.input.enabled = true;
      UI.showToast('+' + reward, 1500);
      this.scene.restart();
    }.bind(this));
    DailyTasks.updateProgress('dailyBonus', 1);
  },

  openSettings: function() {
    var self = this;
    this.input.enabled = false;
    UI.settingsOverlay.classList.add('active');
    var soundIcon = document.getElementById('set-sound-icon');
    var musicIcon = document.getElementById('set-music-icon');
    var volSlider = document.getElementById('set-volume');
    var volLabel = document.getElementById('set-volume-label');
    if (soundIcon) soundIcon.textContent = SoundManager.enabled ? '🔊' : '🔇';
    if (musicIcon) musicIcon.textContent = SoundManager.musicEnabled ? '🎵' : '🚫';
    if (volSlider) volSlider.value = Math.round(SoundManager.volume * 100);
    if (volLabel) volLabel.textContent = Math.round(SoundManager.volume * 100) + '%';

    safeBind('set-sound', function() { var on = SoundManager.toggle(); if (soundIcon) soundIcon.textContent = on ? '🔊' : '🔇'; });
    safeBind('set-music', function() { var on = SoundManager.toggleMusic(); if (musicIcon) musicIcon.textContent = on ? '🎵' : '🚫'; });
    if (volSlider) volSlider.oninput = function() { var v = parseInt(volSlider.value) / 100; SoundManager.setVolume(v); if (volLabel) volLabel.textContent = volSlider.value + '%'; };

    // П.6.9 — Язык
    var langButtons = document.querySelectorAll('.lang-btn');
    var currentLang = getLang();

    langButtons.forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
      btn.onclick = function() {
        var lang = btn.dataset.lang;
        if (lang === getLang()) return;
        SoundManager.click();

        setLang(lang);

        langButtons.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');

        self.scene.restart();
      };
    });

    safeBind('settings-close', function() { UI.settingsOverlay.classList.remove('active'); self.input.enabled = true; });
  },

  /* ============================================================
     FALLPASS 2026 — БАТТЛПАСС
     ============================================================ */

  openBattlePass: function() {
    var self = this;
    this.input.enabled = false;

    var bg = document.getElementById('bp-bg');
    if (bg) {
      var testImg = new Image();
      testImg.onload = function() { bg.style.backgroundImage = "url('assets/ui/battlepass_bg.webp')"; };
      testImg.onerror = function() {
        bg.style.backgroundImage = 'linear-gradient(180deg, #3a2510 0%, #6b3f18 40%, #b86b2a 70%, #d99a3a 100%)';
      };
      testImg.src = 'assets/ui/battlepass_bg.webp';
    }

    UI.bpOverlay.classList.add('active');

    self.renderBattlePass();
    self.renderBpRewardsStrip();
    self.updateBpTopBar();
    self.renderBpTasksButton();

    safeBind('battlepass-close', function() {
      SoundManager.click();
      UI.bpOverlay.classList.remove('active');
      self.stopBpTasksTimer();
      self.input.enabled = true;
      self.scene.restart();
    });

    safeBind('bp-shop-open', function() {
      SoundManager.click();
      self.openBpShop();
    });

    safeBind('bp-upgrade-btn', function() {
      SoundManager.click();
      self.showBpUpgradeDialog();
    });

    safeBind('bp-tasks-btn', function() {
      SoundManager.click();
      self.openBpTasksModal();
    });

    self.setupBpStripDrag();
  },

  updateBpTopBar: function() {
    var state = this.registry.get('state');
    safeText('bp-leaves-count', state.leaves || 0);

    var upgradeBtn = document.getElementById('bp-upgrade-btn');
    var premiumBadge = document.getElementById('bp-premium-badge');
    if (state.bpPremium) {
      if (upgradeBtn) upgradeBtn.style.display = 'none';
      if (premiumBadge) premiumBadge.style.display = '';
    } else {
      if (upgradeBtn) upgradeBtn.style.display = '';
      if (premiumBadge) premiumBadge.style.display = 'none';
    }
  },

  renderBattlePass: function() {
    var state = this.registry.get('state');
    var bpInfo = BattlePass.getProgress(state.battlepassXp);
    safeText('bp-current-level', bpInfo.level);
    var fill = document.getElementById('bp-progress-fill');
    if (fill) fill.style.width = (bpInfo.progress * 100) + '%';
    safeText('bp-xp-text', bpInfo.currentXp + ' / ' + bpInfo.neededXp + ' XP');
  },

  renderBpTasksButton: function() {
    var claimable = 0;
    var data = BPTasks.generate();
    var self = this;
    data.tasks.forEach(function(slot) {
      if (slot.completed && !slot.claimed && BPTasks._findTpl(slot.id)) claimable++;
    });

    var badge = document.getElementById('bp-tasks-badge');
    if (!badge) return;

    if (claimable > 0) {
      badge.textContent = claimable;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  },

  openBpTasksModal: function() {
    var self = this;
    var overlay = document.getElementById('bp-tasks-overlay');
    if (!overlay) return;

    self.renderBpTasksModal();
    overlay.classList.add('active');

    safeBind('bp-tasks-close', function() {
      SoundManager.click();
      overlay.classList.remove('active');
      self.stopBpTasksTimer();
    });
  },

  renderBpTasksModal: function() {
    var self = this;
    var list = document.getElementById('bp-tasks-modal-list');
    if (!list) return;

    // getForRender() — desc уже переведён на текущий язык
    var tasks = BPTasks.getForRender();
    list.innerHTML = '';

    tasks.forEach(function(tsk) {
      var card = document.createElement('div');
      card.className = 'bp-task-card' + (tsk.completed ? ' done' : '') + (tsk.claimed ? ' claimed' : '');

      var pct = Math.min(100, (tsk.progress / tsk.target) * 100);
      var progressText = Math.min(tsk.progress, tsk.target) + ' / ' + tsk.target;
      var descText = tsk.desc;

      var html = '';
      html += '<div class="bp-task-card-desc">' + descText + '</div>';
      html += '<div class="bp-task-card-bar"><div class="bp-task-card-fill" style="width:' + pct + '%"></div></div>';
      html += '<div class="bp-task-card-footer">';
      html += '<div class="bp-task-card-count">' + progressText + '</div>';
      html += '<div class="bp-task-card-reward">+' + BP_XP_PER_TASK + ' BP XP</div>';
      html += '</div>';

      if (tsk.claimed) {
        html += '<div class="bp-task-card-claimed-mark">' + t('bp.task_claimed', '✓ Получено') + '</div>';
      } else if (tsk.completed) {
        html += '<button class="bp-task-card-claim" data-id="' + tsk.id + '">' + t('bp.claim', 'ЗАБРАТЬ') + '</button>';
      }

      card.innerHTML = html;

      var claimBtn = card.querySelector('.bp-task-card-claim');
      if (claimBtn) {
        claimBtn.onclick = function() { self.claimBpTask(tsk.id); };
      }

      list.appendChild(card);
    });

    self.startBpTasksTimer();
  },

  claimBpTask: function(taskId) {
    var state = this.registry.get('state');
    if (!BPTasks.claim(taskId)) return;

    SoundManager.victory();
    UI.showToast('+' + BP_XP_PER_TASK + ' BP XP', 1500);

    if (window.addBpXp) addBpXp(BP_XP_PER_TASK);

    DailyTasks.updateProgress('bpTask1', 1);
    DailyTasks.updateProgress('bpTask3', 1);
    DailyTasks.updateProgress('bpTask5', 1);

    this.renderBpTasksModal();
    this.renderBattlePass();
    this.renderBpRewardsStrip();
    this.renderBpTasksButton();
  },

  startBpTasksTimer: function() {
    var self = this;
    if (self._bpTasksTimerInterval) clearInterval(self._bpTasksTimerInterval);

    var update = function() {
      var el = document.getElementById('bp-tasks-timer');
      if (!el) return;

      var nowMs = Date.now();
      var MSK_OFFSET = 3 * 60 * 60 * 1000;
      var nowMskMs = nowMs + MSK_OFFSET;
      var dayMs = 24 * 60 * 60 * 1000;
      var todayStartMskMs = Math.floor(nowMskMs / dayMs) * dayMs;
      var nextMidnightMskMs = todayStartMskMs + dayMs;
      var diff = nextMidnightMskMs - nowMskMs;

      var totalSec = Math.floor(diff / 1000);
      var h = Math.floor(totalSec / 3600);
      var m = Math.floor((totalSec % 3600) / 60);
      var s = totalSec % 60;

      var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
      el.textContent = t('bp.tasks_timer', 'Обновление через ') + pad(h) + ':' + pad(m) + ':' + pad(s);
    };

    update();
    self._bpTasksTimerInterval = setInterval(update, 1000);
  },

  stopBpTasksTimer: function() {
    if (this._bpTasksTimerInterval) {
      clearInterval(this._bpTasksTimerInterval);
      this._bpTasksTimerInterval = null;
    }
  },

  renderBpRewardsStrip: function() {
    var self = this;
    var state = this.registry.get('state');
    var strip = document.getElementById('bp-rewards-strip');
    if (!strip) return;

    var currentLevel = BattlePass.getLevel(state.battlepassXp);
    strip.innerHTML = '';

    for (var lvl = 1; lvl <= BP_MAX_LEVEL; lvl++) {
      var isPremium = state.bpPremium;
      var isCurrent = lvl === currentLevel;
      var isUnlocked = lvl <= currentLevel;
      var isFreeClaimed = state.claimedBpLevels.indexOf(lvl) >= 0;
      var isPremiumClaimed = state.claimedBpPremiumLevels.indexOf(lvl) >= 0;
      var isClaimed = isFreeClaimed && (!isPremium || isPremiumClaimed);
      var freeReward = getBpReward(lvl, false);
      var premiumReward = getBpReward(lvl, true);

      var card = document.createElement('div');
      card.className = 'bp-level-card';
      if (isCurrent) card.classList.add('current');
      else if (isClaimed) card.classList.add('claimed');
      else if (isUnlocked) card.classList.add('unlocked');
      else card.classList.add('locked');
      card.dataset.level = lvl;

      var cardHtml = '';
      cardHtml += '<div class="bp-card-num">' + t('bp.card_level_short', 'УР.') + ' ' + lvl + '</div>';
      cardHtml += '<div class="bp-card-rewards">';

      cardHtml += '<div class="bp-card-reward free">';
      if (freeReward.type === 'none') {
        cardHtml += '<div class="bp-card-reward-icon" style="opacity:0.3;">—</div>';
        cardHtml += '<div class="bp-card-reward-name">—</div>';
      } else {
        cardHtml += '<div class="bp-card-reward-icon">' + (freeReward.icon || '') + '</div>';
        cardHtml += '<div class="bp-card-reward-name">' + freeReward.name + '</div>';
      }
      cardHtml += '</div>';

      var premClass = 'bp-card-reward premium' + (isPremium ? '' : ' locked');
      cardHtml += '<div class="' + premClass + '">';
      cardHtml += '<div class="bp-card-reward-icon">' + (premiumReward.icon || '') + '</div>';
      cardHtml += '<div class="bp-card-reward-name">' + premiumReward.name + '</div>';
      if (!isPremium) cardHtml += '<div class="bp-card-reward-lock">🔒</div>';
      cardHtml += '</div>';

      cardHtml += '</div>';

      var isFreeClaimed2 = state.claimedBpLevels.indexOf(lvl) >= 0;
      var isPremiumClaimed2 = state.claimedBpPremiumLevels.indexOf(lvl) >= 0;
      var premiumAvailable = isPremium && !isPremiumClaimed2;
      var freeAvailable = !isFreeClaimed2;
      var hasSomethingToClaim = (isUnlocked && (freeAvailable || premiumAvailable));

      if (isUnlocked && hasSomethingToClaim) {
        var btnLabel = t('bp.claim', 'ЗАБРАТЬ');
        if (!freeAvailable && premiumAvailable) btnLabel = t('bp.claim_premium', 'ЗАБРАТЬ ПРЕМИУМ');
        else if (freeAvailable && premiumAvailable) btnLabel = t('bp.claim_all', 'ЗАБРАТЬ ВСЁ');
        cardHtml += '<button class="bp-card-claim" data-level="' + lvl + '">' + btnLabel + '</button>';
      } else if (isUnlocked && !hasSomethingToClaim) {
  cardHtml += '<div class="bp-card-claimed">' + t('bp.claimed_plain', 'ПОЛУЧЕНО') + '</div>';
} else if (isCurrent) {
        cardHtml += '<button class="bp-card-claim disabled" disabled>' + t('bp.claim', 'ЗАБРАТЬ') + '</button>';
      }

      card.innerHTML = cardHtml;

      var claimBtn = card.querySelector('.bp-card-claim[data-level]');
      if (claimBtn) {
        claimBtn.onclick = function(e) {
          e.stopPropagation();
          self.claimBpReward(parseInt(this.dataset.level));
        };
      }

      strip.appendChild(card);
    }

    setTimeout(function() {
      var currentCard = strip.querySelector('.bp-level-card.current');
      if (currentCard) {
        currentCard.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
      }
    }, 50);
  },

  setupBpStripDrag: function() {
    var strip = document.getElementById('bp-rewards-strip');
    if (!strip) return;

    if (strip._dragHandlers) {
      strip.removeEventListener('mousedown', strip._dragHandlers.mouseDown);
      strip.removeEventListener('touchstart', strip._dragHandlers.touchStart);
    }

    var isDown = false;
    var startX = 0;
    var startScroll = 0;

    var onMouseDown = function(e) {
      isDown = true;
      startX = e.pageX;
      startScroll = strip.scrollLeft;
      strip.classList.add('dragging');
      e.preventDefault();
    };
    var onMouseMove = function(e) {
      if (!isDown) return;
      var walk = e.pageX - startX;
      strip.scrollLeft = startScroll - walk;
      e.preventDefault();
    };
    var onMouseUp = function() {
      isDown = false;
      strip.classList.remove('dragging');
    };

    var onTouchStart = function(e) {
      isDown = true;
      startX = e.touches[0].pageX;
      startScroll = strip.scrollLeft;
    };
    var onTouchMove = function(e) {
      if (!isDown) return;
      var walk = e.touches[0].pageX - startX;
      strip.scrollLeft = startScroll - walk;
    };
    var onTouchEnd = function() {
      isDown = false;
    };

    strip.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    strip.addEventListener('touchstart', onTouchStart, { passive: true });
    strip.addEventListener('touchmove', onTouchMove, { passive: true });
    strip.addEventListener('touchend', onTouchEnd);

    strip._dragHandlers = { mouseDown: onMouseDown, touchStart: onTouchStart };
  },

  claimBpReward: function(level) {
    var self = this;
    var state = this.registry.get('state');

    if (BattlePass.getLevel(state.battlepassXp) < level) return;

    if (!state.claimedBpPremiumLevels) state.claimedBpPremiumLevels = [];

    var isFreeClaimed = state.claimedBpLevels.indexOf(level) >= 0;
    var isPremiumClaimed = state.claimedBpPremiumLevels.indexOf(level) >= 0;
    var isPremium = state.bpPremium;

    var freeReward = getBpReward(level, false);
    var premiumReward = getBpReward(level, true);

    var canClaimFree = !isFreeClaimed;
    var canClaimPremium = isPremium && !isPremiumClaimed;

    if (!canClaimFree && !canClaimPremium) return;

    var received = [];

    if (canClaimFree) {
      var r1 = this._applyReward(state, freeReward);
      if (r1) received.push(r1);
      state.claimedBpLevels.push(level);
    }

    if (canClaimPremium) {
      var r2 = this._applyReward(state, premiumReward);
      if (r2) received.push(r2);
      state.claimedBpPremiumLevels.push(level);
    }

    this.registry.set('state', state);
    YandexSDK.saveProgress(state);

    SoundManager.victory();
    var toastText = received.length > 0 ? received.join('  ') : t('bp.received', 'Получено!');
    UI.showToast('🎁 ' + toastText, 2000);

    self.renderBpRewardsStrip();
    self.updateBpTopBar();
  },

  _applyReward: function(state, reward) {
    if (!reward || reward.type === 'none') return null;

    if (reward.type === 'coins') {
      state.coins += reward.value;
      state.stats.totalCoins += reward.value;
      return '+' + reward.value + ' <span class="coin-icon"></span>';
    }
    if (reward.type === 'gems') {
      state.gems += reward.value;
      return '+' + reward.value + ' <span class="gem-icon"></span>';
    }
    if (reward.type === 'leaves') {
      state.leaves = (state.leaves || 0) + reward.value;
      return '+' + reward.value + ' <span class="leaf-icon"></span>';
    }
    if (reward.type === 'booster') {
      var types = ['time', 'reveal', 'skip'];
      var chosen = types[Math.floor(Math.random() * types.length)];
      state.boosters[chosen] = (state.boosters[chosen] || 0) + 1;
      var names = {
        time:   t('shop.booster_time_name', '🕐 +45 сек'),
        reveal: t('shop.booster_reveal_name', '👁 Решение'),
        skip:   t('shop.booster_skip_name', '⏭ Пропуск')
      };
      return names[chosen];
    }
    if (reward.type === 'chest') {
      state.coins += 150;
      state.stats.totalCoins += 150;
      return '<span class="chest-icon"></span> ' + t('bp.chest_short', 'Сундук') + ' (+150 <span class="coin-icon"></span>)';
    }
    return null;
  },

  showBpUpgradeDialog: function() {
    var self = this;
    var state = this.registry.get('state');

    var text = '';
    text += t('bp.upgrade_text_1', 'Улучши FallPass и получай <b>дополнительные награды</b> на каждом уровне!') + '<br><br>';
    text += t('bp.upgrade_text_2', '⭐ <b>Премиум-трек</b> — вторая дорожка наград') + '<br>';
    text += t('bp.upgrade_text_3', 'Больше листиков, монет и алмазов') + '<br><br>';
    text += t('bp.upgrade_cost', 'Стоимость: <b>{gems} <span class="gem-icon"></span></b> или <b>посмотреть {ads} реклам</b>', { gems: BP_UPGRADE_COST_GEMS, ads: BP_UPGRADE_COST_ADS }) + '<br>';
    text += '<span style="color:#888;font-size:12px;">' + t('bp.upgrade_watched', 'Просмотрено: {cur} / {max}', { cur: (state.bpPremiumAdsWatched || 0), max: BP_UPGRADE_COST_ADS }) + '</span>';

    UI.confirm(t('bp.upgrade_title', '⭐ Улучшить FallPass'), text, [
      { label: t('bp.upgrade_gems_btn', '{n} 💎', { n: BP_UPGRADE_COST_GEMS }), class: 'yes', action: function() { self.buyBpUpgrade('gems'); } },
      { label: t('bp.upgrade_ads_btn', '📺 Реклама ({cur}/{max})', { cur: (state.bpPremiumAdsWatched || 0), max: BP_UPGRADE_COST_ADS }), class: 'ad', action: function() { self.buyBpUpgrade('ads'); } },
      { label: t('bp.upgrade_cancel', 'Отмена'), class: 'no', action: function() {} }
    ]);
  },

  buyBpUpgrade: function(method) {
    var self = this;
    var state = this.registry.get('state');

    if (state.bpPremium) { UI.showToast(t('bp.premium_already', 'Премиум уже активен')); return; }

    if (method === 'gems') {
      if (state.gems < BP_UPGRADE_COST_GEMS) {
        SoundManager.error();
        UI.showToast(t('bp.not_enough_gems', 'Недостаточно алмазов'));
        return;
      }
      state.gems -= BP_UPGRADE_COST_GEMS;
      state.bpPremium = true;
      this.registry.set('state', state);
      YandexSDK.saveProgress(state);
      SoundManager.victory();
      UI.showToast(t('bp.premium_activated', '⭐ Премиум активирован!'), 2500);
      self.updateBpTopBar();
      self.renderBpRewardsStrip();
      return;
    }

    if (method === 'ads') {
      YandexSDK.showRewardedVideo().then(function(ok) {
        if (!ok) return;
        state.bpPremiumAdsWatched = (state.bpPremiumAdsWatched || 0) + 1;
        if (state.bpPremiumAdsWatched >= BP_UPGRADE_COST_ADS) {
          state.bpPremium = true;
          state.bpPremiumAdsWatched = 0;
          self.registry.set('state', state);
          YandexSDK.saveProgress(state);
          SoundManager.victory();
          UI.showToast(t('bp.premium_activated', '⭐ Премиум активирован!'), 2500);
        } else {
          self.registry.set('state', state);
          YandexSDK.saveProgress(state);
          UI.showToast(t('bp.ad_watched', '📺 Просмотрено {cur} / {max}', { cur: state.bpPremiumAdsWatched, max: BP_UPGRADE_COST_ADS }), 2000);
        }
        self.updateBpTopBar();
        self.renderBpRewardsStrip();
      });
    }
  },

  openBpShop: function() {
    var self = this;
    var state = this.registry.get('state');

    var overlay = document.getElementById('bp-shop-overlay');
    if (!overlay) return;

    self.renderBpShop();
    overlay.classList.add('active');

    safeBind('bp-shop-close', function() {
      SoundManager.click();
      overlay.classList.remove('active');
    });
  },

  renderBpShop: function() {
    var self = this;
    var state = this.registry.get('state');
    var content = document.getElementById('bp-shop-content');
    if (!content) return;

    var leaves = state.leaves || 0;
    var html = '';

    html += '<div class="bp-shop-balance">';
    html += '<span>' + t('bp.balance', 'Твой баланс:') + '</span>';
    html += '<span class="leaf-icon"></span>';
    html += '<span id="bp-shop-leaves">' + leaves + '</span>';
    html += '</div>';

    html += '<div class="bp-shop-grid">';
    BP_SHOP_ITEMS.forEach(function(item) {
      var owned = self._isBpShopItemOwned(item, state);
      var canBuy = leaves >= item.leafPrice && !owned;

      html += '<div class="bp-shop-item' + (owned ? ' owned' : '') + '" data-item="' + item.id + '">';

      html += '<div class="bp-shop-item-preview' + (item.type === 'theme' ? ' theme-anime-preview' : (item.type === 'trail' ? ' trail-preview' : '')) + '">';
      if (item.type === 'background' && item.preview) {
        html += '<img src="' + item.preview + '" alt="">';
      } else if (item.type === 'theme') {
        for (var f = 0; f < 8; f++) {
          html += '<div class="theme-face-cell" data-face="' + f + '"></div>';
        }
      } else if (item.type === 'trail') {
        html += '<div style="font-size:36px;">💗</div>';
      }
      html += '</div>';

      html += '<div class="bp-shop-item-name">' + item.name + '</div>';

      if (!owned) {
        html += '<div class="bp-shop-item-price">' + item.leafPrice + ' <span class="leaf-icon"></span></div>';
      }

      if (owned) {
        html += '<button class="bp-shop-item-btn owned" disabled>' + t('bp.item_bought', 'КУПЛЕНО') + '</button>';
      } else {
        html += '<button class="bp-shop-item-btn" data-buy="' + item.id + '"' + (canBuy ? '' : ' disabled') + '>' + t('bp.item_buy', 'КУПИТЬ') + '</button>';
      }

      html += '</div>';
    });
    html += '</div>';

    html += '<hr class="bp-shop-divider">';

    html += '<div class="bp-shop-chest">';
    html += '<div class="bp-shop-chest-info">';
    html += '<div class="bp-shop-chest-icon"></div>';
    html += '<div class="bp-shop-chest-text">';
    html += '<div class="bp-shop-chest-name">' + t('bp.chest_name', 'Сундук FallPass') + '</div>';
    html += '<div class="bp-shop-chest-desc">' + t('bp.chest_desc', 'Случайная награда: монеты, алмазы, листики или эксклюзив') + '</div>';
    html += '</div>';
    html += '</div>';
    html += '<button class="bp-shop-chest-btn" data-buy="chest"' + (leaves >= BP_CHEST_PRICE ? '' : ' disabled') + '>' + BP_CHEST_PRICE + ' <span class="leaf-icon"></span></button>';
    html += '</div>';

    html += '<hr class="bp-shop-divider">';

    html += '<div class="bp-exchange-block">';

    html += '<div class="bp-exchange-row">';
    html += '<div class="bp-exchange-info"><span class="leaf-icon"></span> → <span class="coin-icon"></span> <span class="bp-exchange-rate">' + t('bp.exchange_coins', '{rate} монет за 1 листик', { rate: LEAF_EXCHANGE.coins.rate }) + '</span></div>';
    html += '<div class="bp-exchange-buttons">';
    LEAF_EXCHANGE.coins.steps.forEach(function(step) {
      var can = leaves >= step;
      html += '<button class="bp-exchange-btn" data-exchange="coins" data-amount="' + step + '"' + (can ? '' : ' disabled') + '>×' + step + '</button>';
    });
    html += '</div>';
    html += '</div>';

    html += '<div class="bp-exchange-row">';
    html += '<div class="bp-exchange-info"><span class="leaf-icon"></span> → <span class="gem-icon"></span> <span class="bp-exchange-rate">' + t('bp.exchange_gems', '{rate} алмазов за 1 листик', { rate: LEAF_EXCHANGE.gems.rate }) + '</span></div>';
    html += '<div class="bp-exchange-buttons">';
    LEAF_EXCHANGE.gems.steps.forEach(function(step) {
      var can = leaves >= step;
      html += '<button class="bp-exchange-btn" data-exchange="gems" data-amount="' + step + '"' + (can ? '' : ' disabled') + '>×' + step + '</button>';
    });
    html += '</div>';
    html += '</div>';

    html += '</div>';

    content.innerHTML = html;

    content.querySelectorAll('[data-buy]').forEach(function(btn) {
      btn.onclick = function() {
        var id = btn.dataset.buy;
        if (id === 'chest') {
          self.buyBpChest();
        } else {
          self.buyBpShopItem(id);
        }
      };
    });

    content.querySelectorAll('[data-exchange]').forEach(function(btn) {
      btn.onclick = function() {
        var currency = btn.dataset.exchange;
        var amount = parseInt(btn.dataset.amount);
        self.exchangeLeaves(currency, amount);
      };
    });
  },

  _isBpShopItemOwned: function(item, state) {
    if (item.type === 'background') return state.ownedBackgrounds.indexOf(item.key) !== -1;
    if (item.type === 'theme') return state.ownedThemes.indexOf(item.key) !== -1;
    if (item.type === 'trail') return state.ownedTrails.indexOf(item.key) !== -1;
    return false;
  },

  buyBpShopItem: function(itemId) {
    var self = this;
    var state = this.registry.get('state');
    var item = BP_SHOP_ITEMS.find(function(i) { return i.id === itemId; });
    if (!item) return;

    if (self._isBpShopItemOwned(item, state)) { SoundManager.error(); UI.showToast(t('toast.already_owned', 'Уже куплено')); return; }
    if ((state.leaves || 0) < item.leafPrice) { SoundManager.error(); UI.showToast(t('toast.no_leaves', 'Недостаточно листиков')); return; }

    state.leaves -= item.leafPrice;

    if (item.type === 'background') {
      if (state.ownedBackgrounds.indexOf(item.key) === -1) state.ownedBackgrounds.push(item.key);
      state.currentBackground = item.key;
      try { applyBackground(item.key); } catch(e) {}
    } else if (item.type === 'theme') {
      if (state.ownedThemes.indexOf(item.key) === -1) state.ownedThemes.push(item.key);
      state.currentTheme = item.key;
    } else if (item.type === 'trail') {
      if (state.ownedTrails.indexOf(item.key) === -1) state.ownedTrails.push(item.key);
      state.currentTrail = item.key;
    }

    this.registry.set('state', state);
    YandexSDK.saveProgress(state);

    SoundManager.victory();
    UI.showToast(t('toast.bought', 'Куплено: ') + item.name, 2000);

    self.renderBpShop();
    self.updateBpTopBar();
  },

  exchangeLeaves: function(currency, amount) {
    var state = this.registry.get('state');
    if ((state.leaves || 0) < amount) { SoundManager.error(); UI.showToast(t('toast.no_leaves', 'Недостаточно листиков')); return; }

    var cfg = LEAF_EXCHANGE[currency];
    if (!cfg) return;

    var gained = amount * cfg.rate;

    state.leaves -= amount;
    if (currency === 'coins') {
      state.coins += gained;
      state.stats.totalCoins += gained;
      UI.showToast('+' + gained + ' <span class="coin-icon"></span>', 1500);
    } else if (currency === 'gems') {
      state.gems += gained;
      UI.showToast('+' + gained + ' <span class="gem-icon"></span>', 1500);
    }

    this.registry.set('state', state);
    YandexSDK.saveProgress(state);
    SoundManager.victory();

    this.renderBpShop();
    this.updateBpTopBar();
  },

  buyBpChest: function() {
    var self = this;
    var state = this.registry.get('state');
    if ((state.leaves || 0) < BP_CHEST_PRICE) { SoundManager.error(); UI.showToast(t('toast.no_leaves', 'Недостаточно листиков')); return; }

    state.leaves -= BP_CHEST_PRICE;
    this.registry.set('state', state);
    YandexSDK.saveProgress(state);

    self.updateBpTopBar();
    self.openBpChestRoulette();
  },

  openBpChestRoulette: function() {
    var self = this;
    var state = this.registry.get('state');
    var overlay = document.getElementById('chest-overlay');
    if (!overlay) return;

    var totalWeight = BP_CHEST_PRIZES.reduce(function(s, p) { return s + p.weight; }, 0);
    var roll = Math.random() * totalWeight;
    var winner = BP_CHEST_PRIZES[0];
    var acc = 0;
    for (var i = 0; i < BP_CHEST_PRIZES.length; i++) {
      acc += BP_CHEST_PRIZES[i].weight;
      if (roll <= acc) { winner = BP_CHEST_PRIZES[i]; break; }
    }

    var itemWidth = 130;
    var reelLength = 50;
    var winnerIndex = 42;
    var trackItems = [];
    for (var j = 0; j < reelLength; j++) {
      if (j === winnerIndex) trackItems.push(winner);
      else trackItems.push(BP_CHEST_PRIZES[Math.floor(Math.random() * BP_CHEST_PRIZES.length)]);
    }

    var track = document.getElementById('chest-track');
    if (!track) return;
    track.innerHTML = '';
    track.style.transition = 'none';
    track.style.transform = 'translateX(0px)';

    trackItems.forEach(function(p) {
      var div = document.createElement('div');
      div.className = 'chest-item';
      var icon = p.icon || '';
      if (p.type === 'exclusive' && !p.icon) icon = '<span class="chest-icon"></span>';
      div.innerHTML = '<div class="chest-item-icon">' + icon + '</div><div class="chest-item-name">' + p.name + '</div>';
      track.appendChild(div);
    });

    var resultEl = document.getElementById('chest-result');
    if (resultEl) resultEl.textContent = '';
    var closeBtn = document.getElementById('chest-close');
    var againBtn = document.getElementById('chest-again');
    if (closeBtn) closeBtn.style.display = 'none';
    if (againBtn) againBtn.style.display = 'none';

    var titleEl = document.getElementById('chest-title');
    if (titleEl) titleEl.textContent = t('bp.chest_title', 'Сундук FallPass');

    overlay.classList.add('active');

    var containerWidth = track.parentElement.offsetWidth || 400;
    var centerOffset = containerWidth / 2;
    var winnerCenter = winnerIndex * itemWidth + itemWidth / 2;
    var finalOffset = -(winnerCenter - centerOffset) + (Math.random() - 0.5) * 60;

    setTimeout(function() {
      track.style.transition = 'transform 6s cubic-bezier(0.15, 0.85, 0.25, 1)';
      track.style.transform = 'translateX(' + finalOffset + 'px)';
    }, 50);

    var tickCount = 0;
    var tickInterval = setInterval(function() {
      if (tickCount >= 30) { clearInterval(tickInterval); return; }
      SoundManager.tick();
      tickCount++;
    }, 200);

    setTimeout(function() {
      clearInterval(tickInterval);
      SoundManager.reveal();

      var resultText = '';
      var st = self.registry.get('state');

      if (winner.type === 'coins') {
        st.coins += winner.value;
        st.stats.totalCoins += winner.value;
        resultText = '+' + winner.value + ' <span class="coin-icon"></span>';
      } else if (winner.type === 'gems') {
        st.gems += winner.value;
        resultText = '+' + winner.value + ' <span class="gem-icon"></span>';
      } else if (winner.type === 'leaves') {
        st.leaves = (st.leaves || 0) + winner.value;
        resultText = '+' + winner.value + ' <span class="leaf-icon"></span>';
      } else if (winner.type === 'exclusive') {
        var key = winner.key;
        var alreadyOwned = false;
        if (key === 'anime_forest') {
          alreadyOwned = st.ownedBackgrounds.indexOf(key) !== -1;
          if (!alreadyOwned) {
            st.ownedBackgrounds.push(key);
            st.currentBackground = key;
            try { applyBackground(key); } catch(e) {}
          }
        } else if (key === 'anime') {
          alreadyOwned = st.ownedThemes.indexOf(key) !== -1;
          if (!alreadyOwned) {
            st.ownedThemes.push(key);
            st.currentTheme = key;
          }
        } else if (key === 'anime_trail') {
          alreadyOwned = st.ownedTrails.indexOf(key) !== -1;
          if (!alreadyOwned) {
            st.ownedTrails.push(key);
            st.currentTrail = key;
          }
        }
        if (alreadyOwned) {
          st.leaves = (st.leaves || 0) + 60;
          resultText = winner.name + t('bp.chest_owned_toast', ' (уже куплено) → +60 ') + '<span class="leaf-icon"></span>';
        } else {
          resultText = winner.name + '!';
        }
      }

      self.registry.set('state', st);
      YandexSDK.saveProgress(st);

      if (resultEl) resultEl.innerHTML = resultText;
      if (closeBtn) {
        closeBtn.style.display = '';
        closeBtn.onclick = function() {
          SoundManager.click();
          overlay.classList.remove('active');
          self.renderBpShop();
          self.updateBpTopBar();
        };
      }
      if (againBtn) {
        var canAfford = (st.leaves || 0) >= BP_CHEST_PRICE;
        againBtn.style.display = canAfford ? '' : 'none';
        againBtn.innerHTML = t('bp.chest_again', '🎁 Открыть ещё один ({n} ', { n: BP_CHEST_PRICE }) + '<span class="leaf-icon"></span>)';
        againBtn.onclick = function() {
          SoundManager.click();
          overlay.classList.remove('active');
          setTimeout(function() { self.buyBpChest(); }, 100);
        };
      }
    }, 6600);
    DailyTasks.updateProgress('openChest1', 1);
    DailyTasks.updateProgress('chest3', 1);
  },

  /* ============================================================
     МАГАЗИН, ИНВЕНТАРЬ, СУНДУКИ, ДОСТИЖЕНИЯ (старые)
     ============================================================ */

  openShop: function() {
    var self = this;
    var state = this.registry.get('state');
    this.input.enabled = false;
    UI.shopOverlay.classList.add('active');

    var renderContent = function(tab) {
      var content = document.getElementById('shop-content');
      if (!content) return;
      content.innerHTML = '';

      if (tab === 'themes') {
        var grid = document.createElement('div'); grid.className = 'shop-grid';
        var anyItems = false;
        for (var key in THEMES) {
          var th = THEMES[key];
          if (th.reward || th.exclusive) continue;
          if (state.ownedThemes.indexOf(key) !== -1) continue;
          anyItems = true;
          (function(k, tItem) {
            var card = document.createElement('div');
            card.className = 'theme-card';

            var dots = '<div class="theme-preview">';
            tItem.colors.forEach(function(c) {
              var style = 'background:' + hexColor(c) + '; color:' + hexColor(c) + ';';
              dots += '<div class="theme-dot' + (tItem.glow ? ' neon-glow' : '') + '" style="' + style + '"></div>';
            });
            dots += '</div>';

            var coinOk = state.coins >= tItem.price;
            var gemOk = state.gems >= tItem.priceGems;

            card.innerHTML = dots +
              '<div class="theme-name">' + tItem.name + (tItem.glow ? ' ✨' : '') + '</div>' +
              '<div class="shop-buy-group">' +
                '<button class="shop-buy ' + (coinOk ? 'available' : 'unavailable') + '" data-currency="coins">' +
                  tItem.price + ' <span class="coin-icon"></span>' +
                '</button>' +
                '<button class="shop-buy ' + (gemOk ? 'available' : 'unavailable') + '" data-currency="gems">' +
                  tItem.priceGems + ' <span class="gem-icon"></span>' +
                '</button>' +
              '</div>';

            card.querySelector('.shop-buy[data-currency="coins"]').onclick = function(e) {
              e.stopPropagation();
              if (!coinOk) { SoundManager.error(); UI.showToast(t('toast.no_coins', 'Недостаточно монет')); return; }
              if (buyItem('theme', k, 'coins')) { renderContent('themes'); safeText('dash-coins', state.coins); safeText('dash-gems', state.gems); }
            };
            card.querySelector('.shop-buy[data-currency="gems"]').onclick = function(e) {
              e.stopPropagation();
              if (!gemOk) { SoundManager.error(); UI.showToast(t('toast.no_gems', 'Недостаточно алмазов')); return; }
              if (buyItem('theme', k, 'gems')) { renderContent('themes'); safeText('dash-coins', state.coins); safeText('dash-gems', state.gems); }
            };

            grid.appendChild(card);
          })(key, th);
        }
        if (!anyItems) { content.innerHTML = '<div style="padding:30px;color:#888;">' + t('shop.all_themes_bought', 'Все темы куплены!') + '</div>'; }
        else content.appendChild(grid);
      }
      else if (tab === 'backgrounds') {
        var grid2 = document.createElement('div'); grid2.className = 'shop-grid';
        var anyBg = false;
        for (var key in BACKGROUNDS) {
          var b = BACKGROUNDS[key];
          if (b.exclusive) continue;
          if (state.ownedBackgrounds.indexOf(key) !== -1) continue;
          anyBg = true;
          (function(k, bg) {
            var card = document.createElement('div');
            card.className = 'theme-card';
            var previewStyle = 'background:' + (bg.preview || '#1a1a2e') + ';';
            var previewHtml = '<div style="height:50px;border-radius:8px;margin-bottom:8px;border:1px solid #444;position:relative;overflow:hidden;' + previewStyle + '">';
            if (bg.type === 'stars' || bg.type === 'snow') previewHtml += '<div style="position:absolute;inset:0;background-image:radial-gradient(white 1px,transparent 1px);background-size:20px 20px;opacity:0.6;"></div>';
            previewHtml += '</div>';
            var coinOk = state.coins >= bg.price;
            var gemOk = state.gems >= bg.priceGems;

            card.innerHTML = previewHtml +
              '<div class="theme-name">' + bg.name + '</div>' +
              '<div class="shop-buy-group">' +
                '<button class="shop-buy ' + (coinOk ? 'available' : 'unavailable') + '" data-currency="coins">' +
                  bg.price + ' <span class="coin-icon"></span>' +
                '</button>' +
                '<button class="shop-buy ' + (gemOk ? 'available' : 'unavailable') + '" data-currency="gems">' +
                  bg.priceGems + ' <span class="gem-icon"></span>' +
                '</button>' +
              '</div>';

            card.querySelector('.shop-buy[data-currency="coins"]').onclick = function(e) {
              e.stopPropagation();
              if (!coinOk) { SoundManager.error(); UI.showToast(t('toast.no_coins', 'Недостаточно монет')); return; }
              if (buyItem('background', k, 'coins')) { renderContent('backgrounds'); safeText('dash-coins', state.coins); safeText('dash-gems', state.gems); }
            };
            card.querySelector('.shop-buy[data-currency="gems"]').onclick = function(e) {
              e.stopPropagation();
              if (!gemOk) { SoundManager.error(); UI.showToast(t('toast.no_gems', 'Недостаточно алмазов')); return; }
              if (buyItem('background', k, 'gems')) { renderContent('backgrounds'); safeText('dash-coins', state.coins); safeText('dash-gems', state.gems); }
            };
            grid2.appendChild(card);
          })(key, b);
        }
        if (!anyBg) { content.innerHTML = '<div style="padding:30px;color:#888;">' + t('shop.all_bg_bought', 'Все фоны куплены!') + '</div>'; }
        else content.appendChild(grid2);
      }
      else if (tab === 'trails') {
        var grid3 = document.createElement('div'); grid3.className = 'shop-grid';
        var anyTr = false;
        for (var key in TRAILS) {
          var tr = TRAILS[key];
          if (tr.reward || tr.exclusive) continue;
          if (state.ownedTrails.indexOf(key) !== -1) continue;
          anyTr = true;
          (function(k, trail) {
            var card = document.createElement('div');
            card.className = 'theme-card';
            if (k === 'quantum') card.style.borderColor = '#ffd93d';
            var previewHtml = '<div style="height:30px;border-radius:8px;background:' + (k === 'quantum' ? 'linear-gradient(90deg, #a55eea, #00d2ff, #a55eea)' : trail.cursorColor) + ';margin-bottom:8px;"></div>';
            var coinOk = state.coins >= trail.price;
            var gemOk = state.gems >= trail.priceGems;

            card.innerHTML = previewHtml +
              '<div class="theme-name">' + (k === 'quantum' ? '👑 ' : '') + trail.name + '</div>' +
              '<div class="shop-buy-group">' +
                '<button class="shop-buy ' + (coinOk ? 'available' : 'unavailable') + '" data-currency="coins">' +
                  trail.price + ' <span class="coin-icon"></span>' +
                '</button>' +
                '<button class="shop-buy ' + (gemOk ? 'available' : 'unavailable') + '" data-currency="gems">' +
                  trail.priceGems + ' <span class="gem-icon"></span>' +
                '</button>' +
              '</div>';

            card.querySelector('.shop-buy[data-currency="coins"]').onclick = function(e) {
              e.stopPropagation();
              if (!coinOk) { SoundManager.error(); UI.showToast(t('toast.no_coins', 'Недостаточно монет')); return; }
              if (buyItem('trail', k, 'coins')) { renderContent('trails'); safeText('dash-coins', state.coins); safeText('dash-gems', state.gems); }
            };
            card.querySelector('.shop-buy[data-currency="gems"]').onclick = function(e) {
              e.stopPropagation();
              if (!gemOk) { SoundManager.error(); UI.showToast(t('toast.no_gems', 'Недостаточно алмазов')); return; }
              if (buyItem('trail', k, 'gems')) { renderContent('trails'); safeText('dash-coins', state.coins); safeText('dash-gems', state.gems); }
            };
            grid3.appendChild(card);
          })(key, tr);
        }
        if (!anyTr) { content.innerHTML = '<div style="padding:30px;color:#888;">' + t('shop.all_trails_bought', 'Все следы куплены!') + '</div>'; }
        else content.appendChild(grid3);
      }
      else if (tab === 'boosters') {
        var boostersDiv = document.createElement('div');
        var boosters = [
          { type: 'time',    icon: '🕐', name: t('shop.booster_time_name', '+45 секунд'),  desc: t('shop.booster_time_desc', 'Добавляет 45 сек (только бесконечный/испытание)'), price: 75,  priceGems: 15 },
          { type: 'reveal',  icon: '👁', name: t('shop.booster_reveal_name', 'Решение'),   desc: t('shop.booster_reveal_desc', 'Показывает решение на 3 сек'),                     price: 150, priceGems: 30 },
          { type: 'skip',    icon: '⏭', name: t('shop.booster_skip_name', 'Пропуск'),     desc: t('shop.booster_skip_desc', 'Пропускает уровень (кроме боссов)'),                price: 300, priceGems: 60 }
        ];

        boosters.forEach(function(b) {
          var count = state.boosters[b.type] || 0;
          var coinOk = state.coins >= b.price;
          var gemOk = state.gems >= b.priceGems;

          var card = document.createElement('div');
          card.className = 'booster-card';
          card.innerHTML =
            '<div class="booster-card-icon">' + b.icon + '</div>' +
            '<div class="booster-card-info">' +
              '<div class="name">' + b.name + ' <span style="color:#f1c40f;">×' + count + '</span></div>' +
              '<div class="desc">' + b.desc + '</div>' +
            '</div>' +
            '<div class="booster-card-buy-group">' +
              '<button class="booster-card-buy ' + (coinOk ? 'available' : 'unavailable') + '" data-type="' + b.type + '" data-currency="coins" data-price="' + b.price + '">' +
                b.price + ' <span class="coin-icon"></span>' +
              '</button>' +
              '<button class="booster-card-buy ' + (gemOk ? 'available' : 'unavailable') + '" data-type="' + b.type + '" data-currency="gems" data-price="' + b.priceGems + '">' +
                b.priceGems + ' <span class="gem-icon"></span>' +
              '</button>' +
            '</div>';
          boostersDiv.appendChild(card);
        });
        content.appendChild(boostersDiv);

        setTimeout(function() {
          content.querySelectorAll('.booster-card-buy').forEach(function(btn) {
            btn.onclick = function() {
              var type = btn.dataset.type;
              var currency = btn.dataset.currency;
              var price = parseInt(btn.dataset.price);

              if (currency === 'coins') {
                if (state.coins < price) { SoundManager.error(); UI.showToast(t('toast.no_coins', 'Недостаточно монет')); return; }
                state.coins -= price;
                if (state.bpStats) {
                  state.bpStats.spend_coins = (state.bpStats.spend_coins || 0) + price;
                  if (window.BPTasks) BPTasks.updateProgress('spend_coins', price);
                }
              } else {
                if (state.gems < price) { SoundManager.error(); UI.showToast(t('toast.no_gems', 'Недостаточно алмазов')); return; }
                state.gems -= price;
              }

              state.boosters[type] = (state.boosters[type] || 0) + 1;

              self.registry.set('state', state);
              YandexSDK.saveProgress(state);
              SoundManager.victory();
              UI.showToast(t('shop.booster_added', '+1 бустер!'));
              renderContent('boosters');
              safeText('dash-coins', state.coins);
              safeText('dash-gems', state.gems);
            };
          });
        }, 50);
      }
      else if (tab === 'chests') {
        var chestDiv = document.createElement('div');
        chestDiv.style.cssText = 'text-align:center; padding:20px;';
        var coinOk = state.coins >= 100;
        var gemOk = state.gems >= 20;
        chestDiv.innerHTML =
          '<div class="chest-icon" style="width:80px;height:80px;margin:0 auto 15px;"></div>' +
          '<div style="font-size:15px;color:#ccc;margin-bottom:16px;">' + t('shop.chest_desc', 'Сундук со случайной наградой!') + '</div>' +
          '<div style="display:flex;flex-direction:column;gap:10px;align-items:center;">' +
            '<button class="modal-btn" id="chest-buy-coins" ' + (coinOk ? '' : 'disabled') + '>' + t('shop.chest_buy_coins', 'Открыть за 100 ') + '<span class="coin-icon"></span></button>' +
            '<button class="modal-btn" id="chest-buy-gems" ' + (gemOk ? '' : 'disabled') + '>' + t('shop.chest_buy_gems', 'Открыть за 20 ') + '<span class="gem-icon"></span></button>' +
          '</div>';
        content.appendChild(chestDiv);

        setTimeout(function() {
          var buyCoins = document.getElementById('chest-buy-coins');
          if (buyCoins) buyCoins.onclick = function() {
            if (state.coins < 100) { SoundManager.error(); UI.showToast(t('toast.no_coins', 'Недостаточно монет')); return; }
            state.coins -= 100;
            if (state.bpStats) {
              state.bpStats.spend_coins = (state.bpStats.spend_coins || 0) + 100;
              if (window.BPTasks) BPTasks.updateProgress('spend_coins', 100);
            }
            self.registry.set('state', state); YandexSDK.saveProgress(state);
            UI.shopOverlay.classList.remove('active');
            setTimeout(function() { self.openChestRoulette(); }, 100);
          };

          var buyGems = document.getElementById('chest-buy-gems');
          if (buyGems) buyGems.onclick = function() {
            if (state.gems < 20) { SoundManager.error(); UI.showToast(t('toast.no_gems', 'Недостаточно алмазов')); return; }
            state.gems -= 20;
            self.registry.set('state', state); YandexSDK.saveProgress(state);
            UI.shopOverlay.classList.remove('active');
            setTimeout(function() { self.openChestRoulette(); }, 100);
          };
        }, 50);
      }
    };

    document.querySelectorAll('#shop-overlay .shop-tab').forEach(function(t) { t.classList.remove('active'); });
    var firstTab = document.querySelector('#shop-overlay .shop-tab');
    if (firstTab) firstTab.classList.add('active');

    document.querySelectorAll('#shop-overlay .shop-tab').forEach(function(tab) {
      tab.onclick = function() { document.querySelectorAll('#shop-overlay .shop-tab').forEach(function(t) { t.classList.remove('active'); }); tab.classList.add('active'); renderContent(tab.dataset.tab); };
    });
    renderContent('themes');
    safeBind('shop-close', function() { UI.shopOverlay.classList.remove('active'); self.input.enabled = true; self.scene.restart(); });
  },

  openInventory: function() {
    var self = this;
    var state = this.registry.get('state');
    this.input.enabled = false;
    UI.inventoryOverlay.classList.add('active');

    var renderContent = function(tab) {
      var content = document.getElementById('inventory-content');
      if (!content) return;
      content.innerHTML = '';

      if (tab === 'themes') {
        var grid = document.createElement('div'); grid.className = 'shop-grid';
        for (var key in THEMES) {
          if (state.ownedThemes.indexOf(key) === -1) continue;
          (function(k, th) {
            var active = state.currentTheme === k;
            var card = document.createElement('div');
            card.className = 'theme-card' + (active ? ' active' : '');

            if (k === 'anime') {
              var facesHtml = '<div class="theme-preview-faces-grid">';
              for (var f = 0; f < 8; f++) {
                facesHtml += '<div class="theme-face-cell" data-face="' + f + '"></div>';
              }
              facesHtml += '</div>';
              card.innerHTML = facesHtml +
                '<div class="theme-name">' + th.name + '</div>' +
                '<div class="theme-status" style="color:' + (active ? '#f1c40f' : '#2ed573') + '">' + (active ? t('inv.active', '✓ Активна') : t('inv.select', 'Выбрать')) + '</div>';
            } else {
              var dots = '<div class="theme-preview">';
              th.colors.forEach(function(c) {
                var style = 'background:' + hexColor(c) + '; color:' + hexColor(c) + ';';
                dots += '<div class="theme-dot' + (th.glow ? ' neon-glow' : '') + '" style="' + style + '"></div>';
              });
              dots += '</div>';
              card.innerHTML = dots + '<div class="theme-name">' + th.name + '</div>' +
                '<div class="theme-status" style="color:' + (active ? '#f1c40f' : '#2ed573') + '">' + (active ? t('inv.active', '✓ Активна') : t('inv.select', 'Выбрать')) + '</div>';
            }

            card.onclick = function() {
              if (active) return;
              state.currentTheme = k;
              self.registry.set('state', state);
              YandexSDK.saveProgress(state);
              SoundManager.click();
              renderContent('themes');
            };
            grid.appendChild(card);
          })(key, THEMES[key]);
        }
        content.appendChild(grid);
      }
      else if (tab === 'backgrounds') {
        var grid2 = document.createElement('div'); grid2.className = 'shop-grid';
        for (var key in BACKGROUNDS) {
          if (state.ownedBackgrounds.indexOf(key) === -1) continue;
          (function(k, bg) {
            var active = state.currentBackground === k;
            var card = document.createElement('div');
            card.className = 'theme-card' + (active ? ' active' : '');
            var previewStyle = 'background:' + (bg.preview || '#1a1a2e') + ';';
            card.innerHTML = '<div style="height:50px;border-radius:8px;margin-bottom:8px;border:1px solid #444;' + previewStyle + '"></div>' + '<div class="theme-name">' + bg.name + '</div>' +
              '<div class="theme-status" style="color:' + (active ? '#f1c40f' : '#2ed573') + '">' + (active ? t('inv.active_bg', '✓ Активен') : t('inv.select', 'Выбрать')) + '</div>';
            card.onclick = function() {
              if (active) return;
              state.currentBackground = k;
              self.registry.set('state', state);
              YandexSDK.saveProgress(state);
              applyBackground(k);
              SoundManager.click();
              renderContent('backgrounds');
            };
            grid2.appendChild(card);
          })(key, BACKGROUNDS[key]);
        }
        content.appendChild(grid2);
      }
      if (tab === 'trails') {
        var grid3 = document.createElement('div'); grid3.className = 'shop-grid';
        for (var key in TRAILS) {
          if (state.ownedTrails.indexOf(key) === -1) continue;
          (function(k, tr) {
            var active = state.currentTrail === k;
            var card = document.createElement('div');
            card.className = 'theme-card' + (active ? ' active' : '');
            if (k === 'quantum') card.style.borderColor = '#ffd93d';
            var previewBg = (k === 'quantum') ? 'linear-gradient(90deg, #a55eea, #00d2ff, #a55eea)' : tr.cursorColor;
            card.innerHTML = '<div style="height:30px;border-radius:8px;background:' + previewBg + ';margin-bottom:8px;"></div>' +
              '<div class="theme-name">' + (k === 'quantum' ? '👑 ' : '') + tr.name + '</div>' +
              '<div class="theme-status" style="color:' + (active ? '#f1c40f' : '#2ed573') + '">' + (active ? t('inv.active_bg', '✓ Активен') : t('inv.select', 'Выбрать')) + '</div>';
            card.onclick = function() {
              if (active) return;
              state.currentTrail = k;
              self.registry.set('state', state);
              YandexSDK.saveProgress(state);
              SoundManager.click();
              renderContent('trails');
            };
            grid3.appendChild(card);
          })(key, TRAILS[key]);
        }
        content.appendChild(grid3);
      }
    };

    document.querySelectorAll('#inventory-overlay .shop-tab').forEach(function(t) { t.classList.remove('active'); });
    var firstInvTab = document.querySelector('#inventory-overlay .shop-tab');
    if (firstInvTab) firstInvTab.classList.add('active');

    document.querySelectorAll('#inventory-overlay .shop-tab').forEach(function(tab) {
      tab.onclick = function() { document.querySelectorAll('#inventory-overlay .shop-tab').forEach(function(t) { t.classList.remove('active'); }); tab.classList.add('active'); renderContent(tab.dataset.inv); };
    });
    renderContent('themes');
    safeBind('inventory-close', function() { UI.inventoryOverlay.classList.remove('active'); self.input.enabled = true; self.scene.restart(); });
  },

  openChestRoulette: function() {
    var self = this;
    var state = this.registry.get('state');
    var prizes = [];
    prizes.push({ type: 'coins', value: 50, icon: '<span class="coin-icon"></span>', get name() { return t('prize.coins_50', '50 монет'); }, weight: 30, tier: 'common' });
    prizes.push({ type: 'coins', value: 100, icon: '<span class="coin-icon"></span>', get name() { return t('prize.coins_100', '100 монет'); }, weight: 25, tier: 'common' });
    prizes.push({ type: 'coins', value: 200, icon: '<span class="coin-icon"></span>', get name() { return t('prize.coins_200', '200 монет'); }, weight: 15, tier: 'common' });
    prizes.push({ type: 'coins', value: 500, icon: '<span class="coin-icon"></span>', get name() { return t('prize.coins_500', '500 монет'); }, weight: 5, tier: 'common' });
    prizes.push({ type: 'gems', value: 5, icon: '<span class="gem-icon"></span>', get name() { return t('prize.gems_5', '5 алмазов'); }, weight: 10, tier: 'common' });
    prizes.push({ type: 'gems', value: 15, icon: '<span class="gem-icon"></span>', get name() { return t('prize.gems_15', '15 алмазов'); }, weight: 5, tier: 'rare' });
    prizes.push({ type: 'gems', value: 30, icon: '<span class="gem-icon"></span>', get name() { return t('prize.gems_30', '30 алмазов'); }, weight: 3, tier: 'rare' });
    prizes.push({ type: 'booster_time', value: 1, icon: '🕐', get name() { return t('shop.booster_time_name', 'Бустер +45 сек'); }, weight: 12, tier: 'common' });
    prizes.push({ type: 'booster_reveal', value: 1, icon: '👁', get name() { return t('shop.booster_reveal_name', 'Бустер решение'); }, weight: 7, tier: 'rare' });
    prizes.push({ type: 'booster_skip', value: 1, icon: '⏭', get name() { return t('shop.booster_skip_name', 'Бустер пропуск'); }, weight: 3, tier: 'rare' });

    var totalWeight = prizes.reduce(function(s, p) { return s + p.weight; }, 0);
    var roll = Math.random() * totalWeight;
    var winner = prizes[0]; var acc = 0;
    for (var i = 0; i < prizes.length; i++) { acc += prizes[i].weight; if (roll <= acc) { winner = prizes[i]; break; } }
    var itemWidth = 130; var reelLength = 50; var winnerIndex = 42;
    var trackItems = [];
    for (var j = 0; j < reelLength; j++) { if (j === winnerIndex) trackItems.push(winner); else trackItems.push(prizes[Math.floor(Math.random() * prizes.length)]); }
    var track = document.getElementById('chest-track');
    if (!track) return;
    track.innerHTML = ''; track.style.transition = 'none'; track.style.transform = 'translateX(0px)';
    trackItems.forEach(function(p) {
      var div = document.createElement('div'); div.className = 'chest-item';
      div.innerHTML = '<div class="chest-item-icon">' + p.icon + '</div><div class="chest-item-name">' + p.name + '</div>';
      track.appendChild(div);
    });
    var resultEl = document.getElementById('chest-result'); if (resultEl) resultEl.textContent = '';
    var closeBtn = document.getElementById('chest-close'); var againBtn = document.getElementById('chest-again');
    if (closeBtn) closeBtn.style.display = 'none';
    if (againBtn) againBtn.style.display = 'none';

    var titleEl = document.getElementById('chest-title');
    if (titleEl) titleEl.textContent = t('chest.title', '🎁 Открытие сундука');

    UI.chestOverlay.classList.add('active');
    var containerWidth = track.parentElement.offsetWidth || 400;
    var centerOffset = containerWidth / 2;
    var winnerCenter = winnerIndex * itemWidth + itemWidth / 2;
    var finalOffset = -(winnerCenter - centerOffset) + (Math.random() - 0.5) * 60;
    setTimeout(function() {
      track.style.transition = 'transform 6s cubic-bezier(0.15, 0.85, 0.25, 1)';
      track.style.transform = 'translateX(' + finalOffset + 'px)';
    }, 50);
    var tickCount = 0;
    var tickInterval = setInterval(function() { if (tickCount >= 30) { clearInterval(tickInterval); return; } SoundManager.tick(); tickCount++; }, 200);
    setTimeout(function() {
      clearInterval(tickInterval);
      SoundManager.reveal();
      var resultText = '';
      if (winner.type === 'coins') { state.coins += winner.value; state.stats.totalCoins += winner.value; resultText = '+' + winner.value + ' <span class="coin-icon"></span>'; }
      else if (winner.type === 'gems') { state.gems += winner.value; resultText = '+' + winner.value + ' <span class="gem-icon"></span>'; }
      else if (winner.type === 'booster_time') { state.boosters.time = (state.boosters.time || 0) + 1; resultText = t('shop.booster_time_name', 'Бустер «+45 сек»') + '!'; }
      else if (winner.type === 'booster_reveal') { state.boosters.reveal = (state.boosters.reveal || 0) + 1; resultText = t('shop.booster_reveal_name', 'Бустер «Решение»') + '!'; }
      else if (winner.type === 'booster_skip') { state.boosters.skip = (state.boosters.skip || 0) + 1; resultText = t('shop.booster_skip_name', 'Бустер «Пропуск»') + '!'; }

      if (state.bpStats) {
        state.bpStats.open_chests = (state.bpStats.open_chests || 0) + 1;
        BPTasks.updateProgress('open_chests', 1);
      }

      self.registry.set('state', state); YandexSDK.saveProgress(state);
      safeText('dash-coins', state.coins);
      safeText('dash-gems', state.gems);
      if (resultEl) resultEl.innerHTML = resultText;
      if (closeBtn) { closeBtn.style.display = ''; closeBtn.onclick = function() { SoundManager.click(); UI.chestOverlay.classList.remove('active'); self.input.enabled = true; self.scene.restart(); }; }
      if (againBtn) {
        againBtn.style.display = '';
        againBtn.innerHTML = t('shop.chest_again_coins', '🎁 Открыть ещё один (100 ') + '<span class="coin-icon"></span>)';
        againBtn.onclick = function() {
          SoundManager.click();
          if (state.coins < 100) { SoundManager.error(); UI.showToast(t('toast.no_coins', 'Недостаточно монет')); return; }
          state.coins -= 100;
          self.registry.set('state', state);
          YandexSDK.saveProgress(state);
          safeText('dash-coins', state.coins);
          UI.chestOverlay.classList.remove('active');
          setTimeout(function() { self.openChestRoulette(); }, 100);
        };
      }
    }, 6600);
    DailyTasks.updateProgress('openChest1', 1);
    DailyTasks.updateProgress('chest3', 1);
  },

  openAchievements: function() {
    var self = this;
    var state = this.registry.get('state');
    var list = document.getElementById('ach-list');
    var headerEl = document.getElementById('ach-header');
    if (!list) return;

    var seenIds = [];
    try {
      seenIds = JSON.parse(localStorage.getItem('flow_ach_seen') || '[]');
    } catch (e) { seenIds = []; }

    var newlyUnlocked = state.achievements.filter(function(id) {
      return seenIds.indexOf(id) === -1;
    });

    var total = ACHIEVEMENTS.length;
    var unlockedCount = state.achievements.length;
    var pct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

    if (headerEl) {
      headerEl.innerHTML =
        '<div class="ach-progress-text">' + t('ach_modal.progress', 'Открыто: <b>{cur} / {total}</b>', { cur: unlockedCount, total: total }) + '</div>' +
        '<div class="ach-progress-bar"><div class="ach-progress-fill" style="width:' + pct + '%"></div></div>';
    }

    list.innerHTML = '';
    ACHIEVEMENTS.forEach(function(a) {
      var unlocked = state.achievements.indexOf(a.id) >= 0;
      var isNew = unlocked && newlyUnlocked.indexOf(a.id) >= 0;
      var div = document.createElement('div');
      div.className = 'ach-item ' + (unlocked ? 'unlocked' : 'locked') + (isNew ? ' new-unlocked' : '');
      div.innerHTML =
        (unlocked ? '' : '<div class="ach-lock">🔒</div>') +
        '<div class="ach-icon">' + a.icon + '</div>' +
        '<div class="ach-name">' + a.name + '</div>' +
        '<div class="ach-desc">' + a.desc + '</div>' +
        '<div class="ach-reward">+' + a.coins + ' <span class="coin-icon"></span></div>';
      list.appendChild(div);
    });

    setTimeout(function() {
      try { localStorage.setItem('flow_ach_seen', JSON.stringify(state.achievements)); } catch (e) {}
    }, 1500);

    AchListDrag.enable(list);

    this.input.enabled = false;
    UI.achOverlay.classList.add('active');
  },
});
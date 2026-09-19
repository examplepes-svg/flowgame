/* ============================================================
   ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ WIN/LOSE
   ============================================================ */

/* ============================================================
   ПОЛУЧЕНИЕ АКТИВНОЙ ИГРОВОЙ СЦЕНЫ
   ============================================================ */
function getActiveGameScene() {
  if (!window.game) return null;
  var endless = window.game.scene.getScene('Endless');
  if (endless && endless.scene.isActive()) return endless;
  var game = window.game.scene.getScene('Game');
  if (game && game.scene.isActive()) return game;
  return null;
}

/* ============================================================
   УНИВЕРСАЛЬНЫЙ ВОЗВРАТ ИЗ ОКОН WIN/LOSE
   ============================================================ */
function backFromWinLose() {
  var game = getActiveGameScene();
  if (game && (game.mode === 'endless' || game.mode === 'challenge')) {
    goToMainMenu();
  } else {
    WorldMapUI.show();
  }
}

safeBind('win-menu', function() {
  var wo = document.getElementById('win-overlay');
  if (wo) wo.classList.remove('active');
  backFromWinLose();
});

safeBind('lose-menu', function() {
  var lo = document.getElementById('lose-overlay');
  if (lo) lo.classList.remove('active');
  backFromWinLose();
});

/* ============================================================
   ВОССТАНОВЛЕНИЕ ПОСЛЕ "ПРОДОЛЖИТЬ"
   ============================================================ */
function resumeGameScene(game) {
  if (!game) return;

  var lo = document.getElementById('lose-overlay');
  if (lo) {
    lo.classList.remove('active');
    lo.style.pointerEvents = '';
    lo.style.display = '';
  }

  game._ended = false;
  game.drawing = null;
  game.growAnimation = null;
  game.input.enabled = true;

  game.timeLeft = 60;
  if (game.timerEvent) game.timerEvent.remove();
  game.timerEvent = game.time.addEvent({
    delay: 1000,
    loop: true,
    callback: function() {
      game.timeLeft--;
      UI.setTimer(game.timeLeft);
      if (game.timeLeft <= 0) {
        game.timerEvent.remove();
        game.onTimeUp();
      }
    }
  });
  UI.setTimer(game.timeLeft);

  if (game.scene.key === 'Endless' && window.EndlessMode) {
    EndlessMode.saveSession(
      game.levelNumber - 1,
      game.sessionCoins || 0,
      game.sessionXp || 0
    );
  }
}

/* ============================================================
   ПРОДОЛЖИТЬ ЗА РЕКЛАМУ
   ============================================================ */
safeBind('lose-continue', function() {
  YandexSDK.showRewardedVideo().then(function(ok) {
    if (ok) {
      var game = getActiveGameScene();
      resumeGameScene(game);
    }
  });
});

/* ============================================================
   ПРОДОЛЖИТЬ ЗА 200 МОНЕТ
   ============================================================ */
safeBind('lose-continue-coins', function() {
  var game = getActiveGameScene();
  if (!game) return;
  var state = game.registry.get('state');
  if (state.coins < 200) { UI.showToast(t('toast.no_coins', 'Недостаточно монет')); return; }
  state.coins -= 200;
  game.registry.set('state', state);
  YandexSDK.saveProgress(state);
  safeText('dash-coins', state.coins);

  resumeGameScene(game);
});

/* ============================================================
   СЛЕДУЮЩИЙ УРОВЕНЬ
   ============================================================ */
safeBind('win-next', function() {
  var wo = document.getElementById('win-overlay');
  if (wo) wo.classList.remove('active');
  if (!window.game) return;

  var endless = window.game.scene.getScene('Endless');
  if (endless && endless.scene.isActive()) {
    window.game.scene.stop('Endless');
    setTimeout(function() {
      window.game.scene.start('Endless', { level: endless.levelNumber + 1 });
    }, 100);
    return;
  }

  var game = window.game.scene.getScene('Game');
  if (game) {
    if (game.mode === 'challenge') { WorldMapUI.show(); return; }
    if (game.region) {
      var regionId = game.region;
      window.game.scene.stop('Game');
      UI.hideAll();
      setTimeout(function() { RegionScreen.open(regionId); }, 100);
      return;
    }
    WorldMapUI.show();
  }
});

/* ============================================================
   РЕКЛАМА ×2
   ============================================================ */
safeBind('win-x2', function() {
  YandexSDK.showRewardedVideo().then(function(ok) {
    if (ok) {
      var game = getActiveGameScene();
      if (!game) return;
      var state = game.registry.get('state');
      state.coins += 10;
      game.registry.set('state', state);
      YandexSDK.saveProgress(state);
      UI.showToast(t('toast.ad_x2_reward', '+10 монет!'));
      var btn = document.getElementById('win-x2');
      if (btn) btn.disabled = true;
    }
  });
});

/* ============================================================
   ЗАКРЫТИЕ ОКОН
   ============================================================ */
safeBind('ach-close', function() {
  var el = document.getElementById('ach-overlay');
  if (el) el.classList.remove('active');
  var scene = window.game.scene.getScene('Menu');
  if (scene) scene.input.enabled = true;
});

safeBind('profile-close', function() {
  var el = document.getElementById('profile-overlay');
  if (el) el.classList.remove('active');
  var scene = window.game.scene.getScene('Menu');
  if (scene) scene.input.enabled = true;
});


/* ============================================================
   ЗАСТАВКА — логика прогресса и скрытия
   ============================================================ */
var SplashScreen = {
  _hidden: false,
  _stepsDone: 0,
  _fallbackShown: false,
  _totalSteps: 7,
  _maxWaitMs: 15000,
  _startTime: 0,
  _fieldDone: false,
  _phaserReady: false,
  _lastStepTime: 0,
  _fieldFinishDelay: 700,

  init: function() {
    var self = this;
    this._startTime = Date.now();
    this._fieldDone = false;
    this._phaserReady = false;
    this._lastStepTime = 0;

    var offlineBtn = document.getElementById('splash-offline-btn');
    if (offlineBtn) {
      offlineBtn.onclick = function() { self._tryOffline(); };
    }
    var reloadBtn = document.getElementById('splash-reload-btn');
    if (reloadBtn) {
      reloadBtn.onclick = function() { location.reload(); };
    }

    var stepDelay = 350;
    var checkInterval = setInterval(function() {
      if (!self._fallbackShown && Date.now() - self._startTime > self._maxWaitMs) {
        self._showFallback();
        return;
      }

      if (self._isPhaserReady()) {
        self._phaserReady = true;
      }

      if (self._stepsDone < self._totalSteps) {
        self._doStep(self._stepsDone);
        self._stepsDone++;
        self._lastStepTime = Date.now();
        self._setProgress(Math.min(95, Math.round((self._stepsDone / self._totalSteps) * 95)));
      }

      if (!self._fieldDone && self._stepsDone >= self._totalSteps) {
        if (Date.now() - self._lastStepTime >= self._fieldFinishDelay) {
          self._fieldDone = true;
        }
      }

      if (self._fieldDone && self._phaserReady) {
        clearInterval(checkInterval);
        self._finish();
      } else if (self._stepsDone >= self._totalSteps && !self._fieldDone) {
        self._setProgress(99);
      } else if (self._fieldDone && !self._phaserReady) {
        var text = document.getElementById('splash-progress-text');
        if (text && !text.classList.contains('waiting')) {
          text.classList.add('waiting');
          text.textContent = t('splash.almost', 'Почти готово…');
        }
      }
    }, stepDelay);
  },

  _doStep: function(step) {
    if (step === 0) {
      this._setDash('splash-line-blue-main', 100);
      this._setDash('splash-line-blue-inner', 100);
    } else if (step === 1) {
      this._setDash('splash-line-blue-main', 0);
      this._setDash('splash-line-blue-inner', 0);
    } else if (step >= 2 && step <= 6) {
      var redOffset = 1000 - (step - 1) * 200;
      if (redOffset < 0) redOffset = 0;
      this._setDash('splash-line-red-main', redOffset);
      this._setDash('splash-line-red-inner', redOffset);
    }
  },

  _setDash: function(id, offset) {
    var el = document.getElementById(id);
    if (el) el.style.strokeDashoffset = offset;
  },

  _setProgress: function(pct) {
    var fill = document.getElementById('splash-progress-fill');
    var text = document.getElementById('splash-progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text && !text.classList.contains('waiting')) {
      text.textContent = t('splash.loading_pct', 'Загрузка… {n}%', { n: pct });
    }
  },

  _isPhaserReady: function() {
    if (typeof Phaser === 'undefined') return false;
    if (!window.game) return false;
    if (!window.game.scene) return false;
    try {
      var menuScene = window.game.scene.getScene('Menu');
      if (menuScene && menuScene.scene.isActive()) return true;
    } catch (e) {}
    return false;
  },

  _finish: function() {
    if (this._hidden) return;
    this._hidden = true;
    this._setProgress(100);
    var text = document.getElementById('splash-progress-text');
    if (text) {
      text.classList.remove('waiting');
      text.textContent = t('splash.done', 'Готово!');
    }

    if (window.YandexSDK && YandexSDK.ready) {
      try { YandexSDK.ready(); } catch (e) {}
    }
    setTimeout(function() {
      var splash = document.getElementById('splash-screen');
      if (splash) {
        splash.classList.add('hide');
        setTimeout(function() {
          if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 600);
      }
    }, 350);
  },

  _showFallback: function() {
    if (this._fallbackShown) return;
    this._fallbackShown = true;
    var fb = document.getElementById('splash-fallback');
    if (fb) fb.style.display = 'flex';
    var text = document.getElementById('splash-progress-text');
    if (text) {
      text.classList.remove('waiting');
      text.textContent = t('splash.error', 'Ошибка загрузки');
    }
  },

  _tryOffline: function() {
    var self = this;
    this._fallbackShown = false;
    var fb = document.getElementById('splash-fallback');
    if (fb) fb.style.display = 'none';
    var text = document.getElementById('splash-progress-text');
    if (text) {
      text.classList.remove('waiting');
      text.textContent = t('splash.retry', 'Повторная попытка…');
    }

    this._startTime = Date.now();
    this._maxWaitMs = 8000;

    var retryInterval = setInterval(function() {
      if (self._isPhaserReady()) {
        clearInterval(retryInterval);
        self._phaserReady = true;
        if (self._fieldDone) self._finish();
      }
      if (Date.now() - self._startTime > self._maxWaitMs) {
        clearInterval(retryInterval);
        self._showFallback();
      }
    }, 300);
  }
};

/* ============================================================
   Запрет контекстного меню и лонг-тапа
   ============================================================ */
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  return false;
}, { passive: false });

document.addEventListener('selectstart', function(e) {
  e.preventDefault();
  return false;
}, { passive: false });

document.addEventListener('dragstart', function(e) {
  e.preventDefault();
  return false;
}, { passive: false });

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ PHASER
   ============================================================ */
window.addEventListener('load', function() {
  /* ============================================================
     П.1.6.1.1 — Fullscreen на первый тап пользователя
     ============================================================ */
  (function setupFullscreenOnFirstTap() {
    var requested = false;
    var requestFS = function() {
      if (requested) return;
      requested = true;

      // На десктопе не форсим — там это раздражает
      var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      if (!isMobile) return;

      var el = document.documentElement;
      var fn = el.requestFullscreen
            || el.webkitRequestFullscreen
            || el.mozRequestFullScreen
            || el.msRequestFullscreen;

      if (fn) {
        try {
          var result = fn.call(el);
          if (result && result.catch) result.catch(function() {});
        } catch (e) {}
      }
      // Скрываем адресную строку на iOS Safari
      try { window.scrollTo(0, 1); } catch (e) {}
    };

    document.addEventListener('pointerdown', requestFS, { once: true });
    document.addEventListener('touchstart', requestFS, { once: true, passive: true });
  })();

  // Инициализируем заставку сразу
  SplashScreen.init();

  if (typeof Phaser === 'undefined') {
    // Phaser не загрузился — заставка покажет fallback через 15 сек
    console.warn('⚠️ Phaser не загрузился, ожидаем fallback через 15 сек');
    return;
  }
  try {
    var config = {
      type: Phaser.AUTO,
      parent: 'game',
      backgroundColor: '#000000',
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight
      },
      scene: [BootScene, MenuScene, GameScene, EndlessScene, DuelScene]
    };
    window.game = new Phaser.Game(config);
    console.log('✅ Phaser.Game создан:', window.game);
  } catch (e) {
    console.error('❌ Ошибка создания Phaser:', e);
    // Заставка сама покажет fallback через 15 сек
  }
});
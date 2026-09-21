/* ============================================================
   UI + goToMainMenu
   ============================================================ */
var UI = {
  overlay: document.getElementById('ui-overlay'),
  winOverlay: document.getElementById('win-overlay'),
  loseOverlay: document.getElementById('lose-overlay'),
  dailyOverlay: document.getElementById('daily-overlay'),
  achOverlay: document.getElementById('ach-overlay'),
  shopOverlay: document.getElementById('shop-overlay'),
  inventoryOverlay: document.getElementById('inventory-overlay'),
  chestOverlay: document.getElementById('chest-overlay'),
  confirmOverlay: document.getElementById('confirm-overlay'),
  lbOverlay: document.getElementById('lb-overlay'),
  profileOverlay: document.getElementById('profile-overlay'),
  settingsOverlay: document.getElementById('settings-overlay'),
  modeOverlay: document.getElementById('mode-overlay'),
  bpOverlay: document.getElementById('battlepass-overlay'),
  dashboard: document.getElementById('menu-dashboard'),

  show: function() { if (this.overlay) this.overlay.classList.add('active'); },
  hide: function() { if (this.overlay) this.overlay.classList.remove('active'); },
  showDashboard: function() { if (this.dashboard) this.dashboard.classList.add('active'); },
  hideDashboard: function() { if (this.dashboard) this.dashboard.classList.remove('active'); },
  hideAll: function() {
    document.querySelectorAll('.modal-overlay').forEach(function(o) { o.classList.remove('active'); });
    if (this.overlay) this.overlay.classList.remove('active');
    if (this.confirmOverlay) this.confirmOverlay.classList.remove('active');
    if (this.dashboard) this.dashboard.classList.remove('active');
    if (this.chestOverlay) this.chestOverlay.classList.remove('active');
    if (this.bpOverlay) this.bpOverlay.classList.remove('active');
    var tut = document.getElementById('tut-overlay'); if (tut) tut.classList.remove('active');
  },
  setLevel: function(n, mode) {
    var prefix;
    if (mode === 'endless') {
      prefix = t('ui.endless_level', '♾ Уровень ');
    } else if (mode === 'challenge') {
      prefix = t('ui.challenge', '🎯 Испытание ');
    } else {
      prefix = t('ui.level', 'Уровень ');
    }
    safeText('ui-level', prefix + n);
  },
  setCoins: function(n) { var el = document.getElementById('ui-coins'); if (el) el.innerHTML = n + ' <span class="coin-icon"></span>'; },
  setGems: function(n) { var el = document.getElementById('ui-gems'); if (el) el.innerHTML = n + ' <span class="gem-icon"></span>'; },
  setTimer: function(sec) {
    var el = document.getElementById('ui-timer');
    if (!el) return;
    if (sec === null) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
      el.textContent = '⏱ ' + formatTime(Math.max(0, sec));
    }
  },
  setProgress: function(done, total) { var el = document.getElementById('ui-progress'); if (el) el.style.width = (total > 0 ? (done / total) * 100 : 0) + '%'; },
  showToast: function(text, duration) {
    var toast = document.createElement('div'); toast.className = 'toast'; toast.innerHTML = text;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, duration || 1500);
  },
  confirm: function(title, text, buttons) {
    var self = this;
    var titleEl = document.getElementById('confirm-title');
    var textEl = document.getElementById('confirm-text');
    var btns = document.getElementById('confirm-buttons');
    if (!titleEl || !textEl || !btns || !this.confirmOverlay) return;
    titleEl.textContent = title;
    textEl.innerHTML = text;
    btns.innerHTML = '';
    buttons.forEach(function(b) {
      var btn = document.createElement('button');
      btn.className = b.class || 'no';
      btn.textContent = b.label;
      btn.onclick = function() { self.confirmOverlay.classList.remove('active'); if (b.action) b.action(); };
      btns.appendChild(btn);
    });
    this.confirmOverlay.classList.add('active');
  }
};

function goToMainMenu() {
  UI.hideAll();

  // === УДАЛЯЕМ ВСЕ DOM-ЭЛЕМЕНТЫ ДУЭЛИ ===
  var ids = ['duel-panel', 'duel-floats', 'duel-countdown', 'duel-result-overlay', 'duel-search-overlay', 'duel-menu-overlay'];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  });

  // Останавливаем дуэль
  if (window.DuelLogic) DuelLogic.stop();

  // Убираем обработчик visibilitychange
  if (window._duelVisibilityHandler) {
    document.removeEventListener('visibilitychange', window._duelVisibilityHandler);
    window._duelVisibilityHandler = null;
  }

  var parent = document.getElementById('game');
  if (parent) { var old = parent.querySelector('canvas.paths-layer'); if (old) old.remove(); }
  SoundManager.stopMusic();
  if (window._bgAnimCleanup) { window._bgAnimCleanup(); window._bgAnimCleanup = null; }
  if (window.game) {
    window.game.scene.getScenes(true).forEach(function(scene) { if (scene.scene.key !== 'Menu') { try { window.game.scene.stop(scene.scene.key); } catch (e) {} } });
    try { if (window.game.scene.isActive('Menu')) window.game.scene.restart('Menu'); else window.game.scene.start('Menu'); }
    catch (e) { window.game.scene.start('Menu'); }
  }
}
window.goToMainMenu = goToMainMenu;
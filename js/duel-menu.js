/* ============================================================
   ДУЭЛИ — меню
   ============================================================ */

var DuelMenu = {
  show: function() {
    // Убираем старый overlay если есть (защита от дубликатов)
    var oldOverlay = document.getElementById('duel-menu-overlay');
    if (oldOverlay) oldOverlay.remove();

    // Убираем остатки элементов дуэли (кроме меню)
    var cleanIds = ['duel-panel', 'duel-floats', 'duel-countdown', 'duel-result-overlay', 'duel-search-overlay'];
    cleanIds.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });

    // Скрываем игровой UI
    if (window.UI) UI.hideAll();

    var overlay = document.createElement('div');
    overlay.id = 'duel-menu-overlay';
    overlay.className = 'duel-menu-overlay';
    document.body.appendChild(overlay);

    var stats = DuelStats.get();
    var rank = DuelRanks.getRank(stats.stars);
    var rankName = DuelRanks.getRankName(stats.stars);
    var place = DuelLeaderboard.getPlayerPlace(stats.stars);
    var winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

    var html = '';
    html += '<div class="duel-menu-content">';
    html += '<div class="duel-menu-header">';
    html += '<h2>' + t('duel.title', '⚔️ ДУЭЛИ') + '</h2>';
    html += '<button class="duel-menu-close" id="duel-menu-close">✕</button>';
    html += '</div>';

    // Ранг
    html += '<div class="duel-menu-rank-block">';
    html += '<div class="duel-menu-rank-icon" id="duel-menu-rank-icon"></div>';
    html += '<div class="duel-menu-rank-info">';
    html += '<div class="duel-menu-rank-name" id="duel-menu-rank-name">' + rankName + '</div>';
    html += '<div class="duel-menu-rank-stars">' + stats.stars + ' ⭐</div>';
    if (rank.rank === 'legend') {
      html += '<div class="duel-menu-rank-place">👑 #' + place + '</div>';
    }
    html += '</div>';
    html += '</div>';

    // Статистика
    html += '<div class="duel-menu-stats">';
    html += '<div class="duel-menu-stat"><div class="duel-menu-stat-value">' + stats.totalGames + '</div><div class="duel-menu-stat-label">' + t('duel.stats_total', 'Всего игр') + '</div></div>';
    html += '<div class="duel-menu-stat"><div class="duel-menu-stat-value win">' + stats.wins + '</div><div class="duel-menu-stat-label">' + t('duel.stats_wins', 'Побед') + '</div></div>';
    html += '<div class="duel-menu-stat"><div class="duel-menu-stat-value lose">' + stats.loses + '</div><div class="duel-menu-stat-label">' + t('duel.stats_loses', 'Поражений') + '</div></div>';
    html += '<div class="duel-menu-stat"><div class="duel-menu-stat-value">' + winRate + '%</div><div class="duel-menu-stat-label">' + t('duel.stats_winrate', 'Побед %') + '</div></div>';
    html += '<div class="duel-menu-stat"><div class="duel-menu-stat-value">🔥 ' + stats.winStreak + '</div><div class="duel-menu-stat-label">' + t('duel.stats_streak', 'Серия') + '</div></div>';
    html += '<div class="duel-menu-stat"><div class="duel-menu-stat-value">' + stats.bestStreak + '</div><div class="duel-menu-stat-label">' + t('duel.stats_best_streak', 'Лучшая серия') + '</div></div>';
    html += '</div>';

    // Кнопки
    html += '<div class="duel-menu-buttons">';
    html += '<button class="duel-menu-btn primary" id="duel-start">' + t('duel.start', '⚔️ НАЧАТЬ ДУЭЛЬ') + '</button>';
    html += '<button class="duel-menu-btn secondary" id="duel-training">' + t('duel.training', '🎯 ТРЕНИРОВКА') + '</button>';
    html += '<button class="duel-menu-btn secondary" id="duel-leaderboard">' + t('duel.leaderboard', '🏆 ЛИДЕРБОРД') + '</button>';
    html += '</div>';

    html += '</div>';

    overlay.innerHTML = html;
    overlay.classList.add('active');

    // Иконка ранга
    var rankIcon = document.getElementById('duel-menu-rank-icon');
    if (rankIcon) DuelRanks.setIcon(rankIcon, stats.stars);

    // Обработчики
    safeBind('duel-menu-close', function() {
      SoundManager.click();
      overlay.classList.remove('active');
      overlay.remove();
      goToMainMenu();
    });

    safeBind('duel-start', function() {
      SoundManager.click();
      overlay.classList.remove('active');
      overlay.remove();
      DuelSearch.start(false);
    });

    safeBind('duel-training', function() {
      SoundManager.click();
      overlay.classList.remove('active');
      overlay.remove();
      DuelSearch.start(true);
    });

    safeBind('duel-leaderboard', function() {
      SoundManager.click();
      DuelMenu.showLeaderboard();
    });
  },

    showLeaderboard: function() {
    // Скрываем меню дуэлей, чтобы не мешало
    var duelMenuOverlay = document.getElementById('duel-menu-overlay');
    if (duelMenuOverlay) {
      duelMenuOverlay.classList.remove('active');
      duelMenuOverlay.remove();
    }

    var menuScene = window.game && window.game.scene.getScene('Menu');
    if (menuScene && typeof menuScene.openLeaderboardExpanded === 'function') {
      // Открываем общий лидерборд с единственной вкладкой "Дуэли"
      // и возвратом обратно в меню дуэлей при закрытии
      menuScene.openLeaderboardExpanded('duel', {
        duelOnly: true,
        onClose: function() {
          setTimeout(function() { DuelMenu.show(); }, 100);
        }
      });
      return;
    }

    // Fallback — если сцена Menu почему-то недоступна
    DuelMenu._showLeaderboardFallback();
  },

  /* Fallback: старая реализация (на случай, если Menu-сцена недоступна) */
  _showLeaderboardFallback: function() {
    var stats = DuelStats.get();
    var playerName = YandexSDK.playerName || t('common.player', 'Игрок');

    DuelLeaderboard.getLeaderboard(playerName, stats.stars).then(function(entries) {
      var overlay = document.createElement('div');
      overlay.className = 'duel-menu-overlay active';
      overlay.style.zIndex = '1000';

      var html = '';
      html += '<div class="duel-menu-content">';
      html += '<div class="duel-menu-header">';
      html += '<h2>' + t('duel.lb_title', '🏆 ЛИДЕРБОРД — ДУЭЛИ') + '</h2>';
      html += '<button class="duel-menu-close" id="duel-lb-close">✕</button>';
      html += '</div>';
      html += '<div class="duel-lb-list">';

      var meIndex = entries.findIndex(function(e) { return e.isMe; });

      entries.slice(0, 30).forEach(function(e, idx) {
        var rank = idx + 1;
        var medal = rank === 1 ? '🥇' : (rank === 2 ? '🥈' : (rank === 3 ? '🥉' : rank));
        var rankClass = e.isMe ? 'me' : '';
        var youSuffix = t('lb.you', ' (вы)');

        html += '<div class="duel-lb-row ' + rankClass + '">';
        html += '<div class="duel-lb-rank">' + medal + '</div>';
        html += '<div class="duel-lb-name">' + e.name + (e.isMe ? youSuffix : '') + '</div>';
        html += '<div class="duel-lb-stars">' + e.score + ' ⭐</div>';
        html += '</div>';
      });

      html += '</div>';
      html += '</div>';

      overlay.innerHTML = html;
      document.body.appendChild(overlay);

      safeBind('duel-lb-close', function() {
        SoundManager.click();
        overlay.remove();
        DuelMenu.show();
      });
    });
  },
};

/* ============================================================
   ПОИСК СОПЕРНИКА
   ============================================================ */

var DuelSearch = {
  start: function(isTraining) {
    // Явно приводим к boolean
    isTraining = !!isTraining;

    // Убираем старый overlay если есть
    var oldOverlay = document.getElementById('duel-search-overlay');
    if (oldOverlay) oldOverlay.remove();

    var overlay = document.createElement('div');
    overlay.id = 'duel-search-overlay';
    overlay.className = 'duel-search-overlay';
    document.body.appendChild(overlay);

    var waitTime = DUEL_CONFIG.WAIT_TIME_MIN + Math.floor(Math.random() * (DUEL_CONFIG.WAIT_TIME_MAX - DUEL_CONFIG.WAIT_TIME_MIN + 1));

    overlay.innerHTML =
      '<div class="duel-search-content">' +
        '<div class="duel-search-spinner"></div>' +
        '<div class="duel-search-title">' + t('duel.searching', '⚔️ ПОИСК СОПЕРНИКА') + '</div>' +
        '<div class="duel-search-time">' + t('duel.search_time', 'Примерное время: {n} сек', { n: waitTime }) + '</div>' +
        '<div class="duel-search-status" id="duel-search-status">' + t('duel.search_status_1', 'Подключение...') + '</div>' +
        '<button class="duel-search-cancel" id="duel-search-cancel">' + t('duel.search_cancel', 'Отмена') + '</button>' +
      '</div>';

    overlay.classList.add('active');

    var statusEl = document.getElementById('duel-search-status');
    var statuses = [
      t('duel.search_status_1', 'Подключение...'),
      t('duel.search_status_2', 'Поиск игрока...'),
      t('duel.search_status_3', 'Проверка соединения...'),
      t('duel.search_status_4', 'Почти готово...')
    ];
    var statusIdx = 0;

    var statusInterval = setInterval(function() {
      if (statusEl) statusEl.textContent = statuses[statusIdx % statuses.length];
      statusIdx++;
    }, 800);

    // Звук поиска
    SoundManager.tick();
    var tickInterval = setInterval(function() { SoundManager.tick(); }, 700);

    var searchTime = DUEL_CONFIG.SEARCH_MIN + Math.random() * (DUEL_CONFIG.SEARCH_MAX - DUEL_CONFIG.SEARCH_MIN);
    var searchTimer = setTimeout(function() {
      clearInterval(statusInterval);
      clearInterval(tickInterval);
      if (statusEl) statusEl.textContent = t('duel.search_found', '✓ Соперник найден!');
      SoundManager.victory();
      setTimeout(function() {
        overlay.classList.remove('active');
        overlay.remove();
        // Всегда передаём оба параметра явно, чтобы Phaser не сохранил
        // data из предыдущего запуска сцены.
        window.game.scene.start('Duel', { training: isTraining });
      }, 800);
    }, searchTime * 1000);

    safeBind('duel-search-cancel', function() {
      clearTimeout(searchTimer);
      clearInterval(statusInterval);
      clearInterval(tickInterval);
      SoundManager.click();
      overlay.classList.remove('active');
      overlay.remove();
      DuelMenu.show();
    });
  }
};

window.DuelMenu = DuelMenu;
window.DuelSearch = DuelSearch;
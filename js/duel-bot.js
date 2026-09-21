/* ============================================================
   ДУЭЛИ — бот
   ============================================================ */

var DuelBot = {
  current: null,
  _timeouts: [],
  _activeBot: null,

  /**
   * Создать бота по тиру игрока
   */
  create: function(playerStars) {
    var rank = DuelRanks.getRank(playerStars);
    var botType = this.getBotTypeForRank(rank);

    // Защита от undefined
    if (!botType) botType = DUEL_BOTS.novice;

    var winStreak = DuelStats.getWinStreak();
    var hardMode = winStreak >= 10;

    // botType.name — это ключ ('bot.novice' и т.п.),
    // прогоняем через t() чтобы получить локализованное имя
    var botName = t(botType.name || 'bot.novice', 'Новичок');

    var bot = {
      id: botType.id || 'novice',
      name: botName,
      speed: (typeof botType.speed === 'number') ? botType.speed : 1.0,
      errorRate: (typeof botType.errorRate === 'number') ? botType.errorRate : 0.3,
      pauseMult: (typeof botType.pauseMult === 'number') ? botType.pauseMult : 1.5,
      hardMode: hardMode,
      progress: 0,
      currentLine: 0,
      totalLines: 0,
      errorCount: 0,
      finished: false,
      finishTime: 0,
      actions: []
    };

    if (winStreak >= 10) {
      var extraWins = winStreak - 10;                 // 0 на 10-й, 1 на 11-й, 2 на 12-й …
      var boostFactor = Math.max(0.3, 1.0 - extraWins * 0.1);

      bot.speed *= boostFactor;
      bot.errorRate = Math.max(0.01, 0.02 * boostFactor);
    }

    return bot;
  },

  getBotTypeForRank: function(rank) {
    if (rank.rank === 'legend') return DUEL_BOTS.champion;
    if (rank.rank === 'diamond') return DUEL_BOTS.champion;
    if (rank.rank === 'emerald') return DUEL_BOTS.pro;
    if (rank.rank === 'ruby') return DUEL_BOTS.pro;
    if (rank.rank === 'gold') return DUEL_BOTS.amateur;
    if (rank.rank === 'silver') return DUEL_BOTS.amateur;
    if (rank.rank === 'iron') return DUEL_BOTS.novice;
    return DUEL_BOTS.novice;
  },

  /**
   * Запустить бота
   */
  start: function(bot, totalLines, onAction, onFinish) {
    bot.totalLines = totalLines;
    bot.progress = 0;
    bot.currentLine = 0;
    bot.errorCount = 0;
    bot.finished = false;
    bot.actions = [];

    var totalTime = this.getTotalTime(bot, totalLines);

    this.scheduleActions(bot, totalLines, totalTime, onAction, onFinish);
  },

  /**
   * Общее время бота (в СЕКУНДАХ)
   */
  getTotalTime: function(bot, totalLines) {
    // Защита от undefined/NaN
    var speed = (typeof bot.speed === 'number' && !isNaN(bot.speed) && bot.speed > 0) ? bot.speed : 1.0;
    var lines = (typeof totalLines === 'number' && totalLines > 0) ? totalLines : 8;

    var baseTime = 40 + lines * 5;
    var time = baseTime * speed;
    time *= 0.9 + Math.random() * 0.2;

    if (isNaN(time) || time < 10) time = 60;

    return Math.max(20, time);
  },

  /**
   * Запланировать действия бота (в СЕКУНДАХ, setTimeout в МИЛЛИСЕКУНДАХ)
   */
  scheduleActions: function(bot, totalLines, totalTime, onAction, onFinish) {
    var self = this;

    // Инициализируем массив таймеров
    if (!this._timeouts) this._timeouts = [];
    this._activeBot = bot;

    if (isNaN(totalTime) || totalTime < 10) totalTime = 60;
    if (!totalLines || totalLines < 1) totalLines = 8;

    var totalMs = totalTime * 1000;
    var delayPerLine = totalMs / totalLines;
    var cumulativeTime = 0;

    for (var i = 0; i < totalLines; i++) {
      var isError = Math.random() < bot.errorRate;
      cumulativeTime += delayPerLine * (0.7 + Math.random() * 0.6);

      (function(lineIdx, time, error) {
        var id = setTimeout(function() {
          // Проверка, что бот ещё активен
          if (!self._activeBot || self._activeBot !== bot) return;
          if (bot.finished) return;

          if (error) {
            bot.errorCount++;
            if (onAction) onAction({ type: 'error', line: lineIdx });
          } else {
            bot.currentLine = lineIdx + 1;
            bot.progress = (lineIdx + 1) / totalLines;
            if (onAction) onAction({ type: 'line', line: lineIdx, progress: bot.progress });
          }
        }, time);
        self._timeouts.push(id);
      })(i, cumulativeTime, isError);
    }

    var finishId = setTimeout(function() {
      if (!self._activeBot || self._activeBot !== bot) return;
      if (bot.finished) return;
      bot.finished = true;
      bot.finishTime = totalTime;
      bot.progress = 1;
      if (onFinish) onFinish();
    }, totalMs);
    self._timeouts.push(finishId);
  },

  /**
   * Остановить бота — очистить все setTimeout
   */
  stop: function() {
    if (!this._timeouts) {
      this._timeouts = [];
      return;
    }
    this._timeouts.forEach(function(id) { clearTimeout(id); });
    this._timeouts = [];
    this._activeBot = null;
  }
};

window.DuelBot = DuelBot;
/* ============================================================
   ДУЭЛИ — логика
   ============================================================ */

var DuelLogic = {
  current: null,

  /**
   * Запустить дуэль
   */
  start: function() {
    var state = this.getState();
    var playerStars = DuelStats.getStars();

    var config = { w: DUEL_CONFIG.FIELD_SIZE, h: DUEL_CONFIG.FIELD_SIZE, colors: 8 };
    var level = LevelGenerator.generate(config.w, config.h, config.colors);

    var bot = DuelBot.create(playerStars);

    this.current = {
      level: level,
      bot: bot,
      startTime: Date.now(),
      endTime: null,
      playerFinished: false,
      botFinished: false,
      winner: null,
      onBotAction: null,
      onBotFinish: null,
      onEnd: null,
      stopped: false
    };

    return this.current;
  },

  setCallbacks: function(onBotAction, onBotFinish, onEnd) {
    if (!this.current) return;
    this.current.onBotAction = onBotAction;
    this.current.onBotFinish = onBotFinish;
    this.current.onEnd = onEnd;
  },

  startBot: function() {
    if (!this.current) return;
    var self = this;
    var bot = this.current.bot;
    var totalLines = this.current.level.paths.length;

    DuelBot.start(bot, totalLines,
      function(action) {
        if (!self.current || self.current.stopped) return;
        if (self.current.onBotAction) self.current.onBotAction(action);
      },
      function() {
        if (!self.current || self.current.stopped) return;
        if (self.current.botFinished) return;
        self.current.botFinished = true;
        if (self.current.onBotFinish) self.current.onBotFinish();
        self.checkEnd();
      }
    );
  },

  playerFinished: function() {
    if (!this.current || this.current.stopped) return;
    if (this.current.playerFinished) return;
    this.current.playerFinished = true;
    this.current.endTime = Date.now();
    this.checkEnd();
  },

  checkEnd: function() {
    if (!this.current || this.current.stopped) return;
    if (this.current.winner) return;

    if (this.current.playerFinished && this.current.botFinished) {
      var playerTime = (this.current.endTime - this.current.startTime) / 1000;
      var botTime = this.current.bot.finishTime;
      this.current.winner = playerTime <= botTime ? 'player' : 'bot';
      this.current.playerTime = playerTime;
      this.current.botTime = botTime;
    } else if (this.current.playerFinished) {
      this.current.winner = 'player';
      this.current.playerTime = (this.current.endTime - this.current.startTime) / 1000;
      this.current.botTime = this.current.playerTime + 5;
    } else if (this.current.botFinished) {
      this.current.winner = 'bot';
      this.current.botTime = this.current.bot.finishTime;
      this.current.playerTime = this.current.botTime + 5;
    }

    if (this.current.winner && this.current.onEnd) {
      this.current.onEnd(this.current.winner);
    }
  },

  stop: function() {
    if (!this.current) return;
    this.current.stopped = true;
    this.current.onBotAction = null;
    this.current.onBotFinish = null;
    this.current.onEnd = null;

    if (window.DuelBot) DuelBot.stop();

    this.current = null;
  },

  getState: function() {
    return window.game ? window.game.scene.getScene('Menu').registry.get('state') : null;
  }
};

/* ============================================================
   СТАТИСТИКА ДУЭЛЕЙ
   ============================================================ */

var DuelStats = {
  get: function() {
    try {
      var raw = localStorage.getItem('flow_duel_stats');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      stars: 0,
      wins: 0,
      loses: 0,
      totalGames: 0,
      winStreak: 0,
      bestStreak: 0,
      hardModeGamesLeft: 0
    };
  },

  save: function(data) {
    try { localStorage.setItem('flow_duel_stats', JSON.stringify(data)); } catch (e) {}
  },

  getStars: function() { return this.get().stars || 0; },
  getWinStreak: function() { return this.get().winStreak || 0; },
  getTotalGames: function() { return this.get().totalGames || 0; },

  addWin: function() {
    var d = this.get();
    d.wins++;
    d.totalGames++;
    d.winStreak++;
    d.bestStreak = Math.max(d.bestStreak, d.winStreak);
    d.stars = Math.max(0, d.stars + DUEL_CONFIG.WIN_STARS);

    if (d.winStreak >= 10) {
      d.hardModeGamesLeft = 3;
    }

    this.save(d);
    return d;
  },

  addLose: function() {
    var d = this.get();
    d.loses++;
    d.totalGames++;
    d.stars = Math.max(0, d.stars + DUEL_CONFIG.LOSE_STARS);
    d.winStreak = 0;
    this.save(d);
    return d;
  },

  applyStreakBonus: function(streak) {
    if (!DUEL_STREAK_BONUS[streak]) return null;
    var d = this.get();
    var bonus = DUEL_STREAK_BONUS[streak];
    d.stars += bonus.stars;
    this.save(d);
    return bonus;
  },

  reset: function() {
    this.save({ stars: 0, wins: 0, loses: 0, totalGames: 0, winStreak: 0, bestStreak: 0, hardModeGamesLeft: 0 });
  }
};

window.DuelLogic = DuelLogic;
window.DuelStats = DuelStats;
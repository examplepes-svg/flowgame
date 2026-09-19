/* ============================================================
   ДУЭЛИ — данные
   ============================================================ */

var DUEL_CONFIG = {
  FIELD_SIZE: 8,
  MAX_TIME: 120,
  SEARCH_MIN: 1,
  SEARCH_MAX: 10,
  WAIT_TIME_MIN: 15,
  WAIT_TIME_MAX: 25,
  PAUSE_MIN: 0.5,
  PAUSE_MAX: 3,
  REVEAL_DELAY: 2000,
  FLOAT_TIME: 5000,
  FADE_TIME: 2000,
  DISCONNECT_TIME: 120,
  COUNTDOWN: 5,
  WIN_STARS: 5,
  LOSE_STARS: -5,
  WIN_COINS: 20,     // ← 20 монет за победу
  LOSE_COINS: 5      // ← 5 монет за поражение
};

/* ============================================================
   БОТЫ — 4 типа
   name — ключ локализации (bot.novice, bot.amateur, ...)
   ============================================================ */

var DUEL_BOTS = {
  novice:   { id: 'novice',   name: 'bot.novice',   speed: 1.4,  errorRate: 0.35, pauseMult: 1.5 },
  amateur:  { id: 'amateur',  name: 'bot.amateur',  speed: 1.15, errorRate: 0.20, pauseMult: 1.2 },
  pro:      { id: 'pro',      name: 'bot.pro',      speed: 0.95, errorRate: 0.10, pauseMult: 0.9 },
  champion: { id: 'champion', name: 'bot.champion', speed: 0.75, errorRate: 0.03, pauseMult: 0.6 }
};

/* ============================================================
   ЗВЁЗДЫ — серии (20 / 30 / 50 монет)
   ============================================================ */

var DUEL_STREAK_BONUS = {
  3:  { stars: 10, coins: 20 },
  5:  { stars: 25, coins: 30 },
  10: { stars: 50, coins: 50 }
};

window.DUEL_CONFIG = DUEL_CONFIG;
window.DUEL_BOTS = DUEL_BOTS;
window.DUEL_STREAK_BONUS = DUEL_STREAK_BONUS;
/* ============================================================
   БЕСКОНЕЧНЫЙ РЕЖИМ — данные и логика
   ============================================================ */

var EndlessMode = {
  /**
   * Конфиг сложности по уровням
   */
  getConfig: function(level) {
    if (level <= 5)   return { w: 5, h: 5, colors: 4, time: 90 };
    if (level <= 10)  return { w: 6, h: 6, colors: 5, time: 80 };
    if (level <= 20)  return { w: 6, h: 6, colors: 6, time: 70 };
    if (level <= 30)  return { w: 7, h: 7, colors: 6, time: 60 };
    if (level <= 40)  return { w: 7, h: 7, colors: 7, time: 60 };
    if (level <= 50)  return { w: 8, h: 8, colors: 7, time: 60 };
    if (level <= 100) return { w: 8, h: 8, colors: 8, time: 60 };
    if (level <= 150) return { w: 8, h: 8, colors: 8, time: 50 };
    if (level <= 200) return { w: 8, h: 8, colors: 8, time: 45 };
    var extra = Math.floor((level - 200) / 50);
    var time = Math.max(20, 45 - extra * 5);
    return { w: 8, h: 8, colors: 8, time: time };
  },

  /**
   * Награда за уровень
   */
  getReward: function(level) {
    return 12;
  },

  /**
   * Бонус за каждые 5 уровней
   */
  getBonus: function(level) {
    if (level % 5 !== 0) return 0;
    return 15;
  },

  /* ============================================================
     ГЛОБАЛЬНАЯ СТАТИСТИКА (сумма всех уровней за всё время)
     ============================================================ */

  getTotalLevels: function() {
    try {
      var raw = localStorage.getItem('flow_endless');
      if (raw) return JSON.parse(raw).totalLevels || 0;
    } catch (e) {}
    return 0;
  },

  getBest: function() {
    try {
      var raw = localStorage.getItem('flow_endless');
      if (raw) return JSON.parse(raw).best || 0;
    } catch (e) {}
    return 0;
  },

  getActualBest: function() {
    var finished = this.getBest();
    var session = this.loadSession();
    var sessionLevel = (session && session.currentLevel) ? session.currentLevel : 0;
    return Math.max(finished, sessionLevel);
  },

  /**
   * === NEW ===
   * Засчитать один пройденный уровень бесконечного.
   * Вызывается из EndlessScene.onVictory (и skipLevelWithBooster)
   * на КАЖДОМ пройденном уровне, чтобы totalLevels рос сразу.
   *
   * Обновляет:
   *   - totalLevels += 1
   *   - best = max(best, level)
   */
  recordLevelCompleted: function(level) {
    try {
      var raw = localStorage.getItem('flow_endless');
      var data = raw ? JSON.parse(raw) : { best: 0, totalLevels: 0 };
      data.totalLevels = (data.totalLevels || 0) + 1;
      if (level && level > (data.best || 0)) {
        data.best = level;
      }
      localStorage.setItem('flow_endless', JSON.stringify(data));
      return data;
    } catch (e) {}
    return { best: level || 0, totalLevels: 1 };
  },

  /**
   * Финальный результат при проигрыше.
   *
   * ВАЖНО: с введением recordLevelCompleted() этот метод больше
   * НЕ инкрементирует totalLevels (иначе будет задвоение —
   * каждый уровень уже засчитан на победе).
   * Оставляем только обновление best как страховку
   * (например, если игрок дошёл до рекорда, но не выиграл
   * последний уровень — best обновится всё равно).
   */
  saveResult: function(level) {
    try {
      var raw = localStorage.getItem('flow_endless');
      var data = raw ? JSON.parse(raw) : { best: 0, totalLevels: 0 };
      if (level && level > (data.best || 0)) {
        data.best = level;
      }
      localStorage.setItem('flow_endless', JSON.stringify(data));
      return data;
    } catch (e) {}
    return { best: level || 0, totalLevels: 0 };
  },

  /* ============================================================
     СЕССИЯ ТЕКУЩЕЙ ИГРЫ (для продолжения)
     ============================================================ */

  saveSession: function(level, sessionCoins, sessionXp) {
    try {
      var data = {
        currentLevel: level,
        sessionCoins: sessionCoins || 0,
        sessionXp: sessionXp || 0,
        savedAt: Date.now()
      };
      localStorage.setItem('flow_endless_session', JSON.stringify(data));
    } catch (e) {}
  },

  loadSession: function() {
    try {
      var raw = localStorage.getItem('flow_endless_session');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },

  hasSavedSession: function() {
    var s = this.loadSession();
    return s && s.currentLevel > 0;
  },

  clearSession: function() {
    try { localStorage.removeItem('flow_endless_session'); } catch (e) {}
  },

  isDuelUnlocked: function() {
    return this.getTotalLevels() >= 50;
  },

  getDuelProgress: function() {
    var total = this.getTotalLevels();
    return {
      current: Math.min(total, 50),
      needed: 50,
      unlocked: total >= 50
    };
  }
};

window.EndlessMode = EndlessMode;
/* ============================================================
   УТИЛИТЫ
   ============================================================ */
var MSK_OFFSET = 3 * 60 * 60 * 1000;

function todayStrMSK() {
  var d = new Date(Date.now() + MSK_OFFSET);
  var y = d.getUTCFullYear();
  var m = d.getUTCMonth() + 1;
  var day = d.getUTCDate();
  return y + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
}

function yesterdayStrMSK() {
  var d = new Date(Date.now() + MSK_OFFSET - 24 * 60 * 60 * 1000);
  var y = d.getUTCFullYear();
  var m = d.getUTCMonth() + 1;
  var day = d.getUTCDate();
  return y + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
}

function weekStrMSK() {
  var d = new Date(Date.now() + MSK_OFFSET);
  var day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return d.getUTCFullYear() + '-W' + (weekNo < 10 ? '0' + weekNo : weekNo);
}

function msUntilMidnightMSK() {
  var now = Date.now() + MSK_OFFSET;
  var dayMs = 24 * 60 * 60 * 1000;
  var todayStart = Math.floor(now / dayMs) * dayMs;
  return todayStart + dayMs - now;
}

/* Обратная совместимость — все старые вызовы todayStr() возвращают МСК-дату */
function todayStr() { return todayStrMSK(); }
function formatTime(sec) { var m = Math.floor(sec / 60); var s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
function formatTimeLong(sec) { var h = Math.floor(sec / 3600); var m = Math.floor((sec % 3600) / 60); var s = sec % 60; if (h > 0) return h + 'ч ' + m + 'м'; if (m > 0) return m + 'м ' + s + 'с'; return s + 'с'; }
function generateRandomName() { return 'u' + Math.floor(10000000 + Math.random() * 90000000); }
function safeBind(id, handler) { var el = document.getElementById(id); if (el) el.onclick = handler; }
function safeText(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }
function hexColor(c) { return '#' + ('000000' + c.toString(16)).slice(-6); }

/* ============================================================
   ЯЗЫК — заготовка (полная локализация в Шаге 5)
   ============================================================ */
window.TRANSLATIONS = window.TRANSLATIONS || { ru: {}, en: {} };

function getLang() {
  return (window.YandexSDK && YandexSDK.lang) || 'ru';
}

function t(key, fallback) {
  var lang = getLang();
  var dict = window.TRANSLATIONS[lang];
  if (dict && dict[key] !== undefined) return dict[key];
  if (fallback !== undefined) return fallback;
  return key;
}
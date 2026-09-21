/* ============================================================
   ДУЭЛИ — ранги
   ============================================================ */

var DuelRanks = {
  // 29 картинок: 7 рангов × 4 состояния + 1 legend
  // Сетка: 7 колонок × 4 ряда = 28 ячеек

  // name — это ключ локализации (rank.wood, rank.iron, ...)
  RANKS: [
    { id: 'wood',     name: 'rank.wood',     col: 0 },
    { id: 'iron',     name: 'rank.iron',     col: 1 },
    { id: 'silver',   name: 'rank.silver',   col: 2 },
    { id: 'gold',     name: 'rank.gold',     col: 3 },
    { id: 'ruby',     name: 'rank.ruby',     col: 4 },
    { id: 'emerald',  name: 'rank.emerald',  col: 5 },
    { id: 'diamond',  name: 'rank.diamond',  col: 6 }
  ],

  // Римские цифры для отображения (универсальны для всех языков)
  ROMAN: ['', ' I', ' II', ' III'],

  /**
   * Получить ранг по звёздам
   */
  getRank: function(stars) {
    if (stars >= 1001) {
      return { rank: 'legend', rankName: t('rank.legend', 'Легенда'), col: -1, row: -1 };
    }

    var step = 0;
    if (stars <= 0) step = 0;
    else step = Math.min(28, Math.floor((stars - 1) / 36) + 1);

    // step 1-4 → Дерево (0,1,2,3)
    // step 5-8 → Железо (0,1,2,3)
    // step 9-12 → Серебро (0,1,2,3)
    // step 13-16 → Золото (0,1,2,3)
    // step 17-20 → Рубин (0,1,2,3)
    // step 21-24 → Изумруд (0,1,2,3)
    // step 25-28 → Алмаз (0,1,2,3)

    var rankIndex, starIndex;
    if (step <= 4) {
      rankIndex = 0; starIndex = step - 1;
    } else if (step <= 8) {
      rankIndex = 1; starIndex = step - 5;
    } else if (step <= 12) {
      rankIndex = 2; starIndex = step - 9;
    } else if (step <= 16) {
      rankIndex = 3; starIndex = step - 13;
    } else if (step <= 20) {
      rankIndex = 4; starIndex = step - 17;
    } else if (step <= 24) {
      rankIndex = 5; starIndex = step - 21;
    } else {
      rankIndex = 6; starIndex = step - 25;
    }

    // Особый случай для 0 звёзд — "чистый" ранг без цифры
    // (0 звёзд → Дерево, а не Дерево 0)
    if (step === 0) starIndex = 0;

    var rank = this.RANKS[rankIndex];
    return {
      rank: rank.id,
      rankName: t(rank.name, rank.id),
      col: rank.col,
      row: starIndex,
      step: step
    };
  },

  /**
   * Установить иконку ранга (позиционирование — как в рабочем коде)
   */
  setIcon: function(element, stars) {
    var r = this.getRank(stars);

    if (r.rank === 'legend') {
      element.style.backgroundImage = 'url(assets/ranks/rank_legend.png)';
      element.style.backgroundSize = 'contain';
      element.style.backgroundPosition = 'center';
      element.style.backgroundRepeat = 'no-repeat';
      element.dataset.rank = 'legend';
      element.dataset.rankName = t('rank.legend', 'Легенда');
      return r;
    }

    element.style.backgroundImage = 'url(assets/ranks/ranks_grid.webp)';
    element.style.backgroundSize = '700% 400%';
    element.style.backgroundRepeat = 'no-repeat';

    var xPercent = (r.col / 6) * 100;
    var yPercent = (r.row / 3) * 100;
    element.style.backgroundPosition = xPercent + '% ' + yPercent + '%';

    element.dataset.rank = r.rank;
    element.dataset.rankName = this.getRankName(stars);

    return r;
  },

  /**
   * Получить название ранга текстом
   * Логика:
   *   row 0 → "Дерево"
   *   row 1 → "Дерево I"
   *   row 2 → "Дерево II"
   *   row 3 → "Дерево III"
   */
  getRankName: function(stars) {
    var r = this.getRank(stars);
    if (r.rank === 'legend') return t('rank.legend', 'Легенда');

    return r.rankName + (this.ROMAN[r.row] || '');
  },

  /**
   * Получить звёзды для перехода в следующий ранг
   */
  getStarsToNext: function(stars) {
    if (stars >= 1001) return 0;
    var nextStep = Math.floor(stars / 36) + 1;
    if (nextStep > 28) nextStep = 28;
    var nextThreshold = nextStep * 36;
    if (stars === 0) nextThreshold = 1;
    return Math.max(0, nextThreshold - stars);
  }
};

window.DuelRanks = DuelRanks;
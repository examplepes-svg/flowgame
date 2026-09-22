/* ============================================================
   КОНФИГ-ДАННЫЕ: ТЕМЫ, ФОНЫ, СЛЕДЫ
   ============================================================ */

var THEMES = {
  default:   { get name() { return t('theme.default', 'Классика'); },           price: 0,   priceGems: 0,  glow: false, colors: [0xff4757, 0x1e90ff, 0x2ed573, 0xffa502, 0xa55eea, 0x00d2d3, 0xff6b81, 0xfeca57] },
  dark:      { get name() { return t('theme.dark', 'Тёмная'); },                price: 150, priceGems: 30, glow: false, colors: [0xb71c1c, 0x1565c0, 0x2e7d32, 0xf9a825, 0x6a1b9a, 0x00838f, 0xff4081, 0x5d4037] },
  retro:     { get name() { return t('theme.retro', 'Ретро'); },                price: 150, priceGems: 30, glow: false, colors: [0xd94f4f, 0x3b82c4, 0x5fa85f, 0xe0a640, 0x8e44ad, 0x16a085, 0xc0704f, 0xf0c674] },
  oriental:  { get name() { return t('theme.oriental', 'Японская'); },          price: 200, priceGems: 40, glow: false, colors: [0xc8102e, 0x1a1a1a, 0xf5f5dc, 0x7c9a5f, 0xd4af37, 0x264653, 0xffb7c5, 0x8b7355] },
  ocean:     { get name() { return t('theme.ocean', 'Океан'); },                price: 200, priceGems: 40, glow: false, colors: [0x001f3f, 0x0074d9, 0x00ffd0, 0x2ecc40, 0x7fdbff, 0x01ff70, 0x85144b, 0xff851b] },
  gradient:  { get name() { return t('theme.gradient', 'Градиент'); },          price: 300, priceGems: 60, glow: true,  gradient: true, colors: [0xff006e, 0xfb5607, 0xffbe0b, 0x8338ec, 0x3a86ff, 0x06d6a0, 0xff006e, 0x06d6a0] },
  pastel:    { get name() { return t('theme.pastel', 'Пастель'); },             price: 150, priceGems: 30, glow: false, colors: [0xffb3ba, 0x9ad4ff, 0xb5e8a8, 0xffe28a, 0xd5a8ff, 0xffc2a8, 0x9ff0e8, 0xff8fbf] },
  neon:      { get name() { return t('theme.neon', 'Неон'); },                  price: 300, priceGems: 60, glow: true,  colors: [0xff00ff, 0x00ffff, 0xff0040, 0x00ff00, 0xffdd00, 0xff8800, 0x00ff88, 0x0088ff] },
  cosmic:    { get name() { return t('theme.cosmic', 'Космос'); },              price: 200, priceGems: 40, glow: false, colors: [0xff00ff, 0x00ffff, 0xff4500, 0x00ff88, 0xffcc00, 0x8800ff, 0x0088ff, 0xff44aa] },
  glitch:    { get name() { return t('theme.glitch', 'Глитч'); },               price: 300, priceGems: 60, glow: true,  glitch: true, colors: [0xff0040, 0x00ff40, 0x4000ff, 0xff00ff, 0x00ffff, 0xffff00, 0xff6600, 0x00ffaa] },
  metallic:  { get name() { return t('theme.metallic', 'Металлик'); },          price: 200, priceGems: 40, glow: false, metallic: true, colors: [0xc0c0c0, 0xffd700, 0xb87333, 0xe5e4e2, 0xcd7f32, 0x848482, 0xffd700, 0xa9a9a9] },
  fire:      { get name() { return t('theme.fire', 'Огонь'); },                 price: 200, priceGems: 40, glow: false, colors: [0xff0000, 0xff6600, 0xffcc00, 0x8b0000, 0xffaa00, 0xffdd55, 0xff2200, 0xff8800] },
  gems:      { get name() { return t('theme.gems', 'Драгоценные камни'); },     price: 200, priceGems: 40, glow: false, sparkle: true, colors: [0x006400, 0xb22222, 0x0f52ba, 0x9966cc, 0xffbf00, 0x008080, 0xc71585, 0x50c878] },

  r_sakura:   { get name() { return t('theme.r_sakura', 'Сакура'); },    price: 0, priceGems: 0, glow: false, reward: true, lineParticle: 'sakura_petal', colors: [0xff69b4, 0xffb7c5, 0xff1493, 0xfff0f5, 0xc8102e, 0xffd700, 0xff8fab, 0xffffff] },
  r_venice:   { get name() { return t('theme.r_venice', 'Венеция'); },   price: 0, priceGems: 0, glow: false, reward: true, lineParticle: 'bubble', colors: [0x00bcd4, 0x0097a7, 0xffd700, 0xffa500, 0x1565c0, 0x80deea, 0xff6f00, 0x00838f] },
  r_lavender: { get name() { return t('theme.r_lavender', 'Лаванда'); }, price: 0, priceGems: 0, glow: false, reward: true, lineParticle: 'lavender_petal', colors: [0x9b59b6, 0x8e44ad, 0xc39bd3, 0xe8daef, 0x6c3483, 0xd2b4de, 0xbb8fce, 0xffffff] },
  r_winter:   { get name() { return t('theme.r_winter', 'Зима'); },      price: 0, priceGems: 0, glow: false, reward: true, lineParticle: 'snowflake', colors: [0xffffff, 0xb0e0e6, 0x87ceeb, 0x4682b4, 0xdcdcdc, 0xadd8e6, 0x5f9ea0, 0xe0ffff] },
  r_vegas:    { get name() { return t('theme.r_vegas', 'Вегас'); },      price: 0, priceGems: 0, glow: true,  reward: true, lineParticle: 'neon_spark', colors: [0xff1493, 0x9b59b6, 0xffd700, 0x00ffff, 0xff4500, 0xff00ff, 0x00ff88, 0xffcc00] },
  r_carnival: { get name() { return t('theme.r_carnival', 'Карнавал'); }, price: 0, priceGems: 0, glow: false, reward: true, lineParticle: 'confetti', colors: [0xffd700, 0x00c853, 0x0091ea, 0xff1744, 0xff6d00, 0xffeb3b, 0x00bcd4, 0x8e24aa] },
  r_dragon:   { get name() { return t('theme.r_dragon', 'Дракон'); },    price: 0, priceGems: 0, glow: false, reward: true, lineParticle: 'fire_dot', colors: [0xd32f2f, 0xb71c1c, 0xffd700, 0xff8f00, 0x8b0000, 0xffab00, 0xc62828, 0xffe082] },
  r_forest:   { get name() { return t('theme.r_forest', 'Лес'); },       price: 0, priceGems: 0, glow: false, reward: true, lineParticle: 'leaf', colors: [0x2e7d32, 0x1b5e20, 0x4caf50, 0x8d6e63, 0x33691e, 0x558b2f, 0x3e2723, 0xa5d6a7] },
  r_outback:  { get name() { return t('theme.r_outback', 'Аутбэк'); },   price: 0, priceGems: 0, glow: false, reward: true, lineParticle: 'dust', colors: [0xff6d00, 0xe65100, 0xbf360c, 0xffab00, 0xd84315, 0xff8f00, 0xa1887f, 0xffe0b2] },
  r_aurora:   { get name() { return t('theme.r_aurora', 'Сияние'); },    price: 0, priceGems: 0, glow: true,  reward: true, lineParticle: 'aurora_wisp', colors: [0x00e676, 0x9c27b0, 0x00bcd4, 0x76ff03, 0x7c4dff, 0x18ffff, 0xb2ff59, 0xe040fb] },

  /* === ЭКСКЛЮЗИВ FALLPASS — тема «Аниме» === */
  anime: {
    get name() { return t('theme.anime', 'Аниме'); },
    price: 0, priceGems: 0,
    glow: true,
    softGlow: true,
    leafPrice: 60,
    premiumOnly: false,
    exclusive: true,
    colors: [
      0xffffff,
      0xffe4ec,
      0xffd6e8,
      0xe8d5f5,
      0xd6e4ff,
      0xd5f5e3,
      0xfff0d6,
      0xf5e6d3
    ]
  }
};

var BACKGROUNDS = {
  void:      { get name() { return t('bg.void', 'Тёмная пустота'); },                price: 0,   priceGems: 0,  type: 'solid',  value: '#1a1a2e', preview: '#1a1a2e' },
  stars:     { get name() { return t('bg.stars', 'Звёздное небо'); },               price: 200, priceGems: 40, type: 'stars',  preview: '#0a0a1e' },
  waves:     { get name() { return t('bg.waves', 'Волны'); },                        price: 100, priceGems: 20, type: 'waves',  preview: '#0a2540' },
  bubbles:   { get name() { return t('bg.bubbles', 'Пузыри'); },                     price: 200, priceGems: 40, type: 'bubbles', preview: '#0a2a3a' },
  aurora:    { get name() { return t('bg.aurora', 'Северное сияние'); },             price: 300, priceGems: 60, type: 'aurora', preview: '#0a1a2a' },
  matrix:    { get name() { return t('bg.matrix', 'Матрица'); },                     price: 100, priceGems: 20, type: 'matrix', preview: '#001100' },
  nebula:    { get name() { return t('bg.nebula', 'Космическая туманность'); },      price: 300, priceGems: 60, type: 'nebula', preview: '#2a1a3a' },
  snow:      { get name() { return t('bg.snow', 'Снег'); },                          price: 100, priceGems: 20, type: 'snow',   preview: '#1a2a3a' },
  neural:    { get name() { return t('bg.neural', 'Нейросеть'); },                   price: 100, priceGems: 20, type: 'neural', preview: '#0a0a2a' },

  anime_forest: {
    get name() { return t('bg.anime_forest', 'Осенний лес'); },
    price: 0, priceGems: 0,
    leafPrice: 60,
    exclusive: true,
    type: 'image',
    image: 'assets/ui/battlepass_bg.webp',
    blur: 8,
    darken: 0.4,
    preview: 'assets/ui/battlepass_bg.webp'
  }
};

var TRAILS = {
  default:        { get name() { return t('trail.default', 'Классический'); },      price: 0,   priceGems: 0,  type: 'dot',           cursorColor: '#ffffff' },
  lightning:      { get name() { return t('trail.lightning', 'Молния'); },           price: 200, priceGems: 40, type: 'lightning',     cursorColor: '#ffff00' },
  spores:         { get name() { return t('trail.spores', 'Споры'); },               price: 200, priceGems: 40, type: 'spores',        cursorColor: '#88ff88' },
  butterflies:    { get name() { return t('trail.butterflies', 'Бабочки'); },        price: 200, priceGems: 40, type: 'butterflies',   cursorColor: '#ff88dd' },
  comet:          { get name() { return t('trail.comet', 'Комета'); },               price: 300, priceGems: 60, type: 'comet',         cursorColor: '#ffd93d' },
  magic:          { get name() { return t('trail.magic', 'Магия'); },                price: 300, priceGems: 60, type: 'magic',         cursorColor: '#b07fe0' },
  ghosts:         { get name() { return t('trail.ghosts', 'Призраки'); },            price: 300, priceGems: 60, type: 'ghosts',        cursorColor: '#ffffff' },
  curse:          { get name() { return t('trail.curse', 'Проклятие'); },            price: 300, priceGems: 60, type: 'curse',         cursorColor: '#8b0000' },
  shooting_star:  { get name() { return t('trail.shooting_star', 'Падающая звезда'); }, price: 200, priceGems: 40, type: 'shooting_star', cursorColor: '#ffd93d' },
  nebula:         { get name() { return t('trail.nebula', 'Туманность'); },          price: 350, priceGems: 70, type: 'nebula',        cursorColor: '#a55eea' },
  black_hole:     { get name() { return t('trail.black_hole', 'Чёрная дыра'); },     price: 350, priceGems: 70, type: 'black_hole',    cursorColor: '#1a1a2e' },
  crystals:       { get name() { return t('trail.crystals', 'Кристаллы'); },         price: 350, priceGems: 70, type: 'crystals',      cursorColor: '#00d2d3' },
  paint:          { get name() { return t('trail.paint', 'Краска'); },               price: 300, priceGems: 60, type: 'paint',         cursorColor: '#ff6b81' },
  web:            { get name() { return t('trail.web', 'Паутина'); },                price: 200, priceGems: 40, type: 'web',           cursorColor: '#ffffff' },
  constellation:  { get name() { return t('trail.constellation', 'Созвездие'); },    price: 300, priceGems: 60, type: 'constellation', cursorColor: '#ffffff' },
  quantum:        { get name() { return t('trail.quantum', 'Квант'); },              price: 350, priceGems: 70, type: 'quantum',       cursorColor: '#a55eea' },

  sakura:    { get name() { return t('trail.sakura', 'Лепестки сакуры'); },     price: 0, priceGems: 0, type: 'sakura',        cursorColor: '#ffb7c5', reward: true },
  bubbles:   { get name() { return t('trail.bubbles', 'Пузыри Венеции'); },     price: 0, priceGems: 0, type: 'bubbles_trail', cursorColor: '#a0d8ff', reward: true },
  lavender:  { get name() { return t('trail.lavender', 'Лаванда'); },           price: 0, priceGems: 0, type: 'sakura',        cursorColor: '#9b59b6', reward: true },
  snowflake: { get name() { return t('trail.snowflake', 'Снежинки'); },         price: 0, priceGems: 0, type: 'snowflake',     cursorColor: '#a8e6ff', reward: true },
  sparks:    { get name() { return t('trail.sparks', 'Неоновые искры'); },      price: 0, priceGems: 0, type: 'sparks',        cursorColor: '#00ff88', reward: true },
  rainbow:   { get name() { return t('trail.rainbow', 'Карнавал'); },           price: 0, priceGems: 0, type: 'rainbow',       cursorColor: '#ff00ff', reward: true },
  fire:      { get name() { return t('trail.fire', 'Огонь дракона'); },         price: 0, priceGems: 0, type: 'fire',          cursorColor: '#ff6600', reward: true },
  leaves:    { get name() { return t('trail.leaves', 'Листья осени'); },        price: 0, priceGems: 0, type: 'leaves',        cursorColor: '#7c9a5f', reward: true },
  water:     { get name() { return t('trail.water', 'Волны океана'); },         price: 0, priceGems: 0, type: 'water',         cursorColor: '#0099ff', reward: true },
  aurora:    { get name() { return t('trail.aurora', 'Северное сияние'); },     price: 0, priceGems: 0, type: 'aurora',        cursorColor: '#00ff88', reward: true },

  anime: {
    get name() { return t('trail.anime', 'Аниме'); },
    price: 0, priceGems: 0,
    leafPrice: 60,
    exclusive: true,
    type: 'anime_trail',
    cursorColor: '#ffb7d5'
  }
};

/* ============================================================
   ДОСТИЖЕНИЯ
   ============================================================ */

var ACHIEVEMENTS = [
  /* === БАЗОВЫЕ === */
  { id: 'first',      get name() { return t('ach.first', 'Первая победа'); },            get desc() { return t('ach.first_desc', 'Пройди 1 уровень'); },                       icon: '🏆', coins: 25,  check: function(p) { return p.levelsCompleted >= 1; } },
  { id: 'ten',        get name() { return t('ach.ten', 'Десятка'); },                    get desc() { return t('ach.ten_desc', 'Пройди 10 уровней'); },                        icon: '🔟', coins: 50,  check: function(p) { return p.levelsCompleted >= 10; } },
  { id: 'fifty',      get name() { return t('ach.fifty', 'Полтинник'); },                get desc() { return t('ach.fifty_desc', 'Пройди 50 уровней'); },                      icon: '⭐', coins: 125, check: function(p) { return p.levelsCompleted >= 50; } },
  { id: 'hundred',    get name() { return t('ach.hundred', 'Сотка'); },                  get desc() { return t('ach.hundred_desc', 'Пройди 100 уровней'); },                   icon: '💯', coins: 250, check: function(p) { return p.levelsCompleted >= 100; } },
  { id: 'two_fifty',  get name() { return t('ach.two_fifty', 'Двести пятьдесят'); },     get desc() { return t('ach.two_fifty_desc', 'Пройди 250 уровней'); },                 icon: '🏅', coins: 375, check: function(p) { return p.levelsCompleted >= 250; } },
  { id: 'five_hundred', get name() { return t('ach.five_hundred', 'Пятьсот'); },         get desc() { return t('ach.five_hundred_desc', 'Пройди 500 уровней'); },              icon: '🎖️', coins: 500, check: function(p) { return p.levelsCompleted >= 500; } },
  { id: 'thousand',   get name() { return t('ach.thousand', 'Тысяча'); },                get desc() { return t('ach.thousand_desc', 'Пройди 1000 уровней'); },                 icon: '👑', coins: 1000, check: function(p) { return p.levelsCompleted >= 1000; } },
  { id: 'ten_thousand', get name() { return t('ach.ten_thousand', 'Десять тысяч'); },    get desc() { return t('ach.ten_thousand_desc', 'Пройди 10000 уровней'); },            icon: '🌟', coins: 3000, check: function(p) { return p.levelsCompleted >= 10000; } },

  /* === ЭКОНОМИКА === */
  { id: 'rich',       get name() { return t('ach.rich', 'Богач'); },                     get desc() { return t('ach.rich_desc', 'Накопи 1000 монет'); },                       icon: '💰', coins: 75,  check: function(p) { return p.coins >= 1000; } },
  { id: 'collector',  get name() { return t('ach.collector', 'Коллекционер'); },         get desc() { return t('ach.collector_desc', 'Купи 5 тем'); },                         icon: '🎨', coins: 150, check: function(p) { return p.ownedThemes.length >= 5; } },
  { id: 'buy10',      get name() { return t('ach.buy10', 'Шопоголик'); },                get desc() { return t('ach.buy10_desc', 'Купи 10 предметов'); },                      icon: '🛍️', coins: 200, check: function(p) { return (p.ownedThemes.length + p.ownedTrails.length + p.ownedBackgrounds.length) >= 10; } },

  /* === СКОРОСТЬ И МАСТЕРСТВО === */
  { id: 'speedster',  get name() { return t('ach.speedster', 'Скоростной'); },           get desc() { return t('ach.speedster_desc', 'Пройди уровень за 15 секунд'); },        icon: '⚡', coins: 50,  check: function(p) { return p.bestTime <= 15 && p.bestTime > 0; } },
  { id: 'noHint',     get name() { return t('ach.noHint', 'Сам себе мастер'); },         get desc() { return t('ach.noHint_desc', 'Пройди 20 уровней без подсказок'); },       icon: '🧠', coins: 100, check: function(p) { return p.levelsNoHint >= 20; } },
  { id: 'no_hint_50', get name() { return t('ach.no_hint_50', 'Мастер без подсказок'); }, get desc() { return t('ach.no_hint_50_desc', 'Пройди 50 уровней без подсказок'); }, icon: '🧘', coins: 250, check: function(p) { return p.levelsNoHint >= 50; } },

  /* === ЕЖЕДНЕВНЫЕ / СЕРИИ === */
  { id: 'daily7',     get name() { return t('ach.daily7', 'Верный друг'); },             get desc() { return t('ach.daily7_desc', 'Заходи 7 дней подряд'); },                  icon: '📅', coins: 250, check: function(p) { return p.streak >= 7; } },
  { id: 'tasks20',    get name() { return t('ach.tasks20', 'Исполнительный'); },         get desc() { return t('ach.tasks20_desc', 'Выполни 20 заданий'); },                   icon: '✅', coins: 125, check: function(p) { return p.tasksCompleted >= 20; } },
  { id: 'level10',    get name() { return t('ach.level10', 'Опытный'); },                get desc() { return t('ach.level10_desc', 'Достигни 10 уровня игрока'); },             icon: '⭐', coins: 250, check: function(p) { return PlayerLevels.getLevel(p.totalXp) >= 10; } },

  /* === БЕСКОНЕЧНЫЙ РЕЖИМ === */
  { id: 'endless10',  get name() { return t('ach.endless10', 'Бесконечный герой'); },    get desc() { return t('ach.endless10_desc', 'Пройди 10 уровней в бесконечном режиме'); }, icon: '♾️', coins: 200, check: function(p) { return p.endlessBest >= 10; } },
  { id: 'endless_25', get name() { return t('ach.endless_25', 'Бесконечный 25'); },      get desc() { return t('ach.endless_25_desc', 'Пройди 25 уровней в бесконечном'); },   icon: '🌊', coins: 150, check: function(p) { return p.endlessBest >= 25; } },
  { id: 'endless_50', get name() { return t('ach.endless_50', 'Бесконечный 50'); },      get desc() { return t('ach.endless_50_desc', 'Пройди 50 уровней в бесконечном'); },   icon: '🌀', coins: 250, check: function(p) { return p.endlessBest >= 50; } },
  { id: 'endless_100', get name() { return t('ach.endless_100', 'Бесконечный 100'); },   get desc() { return t('ach.endless_100_desc', 'Пройди 100 уровней в бесконечном'); }, icon: '🌪️', coins: 375, check: function(p) { return p.endlessBest >= 100; } },
  { id: 'endless_250', get name() { return t('ach.endless_250', 'Бесконечный 250'); },   get desc() { return t('ach.endless_250_desc', 'Пройди 250 уровней в бесконечном'); }, icon: '🌠', coins: 500, check: function(p) { return p.endlessBest >= 250; } },
  { id: 'endless_500', get name() { return t('ach.endless_500', 'Бесконечный 500'); },   get desc() { return t('ach.endless_500_desc', 'Пройди 500 уровней в бесконечном'); }, icon: '🌌', coins: 1000, check: function(p) { return p.endlessBest >= 500; } },
  { id: 'endless_1000', get name() { return t('ach.endless_1000', 'Бесконечный 1000'); }, get desc() { return t('ach.endless_1000_desc', 'Пройди 1000 уровней в бесконечном'); }, icon: '🪐', coins: 2500, check: function(p) { return p.endlessBest >= 1000; } },

  /* === РЕГИОНЫ === */
  { id: 'region_japan',     get name() { return t('ach.region_japan', 'Самурай'); },              get desc() { return t('ach.region_japan_desc', 'Пройди Японию полностью'); },              icon: '⚔️', coins: 100, region: true, check: function(p) { return WorldMapProgress.getRegionCompleted('japan') >= 10; } },
  { id: 'region_italy',     get name() { return t('ach.region_italy', 'Гондольер'); },            get desc() { return t('ach.region_italy_desc', 'Пройди Италию полностью'); },              icon: '🛶', coins: 100, region: true, check: function(p) { return WorldMapProgress.getRegionCompleted('italy') >= 10; } },
  { id: 'region_france',    get name() { return t('ach.region_france', 'Художник'); },            get desc() { return t('ach.region_france_desc', 'Пройди Францию полностью'); },             icon: '🎨', coins: 100, region: true, check: function(p) { return WorldMapProgress.getRegionCompleted('france') >= 10; } },
  { id: 'region_russia',    get name() { return t('ach.region_russia', 'Покоритель зимы'); },     get desc() { return t('ach.region_russia_desc', 'Пройди Россию полностью'); },              icon: '❄️', coins: 100, region: true, check: function(p) { return WorldMapProgress.getRegionCompleted('russia') >= 10; } },
  { id: 'region_usa',       get name() { return t('ach.region_usa', 'Свобода'); },                get desc() { return t('ach.region_usa_desc', 'Пройди США полностью'); },                 icon: '🗽', coins: 100, region: true, check: function(p) { return WorldMapProgress.getRegionCompleted('usa') >= 10; } },
  { id: 'region_brazil',    get name() { return t('ach.region_brazil', 'Танцор'); },              get desc() { return t('ach.region_brazil_desc', 'Пройди Бразилию полностью'); },            icon: '💃', coins: 100, region: true, check: function(p) { return WorldMapProgress.getRegionCompleted('brazil') >= 10; } },
  { id: 'region_china',     get name() { return t('ach.region_china', 'Укротитель дракона'); },   get desc() { return t('ach.region_china_desc', 'Пройди Китай полностью'); },               icon: '🐉', coins: 100, region: true, check: function(p) { return WorldMapProgress.getRegionCompleted('china') >= 10; } },
  { id: 'region_germany',   get name() { return t('ach.region_germany', 'Хранитель замка'); },    get desc() { return t('ach.region_germany_desc', 'Пройди Германию полностью'); },            icon: '🏰', coins: 100, region: true, check: function(p) { return WorldMapProgress.getRegionCompleted('germany') >= 10; } },
  { id: 'region_australia', get name() { return t('ach.region_australia', 'Сёрфер'); },           get desc() { return t('ach.region_australia_desc', 'Пройди Австралию полностью'); },         icon: '🏄', coins: 100, region: true, check: function(p) { return WorldMapProgress.getRegionCompleted('australia') >= 10; } },
  { id: 'region_iceland',   get name() { return t('ach.region_iceland', 'Ледяной герой'); },      get desc() { return t('ach.region_iceland_desc', 'Пройди Исландию полностью'); },            icon: '🧊', coins: 100, region: true, check: function(p) { return WorldMapProgress.getRegionCompleted('iceland') >= 10; } },

  /* === КРУГОСВЕТКА И БОССЫ === */
  { id: 'all_regions', get name() { return t('ach.all_regions', 'Кругосветка'); },     get desc() { return t('ach.all_regions_desc', 'Пройди все 10 регионов'); },                icon: '🌍', coins: 500, check: function(p) {
      var ids = ['japan','italy','france','russia','usa','brazil','china','germany','australia','iceland'];
      return ids.every(function(id) { return WorldMapProgress.getRegionCompleted(id) >= 10; });
  }},
  { id: 'boss_all',    get name() { return t('ach.boss_all', 'Покоритель боссов'); }, get desc() { return t('ach.boss_all_desc', 'Победи всех 10 боссов'); },              icon: '🐲', coins: 500, check: function(p) {
      var ids = ['japan','italy','france','russia','usa','brazil','china','germany','australia','iceland'];
      return ids.every(function(id) { return WorldMapProgress.getRegionCompleted(id) >= 10; });
  }},

  /* === BATTLE PASS === */
  { id: 'bp50',        get name() { return t('ach.bp50', 'FallPass 50'); },            get desc() { return t('ach.bp50_desc', 'Достигни 50 уровня FallPass'); },              icon: '🏆', coins: 500, check: function(p) { return BattlePass.getLevel(p.battlepassXp) >= 50; } },

  /* === ДУЭЛИ === */
  { id: 'duel_10',     get name() { return t('ach.duel_10', 'Дуэлянт'); },             get desc() { return t('ach.duel_10_desc', 'Выиграй 10 дуэлей'); },                     icon: '⚔️', coins: 150, check: function(p) { return DuelStats.get().wins >= 10; } },
  { id: 'duel_25',     get name() { return t('ach.duel_25', 'Воин'); },                get desc() { return t('ach.duel_25_desc', 'Выиграй 25 дуэлей'); },                     icon: '🗡️', coins: 250, check: function(p) { return DuelStats.get().wins >= 25; } },
  { id: 'duel_50',     get name() { return t('ach.duel_50', 'Гладиатор'); },           get desc() { return t('ach.duel_50_desc', 'Выиграй 50 дуэлей'); },                     icon: '🛡️', coins: 375, check: function(p) { return DuelStats.get().wins >= 50; } },
  { id: 'duel_100',    get name() { return t('ach.duel_100', 'Снайпер'); },            get desc() { return t('ach.duel_100_desc', 'Выиграй 100 дуэлей'); },                    icon: '🎯', coins: 500, check: function(p) { return DuelStats.get().wins >= 100; } },
  { id: 'duel_250',    get name() { return t('ach.duel_250', 'Легенда арены'); },      get desc() { return t('ach.duel_250_desc', 'Выиграй 250 дуэлей'); },                    icon: '💀', coins: 1000, check: function(p) { return DuelStats.get().wins >= 250; } },
  { id: 'duel_1000',   get name() { return t('ach.duel_1000', 'Владыка арены'); },     get desc() { return t('ach.duel_1000_desc', 'Выиграй 1000 дуэлей'); },                   icon: '👑', coins: 2500, check: function(p) { return DuelStats.get().wins >= 1000; } },

  /* === РАНГИ ДУЭЛЕЙ === */
  { id: 'rank_wood',    get name() { return t('ach.rank_wood', 'Дерево'); },      get desc() { return t('ach.rank_wood_desc', 'Заработай 1 звезду в дуэлях'); },     icon: '🪵', coins: 50,  check: function(p) { return DuelStats.getStars() >= 1; } },
  { id: 'rank_iron',    get name() { return t('ach.rank_iron', 'Железо'); },      get desc() { return t('ach.rank_iron_desc', 'Достигни ранга Железо'); },           icon: '⚙️', coins: 100, check: function(p) { return DuelStats.getStars() >= 145; } },
  { id: 'rank_silver',  get name() { return t('ach.rank_silver', 'Серебро'); },   get desc() { return t('ach.rank_silver_desc', 'Достигни ранга Серебро'); },        icon: '🥈', coins: 150, check: function(p) { return DuelStats.getStars() >= 289; } },
  { id: 'rank_gold',    get name() { return t('ach.rank_gold', 'Золото'); },      get desc() { return t('ach.rank_gold_desc', 'Достигни ранга Золото'); },           icon: '🥇', coins: 200, check: function(p) { return DuelStats.getStars() >= 433; } },
  { id: 'rank_ruby',    get name() { return t('ach.rank_ruby', 'Рубин'); },       get desc() { return t('ach.rank_ruby_desc', 'Достигни ранга Рубин'); },            icon: '🔴', coins: 250, check: function(p) { return DuelStats.getStars() >= 577; } },
  { id: 'rank_emerald', get name() { return t('ach.rank_emerald', 'Изумруд'); },  get desc() { return t('ach.rank_emerald_desc', 'Достигни ранга Изумруд'); },      icon: '💚', coins: 300, check: function(p) { return DuelStats.getStars() >= 721; } },
  { id: 'rank_diamond', get name() { return t('ach.rank_diamond', 'Алмаз'); },    get desc() { return t('ach.rank_diamond_desc', 'Достигни ранга Алмаз'); },         icon: '💎', coins: 400, check: function(p) { return DuelStats.getStars() >= 865; } },
  { id: 'rank_legend',  get name() { return t('ach.rank_legend', 'Легенда'); },   get desc() { return t('ach.rank_legend_desc', 'Достигни ранга Легенда'); },        icon: '👑', coins: 750, check: function(p) { return DuelStats.getStars() >= 1001; } }
];

var AchievementManager = {
  check: function(progress) {
    var unlocked = [];
    ACHIEVEMENTS.forEach(function(a) {
      if (!progress.achievements.includes(a.id)) {
        if (a.check(progress)) {
          progress.achievements.push(a.id);
          if (a.coins > 0) progress.coins += a.coins;
          unlocked.push(a);
        }
      }
    });
    return unlocked;
  }
};

/* ============================================================
   ЕЖЕДНЕВНЫЕ ЗАДАНИЯ
   ============================================================ */

var DailyTasks = {
  templates: {
    easy: [
      { id: 'play3',        get desc() { return t('task.play3', 'Пройди 3 уровня'); },                       target: 3,   reward: 30 },
      { id: 'connect20',    get desc() { return t('task.connect20', 'Соедини 20 линий'); },                  target: 20,  reward: 30 },
      { id: 'useHint',      get desc() { return t('task.useHint', 'Используй подсказку'); },                target: 1,   reward: 30 },
      { id: 'earn50',       get desc() { return t('task.earn50', 'Заработай 50 монет'); },                   target: 50,  reward: 30 },
      { id: 'duel1',        get desc() { return t('task.duel1', 'Сыграй 1 дуэль'); },                        target: 1,   reward: 30 },
      { id: 'endless3',     get desc() { return t('task.endless3', 'Пройди 3 уровня в бесконечном'); },      target: 3,   reward: 30 },
      { id: 'bpTask1',      get desc() { return t('task.bpTask1', 'Выполни 1 задание FallPass'); },         target: 1,   reward: 30 },
      { id: 'buy1',         get desc() { return t('task.buy1', 'Купи 1 предмет в магазине'); },              target: 1,   reward: 30 },
      { id: 'useBooster1',  get desc() { return t('task.useBooster1', 'Используй 1 бустер'); },              target: 1,   reward: 30 },
      { id: 'openChest1',   get desc() { return t('task.openChest1', 'Открой 1 сундук'); },                  target: 1,   reward: 30 },
      { id: 'dailyBonus',   get desc() { return t('task.dailyBonus', 'Забери ежедневный бонус'); },          target: 1,   reward: 30 },
      { id: 'playRegion1',  get desc() { return t('task.playRegion1', 'Пройди 1 уровень в путешествии'); },  target: 1,   reward: 30 }
    ],
    medium: [
      { id: 'play5',        get desc() { return t('task.play5', 'Пройди 5 уровней'); },                      target: 5,   reward: 45 },
      { id: 'connect50',    get desc() { return t('task.connect50', 'Соедини 50 линий'); },                  target: 50,  reward: 45 },
      { id: 'noHint3',      get desc() { return t('task.noHint3', 'Пройди 3 уровня без подсказок'); },       target: 3,   reward: 45 },
      { id: 'earn100',      get desc() { return t('task.earn100', 'Заработай 100 монет'); },                 target: 100, reward: 45 },
      { id: 'duelWin1',     get desc() { return t('task.duelWin1', 'Выиграй 1 дуэль'); },                    target: 1,   reward: 45 },
      { id: 'duelPlay3',    get desc() { return t('task.duelPlay3', 'Сыграй 3 дуэли'); },                    target: 3,   reward: 45 },
      { id: 'endless5',     get desc() { return t('task.endless5', 'Пройди 5 уровней в бесконечном'); },     target: 5,   reward: 45 },
      { id: 'bpTask3',      get desc() { return t('task.bpTask3', 'Выполни 3 задания FallPass'); },         target: 3,   reward: 45 },
      { id: 'bpLevel1',     get desc() { return t('task.bpLevel1', 'Открой 1 уровень FallPass'); },          target: 1,   reward: 45 },
      { id: 'region3',      get desc() { return t('task.region3', 'Пройди 3 уровня в одном регионе'); },     target: 3,   reward: 45 },
      { id: 'buy3',         get desc() { return t('task.buy3', 'Купи 3 предмета в магазине'); },             target: 3,   reward: 45 },
      { id: 'chest3',       get desc() { return t('task.chest3', 'Открой 3 сундука'); },                     target: 3,   reward: 45 }
    ],
    hard: [
      { id: 'play10',       get desc() { return t('task.play10', 'Пройди 10 уровней'); },                     target: 10,  reward: 60 },
      { id: 'perfect5',     get desc() { return t('task.perfect5', 'Пройди 5 уровней без подсказок'); },     target: 5,   reward: 60 },
      { id: 'earn250',      get desc() { return t('task.earn250', 'Заработай 250 монет'); },                 target: 250, reward: 60 },
      { id: 'duelWin3',     get desc() { return t('task.duelWin3', 'Выиграй 3 дуэли'); },                    target: 3,   reward: 60 },
      { id: 'duelWin5',     get desc() { return t('task.duelWin5', 'Выиграй 5 дуэлей'); },                   target: 5,   reward: 60 },
      { id: 'endless10',    get desc() { return t('task.endless10', 'Пройди 10 уровней в бесконечном'); },   target: 10,  reward: 60 },
      { id: 'endless15',    get desc() { return t('task.endless15', 'Пройди 15 уровней в бесконечном'); },   target: 15,  reward: 60 },
      { id: 'bpTask5',      get desc() { return t('task.bpTask5', 'Выполни все 5 заданий FallPass'); },      target: 5,   reward: 60 },
      { id: 'bpLevel3',     get desc() { return t('task.bpLevel3', 'Открой 3 уровня FallPass'); },           target: 3,   reward: 60 },
      { id: 'region10',     get desc() { return t('task.region10', 'Пройди 10 уровней в одном регионе'); },  target: 10,  reward: 60 },
      { id: 'chest3',       get desc() { return t('task.chest3', 'Открой 3 сундука'); },                     target: 3,   reward: 60 }
    ]
  },

  _findTemplate: function(diff, id) {
    var arr = this.templates[diff] || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) return arr[i];
    }
    return null;
  },

  _pickId: function(diff) {
    var arr = this.templates[diff];
    var tpl = arr[Math.floor(Math.random() * arr.length)];
    return tpl.id;
  },

  _emptySlot: function(diff) {
    return { id: this._pickId(diff), progress: 0, claimed: false, completed: false };
  },

  generate: function() {
    var today = todayStrMSK();
    var saved = localStorage.getItem('flow_tasks');
    if (saved) {
      try {
        var data = JSON.parse(saved);
        if (data.date === today &&
            data.easy && data.easy.id && this._findTemplate('easy', data.easy.id) &&
            data.medium && data.medium.id && this._findTemplate('medium', data.medium.id) &&
            data.hard && data.hard.id && this._findTemplate('hard', data.hard.id)) {

          var self = this;
          var dirty = false;
          ['easy', 'medium', 'hard'].forEach(function(diff) {
            var slot = data[diff];
            var tpl = self._findTemplate(diff, slot.id);
            if (!tpl) return;
            if (!slot.completed && slot.progress >= tpl.target) {
              slot.progress = tpl.target;
              slot.completed = true;
              dirty = true;
            }
          });
          if (dirty) {
            try { localStorage.setItem('flow_tasks', JSON.stringify(data)); } catch (e) {}
          }

          return data;
        }
      } catch (e) {}
    }
    var tasks = {
      date: today,
      easy: this._emptySlot('easy'),
      medium: this._emptySlot('medium'),
      hard: this._emptySlot('hard'),
      allBonusClaimed: false
    };
    localStorage.setItem('flow_tasks', JSON.stringify(tasks));
    return tasks;
  },

  getForRender: function() {
    var data = this.generate();
    var self = this;
    var out = { date: data.date, allBonusClaimed: !!data.allBonusClaimed };
    ['easy', 'medium', 'hard'].forEach(function(diff) {
      var slot = data[diff];
      var tpl = self._findTemplate(diff, slot.id);
      if (!tpl) { out[diff] = null; return; }
      out[diff] = {
        id: slot.id,
        desc: tpl.desc,
        target: tpl.target,
        reward: tpl.reward,
        progress: slot.progress,
        claimed: slot.claimed,
        completed: slot.completed
      };
    });
    return out;
  },

  updateProgress: function(taskId, amount) {
    var tasks = this.generate();
    var changed = false;
    var self = this;
    ['easy', 'medium', 'hard'].forEach(function(diff) {
      var t = tasks[diff];
      if (!t) return;
      if (t.id === taskId && !t.completed) {
        var tpl = self._findTemplate(diff, t.id);
        if (!tpl) return;
        t.progress += amount;
        if (t.progress >= tpl.target) { t.progress = tpl.target; t.completed = true; }
        changed = true;
      }
    });
    if (changed) localStorage.setItem('flow_tasks', JSON.stringify(tasks));
    return changed;
  },

  claim: function(diff) {
    var tasks = this.generate();
    var t = tasks[diff];
    if (!t || !t.completed || t.claimed) return 0;
    var tpl = this._findTemplate(diff, t.id);
    if (!tpl) return 0;
    t.claimed = true;
    localStorage.setItem('flow_tasks', JSON.stringify(tasks));
    return tpl.reward;
  },

  isAllCompleted: function() {
    var tasks = this.generate();
    return tasks.easy.completed && tasks.medium.completed && tasks.hard.completed;
  },

  isAllBonusClaimed: function() {
    var tasks = this.generate();
    return !!tasks.allBonusClaimed;
  },

  claimAllBonus: function() {
    var tasks = this.generate();
    if (!tasks.easy.completed || !tasks.medium.completed || !tasks.hard.completed) return null;
    if (tasks.allBonusClaimed) return null;
    tasks.allBonusClaimed = true;
    localStorage.setItem('flow_tasks', JSON.stringify(tasks));
    var streakReward = DailyStreak.checkAndUpdate();
    return { gems: 20, streak: streakReward };
  }
};

var DailyStreak = {
  MILESTONES: {
    7:   { coins: 300,   gems: 30   },
    30:  { coins: 1000,  gems: 100  },
    100: { coins: 2500,  gems: 250  },
    365: { coins: 10000, gems: 1000 }
  },

  get: function() {
    try {
      var raw = localStorage.getItem('flow_daily_streak');
      if (raw) {
        var d = JSON.parse(raw);
        var today = todayStrMSK();
        var yesterday = yesterdayStrMSK();
        if (d.lastClaimDate !== today && d.lastClaimDate !== yesterday) {
          d.streak = 0;
        }
        return d;
      }
    } catch (e) {}
    return { lastClaimDate: '', streak: 0, best: 0, lastMilestone: 0 };
  },

  save: function(d) {
    try { localStorage.setItem('flow_daily_streak', JSON.stringify(d)); } catch (e) {}
  },

  checkAndUpdate: function() {
    var d = this.get();
    var today = todayStrMSK();
    var yesterday = yesterdayStrMSK();

    if (d.lastClaimDate === today) return null;

    if (d.lastClaimDate === yesterday) {
      d.streak++;
    } else {
      d.streak = 1;
    }
    d.lastClaimDate = today;
    if (d.streak > d.best) d.best = d.streak;

    var milestoneReward = null;
    var milestones = [7, 30, 100, 365];
    for (var i = 0; i < milestones.length; i++) {
      var m = milestones[i];
      if (d.streak >= m && d.lastMilestone < m) {
        d.lastMilestone = m;
        milestoneReward = { day: m, reward: this.MILESTONES[m] };
      }
    }

    this.save(d);
    return milestoneReward;
  }
};

var WeeklyTasks = {
  templates: {
    easy: [
      { id: 'w_play50',     get desc() { return t('task.w_play50', 'Пройди 50 уровней'); },                 target: 50,  reward: 300 },
      { id: 'w_connect200', get desc() { return t('task.w_connect200', 'Соедини 200 линий'); },             target: 200, reward: 300 },
      { id: 'w_earn1000',   get desc() { return t('task.w_earn1000', 'Заработай 1000 монет'); },            target: 1000, reward: 300 },
      { id: 'w_duelPlay15', get desc() { return t('task.w_duelPlay15', 'Сыграй 15 дуэлей'); },              target: 15,  reward: 300 },
      { id: 'w_endless50',  get desc() { return t('task.w_endless50', 'Пройди 50 уровней в бесконечном'); }, target: 50,  reward: 300 }
    ],
    medium: [
      { id: 'w_duelWin10',  get desc() { return t('task.w_duelWin10', 'Выиграй 10 дуэлей'); },              target: 10,  reward: 500 },
      { id: 'w_endless100', get desc() { return t('task.w_endless100', 'Пройди 100 уровней в бесконечном'); }, target: 100, reward: 500 },
      { id: 'w_bpLevel10',  get desc() { return t('task.w_bpLevel10', 'Открой 10 уровней FallPass'); },     target: 10,  reward: 500 },
      { id: 'w_play150',    get desc() { return t('task.w_play150', 'Пройди 150 уровней'); },               target: 150, reward: 500 },
      { id: 'w_earn3000',   get desc() { return t('task.w_earn3000', 'Заработай 3000 монет'); },            target: 3000, reward: 500 }
    ],
    hard: [
      { id: 'w_play300',    get desc() { return t('task.w_play300', 'Пройди 300 уровней'); },               target: 300, reward: 750 },
      { id: 'w_duelWin30',  get desc() { return t('task.w_duelWin30', 'Выиграй 30 дуэлей'); },              target: 30,  reward: 750 },
      { id: 'w_endless250', get desc() { return t('task.w_endless250', 'Пройди 250 уровней в бесконечном'); }, target: 250, reward: 750 },
      { id: 'w_bpLevel30',  get desc() { return t('task.w_bpLevel30', 'Открой 30 уровней FallPass'); },     target: 30,  reward: 750 },
      { id: 'w_region50',   get desc() { return t('task.w_region50', 'Пройди 50 уровней в путешествии'); }, target: 50,  reward: 750 }
    ]
  },

  _findTemplate: function(diff, id) {
    var arr = this.templates[diff] || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) return arr[i];
    }
    return null;
  },

  _pickId: function(diff) {
    var arr = this.templates[diff];
    var tpl = arr[Math.floor(Math.random() * arr.length)];
    return tpl.id;
  },

  _emptySlot: function(diff) {
    return { id: this._pickId(diff), progress: 0, claimed: false, completed: false };
  },

  generate: function() {
    var week = weekStrMSK();
    var saved = localStorage.getItem('flow_weekly_tasks');
    if (saved) {
      try {
        var data = JSON.parse(saved);
        if (data.week === week &&
            data.easy && data.easy.id && this._findTemplate('easy', data.easy.id) &&
            data.medium && data.medium.id && this._findTemplate('medium', data.medium.id) &&
            data.hard && data.hard.id && this._findTemplate('hard', data.hard.id)) {

          var self = this;
          var dirty = false;
          ['easy', 'medium', 'hard'].forEach(function(diff) {
            var slot = data[diff];
            var tpl = self._findTemplate(diff, slot.id);
            if (!tpl) return;
            if (!slot.completed && slot.progress >= tpl.target) {
              slot.progress = tpl.target;
              slot.completed = true;
              dirty = true;
            }
          });
          if (dirty) {
            try { localStorage.setItem('flow_weekly_tasks', JSON.stringify(data)); } catch (e) {}
          }

          return data;
        }
      } catch (e) {}
    }
    var tasks = {
      week: week,
      easy: this._emptySlot('easy'),
      medium: this._emptySlot('medium'),
      hard: this._emptySlot('hard'),
      allBonusClaimed: false
    };
    localStorage.setItem('flow_weekly_tasks', JSON.stringify(tasks));
    return tasks;
  },

  getForRender: function() {
    var data = this.generate();
    var self = this;
    var out = { week: data.week, allBonusClaimed: !!data.allBonusClaimed };
    ['easy', 'medium', 'hard'].forEach(function(diff) {
      var slot = data[diff];
      var tpl = self._findTemplate(diff, slot.id);
      if (!tpl) { out[diff] = null; return; }
      out[diff] = {
        id: slot.id,
        desc: tpl.desc,
        target: tpl.target,
        reward: tpl.reward,
        progress: slot.progress,
        claimed: slot.claimed,
        completed: slot.completed
      };
    });
    return out;
  },

  updateProgress: function(taskId, amount) {
    var tasks = this.generate();
    var changed = false;
    var self = this;
    ['easy', 'medium', 'hard'].forEach(function(diff) {
      var t = tasks[diff];
      if (!t) return;
      if (t.id === taskId && !t.completed) {
        var tpl = self._findTemplate(diff, t.id);
        if (!tpl) return;
        t.progress += amount;
        if (t.progress >= tpl.target) { t.progress = tpl.target; t.completed = true; }
        changed = true;
      }
    });
    if (changed) localStorage.setItem('flow_weekly_tasks', JSON.stringify(tasks));
    return changed;
  },

  claim: function(diff) {
    var tasks = this.generate();
    var t = tasks[diff];
    if (!t || !t.completed || t.claimed) return 0;
    var tpl = this._findTemplate(diff, t.id);
    if (!tpl) return 0;
    t.claimed = true;
    localStorage.setItem('flow_weekly_tasks', JSON.stringify(tasks));
    return tpl.reward;
  },

  isAllCompleted: function() {
    var tasks = this.generate();
    return tasks.easy.completed && tasks.medium.completed && tasks.hard.completed;
  },

  isAllBonusClaimed: function() {
    var tasks = this.generate();
    return !!tasks.allBonusClaimed;
  },

  claimAllBonus: function() {
    var tasks = this.generate();
    if (!tasks.easy.completed || !tasks.medium.completed || !tasks.hard.completed) return null;
    if (tasks.allBonusClaimed) return null;
    tasks.allBonusClaimed = true;
    localStorage.setItem('flow_weekly_tasks', JSON.stringify(tasks));
    return { gems: 100 };
  }
};

window.DailyTasks = DailyTasks;
window.WeeklyTasks = WeeklyTasks;
window.DailyStreak = DailyStreak;

/* ============================================================
   FALLPASS 2026 — БАТТЛПАСС
   ============================================================ */

var BP_VERSION = 2;
var BP_MAX_LEVEL = 50;
var BP_XP_PER_LEVEL = 200;
var BP_XP_PER_TASK = 100;
var BP_XP_PER_GAME_LEVEL = 5;
var BP_TASKS_PER_DAY = 5;
var BP_UPGRADE_COST_GEMS = 500;
var BP_UPGRADE_COST_ADS = 10;

/* === PATCH п.3: удалены bp_fast_3, bp_fast_5, bp_fast_7 === */
var BP_TASKS = [
  { id: 'bp_play_10',   desc: 'task.bp_play_10',   fallbackDesc: 'Пройди 10 уровней',   target: 10, type: 'play_levels' },
  { id: 'bp_play_15',   desc: 'task.bp_play_15',   fallbackDesc: 'Пройди 15 уровней',   target: 15, type: 'play_levels' },
  { id: 'bp_play_20',   desc: 'task.bp_play_20',   fallbackDesc: 'Пройди 20 уровней',   target: 20, type: 'play_levels' },
  { id: 'bp_play_25',   desc: 'task.bp_play_25',   fallbackDesc: 'Пройди 25 уровней',   target: 25, type: 'play_levels' },
  { id: 'bp_play_30',   desc: 'task.bp_play_30',   fallbackDesc: 'Пройди 30 уровней',   target: 30, type: 'play_levels' },
  { id: 'bp_connect_100', desc: 'task.bp_connect_100', fallbackDesc: 'Соедини 100 линий', target: 100, type: 'connect_lines' },
  { id: 'bp_connect_150', desc: 'task.bp_connect_150', fallbackDesc: 'Соедини 150 линий', target: 150, type: 'connect_lines' },
  { id: 'bp_connect_200', desc: 'task.bp_connect_200', fallbackDesc: 'Соедини 200 линий', target: 200, type: 'connect_lines' },
  { id: 'bp_connect_250', desc: 'task.bp_connect_250', fallbackDesc: 'Соедини 250 линий', target: 250, type: 'connect_lines' },
  { id: 'bp_hint_3', desc: 'task.bp_hint_3', fallbackDesc: 'Используй 3 подсказки', target: 3, type: 'use_hints' },
  { id: 'bp_hint_4', desc: 'task.bp_hint_4', fallbackDesc: 'Используй 4 подсказки', target: 4, type: 'use_hints' },
  { id: 'bp_hint_5', desc: 'task.bp_hint_5', fallbackDesc: 'Используй 5 подсказок', target: 5, type: 'use_hints' },
  { id: 'bp_earn_200', desc: 'task.bp_earn_200', fallbackDesc: 'Заработай 200 монет', target: 200, type: 'earn_coins' },
  { id: 'bp_earn_300', desc: 'task.bp_earn_300', fallbackDesc: 'Заработай 300 монет', target: 300, type: 'earn_coins' },
  { id: 'bp_earn_400', desc: 'task.bp_earn_400', fallbackDesc: 'Заработай 400 монет', target: 400, type: 'earn_coins' },
  { id: 'bp_earn_500', desc: 'task.bp_earn_500', fallbackDesc: 'Заработай 500 монет', target: 500, type: 'earn_coins' },
  { id: 'bp_spend_100', desc: 'task.bp_spend_100', fallbackDesc: 'Потрать 100 монет в магазине', target: 100, type: 'spend_coins' },
  { id: 'bp_spend_200', desc: 'task.bp_spend_200', fallbackDesc: 'Потрать 200 монет в магазине', target: 200, type: 'spend_coins' },
  { id: 'bp_spend_300', desc: 'task.bp_spend_300', fallbackDesc: 'Потрать 300 монет в магазине', target: 300, type: 'spend_coins' },
  { id: 'bp_spend_400', desc: 'task.bp_spend_400', fallbackDesc: 'Потрать 400 монет в магазине', target: 400, type: 'spend_coins' },
  { id: 'bp_spend_500', desc: 'task.bp_spend_500', fallbackDesc: 'Потрать 500 монет в магазине', target: 500, type: 'spend_coins' },
  { id: 'bp_chest_1', desc: 'task.bp_chest_1', fallbackDesc: 'Открой 1 сундук', target: 1, type: 'open_chests' },
  { id: 'bp_chest_2', desc: 'task.bp_chest_2', fallbackDesc: 'Открой 2 сундука', target: 2, type: 'open_chests' },
  { id: 'bp_chest_3', desc: 'task.bp_chest_3', fallbackDesc: 'Открой 3 сундука', target: 3, type: 'open_chests' },
  { id: 'bp_duel_3', desc: 'task.bp_duel_3', fallbackDesc: 'Сыграй 3 дуэли', target: 3, type: 'play_duels' },
  { id: 'bp_duel_5', desc: 'task.bp_duel_5', fallbackDesc: 'Сыграй 5 дуэлей', target: 5, type: 'play_duels' },
  { id: 'bp_duel_7', desc: 'task.bp_duel_7', fallbackDesc: 'Сыграй 7 дуэлей', target: 7, type: 'play_duels' },
  { id: 'bp_duel_10', desc: 'task.bp_duel_10', fallbackDesc: 'Сыграй 10 дуэлей', target: 10, type: 'play_duels' },
  { id: 'bp_duel_win_1', desc: 'task.bp_duel_win_1', fallbackDesc: 'Выиграй 1 дуэль', target: 1, type: 'win_duels' },
  { id: 'bp_duel_win_2', desc: 'task.bp_duel_win_2', fallbackDesc: 'Выиграй 2 дуэли', target: 2, type: 'win_duels' },
  { id: 'bp_duel_win_3', desc: 'task.bp_duel_win_3', fallbackDesc: 'Выиграй 3 дуэли', target: 3, type: 'win_duels' },
  { id: 'bp_duel_win_4', desc: 'task.bp_duel_win_4', fallbackDesc: 'Выиграй 4 дуэли', target: 4, type: 'win_duels' },
  { id: 'bp_duel_win_5', desc: 'task.bp_duel_win_5', fallbackDesc: 'Выиграй 5 дуэлей', target: 5, type: 'win_duels' },
  { id: 'bp_endless_5', desc: 'task.bp_endless_5', fallbackDesc: 'Пройди 5 уровней в бесконечном', target: 5, type: 'endless_levels' },
  { id: 'bp_endless_10', desc: 'task.bp_endless_10', fallbackDesc: 'Пройди 10 уровней в бесконечном', target: 10, type: 'endless_levels' },
  { id: 'bp_endless_15', desc: 'task.bp_endless_15', fallbackDesc: 'Пройди 15 уровней в бесконечном', target: 15, type: 'endless_levels' },
  { id: 'bp_boss_1', desc: 'task.bp_boss_1', fallbackDesc: 'Победи 1 босса', target: 1, type: 'defeat_bosses' },
  { id: 'bp_boss_2', desc: 'task.bp_boss_2', fallbackDesc: 'Победи 2 боссов', target: 2, type: 'defeat_bosses' },
  { id: 'bp_boss_3', desc: 'task.bp_boss_3', fallbackDesc: 'Победи 3 боссов', target: 3, type: 'defeat_bosses' },
  { id: 'bp_no_hint_3', desc: 'task.bp_no_hint_3', fallbackDesc: 'Пройди 3 уровня без подсказок', target: 3, type: 'no_hint_levels' },
  { id: 'bp_no_hint_5', desc: 'task.bp_no_hint_5', fallbackDesc: 'Пройди 5 уровней без подсказок', target: 5, type: 'no_hint_levels' },
  { id: 'bp_no_hint_7', desc: 'task.bp_no_hint_7', fallbackDesc: 'Пройди 7 уровней без подсказок', target: 7, type: 'no_hint_levels' },
  { id: 'bp_buy_theme_1', desc: 'task.bp_buy_theme_1', fallbackDesc: 'Купи 1 тему', target: 1, type: 'buy_themes' },
  { id: 'bp_buy_trail_1', desc: 'task.bp_buy_trail_1', fallbackDesc: 'Купи 1 след', target: 1, type: 'buy_trails' },
  { id: 'bp_buy_bg_1', desc: 'task.bp_buy_bg_1', fallbackDesc: 'Купи 1 фон', target: 1, type: 'buy_backgrounds' },
  { id: 'bp_play_50', desc: 'task.bp_play_50', fallbackDesc: 'Пройди 50 уровней', target: 50, type: 'play_levels' },
  { id: 'bp_earn_1000', desc: 'task.bp_earn_1000', fallbackDesc: 'Заработай 1000 монет', target: 1000, type: 'earn_coins' },
  { id: 'bp_duel_win_10', desc: 'task.bp_duel_win_10', fallbackDesc: 'Выиграй 10 дуэлей', target: 10, type: 'win_duels' }
];

var BP_REWARDS = [
  { type: 'leaves',  value: 5,   icon: '<span class="leaf-icon"></span>', get name() { return t('bp.reward_leaves_5',  '5 листиков'); } },
  { type: 'coins',   value: 50,  icon: '<span class="coin-icon"></span>', get name() { return t('bp.reward_coins_50',  '50 монет'); } },
  { type: 'none',    value: 0,   icon: '',                                get name() { return '—'; } },
  { type: 'gems',    value: 10,  icon: '<span class="gem-icon"></span>',  get name() { return t('bp.reward_gems_10',   '10 алмазов'); } },
  { type: 'booster', value: 1,   icon: '🕐',                              get name() { return t('bp.reward_booster_time', 'Бустер +45 сек'); } },
  { type: 'leaves',  value: 5,   icon: '<span class="leaf-icon"></span>', get name() { return t('bp.reward_leaves_5',  '5 листиков'); } },
  { type: 'coins',   value: 100, icon: '<span class="coin-icon"></span>', get name() { return t('bp.reward_coins_100', '100 монет'); } },
  { type: 'none',    value: 0,   icon: '',                                get name() { return '—'; } },
  { type: 'leaves',  value: 5,   icon: '<span class="leaf-icon"></span>', get name() { return t('bp.reward_leaves_5',  '5 листиков'); } },
  { type: 'chest',   value: 1,   icon: '<span class="chest-icon"></span>', get name() { return t('bp.reward_chest',    'Сундук'); } }
];

var BP_PREMIUM_REWARDS = [
  { type: 'leaves', value: 5,   icon: '<span class="leaf-icon"></span>', get name() { return t('bp.reward_leaves_5',  '5 листиков'); } },
  { type: 'coins',  value: 100, icon: '<span class="coin-icon"></span>', get name() { return t('bp.reward_coins_100', '100 монет'); } },
  { type: 'leaves', value: 5,   icon: '<span class="leaf-icon"></span>', get name() { return t('bp.reward_leaves_5',  '5 листиков'); } },
  { type: 'gems',   value: 25,  icon: '<span class="gem-icon"></span>',  get name() { return t('bp.reward_gems_25',   '25 алмазов'); } },
  { type: 'chest',  value: 1,   icon: '<span class="chest-icon"></span>', get name() { return t('bp.reward_chest',    'Сундук'); } },
  { type: 'leaves', value: 5,   icon: '<span class="leaf-icon"></span>', get name() { return t('bp.reward_leaves_5',  '5 листиков'); } },
  { type: 'coins',  value: 100, icon: '<span class="coin-icon"></span>', get name() { return t('bp.reward_coins_100', '100 монет'); } },
  { type: 'gems',   value: 25,  icon: '<span class="gem-icon"></span>',  get name() { return t('bp.reward_gems_25',   '25 алмазов'); } },
  { type: 'leaves', value: 5,   icon: '<span class="leaf-icon"></span>', get name() { return t('bp.reward_leaves_5',  '5 листиков'); } },
  { type: 'chest',  value: 1,   icon: '<span class="chest-icon"></span>', get name() { return t('bp.reward_chest',    'Сундук'); } }
];

function getBpReward(level, isPremium) {
  var idx = (level - 1) % 10;
  if (isPremium) return BP_PREMIUM_REWARDS[idx];
  return BP_REWARDS[idx];
}

var BattlePass = {
  getLevel: function(bpXp) { return Math.min(BP_MAX_LEVEL, Math.floor(bpXp / BP_XP_PER_LEVEL) + 1); },
  getProgress: function(bpXp) {
    var level = this.getLevel(bpXp);
    if (level >= BP_MAX_LEVEL) return { level: BP_MAX_LEVEL, progress: 1, currentXp: BP_XP_PER_LEVEL, neededXp: BP_XP_PER_LEVEL };
    var currentLevelStart = (level - 1) * BP_XP_PER_LEVEL;
    var nextLevelStart = level * BP_XP_PER_LEVEL;
    var current = bpXp - currentLevelStart;
    var needed = nextLevelStart - currentLevelStart;
    return { level: level, progress: current / needed, currentXp: current, neededXp: needed };
  },
  getRewardForLevel: function(lvl) { return getBpReward(lvl, false); },
  getPremiumRewardForLevel: function(lvl) { return getBpReward(lvl, true); }
};

var BPTasks = {
  _findTpl: function(id) {
    for (var i = 0; i < BP_TASKS.length; i++) {
      if (BP_TASKS[i].id === id) return BP_TASKS[i];
    }
    return null;
  },

  generate: function() {
    var today = todayStr();
    var saved = localStorage.getItem('flow_bp_tasks');
    if (saved) {
      try {
        var data = JSON.parse(saved);
        if (data.date === today && Array.isArray(data.tasks) && data.tasks.length === BP_TASKS_PER_DAY) {
          var ok = true;
          for (var i = 0; i < data.tasks.length; i++) {
            if (!data.tasks[i].id || !this._findTpl(data.tasks[i].id)) { ok = false; break; }
          }
          if (ok) {
            var self = this;
            var dirty = false;
            data.tasks.forEach(function(slot) {
              var tpl = self._findTpl(slot.id);
              if (!tpl) return;
              if (!slot.completed && slot.progress >= tpl.target) {
                slot.progress = tpl.target;
                slot.completed = true;
                dirty = true;
              }
            });
            if (dirty) {
              try { localStorage.setItem('flow_bp_tasks', JSON.stringify(data)); } catch (e) {}
            }
            return data;
          }
        }
      } catch (e) {}
    }
    var shuffled = BP_TASKS.slice().sort(function() { return Math.random() - 0.5; });
    var picked = shuffled.slice(0, BP_TASKS_PER_DAY).map(function(tpl) {
      return { id: tpl.id, progress: 0, completed: false, claimed: false };
    });
    var tasks = { date: today, tasks: picked };
    localStorage.setItem('flow_bp_tasks', JSON.stringify(tasks));
    return tasks;
  },

  getForRender: function() {
    var data = this.generate();
    var self = this;
    var result = [];
    for (var i = 0; i < data.tasks.length; i++) {
      var slot = data.tasks[i];
      var tpl = self._findTpl(slot.id);
      if (!tpl) continue;
      result.push({
        id: slot.id,
        desc: t(tpl.desc, tpl.fallbackDesc),
        target: tpl.target,
        type: tpl.type,
        progress: slot.progress,
        completed: slot.completed,
        claimed: slot.claimed
      });
    }
    return result;
  },

  updateProgress: function(type, amount) {
    var data = this.generate();
    var changed = false;
    var self = this;
    data.tasks.forEach(function(slot) {
      var tpl = self._findTpl(slot.id);
      if (!tpl) return;
      if (tpl.type === type && !slot.completed) {
        slot.progress += amount;
        if (slot.progress >= tpl.target) { slot.progress = tpl.target; slot.completed = true; }
        changed = true;
      }
    });
    if (changed) localStorage.setItem('flow_bp_tasks', JSON.stringify(data));
    return changed;
  },

  claim: function(taskId) {
    var data = this.generate();
    var task = null;
    for (var i = 0; i < data.tasks.length; i++) {
      if (data.tasks[i].id === taskId) { task = data.tasks[i]; break; }
    }
    if (!task || !task.completed || task.claimed) return false;
    task.claimed = true;
    localStorage.setItem('flow_bp_tasks', JSON.stringify(data));
    return true;
  },

  hasClaimable: function() {
    var data = this.generate();
    var self = this;
    for (var i = 0; i < data.tasks.length; i++) {
      var slot = data.tasks[i];
      if (!slot.completed || slot.claimed) continue;
      if (self._findTpl(slot.id)) return true;
    }
    return false;
  }
};

function resetOldBattlePass(state) {
  if (!state) return state;
  if (state.bpVersion === BP_VERSION) return state;

  state.battlepassXp = 0;
  state.claimedBpLevels = [];
  state.claimedBpPremiumLevels = [];
  state.bpPremium = false;
  state.bpPremiumAdsWatched = 0;
  state.leaves = 0;
  state.bpVersion = BP_VERSION;

  try { localStorage.removeItem('flow_bp_tasks'); } catch (e) {}

  if (!state.bpStats) {
    state.bpStats = {
      play_levels: 0, connect_lines: 0, use_hints: 0, earn_coins: 0, spend_coins: 0,
      open_chests: 0, play_duels: 0, win_duels: 0, endless_levels: 0, defeat_bosses: 0,
      no_hint_levels: 0, fast_levels: 0, buy_themes: 0, buy_trails: 0, buy_backgrounds: 0
    };
  }

  return state;
}

var BP_SHOP_ITEMS = [
  { id: 'bg_anime_forest', type: 'background', key: 'anime_forest', leafPrice: 60, get name() { return t('bp.shop_bg_anime_forest', 'Фон «Осенний лес»'); }, preview: 'assets/ui/battlepass_bg.webp' },
  { id: 'theme_anime',     type: 'theme',      key: 'anime',        leafPrice: 60, get name() { return t('bp.shop_theme_anime', 'Тема «Аниме»'); },            preview: null },
  { id: 'trail_anime',     type: 'trail',      key: 'anime',        leafPrice: 60, get name() { return t('bp.shop_trail_anime', 'След «Аниме»'); },            preview: '#ffb7d5' }
];

var LEAF_EXCHANGE = {
  coins:  { rate: 20, steps: [1, 3, 5, 10] },
  gems:   { rate: 5,  steps: [1, 3, 5, 10] }
};

var BP_CHEST_PRIZES = [
  { type: 'coins', value: 50,   get name() { return t('prize.coins_50',   '50 монет'); },   weight: 22,  icon: '<span class="coin-icon"></span>' },
  { type: 'coins', value: 100,  get name() { return t('prize.coins_100',  '100 монет'); },  weight: 15,  icon: '<span class="coin-icon"></span>' },
  { type: 'coins', value: 300,  get name() { return t('prize.coins_300',  '300 монет'); },  weight: 7,   icon: '<span class="coin-icon"></span>' },
  { type: 'coins', value: 500,  get name() { return t('prize.coins_500',  '500 монет'); },  weight: 3,   icon: '<span class="coin-icon"></span>' },
  { type: 'leaves', value: 5,   get name() { return t('prize.leaves_5',   '5 листиков'); }, weight: 15,  icon: '<span class="leaf-icon"></span>' },
  { type: 'leaves', value: 10,  get name() { return t('prize.leaves_10',  '10 листиков'); }, weight: 10,  icon: '<span class="leaf-icon"></span>' },
  { type: 'leaves', value: 15,  get name() { return t('prize.leaves_15',  '15 листиков'); }, weight: 7,   icon: '<span class="leaf-icon"></span>' },
  { type: 'leaves', value: 20,  get name() { return t('prize.leaves_20',  '20 листиков'); }, weight: 4,   icon: '<span class="leaf-icon"></span>' },
  { type: 'leaves', value: 50,  get name() { return t('prize.leaves_50',  '50 листиков'); }, weight: 1.5, icon: '<span class="leaf-icon"></span>' },
  { type: 'gems', value: 10,    get name() { return t('prize.gems_10',    '10 алмазов'); },  weight: 5,   icon: '<span class="gem-icon"></span>' },
  { type: 'gems', value: 25,    get name() { return t('prize.gems_25',    '25 алмазов'); },  weight: 3,   icon: '<span class="gem-icon"></span>' },
  { type: 'gems', value: 50,    get name() { return t('prize.gems_50',    '50 алмазов'); },  weight: 1.5, icon: '<span class="gem-icon"></span>' },
  { type: 'exclusive', key: 'anime_forest', get name() { return t('prize.bg_anime_forest', 'Фон «Осенний лес»'); }, weight: 3,   icon: '🌲' },
  { type: 'exclusive', key: 'anime',        get name() { return t('prize.theme_anime',     'Тема «Аниме»'); },      weight: 1.5, icon: '🎨' },
  { type: 'exclusive', key: 'anime_trail',  get name() { return t('prize.trail_anime',     'След «Аниме»'); },      weight: 1.5, icon: '✨' }
];

var BP_CHEST_PRICE = 10;

var REGION_REWARDS = {
  japan:     { theme: 'r_sakura',   trail: 'sakura',    achievement: 'region_japan',     wave: 1, bossGems: 25, regionGems: 10 },
  italy:     { theme: 'r_venice',   trail: 'bubbles',   achievement: 'region_italy',     wave: 1, bossGems: 25, regionGems: 10 },
  france:    { theme: 'r_lavender', trail: 'lavender',  achievement: 'region_france',    wave: 1, bossGems: 25, regionGems: 10 },
  russia:    { theme: 'r_winter',   trail: 'snowflake', achievement: 'region_russia',    wave: 2, bossGems: 25, regionGems: 10 },
  usa:       { theme: 'r_vegas',    trail: 'sparks',    achievement: 'region_usa',       wave: 2, bossGems: 25, regionGems: 10 },
  brazil:    { theme: 'r_carnival', trail: 'rainbow',   achievement: 'region_brazil',    wave: 2, bossGems: 25, regionGems: 10 },
  china:     { theme: 'r_dragon',   trail: 'fire',      achievement: 'region_china',     wave: 3, bossGems: 25, regionGems: 10 },
  germany:   { theme: 'r_forest',   trail: 'leaves',    achievement: 'region_germany',   wave: 3, bossGems: 25, regionGems: 10 },
  australia: { theme: 'r_outback',  trail: 'water',     achievement: 'region_australia', wave: 3, bossGems: 25, regionGems: 10 },
  iceland:   { theme: 'r_aurora',   trail: 'aurora',    achievement: 'region_iceland',   wave: 3, bossGems: 25, regionGems: 10 }
};

window.BP_TASKS = BP_TASKS;
window.BP_REWARDS = BP_REWARDS;
window.BP_PREMIUM_REWARDS = BP_PREMIUM_REWARDS;
window.BP_MAX_LEVEL = BP_MAX_LEVEL;
window.BP_XP_PER_LEVEL = BP_XP_PER_LEVEL;
window.BP_XP_PER_TASK = BP_XP_PER_TASK;
window.BP_XP_PER_GAME_LEVEL = BP_XP_PER_GAME_LEVEL;
window.BP_UPGRADE_COST_GEMS = BP_UPGRADE_COST_GEMS;
window.BP_UPGRADE_COST_ADS = BP_UPGRADE_COST_ADS;
window.BattlePass = BattlePass;
window.BPTasks = BPTasks;
window.getBpReward = getBpReward;
window.resetOldBattlePass = resetOldBattlePass;
window.BP_SHOP_ITEMS = BP_SHOP_ITEMS;
window.LEAF_EXCHANGE = LEAF_EXCHANGE;
window.BP_CHEST_PRIZES = BP_CHEST_PRIZES;
window.BP_CHEST_PRICE = BP_CHEST_PRICE;
window.REGION_REWARDS = REGION_REWARDS;

function addBpXp(amount) {
  if (!amount || amount <= 0) return;

  var game = window.game; if (!game) return;
  var scene = game.scene.getScene('Menu')
           || game.scene.getScene('Game')
           || game.scene.getScene('Endless')
           || game.scene.getScene('Duel');
  if (!scene) return;

  var state = scene.registry.get('state');
  if (!state) return;

  var oldLevel = BattlePass.getLevel(state.battlepassXp);
  state.battlepassXp += amount;
  var newLevel = BattlePass.getLevel(state.battlepassXp);

  if (newLevel > oldLevel) {
    for (var lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
      if (lvl >= 1)  DailyTasks.updateProgress('bpLevel1', 1);
      if (lvl >= 3)  DailyTasks.updateProgress('bpLevel3', 1);
      if (lvl >= 10) WeeklyTasks.updateProgress('w_bpLevel10', 1);
      if (lvl >= 30) WeeklyTasks.updateProgress('w_bpLevel30', 1);
    }

    if (window.SoundManager) SoundManager.levelUp();
    if (window.UI) UI.showToast('🏆 ' + t('bp.level_up_toast', 'FallPass уровень {n}!', { n: newLevel }), 2000);
  }

  scene.registry.set('state', state);
  if (window.YandexSDK) YandexSDK.saveProgress(state);
}

window.addBpXp = addBpXp;
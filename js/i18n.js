/* ============================================================
   i18n — локализация (русский + английский)
   Определяет язык через YandexSDK.lang.
   Использование:
     t('menu.play', 'ИГРАТЬ')          → строка
     translateDOM(el)                   → переводит все [data-i18n]
   ============================================================ */

window.TRANSLATIONS = {
  ru: {
    /* ============================================================
       APP / SPLASH
       ============================================================ */
    'app.title':           'ПОТОК',
    'splash.loading':      'Загрузка…',
    'splash.loading_pct':  'Загрузка… {n}%',
    'splash.almost':       'Почти готово…',
    'splash.done':         'Готово!',
    'splash.fail':         'Не удалось загрузить игру.<br>Проверьте подключение к интернету.',
    'splash.offline':      'Продолжить в офлайн-режиме',
    'splash.reload':       '🔄 Обновить',
    'splash.error':        'Ошибка загрузки',
    'splash.retry':        'Повторная попытка…',

    /* ============================================================
       МЕНЮ (menu.*)
       ============================================================ */
    'menu.play':           'ИГРАТЬ',
    'menu.play_btn':       '▶ ИГРАТЬ',
    'menu.shop':           'Магазин',
    'menu.inventory':      'Инвентарь',
    'menu.leaderboard':    'Лидеры',
    'menu.battlepass':     'БАТТЛПАСС',
    'menu.achievements':   'Достижения',
    'menu.help':           'Как играть',
    'menu.settings':       'Настройки',
    'menu.tasks':          'Ежедневные задания',
    'menu.tasks_daily':    '📅 Ежедневные',
    'menu.tasks_weekly':   '📆 Еженедельные',
    'menu.reset_timer':    '⏱ До сброса:',

    /* ============================================================
       ВЫБОР РЕЖИМА (mode.*)
       ============================================================ */
    'mode.title':          'Выбери режим',
    'mode.travel':         'ПУТЕШЕСТВИЕ',
    'mode.travel_sub':     'Уровень за уровнем',
    'mode.endless':        'БЕСКОНЕЧНЫЙ',
    'mode.endless_record': 'Рекорд: ',
    'mode.duel':           'ДУЭЛИ',
    'mode.duel_locked':    '🔒 ',
    'mode.duel_locked_msg': '🔒 Пройди ещё {n} уровней в бесконечном!',
    'mode.duel_open':      '✓ Открыто',
    'mode.cancel':         'Отмена',

    /* ============================================================
       ИГРОВОЙ ЭКРАН (ui.*)
       ============================================================ */
    'ui.level':            'Уровень ',
    'ui.level_1':          'Уровень 1',
    'ui.endless_level':    '♾ Уровень ',
    'ui.challenge':        '🎯 Испытание ',
    'ui.training':         '🎯 ТРЕНИРОВКА',
    'ui.duel':             '⚔️ ДУЭЛЬ',
    'ui.reset':            '↺ Сброс',
    'ui.hint':             '💡 Подсказка',
    'ui.boost_time':       '🕐 +45 сек',
    'ui.boost_reveal':     '👁 Решение',
    'ui.boost_skip':       '⏭ Пропуск',

    /* ============================================================
       ПОБЕДА / ПОРАЖЕНИЕ (win.*, lose.*)
       ============================================================ */
    'win.title':           'Уровень пройден!',
    'win.reward_coins':    '+{n} монет',
    'win.reward_speed':    '(+{n} за скорость)',
    'win.bonus_label':     'бонус',
    'win.continue':        'Продолжить',
    'win.ad_x2':           '📺 Посмотреть рекламу ×2',
    'win.menu':            'В меню',
    'win.already_done':    'Уровень уже пройден',
    'win.no_reward_repeat': 'Без наград за повтор',

    'lose.title':          'Игра окончена',
    'lose.progress':       'Пройдено уровней: {n}',
    'lose.progress_0':     'Пройдено уровней: 0',
    'lose.progress_n':     'Пройдено уровней: {n}',
    'lose.continue_ad':    '📺 Продолжить за рекламу',
    'lose.continue_coins': '💰 Продолжить за 200 ',
    'lose.continue_coins_text': 'Продолжить за 200',
    'lose.menu':           'В меню',
    'lose.challenge_fail': 'Испытание не пройдено',

    /* ============================================================
       ПОДСКАЗКА / БУСТЕРЫ / ПОДТВЕРЖДЕНИЯ (dialog.*)
       ============================================================ */
    'dialog.hint_title':   'Подсказка',
    'dialog.hint_text':    'Использовать подсказку?<br><br>Списать <b>50 <span class="coin-icon"></span></b> или посмотреть рекламу?',
    'dialog.hint_coins':   '50 монет',
    'dialog.hint_ad':      '📺 Реклама',
    'dialog.hint_cancel':  'Отмена',
    'dialog.skip_title':   'Пропустить уровень?',
    'dialog.skip_text':    'Будет использован <b>1 бустер «Пропуск»</b>.<br>Уровень засчитается как пройденный, вы получите награду.',
    'dialog.skip_text_endless': 'Будет использован <b>1 бустер «Пропуск»</b>.<br>Уровень засчитан как пройденный.',
    'dialog.skip_yes':     '⏭ Пропустить',
    'dialog.skip_cancel':  'Отмена',
    'dialog.pay_with_title': 'Чем платить?',
    'dialog.pay_with_text': 'У тебя хватает и монет, и алмазов.<br><br>Монеты: <b>{coins} <span class="coin-icon"></span></b><br>Алмазы: <b>{gems} <span class="gem-icon"></span></b>',

    /* ============================================================
       ТОСТЫ (toast.*)
       ============================================================ */
    'toast.no_boosters':   'Нет бустеров',
    'toast.no_coins':      'Недостаточно монет',
    'toast.no_gems':       'Недостаточно алмазов',
    'toast.no_leaves':     'Недостаточно листиков',
    'toast.no_funds':      'Недостаточно средств',
    'toast.time_added':    '+45 секунд!',
    'toast.reveal':        '👁 Решение на 3 секунды...',
    'toast.all_connected': 'Всё уже соединено!',
    'toast.already_owned': 'Уже куплено',
    'toast.item_not_found': 'Товар не найден',
    'toast.bought':        'Куплено: ',
    'toast.bought_coins':  'Куплено за {n} 🪙',
    'toast.bought_gems':   'Куплено за {n} 💎',
    'toast.bonus_coins':   '🎉 Бонус +{n} <span class="coin-icon"></span>!',
    'toast.endless_skipped': '⏭ Пропущено! +{coins} <span class="coin-icon"></span>',
    'toast.level_skipped': '⏭ Уровень пропущен!',
    'toast.level_skipped_full': '⏭ Уровень пропущен! +{coins} <span class="coin-icon"></span> + {xp} XP',
    'toast.level_up':      '⭐ Уровень {n}!',
    'toast.gems_added':    '💎 +{n} алмазов!',
    'toast.ad_x2_reward':  '+10 монет!',

    /* ============================================================
       ДУЭЛИ (duel.*)
       ============================================================ */
    'duel.title':          '⚔️ ДУЭЛИ',
    'duel.start':          '⚔️ НАЧАТЬ ДУЭЛЬ',
    'duel.training':       '🎯 ТРЕНИРОВКА',
    'duel.leaderboard':    '🏆 ЛИДЕРБОРД',
    'duel.searching':      '⚔️ ПОИСК СОПЕРНИКА',
    'duel.search_time':    'Примерное время: {n} сек',
    'duel.search_status_1': 'Подключение...',
    'duel.search_status_2': 'Поиск игрока...',
    'duel.search_status_3': 'Проверка соединения...',
    'duel.search_status_4': 'Почти готово...',
    'duel.search_found':   '✓ Соперник найден!',
    'duel.search_cancel':  'Отмена',
    'duel.you':            '👤 ТЫ',
    'duel.opponent':       '👤 СОПЕРНИК',
    'duel.vs':             'VS',
    'duel.start_countdown': 'СТАРТ!',
    'duel.win':            '🏆 ПОБЕДА!',
    'duel.lose':           '🥈 ПОРАЖЕНИЕ',
    'duel.time':           '⏱ Время дуэли:',
    'duel.time_sec':       '{n} сек',
    'duel.training_no_rewards': 'Без наград — только практика',
    'duel.training_label': '🎯 Тренировка',
    'duel.rewards':        'Награды:',
    'duel.reward_coins':   '+{n} монет',
    'duel.reward_stars':   '{sign}{n} звёзд',
    'duel.streak_bonus':   'Серия! +{stars} ⭐ +{coins} монет',
    'duel.play_again':     '⚔️ Ещё дуэль',
    'duel.to_menu':        '← В меню дуэлей',
    'duel.stats_total':    'Всего игр',
    'duel.stats_wins':     'Побед',
    'duel.stats_loses':    'Поражений',
    'duel.stats_winrate':  'Побед %',
    'duel.stats_streak':   'Серия',
    'duel.stats_best_streak': 'Лучшая серия',
    'duel.stats_rank':     'Ранг',
    'duel.stats_stars':    'Звёзды',
    'duel.stats_winrate_profile': 'Процент побед',
    'duel.stats_best_streak_profile': 'Лучшая серия',
    'duel.profile_title':  '⚔️ СТАТИСТИКА ДУЭЛЕЙ',
    'duel.search_msg_1':   '🤖 Соперник соединил линию',
    'duel.search_msg_2':   '🔥 Соперник ускоряется!',
    'duel.search_msg_3':   '⚡ Соперник близко!',
    'duel.search_msg_4':   '👀 Соперник не отстаёт',
    'duel.opponent_ahead': '⚠️ Соперник впереди!',
    'duel.opponent_error': '❌ Соперник ошибся!',
    'duel.opponent_finished': '🏁 Соперник финишировал!',
    'duel.opponent_finished_short': 'Соперник финишировал!',
    'duel.opponent_error_short': 'Соперник ошибся!',
    'duel.opponent_line_short': 'Соперник соединил линию',
    'duel.lb_title':       '🏆 ЛИДЕРБОРД — ДУЭЛИ',
    'duel.you_short':      ' (вы)',

    /* ============================================================
       ЗАДАНИЯ (task.*)
       ============================================================ */
    'task.easy':           'Простое',
    'task.medium':         'Среднее',
    'task.hard':           'Тяжёлое',
    'task.week_suffix':    ' · неделя',
    'task.streak':         '🔥 Серия: <b>{s}</b> дн. · Рекорд: <b>{b}</b>',
    'task.claim':          'Забрать',
    'task.all_bonus_daily': '🎁 Бонус за 3 задания: +20 ',
    'task.all_bonus_weekly': '🎁 Бонус за 3 задания: +100 ',
    'task.all_done_daily': '✅ Все задания выполнены!',
    'task.all_done_weekly': '✅ Все недельные задания выполнены!',

    /* Ежедневные / еженедельные — описания */
    'task.play3':          'Пройди 3 уровня',
    'task.play5':          'Пройди 5 уровней',
    'task.play10':         'Пройди 10 уровней',
    'task.connect20':      'Соедини 20 линий',
    'task.connect50':      'Соедини 50 линий',
    'task.useHint':        'Используй подсказку',
    'task.earn50':         'Заработай 50 монет',
    'task.earn100':        'Заработай 100 монет',
    'task.earn250':        'Заработай 250 монет',
    'task.duel1':          'Сыграй 1 дуэль',
    'task.duelWin1':       'Выиграй 1 дуэль',
    'task.duelWin3':       'Выиграй 3 дуэли',
    'task.duelWin5':       'Выиграй 5 дуэлей',
    'task.duelPlay3':      'Сыграй 3 дуэли',
    'task.endless3':       'Пройди 3 уровня в бесконечном',
    'task.endless5':       'Пройди 5 уровней в бесконечном',
    'task.endless10':      'Пройди 10 уровней в бесконечном',
    'task.endless15':      'Пройди 15 уровней в бесконечном',
    'task.bpTask1':        'Выполни 1 задание FallPass',
    'task.bpTask3':        'Выполни 3 задания FallPass',
    'task.bpTask5':        'Выполни все 5 заданий FallPass',
    'task.bpLevel1':       'Открой 1 уровень FallPass',
    'task.bpLevel3':       'Открой 3 уровня FallPass',
    'task.buy1':           'Купи 1 предмет в магазине',
    'task.buy3':           'Купи 3 предмета в магазине',
    'task.useBooster1':    'Используй 1 бустер',
    'task.openChest1':     'Открой 1 сундук',
    'task.chest3':         'Открой 3 сундука',
    'task.dailyBonus':     'Забери ежедневный бонус',
    'task.playRegion1':    'Пройди 1 уровень в путешествии',
    'task.region3':        'Пройди 3 уровня в одном регионе',
    'task.region10':       'Пройди 10 уровней в одном регионе',
    'task.fast3':          'Пройди 3 уровня за минуту',
    'task.fast5':          'Пройди 5 уровней за 2 минуты',
    'task.noHint3':        'Пройди 3 уровня без подсказок',
    'task.noHint5':        'Пройди 5 уровней без подсказок',
    'task.perfect5':       'Пройди 5 уровней без ошибок',

    /* Еженедельные */
    'task.w_play50':       'Пройди 50 уровней',
    'task.w_play150':      'Пройди 150 уровней',
    'task.w_play300':      'Пройди 300 уровней',
    'task.w_connect200':   'Соедини 200 линий',
    'task.w_earn1000':     'Заработай 1000 монет',
    'task.w_earn3000':     'Заработай 3000 монет',
    'task.w_duelPlay15':   'Сыграй 15 дуэлей',
    'task.w_duelWin10':    'Выиграй 10 дуэлей',
    'task.w_duelWin30':    'Выиграй 30 дуэлей',
    'task.w_endless50':    'Пройди 50 уровней в бесконечном',
    'task.w_endless100':   'Пройди 100 уровней в бесконечном',
    'task.w_endless250':   'Пройди 250 уровней в бесконечном',
    'task.w_bpLevel10':    'Открой 10 уровней FallPass',
    'task.w_bpLevel30':    'Открой 30 уровней FallPass',
    'task.w_region50':     'Пройди 50 уровней в путешествии',

    /* Задания FallPass (BP_TASKS) */
    'task.bp_play_10':     'Пройди 10 уровней',
    'task.bp_play_15':     'Пройди 15 уровней',
    'task.bp_play_20':     'Пройди 20 уровней',
    'task.bp_play_25':     'Пройди 25 уровней',
    'task.bp_play_30':     'Пройди 30 уровней',
    'task.bp_play_50':     'Пройди 50 уровней',
    'task.bp_connect_100': 'Соедини 100 линий',
    'task.bp_connect_150': 'Соедини 150 линий',
    'task.bp_connect_200': 'Соедини 200 линий',
    'task.bp_connect_250': 'Соедини 250 линий',
    'task.bp_hint_3':      'Используй 3 подсказки',
    'task.bp_hint_4':      'Используй 4 подсказки',
    'task.bp_hint_5':      'Используй 5 подсказок',
    'task.bp_earn_200':    'Заработай 200 монет',
    'task.bp_earn_300':    'Заработай 300 монет',
    'task.bp_earn_400':    'Заработай 400 монет',
    'task.bp_earn_500':    'Заработай 500 монет',
    'task.bp_earn_1000':   'Заработай 1000 монет',
    'task.bp_spend_100':   'Потрать 100 монет в магазине',
    'task.bp_spend_200':   'Потрать 200 монет в магазине',
    'task.bp_spend_300':   'Потрать 300 монет в магазине',
    'task.bp_spend_400':   'Потрать 400 монет в магазине',
    'task.bp_spend_500':   'Потрать 500 монет в магазине',
    'task.bp_chest_1':     'Открой 1 сундук',
    'task.bp_chest_2':     'Открой 2 сундука',
    'task.bp_chest_3':     'Открой 3 сундука',
    'task.bp_duel_3':      'Сыграй 3 дуэли',
    'task.bp_duel_5':      'Сыграй 5 дуэлей',
    'task.bp_duel_7':      'Сыграй 7 дуэлей',
    'task.bp_duel_10':     'Сыграй 10 дуэлей',
    'task.bp_duel_win_1':  'Выиграй 1 дуэль',
    'task.bp_duel_win_2':  'Выиграй 2 дуэли',
    'task.bp_duel_win_3':  'Выиграй 3 дуэли',
    'task.bp_duel_win_4':  'Выиграй 4 дуэли',
    'task.bp_duel_win_5':  'Выиграй 5 дуэлей',
    'task.bp_duel_win_10': 'Выиграй 10 дуэлей',
    'task.bp_endless_5':   'Пройди 5 уровней в бесконечном',
    'task.bp_endless_10':  'Пройди 10 уровней в бесконечном',
    'task.bp_endless_15':  'Пройди 15 уровней в бесконечном',
    'task.bp_boss_1':      'Победи 1 босса',
    'task.bp_boss_2':      'Победи 2 боссов',
    'task.bp_boss_3':      'Победи 3 боссов',
    'task.bp_no_hint_3':   'Пройди 3 уровня без подсказок',
    'task.bp_no_hint_5':   'Пройди 5 уровней без подсказок',
    'task.bp_no_hint_7':   'Пройди 7 уровней без подсказок',
    'task.bp_fast_3':      'Пройди 3 уровня за минуту',
    'task.bp_fast_5':      'Пройди 5 уровней за 2 минуты',
    'task.bp_fast_7':      'Пройди 7 уровней за 3 минуты',
    'task.bp_buy_theme_1': 'Купи 1 тему',
    'task.bp_buy_trail_1': 'Купи 1 след',
    'task.bp_buy_bg_1':    'Купи 1 фон',

    /* ============================================================
       ДОСТИЖЕНИЯ (ach.*)
       ============================================================ */
    'ach.first':           'Первая победа',
    'ach.first_desc':      'Пройди 1 уровень',
    'ach.ten':             'Десятка',
    'ach.ten_desc':        'Пройди 10 уровней',
    'ach.fifty':           'Полтинник',
    'ach.fifty_desc':      'Пройди 50 уровней',
    'ach.hundred':         'Сотка',
    'ach.hundred_desc':    'Пройди 100 уровней',
    'ach.two_fifty':       'Двести пятьдесят',
    'ach.two_fifty_desc':  'Пройди 250 уровней',
    'ach.five_hundred':    'Пятьсот',
    'ach.five_hundred_desc': 'Пройди 500 уровней',
    'ach.thousand':        'Тысяча',
    'ach.thousand_desc':   'Пройди 1000 уровней',
    'ach.ten_thousand':    'Десять тысяч',
    'ach.ten_thousand_desc': 'Пройди 10000 уровней',
    'ach.rich':            'Богач',
    'ach.rich_desc':       'Накопи 1000 монет',
    'ach.collector':       'Коллекционер',
    'ach.collector_desc':  'Купи 5 тем',
    'ach.buy10':           'Шопоголик',
    'ach.buy10_desc':      'Купи 10 предметов',
    'ach.speedster':       'Скоростной',
    'ach.speedster_desc':  'Пройди уровень за 15 секунд',
    'ach.noHint':          'Сам себе мастер',
    'ach.noHint_desc':     'Пройди 20 уровней без подсказок',
    'ach.no_hint_50':      'Мастер без подсказок',
    'ach.no_hint_50_desc': 'Пройди 50 уровней без подсказок',
    'ach.daily7':          'Верный друг',
    'ach.daily7_desc':     'Заходи 7 дней подряд',
    'ach.tasks20':         'Исполнительный',
    'ach.tasks20_desc':    'Выполни 20 заданий',
    'ach.level10':         'Опытный',
    'ach.level10_desc':    'Достигни 10 уровня игрока',
    'ach.endless10':       'Бесконечный герой',
    'ach.endless10_desc':  'Пройди 10 уровней в бесконечном',
    'ach.endless_25':      'Бесконечный 25',
    'ach.endless_25_desc': 'Пройди 25 уровней в бесконечном',
    'ach.endless_50':      'Бесконечный 50',
    'ach.endless_50_desc': 'Пройди 50 уровней в бесконечном',
    'ach.endless_100':     'Бесконечный 100',
    'ach.endless_100_desc': 'Пройди 100 уровней в бесконечном',
    'ach.endless_250':     'Бесконечный 250',
    'ach.endless_250_desc': 'Пройди 250 уровней в бесконечном',
    'ach.endless_500':     'Бесконечный 500',
    'ach.endless_500_desc': 'Пройди 500 уровней в бесконечном',
    'ach.endless_1000':    'Бесконечный 1000',
    'ach.endless_1000_desc': 'Пройди 1000 уровней в бесконечном',
    'ach.region_japan':    'Самурай',
    'ach.region_japan_desc': 'Пройди Японию полностью',
    'ach.region_italy':    'Гондольер',
    'ach.region_italy_desc': 'Пройди Италию полностью',
    'ach.region_france':   'Художник',
    'ach.region_france_desc': 'Пройди Францию полностью',
    'ach.region_russia':   'Покоритель зимы',
    'ach.region_russia_desc': 'Пройди Россию полностью',
    'ach.region_usa':      'Свобода',
    'ach.region_usa_desc': 'Пройди США полностью',
    'ach.region_brazil':   'Танцор',
    'ach.region_brazil_desc': 'Пройди Бразилию полностью',
    'ach.region_china':    'Укротитель дракона',
    'ach.region_china_desc': 'Пройди Китай полностью',
    'ach.region_germany':  'Хранитель замка',
    'ach.region_germany_desc': 'Пройди Германию полностью',
    'ach.region_australia': 'Сёрфер',
    'ach.region_australia_desc': 'Пройди Австралию полностью',
    'ach.region_iceland':  'Ледяной герой',
    'ach.region_iceland_desc': 'Пройди Исландию полностью',
    'ach.all_regions':     'Кругосветка',
    'ach.all_regions_desc': 'Пройди все 10 регионов',
    'ach.boss_all':        'Покоритель боссов',
    'ach.boss_all_desc':   'Победи всех 10 боссов',
    'ach.bp50':            'FallPass 50',
    'ach.bp50_desc':       'Достигни 50 уровня FallPass',
    'ach.duel_10':         'Дуэлянт',
    'ach.duel_10_desc':    'Выиграй 10 дуэлей',
    'ach.duel_25':         'Воин',
    'ach.duel_25_desc':    'Выиграй 25 дуэлей',
    'ach.duel_50':         'Гладиатор',
    'ach.duel_50_desc':    'Выиграй 50 дуэлей',
    'ach.duel_100':        'Снайпер',
    'ach.duel_100_desc':   'Выиграй 100 дуэлей',
    'ach.duel_250':        'Легенда арены',
    'ach.duel_250_desc':   'Выиграй 250 дуэлей',
    'ach.duel_1000':       'Владыка арены',
    'ach.duel_1000_desc':  'Выиграй 1000 дуэлей',
    'ach.rank_wood':       'Дерево',
    'ach.rank_wood_desc':  'Заработай 1 звезду в дуэлях',
    'ach.rank_iron':       'Железо',
    'ach.rank_iron_desc':  'Достигни ранга Железо',
    'ach.rank_silver':     'Серебро',
    'ach.rank_silver_desc': 'Достигни ранга Серебро',
    'ach.rank_gold':       'Золото',
    'ach.rank_gold_desc':  'Достигни ранга Золото',
    'ach.rank_ruby':       'Рубин',
    'ach.rank_ruby_desc':  'Достигни ранга Рубин',
    'ach.rank_emerald':    'Изумруд',
    'ach.rank_emerald_desc': 'Достигни ранга Изумруд',
    'ach.rank_diamond':    'Алмаз',
    'ach.rank_diamond_desc': 'Достигни ранга Алмаз',
    'ach.rank_legend':     'Легенда',
    'ach.rank_legend_desc': 'Достигни ранга Легенда',

    /* ============================================================
       РЕГИОНЫ (region.*)
       ============================================================ */
    'region.japan':        'Япония',
    'region.italy':        'Италия',
    'region.france':       'Франция',
    'region.russia':       'Россия',
    'region.usa':          'США',
    'region.brazil':       'Бразилия',
    'region.china':        'Китай',
    'region.germany':      'Германия',
    'region.australia':    'Австралия',
    'region.iceland':      'Исландия',
    'region.travel':       '🌍 ПУТЕШЕСТВИЕ',
    'region.progress':     'Пройдено: ',
    'region.completed':    '🏆 Регион пройден!',
    'region.locked':       '🔒 Пройди предыдущий уровень',
    'region.locked_wave':  '🔒 Пройди ещё {n} уровней',
    'region.victory_title': '{name} ПРОЙДЕНА!',
    'region.victory_sub':  'Ты прошёл все 10 уровней региона',
    'region.victory_rewards': 'Получены награды:',
    'region.victory_theme': 'Тема «{name}»',
    'region.victory_theme_desc': 'Уникальная тема региона',
    'region.victory_trail': 'След «{name}»',
    'region.victory_trail_desc': 'Уникальный след региона',
    'region.victory_ach':  'Достижение «{name}»',
    'region.victory_gems': '+{n} алмазов',
    'region.victory_gems_desc': 'Бонус за полное прохождение',
    'region.victory_continue': 'Продолжить',
    'region.wave_opened':  '🎉 ВОЛНА {n} ОТКРЫТА!',
    'region.select_pawn':  'Выбери путешественника',
    'region.select_pawn_sub': 'Он будет двигаться по карте мира',
    'region.pawn_boy':     'Макс',
    'region.pawn_girl':    'Ая',

    /* Боссы */
    'boss.defeated':       '{name} ПОБЕЖДЁН!',
    'boss.region':         'Регион: {flag} {name}',
    'boss.rewards':        'Награды:',
    'boss.reward_coins':   '+{n} монет',
    'boss.reward_xp':      '+{n} XP',
    'boss.reward_gems':    '+{n} алмазов',
    'boss.claim':          'Забрать награды',
    'boss.name_default':   'БОСС',
    'boss.name_japan':     '🐉 ДРАКОН ЯМАТО',
    'boss.name_italy':     '🏛️ КОЛИЗЕЙ',
    'boss.name_france':    '🎭 ДУХ ЛУВРА',
    'boss.name_russia':    '🐻 МЕДВЕДЬ-ХОЗЯИН',
    'boss.name_usa':       '🦅 ОРЁЛ СВОБОДЫ',
    'boss.name_brazil':    '🦜 ПОПУГАЙ АРА',
    'boss.name_china':     '🐲 КИТАЙСКИЙ ДРАКОН',
    'boss.name_germany':   '🦌 ОЛЕНЬ-ХРАНИТЕЛЬ',
    'boss.name_australia': '🐊 КРОКОДИЛ-ВЛАДЫКА',
    'boss.name_iceland':   '❄️ ЛЕДЯНОЙ ДУХ',

    /* ============================================================
       ТЕМЫ (theme.*)
       ============================================================ */
    'theme.default':       'Классика',
    'theme.dark':          'Тёмная',
    'theme.retro':         'Ретро',
    'theme.oriental':      'Японская',
    'theme.ocean':         'Океан',
    'theme.gradient':      'Градиент',
    'theme.pastel':        'Пастель',
    'theme.neon':          'Неон',
    'theme.cosmic':        'Космос',
    'theme.glitch':        'Глитч',
    'theme.metallic':      'Металлик',
    'theme.fire':          'Огонь',
    'theme.gems':          'Драгоценные камни',
    'theme.r_sakura':      'Сакура',
    'theme.r_venice':      'Венеция',
    'theme.r_lavender':    'Лаванда',
    'theme.r_winter':      'Зима',
    'theme.r_vegas':       'Вегас',
    'theme.r_carnival':    'Карнавал',
    'theme.r_dragon':      'Дракон',
    'theme.r_forest':      'Лес',
    'theme.r_outback':     'Аутбэк',
    'theme.r_aurora':      'Сияние',
    'theme.anime':         'Аниме',

    /* ============================================================
       ФОНЫ (bg.*)
       ============================================================ */
    'bg.void':             'Тёмная пустота',
    'bg.stars':            'Звёздное небо',
    'bg.waves':            'Волны',
    'bg.bubbles':          'Пузыри',
    'bg.aurora':           'Северное сияние',
    'bg.matrix':           'Матрица',
    'bg.nebula':           'Космическая туманность',
    'bg.snow':             'Снег',
    'bg.neural':           'Нейросеть',
    'bg.anime_forest':     'Осенний лес',

    /* ============================================================
       СЛЕДЫ (trail.*)
       ============================================================ */
    'trail.default':       'Классический',
    'trail.lightning':     'Молния',
    'trail.spores':        'Споры',
    'trail.butterflies':   'Бабочки',
    'trail.comet':         'Комета',
    'trail.magic':         'Магия',
    'trail.ghosts':        'Призраки',
    'trail.curse':         'Проклятие',
    'trail.shooting_star': 'Падающая звезда',
    'trail.nebula':        'Туманность',
    'trail.black_hole':    'Чёрная дыра',
    'trail.crystals':      'Кристаллы',
    'trail.paint':         'Краска',
    'trail.web':           'Паутина',
    'trail.constellation': 'Созвездие',
    'trail.quantum':       'Квант',
    'trail.sakura':        'Лепестки сакуры',
    'trail.bubbles':       'Пузыри Венеции',
    'trail.lavender':      'Лаванда',
    'trail.snowflake':     'Снежинки',
    'trail.sparks':        'Неоновые искры',
    'trail.rainbow':       'Карнавал',
    'trail.fire':          'Огонь дракона',
    'trail.leaves':        'Листья осени',
    'trail.water':         'Волны океана',
    'trail.aurora':        'Северное сияние',
    'trail.anime':         'Аниме',

    /* ============================================================
       БАТТЛПАСС (bp.*)
       ============================================================ */
    'bp.tasks_title':      '📋 ЕЖЕДНЕВНЫЕ ЗАДАНИЯ',
    'bp.tasks_timer':      'Обновление через ',
    'bp.tasks_timer_placeholder': 'Обновление через 24:00:00',
    'bp.shop':             'МАГАЗИН',
    'bp.shop_empty_title': 'Товары скоро появятся!',
    'bp.shop_empty_text':  'Мы готовим эксклюзивные осенние награды. Заглядывай позже 🍂',
    'bp.upgrade':          'УЛУЧШИТЬ BP',
    'bp.premium_active':   'ПРЕМИУМ АКТИВЕН',
    'bp.level_label':      'УРОВЕНЬ',
    'bp.level_text':       'УРОВЕНЬ {n} / 50',
    'bp.card_level_short': 'УР.',
    'bp.xp_text':          '{cur} / {max} XP',
    'bp.claim':            'ЗАБРАТЬ',
    'bp.claim_premium':    'ЗАБРАТЬ ПРЕМИУМ',
    'bp.claim_all':        'ЗАБРАТЬ ВСЁ',
    'bp.claimed':          '✓ ПОЛУЧЕНО',
    'bp.task_claimed':     '✓ Получено',
    'bp.received':         'Получено!',
    'bp.upgrade_title':    '⭐ Улучшить FallPass',
    'bp.upgrade_text_1':   'Улучши FallPass и получай <b>дополнительные награды</b> на каждом уровне!',
    'bp.upgrade_text_2':   '⭐ <b>Премиум-трек</b> — вторая дорожка наград',
    'bp.upgrade_text_3':   'Больше листиков, монет и алмазов',
    'bp.upgrade_cost':     'Стоимость: <b>{gems} <span class="gem-icon"></span></b> или <b>посмотреть {ads} реклам</b>',
    'bp.upgrade_watched':  'Просмотрено: {cur} / {max}',
    'bp.upgrade_gems_btn': '{n} 💎',
    'bp.upgrade_ads_btn':  '📺 Реклама ({cur}/{max})',
    'bp.upgrade_cancel':   'Отмена',
    'bp.premium_activated': '⭐ Премиум активирован!',
    'bp.ad_watched':       '📺 Просмотрено {cur} / {max}',
    'bp.premium_already':  'Премиум уже активен',
    'bp.not_enough_gems':  'Недостаточно алмазов',
    'bp.balance':          'Твой баланс:',
    'bp.item_bought':      'КУПЛЕНО',
    'bp.item_buy':         'КУПИТЬ',
    'bp.chest_name':       'Сундук FallPass',
    'bp.chest_desc':       'Случайная награда: монеты, алмазы, листики или эксклюзив',
    'bp.chest_title':      'Сундук FallPass',
    'bp.chest_short':      'Сундук',
    'bp.exchange_coins':   '{rate} монет за 1 листик',
    'bp.exchange_gems':    '{rate} алмазов за 1 листик',
    'bp.chest_again':      '🎁 Открыть ещё один ({n} ',
    'bp.chest_claim':      'Забрать',
    'bp.chest_owned_toast': '(уже куплено) → +60 ',
    'bp.level_up_toast':   '🏆 FallPass уровень {n}!',

    /* Награды BP */
    'bp.reward_leaves_5':   '5 листиков',
    'bp.reward_coins_50':   '50 монет',
    'bp.reward_coins_100':  '100 монет',
    'bp.reward_gems_10':    '10 алмазов',
    'bp.reward_gems_25':    '25 алмазов',
    'bp.reward_booster_time': 'Бустер +45 сек',
    'bp.reward_chest':      'Сундук',

    /* ============================================================
       МАГАЗИН / ИНВЕНТАРЬ (shop.*, inv.*)
       ============================================================ */
    'shop.title':          '🛒 Магазин',
    'shop.tab_themes':     'Темы',
    'shop.tab_backgrounds': 'Фоны',
    'shop.tab_trails':     'Следы',
    'shop.tab_boosters':   'Бустеры',
    'shop.tab_chests':     'Сундуки',
    'shop.close':          'Закрыть',
    'shop.all_themes_bought': 'Все темы куплены!',
    'shop.all_bg_bought':  'Все фоны куплены!',
    'shop.all_trails_bought': 'Все следы куплены!',
    'shop.booster_time_name': '+45 секунд',
    'shop.booster_time_desc': 'Добавляет 45 сек (только бесконечный/испытание)',
    'shop.booster_reveal_name': 'Решение',
    'shop.booster_reveal_desc': 'Показывает решение на 3 сек',
    'shop.booster_skip_name': 'Пропуск',
    'shop.booster_skip_desc': 'Пропускает уровень (кроме боссов)',
    'shop.booster_added':  '+1 бустер!',
    'shop.chest_desc':     'Сундук со случайной наградой!',
    'shop.chest_buy_coins': 'Открыть за 100 ',
    'shop.chest_buy_gems': 'Открыть за 20 ',
    'shop.chest_again_coins': '🎁 Открыть ещё один (100 ',

    'inv.title':           '🎒 Инвентарь',
    'inv.active':          '✓ Активна',
    'inv.active_bg':       '✓ Активен',
    'inv.select':          'Выбрать',

    /* ============================================================
       ПРОФИЛЬ, ЛИДЕРБОРД, ДОСТИЖЕНИЯ (profile.*, lb.*, ach_modal.*)
       ============================================================ */
    'profile.title':       'Профиль',
    'profile.xp':          '{cur}/{max} XP',
    'profile.total_xp':    'Всего XP',
    'profile.level':       'Уровень игрока',
    'profile.level_short': 'Уровень',
    'profile.levels_done': 'Пройдено уровней',
    'profile.challenges':  'Испытаний',
    'profile.endless_best': 'Рекорд бесконечного',
    'profile.achievements': 'Достижений',
    'profile.total_coins': 'Монет всего',
    'profile.time':        'Время в игре',
    'profile.leaves':      'Листиков',
    'profile.duel_title':  '⚔️ СТАТИСТИКА ДУЭЛЕЙ',
    'profile.duel_rank':   'Ранг',
    'profile.duel_stars':  'Звёзды',
    'profile.duel_total':  'Всего игр',
    'profile.duel_wins':   'Побед',
    'profile.duel_loses':  'Поражений',
    'profile.duel_winrate': 'Процент побед',
    'profile.duel_best_streak': 'Лучшая серия',
    'profile.close':       'Закрыть',

    'lb.title':            '🏅 Таблица лидеров',
    'lb.tab_levels':       'Пройденные уровни',
    'lb.tab_endless':      'Бесконечный',
    'lb.tab_duel':         'Дуэли',
    'lb.you':              ' (вы)',
    'lb.your_place':       'Ваша позиция:',
    'lb.close':            'Закрыть',

    'ach_modal.title':     '🏆 Достижения',
    'ach_modal.progress':  'Открыто: <b>{cur} / {total}</b>',
    'ach_modal.close':     'Закрыть',

    /* ============================================================
       ЕЖЕДНЕВНЫЙ БОНУС (daily.*)
       ============================================================ */
    'daily.title':         '🎁 Ежедневный бонус',
    'daily.sub':           'Заходи каждый день и получай награды!',
    'daily.day':           'День {n}',
    'daily.streak':        'Серия: {n} дней подряд',
    'daily.claim':         'Получить награду',
    'daily.reset':         '🔄 Сбросить серию (30 ',
    'daily.reset_toast':   'Серия сброшена!',

    /* ============================================================
       НАСТРОЙКИ (settings.*)
       ============================================================ */
    'settings.title':      '⚙️ Настройки',
    'settings.sound':      'Звук',
    'settings.music':      'Музыка',
    'settings.volume':     'Громкость',
    'settings.language':   'Язык',
    'settings.close':      'Закрыть',

    /* ============================================================
       ТУТОРИАЛ (tut.*)
       ============================================================ */
    'tut.header_label':    'Обучение · Шаг',
    'tut.step':            '🎓 Обучение · Шаг {cur}/{total}',
    'tut.skip':            'Пропустить ✕',
    'tut.next':            'Далее →',
    'tut.finish':          '🎮 Начать играть',
    'tut.hint1':           '🎯<span class="space"></span><b>Задача игры:</b><span class="space"></span>соедини пары точек одного цвета линиями.',
    'tut.hint2':           '👆<span class="space"></span><b>Веди линию</b><span class="space"></span>от точки к точке того же цвета.',
    'tut.hint3':           '⚠️<span class="space"></span><b>Главное правило:</b><span class="space"></span>линия должна заполнить ВСЕ клетки.',
    'tut.hint4':           '🚫<span class="space"></span><b>Линии не должны пересекаться.</b>',
    'tut.hint5':           '✅<span class="space"></span><b>Готово!</b><span class="space"></span>Удачи!',

    /* ============================================================
       ОБЩИЕ (common.*)
       ============================================================ */
    'common.back':         'Назад',
    'common.cancel':       'Отмена',
    'common.yes':          'Да',
    'common.no':           'Нет',
    'common.close':        'Закрыть',
    'common.player':       'Игрок',
    'common.days_short':   'д',

    /* ============================================================
       БОТЫ ДУЭЛЕЙ (bot.*)
       ============================================================ */
    'bot.novice':          'Новичок',
    'bot.amateur':         'Любитель',
    'bot.pro':             'Профи',
    'bot.champion':        'Чемпион',

    /* ============================================================
       РАНГИ ДУЭЛЕЙ (rank.*)
       ============================================================ */
    'rank.wood':           'Дерево',
    'rank.iron':           'Железо',
    'rank.silver':         'Серебро',
    'rank.gold':           'Золото',
    'rank.ruby':           'Рубин',
    'rank.emerald':        'Изумруд',
    'rank.diamond':        'Алмаз',
    'rank.legend':         'Легенда',

    /* ============================================================
       ЗАДАНИЯ BP — КОНЕЦ
       ============================================================ */
    'bp.tasks_timer_label': 'Обновление через ',

    /* ============================================================
       ПРИЗЫ СУНДУКОВ (prize.*)
       ============================================================ */
    'prize.coins_50':      '50 монет',
    'prize.coins_100':     '100 монет',
    'prize.coins_200':     '200 монет',
    'prize.coins_300':     '300 монет',
    'prize.coins_500':     '500 монет',
    'prize.leaves_5':      '5 листиков',
    'prize.leaves_10':     '10 листиков',
    'prize.leaves_15':     '15 листиков',
    'prize.leaves_20':     '20 листиков',
    'prize.leaves_50':     '50 листиков',
    'prize.gems_5':        '5 алмазов',
    'prize.gems_10':       '10 алмазов',
    'prize.gems_15':       '15 алмазов',
    'prize.gems_25':       '25 алмазов',
    'prize.gems_30':       '30 алмазов',
    'prize.gems_50':       '50 алмазов',
    'prize.gems_100':      '100 алмазов',
    'prize.bg_anime_forest': 'Фон «Осенний лес»',
    'prize.theme_anime':   'Тема «Аниме»',
    'prize.trail_anime':   'След «Аниме»',

    /* ============================================================
       СУНДУК-НАГРАДА (chest.*)
       ============================================================ */
    'chest.title':         '🎁 Открытие сундука',
    'chest.claim':         'Забрать',
    'chest.reward_coins':  '+{n} монет!',
    'chest.reward_gems':   '+{n} алмазов!',
    'chest.reward_booster_time': 'Бустер «+45 сек»!',
    'chest.reward_booster_reveal': 'Бустер «Решение»!',
    'chest.reward_booster_skip': 'Бустер «Пропуск»!',

    /* ============================================================
       ПОДТВЕРЖДЕНИЕ (confirm.*)
       ============================================================ */
    'confirm.title':       'Подтвердите действие',

    /* ============================================================
       БЕСКОНЕЧНЫЙ — ВОЗОБНОВЛЕНИЕ (endless.*)
       ============================================================ */
    'endless.saved_title': '♾ Бесконечный режим',
    'endless.saved_text':  'У тебя есть сохранённая игра.',
    'endless.resume':      '▶ Продолжить',
    'endless.new_game':    '🆕 Новая игра'
  },

  en: {
    /* ============================================================
       APP / SPLASH
       ============================================================ */
    'app.title':           'FLOW',
    'splash.loading':      'Loading…',
    'splash.loading_pct':  'Loading… {n}%',
    'splash.almost':       'Almost ready…',
    'splash.done':         'Ready!',
    'splash.fail':         'Failed to load the game.<br>Check your internet connection.',
    'splash.offline':      'Continue in offline mode',
    'splash.reload':       '🔄 Reload',
    'splash.error':        'Loading error',
    'splash.retry':        'Retrying…',

    /* ============================================================
       MENU
       ============================================================ */
    'menu.play':           'PLAY',
    'menu.play_btn':       '▶ PLAY',
    'menu.shop':           'Shop',
    'menu.inventory':      'Inventory',
    'menu.leaderboard':    'Leaders',
    'menu.battlepass':     'BATTLE PASS',
    'menu.achievements':   'Achievements',
    'menu.help':           'How to play',
    'menu.settings':       'Settings',
    'menu.tasks':          'Daily tasks',
    'menu.tasks_daily':    '📅 Daily',
    'menu.tasks_weekly':   '📆 Weekly',
    'menu.reset_timer':    '⏱ Reset in:',

    /* ============================================================
       MODE
       ============================================================ */
    'mode.title':          'Choose mode',
    'mode.travel':         'ADVENTURE',
    'mode.travel_sub':     'Level by level',
    'mode.endless':        'ENDLESS',
    'mode.endless_record': 'Record: ',
    'mode.duel':           'DUELS',
    'mode.duel_locked':    '🔒 ',
    'mode.duel_locked_msg': '🔒 Complete {n} more levels in endless!',
    'mode.duel_open':      '✓ Unlocked',
    'mode.cancel':         'Cancel',

    /* ============================================================
       UI
       ============================================================ */
    'ui.level':            'Level ',
    'ui.level_1':          'Level 1',
    'ui.endless_level':    '♾ Level ',
    'ui.challenge':        '🎯 Challenge ',
    'ui.training':         '🎯 TRAINING',
    'ui.duel':             '⚔️ DUEL',
    'ui.reset':            '↺ Reset',
    'ui.hint':             '💡 Hint',
    'ui.boost_time':       '🕐 +45 sec',
    'ui.boost_reveal':     '👁 Solution',
    'ui.boost_skip':       '⏭ Skip',

    /* ============================================================
       WIN / LOSE
       ============================================================ */
    'win.title':           'Level complete!',
    'win.reward_coins':    '+{n} coins',
    'win.reward_speed':    '(+{n} for speed)',
    'win.bonus_label':     'bonus',
    'win.continue':        'Continue',
    'win.ad_x2':           '📺 Watch ad ×2',
    'win.menu':            'To menu',
    'win.already_done':    'Level already completed',
    'win.no_reward_repeat': 'No reward for replay',

    'lose.title':          'Game over',
    'lose.progress':       'Levels passed: {n}',
    'lose.progress_0':     'Levels passed: 0',
    'lose.progress_n':     'Levels passed: {n}',
    'lose.continue_ad':    '📺 Continue for ad',
    'lose.continue_coins': '💰 Continue for 200 ',
    'lose.continue_coins_text': 'Continue for 200',
    'lose.menu':           'To menu',
    'lose.challenge_fail': 'Challenge failed',

    /* ============================================================
       DIALOG
       ============================================================ */
    'dialog.hint_title':   'Hint',
    'dialog.hint_text':    'Use a hint?<br><br>Spend <b>50 <span class="coin-icon"></span></b> or watch an ad?',
    'dialog.hint_coins':   '50 coins',
    'dialog.hint_ad':      '📺 Ad',
    'dialog.hint_cancel':  'Cancel',
    'dialog.skip_title':   'Skip level?',
    'dialog.skip_text':    'You will use <b>1 "Skip" booster</b>.<br>The level will be counted as completed and you will get a reward.',
    'dialog.skip_text_endless': 'You will use <b>1 "Skip" booster</b>.<br>The level will be counted as completed.',
    'dialog.skip_yes':     '⏭ Skip',
    'dialog.skip_cancel':  'Cancel',
    'dialog.pay_with_title': 'How to pay?',
    'dialog.pay_with_text': 'You have enough coins and gems.<br><br>Coins: <b>{coins} <span class="coin-icon"></span></b><br>Gems: <b>{gems} <span class="gem-icon"></span></b>',

    /* ============================================================
       TOASTS
       ============================================================ */
    'toast.no_boosters':   'No boosters',
    'toast.no_coins':      'Not enough coins',
    'toast.no_gems':       'Not enough gems',
    'toast.no_leaves':     'Not enough leaves',
    'toast.no_funds':      'Not enough funds',
    'toast.time_added':    '+45 seconds!',
    'toast.reveal':        '👁 Solution for 3 seconds...',
    'toast.all_connected': 'Everything is connected already!',
    'toast.already_owned': 'Already owned',
    'toast.item_not_found': 'Item not found',
    'toast.bought':        'Purchased: ',
    'toast.bought_coins':  'Purchased for {n} 🪙',
    'toast.bought_gems':   'Purchased for {n} 💎',
    'toast.bonus_coins':   '🎉 Bonus +{n} <span class="coin-icon"></span>!',
    'toast.endless_skipped': '⏭ Skipped! +{coins} <span class="coin-icon"></span>',
    'toast.level_skipped': '⏭ Level skipped!',
    'toast.level_skipped_full': '⏭ Level skipped! +{coins} <span class="coin-icon"></span> + {xp} XP',
    'toast.level_up':      '⭐ Level {n}!',
    'toast.gems_added':    '💎 +{n} gems!',
    'toast.ad_x2_reward':  '+10 coins!',

    /* ============================================================
       DUEL
       ============================================================ */
    'duel.title':          '⚔️ DUELS',
    'duel.start':          '⚔️ START DUEL',
    'duel.training':       '🎯 TRAINING',
    'duel.leaderboard':    '🏆 LEADERBOARD',
    'duel.searching':      '⚔️ FINDING OPPONENT',
    'duel.search_time':    'Estimated time: {n} sec',
    'duel.search_status_1': 'Connecting...',
    'duel.search_status_2': 'Searching player...',
    'duel.search_status_3': 'Checking connection...',
    'duel.search_status_4': 'Almost ready...',
    'duel.search_found':   '✓ Opponent found!',
    'duel.search_cancel':  'Cancel',
    'duel.you':            '👤 YOU',
    'duel.opponent':       '👤 OPPONENT',
    'duel.vs':             'VS',
    'duel.start_countdown': 'GO!',
    'duel.win':            '🏆 VICTORY!',
    'duel.lose':           '🥈 DEFEAT',
    'duel.time':           '⏱ Duel time:',
    'duel.time_sec':       '{n} sec',
    'duel.training_no_rewards': 'No rewards — just practice',
    'duel.training_label': '🎯 Training',
    'duel.rewards':        'Rewards:',
    'duel.reward_coins':   '+{n} coins',
    'duel.reward_stars':   '{sign}{n} stars',
    'duel.streak_bonus':   'Streak! +{stars} ⭐ +{coins} coins',
    'duel.play_again':     '⚔️ Play again',
    'duel.to_menu':        '← Back to duels',
    'duel.stats_total':    'Total games',
    'duel.stats_wins':     'Wins',
    'duel.stats_loses':    'Losses',
    'duel.stats_winrate':  'Winrate',
    'duel.stats_streak':   'Streak',
    'duel.stats_best_streak': 'Best streak',
    'duel.stats_rank':     'Rank',
    'duel.stats_stars':    'Stars',
    'duel.stats_winrate_profile': 'Winrate',
    'duel.stats_best_streak_profile': 'Best streak',
    'duel.profile_title':  '⚔️ DUEL STATS',
    'duel.search_msg_1':   '🤖 Opponent connected a line',
    'duel.search_msg_2':   '🔥 Opponent is speeding up!',
    'duel.search_msg_3':   '⚡ Opponent is close!',
    'duel.search_msg_4':   '👀 Opponent is not lagging behind',
    'duel.opponent_ahead': '⚠️ Opponent is ahead!',
    'duel.opponent_error': '❌ Opponent made an error!',
    'duel.opponent_finished': '🏁 Opponent finished!',
    'duel.opponent_finished_short': 'Opponent finished!',
    'duel.opponent_error_short': 'Opponent made an error!',
    'duel.opponent_line_short': 'Opponent connected a line',
    'duel.lb_title':       '🏆 LEADERBOARD — DUELS',
    'duel.you_short':      ' (you)',

    /* ============================================================
       TASKS
       ============================================================ */
    'task.easy':           'Easy',
    'task.medium':         'Medium',
    'task.hard':           'Hard',
    'task.week_suffix':    ' · week',
    'task.streak':         '🔥 Streak: <b>{s}</b> d · Best: <b>{b}</b>',
    'task.claim':          'Claim',
    'task.all_bonus_daily': '🎁 All 3 tasks bonus: +20 ',
    'task.all_bonus_weekly': '🎁 All 3 tasks bonus: +100 ',
    'task.all_done_daily': '✅ All tasks completed!',
    'task.all_done_weekly': '✅ All weekly tasks completed!',

    'task.play3':          'Complete 3 levels',
    'task.play5':          'Complete 5 levels',
    'task.play10':         'Complete 10 levels',
    'task.connect20':      'Connect 20 lines',
    'task.connect50':      'Connect 50 lines',
    'task.useHint':        'Use a hint',
    'task.earn50':         'Earn 50 coins',
    'task.earn100':        'Earn 100 coins',
    'task.earn250':        'Earn 250 coins',
    'task.duel1':          'Play 1 duel',
    'task.duelWin1':       'Win 1 duel',
    'task.duelWin3':       'Win 3 duels',
    'task.duelWin5':       'Win 5 duels',
    'task.duelPlay3':      'Play 3 duels',
    'task.endless3':       'Complete 3 levels in endless',
    'task.endless5':       'Complete 5 levels in endless',
    'task.endless10':      'Complete 10 levels in endless',
    'task.endless15':      'Complete 15 levels in endless',
    'task.bpTask1':        'Complete 1 FallPass task',
    'task.bpTask3':        'Complete 3 FallPass tasks',
    'task.bpTask5':        'Complete all 5 FallPass tasks',
    'task.bpLevel1':       'Unlock 1 FallPass level',
    'task.bpLevel3':       'Unlock 3 FallPass levels',
    'task.buy1':           'Buy 1 item in shop',
    'task.buy3':           'Buy 3 items in shop',
    'task.useBooster1':    'Use 1 booster',
    'task.openChest1':     'Open 1 chest',
    'task.chest3':         'Open 3 chests',
    'task.dailyBonus':     'Claim daily bonus',
    'task.playRegion1':    'Complete 1 adventure level',
    'task.region3':        'Complete 3 levels in one region',
    'task.region10':       'Complete 10 levels in one region',
    'task.fast3':          'Complete 3 levels in a minute',
    'task.fast5':          'Complete 5 levels in 2 minutes',
    'task.noHint3':        'Complete 3 levels without hints',
    'task.noHint5':        'Complete 5 levels without hints',
    'task.perfect5':       'Complete 5 levels without mistakes',

    'task.w_play50':       'Complete 50 levels',
    'task.w_play150':      'Complete 150 levels',
    'task.w_play300':      'Complete 300 levels',
    'task.w_connect200':   'Connect 200 lines',
    'task.w_earn1000':     'Earn 1000 coins',
    'task.w_earn3000':     'Earn 3000 coins',
    'task.w_duelPlay15':   'Play 15 duels',
    'task.w_duelWin10':    'Win 10 duels',
    'task.w_duelWin30':    'Win 30 duels',
    'task.w_endless50':    'Complete 50 levels in endless',
    'task.w_endless100':   'Complete 100 levels in endless',
    'task.w_endless250':   'Complete 250 levels in endless',
    'task.w_bpLevel10':    'Unlock 10 FallPass levels',
    'task.w_bpLevel30':    'Unlock 30 FallPass levels',
    'task.w_region50':     'Complete 50 adventure levels',

    /* FallPass tasks */
    'task.bp_play_10':     'Complete 10 levels',
    'task.bp_play_15':     'Complete 15 levels',
    'task.bp_play_20':     'Complete 20 levels',
    'task.bp_play_25':     'Complete 25 levels',
    'task.bp_play_30':     'Complete 30 levels',
    'task.bp_play_50':     'Complete 50 levels',
    'task.bp_connect_100': 'Connect 100 lines',
    'task.bp_connect_150': 'Connect 150 lines',
    'task.bp_connect_200': 'Connect 200 lines',
    'task.bp_connect_250': 'Connect 250 lines',
    'task.bp_hint_3':      'Use 3 hints',
    'task.bp_hint_4':      'Use 4 hints',
    'task.bp_hint_5':      'Use 5 hints',
    'task.bp_earn_200':    'Earn 200 coins',
    'task.bp_earn_300':    'Earn 300 coins',
    'task.bp_earn_400':    'Earn 400 coins',
    'task.bp_earn_500':    'Earn 500 coins',
    'task.bp_earn_1000':   'Earn 1000 coins',
    'task.bp_spend_100':   'Spend 100 coins in shop',
    'task.bp_spend_200':   'Spend 200 coins in shop',
    'task.bp_spend_300':   'Spend 300 coins in shop',
    'task.bp_spend_400':   'Spend 400 coins in shop',
    'task.bp_spend_500':   'Spend 500 coins in shop',
    'task.bp_chest_1':     'Open 1 chest',
    'task.bp_chest_2':     'Open 2 chests',
    'task.bp_chest_3':     'Open 3 chests',
    'task.bp_duel_3':      'Play 3 duels',
    'task.bp_duel_5':      'Play 5 duels',
    'task.bp_duel_7':      'Play 7 duels',
    'task.bp_duel_10':     'Play 10 duels',
    'task.bp_duel_win_1':  'Win 1 duel',
    'task.bp_duel_win_2':  'Win 2 duels',
    'task.bp_duel_win_3':  'Win 3 duels',
    'task.bp_duel_win_4':  'Win 4 duels',
    'task.bp_duel_win_5':  'Win 5 duels',
    'task.bp_duel_win_10': 'Win 10 duels',
    'task.bp_endless_5':   'Complete 5 endless levels',
    'task.bp_endless_10':  'Complete 10 endless levels',
    'task.bp_endless_15':  'Complete 15 endless levels',
    'task.bp_boss_1':      'Defeat 1 boss',
    'task.bp_boss_2':      'Defeat 2 bosses',
    'task.bp_boss_3':      'Defeat 3 bosses',
    'task.bp_no_hint_3':   'Complete 3 levels without hints',
    'task.bp_no_hint_5':   'Complete 5 levels without hints',
    'task.bp_no_hint_7':   'Complete 7 levels without hints',
    'task.bp_fast_3':      'Complete 3 levels in a minute',
    'task.bp_fast_5':      'Complete 5 levels in 2 minutes',
    'task.bp_fast_7':      'Complete 7 levels in 3 minutes',
    'task.bp_buy_theme_1': 'Buy 1 theme',
    'task.bp_buy_trail_1': 'Buy 1 trail',
    'task.bp_buy_bg_1':    'Buy 1 background',

    /* ============================================================
       ACHIEVEMENTS
       ============================================================ */
    'ach.first':           'First Victory',
    'ach.first_desc':      'Complete 1 level',
    'ach.ten':             'The Ten',
    'ach.ten_desc':        'Complete 10 levels',
    'ach.fifty':           'Fifty',
    'ach.fifty_desc':      'Complete 50 levels',
    'ach.hundred':         'One Hundred',
    'ach.hundred_desc':    'Complete 100 levels',
    'ach.two_fifty':       'Two Hundred Fifty',
    'ach.two_fifty_desc':  'Complete 250 levels',
    'ach.five_hundred':    'Five Hundred',
    'ach.five_hundred_desc': 'Complete 500 levels',
    'ach.thousand':        'One Thousand',
    'ach.thousand_desc':   'Complete 1000 levels',
    'ach.ten_thousand':    'Ten Thousand',
    'ach.ten_thousand_desc': 'Complete 10000 levels',
    'ach.rich':            'Rich',
    'ach.rich_desc':       'Accumulate 1000 coins',
    'ach.collector':       'Collector',
    'ach.collector_desc':  'Buy 5 themes',
    'ach.buy10':           'Shopaholic',
    'ach.buy10_desc':      'Buy 10 items',
    'ach.speedster':       'Speedster',
    'ach.speedster_desc':  'Complete a level in 15 seconds',
    'ach.noHint':          'Self-Made Master',
    'ach.noHint_desc':     'Complete 20 levels without hints',
    'ach.no_hint_50':      'Master Without Hints',
    'ach.no_hint_50_desc': 'Complete 50 levels without hints',
    'ach.daily7':          'Loyal Friend',
    'ach.daily7_desc':     'Log in 7 days in a row',
    'ach.tasks20':         'Diligent',
    'ach.tasks20_desc':    'Complete 20 tasks',
    'ach.level10':         'Experienced',
    'ach.level10_desc':    'Reach player level 10',
    'ach.endless10':       'Endless Hero',
    'ach.endless10_desc':  'Complete 10 endless levels',
    'ach.endless_25':      'Endless 25',
    'ach.endless_25_desc': 'Complete 25 endless levels',
    'ach.endless_50':      'Endless 50',
    'ach.endless_50_desc': 'Complete 50 endless levels',
    'ach.endless_100':     'Endless 100',
    'ach.endless_100_desc': 'Complete 100 endless levels',
    'ach.endless_250':     'Endless 250',
    'ach.endless_250_desc': 'Complete 250 endless levels',
    'ach.endless_500':     'Endless 500',
    'ach.endless_500_desc': 'Complete 500 endless levels',
    'ach.endless_1000':    'Endless 1000',
    'ach.endless_1000_desc': 'Complete 1000 endless levels',
    'ach.region_japan':    'Samurai',
    'ach.region_japan_desc': 'Complete Japan',
    'ach.region_italy':    'Gondolier',
    'ach.region_italy_desc': 'Complete Italy',
    'ach.region_france':   'Artist',
    'ach.region_france_desc': 'Complete France',
    'ach.region_russia':   'Winter Conqueror',
    'ach.region_russia_desc': 'Complete Russia',
    'ach.region_usa':      'Freedom',
    'ach.region_usa_desc': 'Complete USA',
    'ach.region_brazil':   'Dancer',
    'ach.region_brazil_desc': 'Complete Brazil',
    'ach.region_china':    'Dragon Tamer',
    'ach.region_china_desc': 'Complete China',
    'ach.region_germany':  'Castle Keeper',
    'ach.region_germany_desc': 'Complete Germany',
    'ach.region_australia': 'Surfer',
    'ach.region_australia_desc': 'Complete Australia',
    'ach.region_iceland':  'Ice Hero',
    'ach.region_iceland_desc': 'Complete Iceland',
    'ach.all_regions':     'Around the World',
    'ach.all_regions_desc': 'Complete all 10 regions',
    'ach.boss_all':        'Boss Conqueror',
    'ach.boss_all_desc':   'Defeat all 10 bosses',
    'ach.bp50':            'FallPass 50',
    'ach.bp50_desc':       'Reach FallPass level 50',
    'ach.duel_10':         'Duelist',
    'ach.duel_10_desc':    'Win 10 duels',
    'ach.duel_25':         'Warrior',
    'ach.duel_25_desc':    'Win 25 duels',
    'ach.duel_50':         'Gladiator',
    'ach.duel_50_desc':    'Win 50 duels',
    'ach.duel_100':        'Sniper',
    'ach.duel_100_desc':   'Win 100 duels',
    'ach.duel_250':        'Arena Legend',
    'ach.duel_250_desc':   'Win 250 duels',
    'ach.duel_1000':       'Arena Lord',
    'ach.duel_1000_desc':  'Win 1000 duels',
    'ach.rank_wood':       'Wood',
    'ach.rank_wood_desc':  'Earn 1 star in duels',
    'ach.rank_iron':       'Iron',
    'ach.rank_iron_desc':  'Reach Iron rank',
    'ach.rank_silver':     'Silver',
    'ach.rank_silver_desc': 'Reach Silver rank',
    'ach.rank_gold':       'Gold',
    'ach.rank_gold_desc':  'Reach Gold rank',
    'ach.rank_ruby':       'Ruby',
    'ach.rank_ruby_desc':  'Reach Ruby rank',
    'ach.rank_emerald':    'Emerald',
    'ach.rank_emerald_desc': 'Reach Emerald rank',
    'ach.rank_diamond':    'Diamond',
    'ach.rank_diamond_desc': 'Reach Diamond rank',
    'ach.rank_legend':     'Legend',
    'ach.rank_legend_desc': 'Reach Legend rank',

    /* ============================================================
       REGIONS
       ============================================================ */
    'region.japan':        'Japan',
    'region.italy':        'Italy',
    'region.france':       'France',
    'region.russia':       'Russia',
    'region.usa':          'USA',
    'region.brazil':       'Brazil',
    'region.china':        'China',
    'region.germany':      'Germany',
    'region.australia':    'Australia',
    'region.iceland':      'Iceland',
    'region.travel':       '🌍 ADVENTURE',
    'region.progress':     'Progress: ',
    'region.completed':    '🏆 Region completed!',
    'region.locked':       '🔒 Complete the previous level',
    'region.locked_wave':  '🔒 Complete {n} more levels',
    'region.victory_title': '{name} COMPLETED!',
    'region.victory_sub':  'You completed all 10 levels of the region',
    'region.victory_rewards': 'Rewards received:',
    'region.victory_theme': 'Theme «{name}»',
    'region.victory_theme_desc': 'Unique theme of the region',
    'region.victory_trail': 'Trail «{name}»',
    'region.victory_trail_desc': 'Unique trail of the region',
    'region.victory_ach':  'Achievement «{name}»',
    'region.victory_gems': '+{n} gems',
    'region.victory_gems_desc': 'Bonus for full completion',
    'region.victory_continue': 'Continue',
    'region.wave_opened':  '🎉 WAVE {n} UNLOCKED!',
    'region.select_pawn':  'Choose your traveler',
    'region.select_pawn_sub': 'He will move around the world map',
    'region.pawn_boy':     'Max',
    'region.pawn_girl':    'Aya',

    'boss.defeated':       '{name} DEFEATED!',
    'boss.region':         'Region: {flag} {name}',
    'boss.rewards':        'Rewards:',
    'boss.reward_coins':   '+{n} coins',
    'boss.reward_xp':      '+{n} XP',
    'boss.reward_gems':    '+{n} gems',
    'boss.claim':          'Claim rewards',
    'boss.name_default':   'BOSS',
    'boss.name_japan':     '🐉 YAMATO DRAGON',
    'boss.name_italy':     '🏛️ COLOSSEUM',
    'boss.name_france':    '🎭 LOUVRE SPIRIT',
    'boss.name_russia':    '🐻 MASTER BEAR',
    'boss.name_usa':       '🦅 FREEDOM EAGLE',
    'boss.name_brazil':    '🦜 MACAW PARROT',
    'boss.name_china':     '🐲 CHINESE DRAGON',
    'boss.name_germany':   '🦌 GUARDIAN DEER',
    'boss.name_australia': '🐊 CROCODILE LORD',
    'boss.name_iceland':   '❄️ ICE SPIRIT',

    /* ============================================================
       THEMES
       ============================================================ */
    'theme.default':       'Classic',
    'theme.dark':          'Dark',
    'theme.retro':         'Retro',
    'theme.oriental':      'Japanese',
    'theme.ocean':         'Ocean',
    'theme.gradient':      'Gradient',
    'theme.pastel':        'Pastel',
    'theme.neon':          'Neon',
    'theme.cosmic':        'Cosmos',
    'theme.glitch':        'Glitch',
    'theme.metallic':      'Metallic',
    'theme.fire':          'Fire',
    'theme.gems':          'Gems',
    'theme.r_sakura':      'Sakura',
    'theme.r_venice':      'Venice',
    'theme.r_lavender':    'Lavender',
    'theme.r_winter':      'Winter',
    'theme.r_vegas':       'Vegas',
    'theme.r_carnival':    'Carnival',
    'theme.r_dragon':      'Dragon',
    'theme.r_forest':      'Forest',
    'theme.r_outback':     'Outback',
    'theme.r_aurora':      'Aurora',
    'theme.anime':         'Anime',

    /* ============================================================
       BACKGROUNDS
       ============================================================ */
    'bg.void':             'Dark Void',
    'bg.stars':            'Starry Sky',
    'bg.waves':            'Waves',
    'bg.bubbles':          'Bubbles',
    'bg.aurora':           'Aurora',
    'bg.matrix':           'Matrix',
    'bg.nebula':           'Nebula',
    'bg.snow':             'Snow',
    'bg.neural':           'Neural Network',
    'bg.anime_forest':     'Autumn Forest',

    /* ============================================================
       TRAILS
       ============================================================ */
    'trail.default':       'Classic',
    'trail.lightning':     'Lightning',
    'trail.spores':        'Spores',
    'trail.butterflies':   'Butterflies',
    'trail.comet':         'Comet',
    'trail.magic':         'Magic',
    'trail.ghosts':        'Ghosts',
    'trail.curse':         'Curse',
    'trail.shooting_star': 'Shooting Star',
    'trail.nebula':        'Nebula',
    'trail.black_hole':    'Black Hole',
    'trail.crystals':      'Crystals',
    'trail.paint':         'Paint',
    'trail.web':           'Web',
    'trail.constellation': 'Constellation',
    'trail.quantum':       'Quantum',
    'trail.sakura':        'Sakura Petals',
    'trail.bubbles':       'Venice Bubbles',
    'trail.lavender':      'Lavender',
    'trail.snowflake':     'Snowflakes',
    'trail.sparks':        'Neon Sparks',
    'trail.rainbow':       'Carnival',
    'trail.fire':          'Dragon Fire',
    'trail.leaves':        'Autumn Leaves',
    'trail.water':         'Ocean Waves',
    'trail.aurora':        'Aurora',
    'trail.anime':         'Anime',

    /* ============================================================
       BATTLE PASS
       ============================================================ */
    'bp.tasks_title':      '📋 DAILY TASKS',
    'bp.tasks_timer':      'Resets in ',
    'bp.tasks_timer_placeholder': 'Resets in 24:00:00',
    'bp.shop':             'SHOP',
    'bp.shop_empty_title': 'Items coming soon!',
    'bp.shop_empty_text':  'We are preparing exclusive autumn rewards. Check back later 🍂',
    'bp.upgrade':          'UPGRADE BP',
    'bp.premium_active':   'PREMIUM ACTIVE',
    'bp.level_label':      'LEVEL',
    'bp.level_text':       'LEVEL {n} / 50',
    'bp.card_level_short': 'LVL.',
    'bp.xp_text':          '{cur} / {max} XP',
    'bp.claim':            'CLAIM',
    'bp.claim_premium':    'CLAIM PREMIUM',
    'bp.claim_all':        'CLAIM ALL',
    'bp.claimed':          '✓ CLAIMED',
    'bp.task_claimed':     '✓ Claimed',
    'bp.received':         'Received!',
    'bp.upgrade_title':    '⭐ Upgrade FallPass',
    'bp.upgrade_text_1':   'Upgrade FallPass and get <b>extra rewards</b> on every level!',
    'bp.upgrade_text_2':   '⭐ <b>Premium track</b> — second rewards track',
    'bp.upgrade_text_3':   'More leaves, coins and gems',
    'bp.upgrade_cost':     'Cost: <b>{gems} <span class="gem-icon"></span></b> or <b>watch {ads} ads</b>',
    'bp.upgrade_watched':  'Watched: {cur} / {max}',
    'bp.upgrade_gems_btn': '{n} 💎',
    'bp.upgrade_ads_btn':  '📺 Ad ({cur}/{max})',
    'bp.upgrade_cancel':   'Cancel',
    'bp.premium_activated': '⭐ Premium activated!',
    'bp.ad_watched':       '📺 Watched {cur} / {max}',
    'bp.premium_already':  'Premium is already active',
    'bp.not_enough_gems':  'Not enough gems',
    'bp.balance':          'Your balance:',
    'bp.item_bought':      'OWNED',
    'bp.item_buy':         'BUY',
    'bp.chest_name':       'FallPass Chest',
    'bp.chest_desc':       'Random reward: coins, gems, leaves or exclusive',
    'bp.chest_title':      'FallPass Chest',
    'bp.chest_short':      'Chest',
    'bp.exchange_coins':   '{rate} coins per 1 leaf',
    'bp.exchange_gems':    '{rate} gems per 1 leaf',
    'bp.chest_again':      '🎁 Open another one ({n} ',
    'bp.chest_claim':      'Claim',
    'bp.chest_owned_toast': '(already owned) → +60 ',
    'bp.level_up_toast':   '🏆 FallPass level {n}!',

    /* BP rewards */
    'bp.reward_leaves_5':   '5 leaves',
    'bp.reward_coins_50':   '50 coins',
    'bp.reward_coins_100':  '100 coins',
    'bp.reward_gems_10':    '10 gems',
    'bp.reward_gems_25':    '25 gems',
    'bp.reward_booster_time': 'Booster +45 sec',
    'bp.reward_chest':      'Chest',

    /* ============================================================
       SHOP / INVENTORY
       ============================================================ */
    'shop.title':          '🛒 Shop',
    'shop.tab_themes':     'Themes',
    'shop.tab_backgrounds': 'Backgrounds',
    'shop.tab_trails':     'Trails',
    'shop.tab_boosters':   'Boosters',
    'shop.tab_chests':     'Chests',
    'shop.close':          'Close',
    'shop.all_themes_bought': 'All themes purchased!',
    'shop.all_bg_bought':  'All backgrounds purchased!',
    'shop.all_trails_bought': 'All trails purchased!',
    'shop.booster_time_name': '+45 seconds',
    'shop.booster_time_desc': 'Adds 45 sec (endless/challenge only)',
    'shop.booster_reveal_name': 'Solution',
    'shop.booster_reveal_desc': 'Shows the solution for 3 sec',
    'shop.booster_skip_name': 'Skip',
    'shop.booster_skip_desc': 'Skips the level (except bosses)',
    'shop.booster_added':  '+1 booster!',
    'shop.chest_desc':     'Chest with a random reward!',
    'shop.chest_buy_coins': 'Open for 100 ',
    'shop.chest_buy_gems': 'Open for 20 ',
    'shop.chest_again_coins': '🎁 Open another one (100 ',

    'inv.title':           '🎒 Inventory',
    'inv.active':          '✓ Active',
    'inv.active_bg':       '✓ Active',
    'inv.select':          'Select',

    /* ============================================================
       PROFILE / LEADERBOARD / ACHIEVEMENTS MODAL
       ============================================================ */
    'profile.title':       'Profile',
    'profile.xp':          '{cur}/{max} XP',
    'profile.total_xp':    'Total XP',
    'profile.level':       'Player level',
    'profile.level_short': 'Level',
    'profile.levels_done': 'Levels completed',
    'profile.challenges':  'Challenges',
    'profile.endless_best': 'Endless record',
    'profile.achievements': 'Achievements',
    'profile.total_coins': 'Total coins',
    'profile.time':        'Time played',
    'profile.leaves':      'Leaves',
    'profile.duel_title':  '⚔️ DUEL STATS',
    'profile.duel_rank':   'Rank',
    'profile.duel_stars':  'Stars',
    'profile.duel_total':  'Total games',
    'profile.duel_wins':   'Wins',
    'profile.duel_loses':  'Losses',
    'profile.duel_winrate': 'Winrate',
    'profile.duel_best_streak': 'Best streak',
    'profile.close':       'Close',

    'lb.title':            '🏅 Leaderboard',
    'lb.tab_levels':       'Levels completed',
    'lb.tab_endless':      'Endless',
    'lb.tab_duel':         'Duels',
    'lb.you':              ' (you)',
    'lb.your_place':       'Your place:',
    'lb.close':            'Close',

    'ach_modal.title':     '🏆 Achievements',
    'ach_modal.progress':  'Unlocked: <b>{cur} / {total}</b>',
    'ach_modal.close':     'Close',

    /* ============================================================
       DAILY BONUS
       ============================================================ */
    'daily.title':         '🎁 Daily bonus',
    'daily.sub':           'Log in every day and get rewards!',
    'daily.day':           'Day {n}',
    'daily.streak':        'Streak: {n} days',
    'daily.claim':         'Claim reward',
    'daily.reset':         '🔄 Reset streak (30 ',
    'daily.reset_toast':   'Streak reset!',

    /* ============================================================
       SETTINGS
       ============================================================ */
    'settings.title':      '⚙️ Settings',
    'settings.sound':      'Sound',
    'settings.music':      'Music',
    'settings.volume':     'Volume',
    'settings.language':   'Language',
    'settings.close':      'Close',

    /* ============================================================
       TUTORIAL
       ============================================================ */
    'tut.header_label':    'Tutorial · Step',
    'tut.step':            '🎓 Tutorial · Step {cur}/{total}',
    'tut.skip':            'Skip ✕',
    'tut.next':            'Next →',
    'tut.finish':          '🎮 Start playing',
    'tut.hint1':           '🎯<span class="space"></span><b>Goal:</b><span class="space"></span>connect pairs of dots of the same color with lines.',
    'tut.hint2':           '👆<span class="space"></span><b>Drag the line</b><span class="space"></span>from dot to dot of the same color.',
    'tut.hint3':           '⚠️<span class="space"></span><b>Main rule:</b><span class="space"></span>the line must fill ALL cells.',
    'tut.hint4':           '🚫<span class="space"></span><b>Lines must not cross.</b>',
    'tut.hint5':           '✅<span class="space"></span><b>Done!</b><span class="space"></span>Good luck!',

    /* ============================================================
       COMMON
       ============================================================ */
    'common.back':         'Back',
    'common.cancel':       'Cancel',
    'common.yes':          'Yes',
    'common.no':           'No',
    'common.close':        'Close',
    'common.player':       'Player',
    'common.days_short':   'd',

    /* ============================================================
       BOTS
       ============================================================ */
    'bot.novice':          'Novice',
    'bot.amateur':         'Amateur',
    'bot.pro':             'Pro',
    'bot.champion':        'Champion',

    /* ============================================================
       RANKS
       ============================================================ */
    'rank.wood':           'Wood',
    'rank.iron':           'Iron',
    'rank.silver':         'Silver',
    'rank.gold':           'Gold',
    'rank.ruby':           'Ruby',
    'rank.emerald':        'Emerald',
    'rank.diamond':        'Diamond',
    'rank.legend':         'Legend',

    /* ============================================================
       PRIZES (chests)
       ============================================================ */
    'prize.coins_50':      '50 coins',
    'prize.coins_100':     '100 coins',
    'prize.coins_200':     '200 coins',
    'prize.coins_300':     '300 coins',
    'prize.coins_500':     '500 coins',
    'prize.leaves_5':      '5 leaves',
    'prize.leaves_10':     '10 leaves',
    'prize.leaves_15':     '15 leaves',
    'prize.leaves_20':     '20 leaves',
    'prize.leaves_50':     '50 leaves',
    'prize.gems_5':        '5 gems',
    'prize.gems_10':       '10 gems',
    'prize.gems_15':       '15 gems',
    'prize.gems_25':       '25 gems',
    'prize.gems_30':       '30 gems',
    'prize.gems_50':       '50 gems',
    'prize.gems_100':      '100 gems',
    'prize.bg_anime_forest': 'Background «Autumn Forest»',
    'prize.theme_anime':   'Theme «Anime»',
    'prize.trail_anime':   'Trail «Anime»',

    /* ============================================================
       CHEST REWARD
       ============================================================ */
    'chest.title':         '🎁 Opening chest',
    'chest.claim':         'Claim',
    'chest.reward_coins':  '+{n} coins!',
    'chest.reward_gems':   '+{n} gems!',
    'chest.reward_booster_time': 'Booster «+45 sec»!',
    'chest.reward_booster_reveal': 'Booster «Solution»!',
    'chest.reward_booster_skip': 'Booster «Skip»!',

    /* ============================================================
       CONFIRM
       ============================================================ */
    'confirm.title':       'Confirm action',

    /* ============================================================
       ENDLESS — RESUME
       ============================================================ */
    'endless.saved_title': '♾ Endless mode',
    'endless.saved_text':  'You have a saved game.',
    'endless.resume':      '▶ Continue',
    'endless.new_game':    '🆕 New game'
  }
};

/* ============================================================
   ОСНОВНЫЕ ФУНКЦИИ
   ============================================================ */

/**
 * Получить текущий язык
 */
function getLang() {
  return (window.YandexSDK && YandexSDK.lang) || 'ru';
}

/**
 * Получить перевод по ключу
 * @param {string} key — ключ (например 'menu.play')
 * @param {string} fallback — что вернуть, если нет перевода
 * @param {object} params — {n: 5} → подставит в {n}
 */
function t(key, fallback, params) {
  var lang = getLang();
  var dict = window.TRANSLATIONS[lang] || window.TRANSLATIONS.ru;
  var str = (dict && dict[key] !== undefined) ? dict[key] : (fallback !== undefined ? fallback : key);

  // Подставляем параметры {n}, {cur}, {max} и т.д.
  if (params && typeof str === 'string') {
    for (var k in params) {
      str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
    }
  }

  return str;
}

/**
 * Перевести DOM-элемент и все его дочерние [data-i18n]
 */
function translateDOM(root) {
  if (!root) root = document;

  var els = root.querySelectorAll('[data-i18n]');
  els.forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key, el.textContent);
  });

  var inputs = root.querySelectorAll('[data-i18n-placeholder]');
  inputs.forEach(function(el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (key) el.placeholder = t(key, el.placeholder);
  });

  var titleEls = root.querySelectorAll('[data-i18n-title]');
  titleEls.forEach(function(el) {
    var key = el.getAttribute('data-i18n-title');
    if (key) el.title = t(key, el.title);
  });
}

/**
 * Сменить язык вручную (для кнопки в настройках)
 */
function setLang(lang) {
  if (lang !== 'ru' && lang !== 'en') return;
  if (window.YandexSDK) YandexSDK.lang = lang;
  try { localStorage.setItem('flow_lang', lang); } catch (e) {}

  document.documentElement.lang = lang;
  document.title = t('app.title', 'Поток');

  translateDOM(document);
}

/**
 * Загрузить сохранённый язык (приоритет: localStorage > SDK > браузер)
 */
function initLang() {
  var saved = null;
  try { saved = localStorage.getItem('flow_lang'); } catch (e) {}
  if (saved === 'ru' || saved === 'en') {
    if (window.YandexSDK) YandexSDK.lang = saved;
  }

  document.documentElement.lang = getLang();
  document.title = t('app.title', 'Поток');
}
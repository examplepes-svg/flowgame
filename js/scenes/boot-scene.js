var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function BootScene() { Phaser.Scene.call(this, { key: 'Boot' }); },

  preload: function() {
    // Загрузка спрайт-листа лиц для темы «Аниме» (4×2 = 8 лиц по 512×512)
    this.load.spritesheet('faces', 'assets/faces/faces_grid.png', {
      frameWidth: 512,
      frameHeight: 512
    });
  },

  create: function() {
    var self = this;
    var w = this.scale.width, h = this.scale.height;
    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.add.text(w/2, h/2, t('app.title', 'ПОТОК'), {
      fontSize: '48px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // === PATCH: заглушка ориентации для мобильных (только портрет) ===
    this.setupOrientationLock();

    var done = false;
    var finish = function(saved) {
      if (done) return; done = true;
      var state = mergeState(saved);

      if (typeof resetOldBattlePass === 'function') {
        state = resetOldBattlePass(state);
      }

      // Метка времени для разрешения конфликтов локального/облачного сейва
      if (!state._savedAt) state._savedAt = Date.now();

      state.playerLevel = PlayerLevels.getLevel(state.totalXp);
      if (!YandexSDK.playerName) YandexSDK.playerName = generateRandomName();
      self.registry.set('state', state);

      // Устанавливаем язык и переводим статический DOM (splash и т.п.)
      if (typeof initLang === 'function') initLang();
      if (typeof translateDOM === 'function') translateDOM(document);

      self.input.once('pointerdown', function() { try { SoundManager.init(); } catch(e){} });
      self.scene.start('Menu');
    };

    YandexSDK.init()
      .then(function() { return YandexSDK.loadProgress(); })
      .then(finish)
      .catch(function() { finish(null); });

    setTimeout(function() { if (!done) finish(null); }, 3000);
  },

  /* ============================================================
     PATCH: ЗАГЛУШКА ОРИЕНТАЦИИ
     На мобильных принудительно портрет. При повороте в landscape
     показываем HTML-оверлей "Поверните устройство".
     На ПК ничего не делаем.
     ============================================================ */
  setupOrientationLock: function() {
    var self = this;
    var overlay = document.getElementById('orientation-lock-overlay');
    if (!overlay) {
      // Если оверлея нет в HTML — просто выходим, игра работает как есть
      return;
    }

    // Мобильное ли устройство?
    var isMobile = false;

    // 1. Пытаемся через YandexSDK (может быть ещё не инициализирован)
    if (window.YandexSDK && YandexSDK.ysdk && YandexSDK.ysdk.deviceInfo) {
      try {
        if (typeof YandexSDK.ysdk.deviceInfo.isMobile === 'function') {
          isMobile = YandexSDK.ysdk.deviceInfo.isMobile();
        } else if (typeof YandexSDK.ysdk.deviceInfo.isMobile === 'boolean') {
          isMobile = YandexSDK.ysdk.deviceInfo.isMobile;
        }
      } catch (e) {}
    }

    // 2. Fallback на User-Agent
    if (!isMobile) {
      isMobile = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent);
    }

    if (!isMobile) return; // на ПК — не блокируем

    var checkOrientation = function() {
      var isPortrait = window.innerHeight > window.innerWidth;
      if (isPortrait) {
        overlay.style.display = 'none';
        if (self.input) self.input.enabled = true;
      } else {
        overlay.style.display = 'flex';
        if (self.input) self.input.enabled = false;
      }
    };

    // Первая проверка — сразу
    checkOrientation();

    // Слушаем изменения
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', function() {
      // На Android orientationchange срабатывает раньше, чем обновятся
      // innerWidth / innerHeight. Небольшая задержка — и проверяем снова.
      setTimeout(checkOrientation, 100);
    });

    // На всякий случай — экран может начать в портрете, а потом повернуться,
    // даже до того как Phaser полностью инициализируется.
    // Запустим отложенную проверку через 500 мс.
    setTimeout(checkOrientation, 500);
  }
});
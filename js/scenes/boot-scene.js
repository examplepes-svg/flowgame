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
  }
});
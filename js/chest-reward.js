/* ============================================================
   СУНДУК-НАГРАДА — автоматически открывается после босса
   ============================================================ */

var ChestReward = {
  onComplete: null,

  open: function(onComplete) {
    this.onComplete = onComplete || function() {};

    var overlay = document.getElementById('chest-overlay');
    if (!overlay) { this.onComplete(); return; }

    // Награды (как в магазине) — name через геттеры t()
    var prizes = [];
    prizes.push({ type: 'coins', value: 50,  icon: '<span class="coin-icon"></span>', get name() { return t('prize.coins_50',  '50 монет'); },   weight: 40,  tier: 'common' });
    prizes.push({ type: 'coins', value: 100, icon: '<span class="coin-icon"></span>', get name() { return t('prize.coins_100', '100 монет'); },  weight: 25,  tier: 'common' });
    prizes.push({ type: 'coins', value: 200, icon: '<span class="coin-icon"></span>', get name() { return t('prize.coins_200', '200 монет'); },  weight: 12,  tier: 'common' });
    prizes.push({ type: 'coins', value: 500, icon: '<span class="coin-icon"></span>', get name() { return t('prize.coins_500', '500 монет'); },  weight: 4,   tier: 'common' });
    prizes.push({ type: 'gems',  value: 5,   icon: '<span class="gem-icon"></span>',  get name() { return t('prize.gems_5',    '5 алмазов'); },  weight: 18,  tier: 'common' });
    prizes.push({ type: 'gems',  value: 15,  icon: '<span class="gem-icon"></span>',  get name() { return t('prize.gems_15',   '15 алмазов'); }, weight: 10,  tier: 'common' });
    prizes.push({ type: 'gems',  value: 30,  icon: '<span class="gem-icon"></span>',  get name() { return t('prize.gems_30',   '30 алмазов'); }, weight: 5,   tier: 'rare' });
    prizes.push({ type: 'gems',  value: 50,  icon: '<span class="gem-icon"></span>',  get name() { return t('prize.gems_50',   '50 алмазов'); }, weight: 2.5, tier: 'rare' });
    prizes.push({ type: 'gems',  value: 100, icon: '<span class="gem-icon"></span>',  get name() { return t('prize.gems_100',  '100 алмазов'); }, weight: 1,  tier: 'rare' });

    var totalWeight = prizes.reduce(function(s, p) { return s + p.weight; }, 0);
    var roll = Math.random() * totalWeight;
    var winner = prizes[0]; var acc = 0;
    for (var i = 0; i < prizes.length; i++) { acc += prizes[i].weight; if (roll <= acc) { winner = prizes[i]; break; } }

    var itemWidth = 130; var reelLength = 50; var winnerIndex = 42;
    var trackItems = [];
    for (var j = 0; j < reelLength; j++) { if (j === winnerIndex) trackItems.push(winner); else trackItems.push(prizes[Math.floor(Math.random() * prizes.length)]); }

    var track = document.getElementById('chest-track');
    if (!track) { this.onComplete(); return; }
    track.innerHTML = ''; track.style.transition = 'none'; track.style.transform = 'translateX(0px)';

    trackItems.forEach(function(p) {
      var div = document.createElement('div'); div.className = 'chest-item';
      div.innerHTML = '<div class="chest-item-icon">' + p.icon + '</div><div class="chest-item-name">' + p.name + '</div>';
      track.appendChild(div);
    });

    var resultEl = document.getElementById('chest-result'); if (resultEl) resultEl.textContent = '';
    var closeBtn = document.getElementById('chest-close'); var againBtn = document.getElementById('chest-again');
    if (closeBtn) closeBtn.style.display = 'none';
    if (againBtn) againBtn.style.display = 'none';

    var chancesEl = document.getElementById('chest-chances');
    if (chancesEl) chancesEl.innerHTML = '';

    // Заголовок
    var titleEl = document.getElementById('chest-title');
    if (titleEl) titleEl.textContent = t('chest.title', '🎁 Открытие сундука');

    overlay.classList.add('active');

    var containerWidth = track.parentElement.offsetWidth || 400;
    var centerOffset = containerWidth / 2;
    var winnerCenter = winnerIndex * itemWidth + itemWidth / 2;
    var finalOffset = -(winnerCenter - centerOffset) + (Math.random() - 0.5) * 60;

    setTimeout(function() {
      track.style.transition = 'transform 6s cubic-bezier(0.15, 0.85, 0.25, 1)';
      track.style.transform = 'translateX(' + finalOffset + 'px)';
    }, 50);

    var tickCount = 0;
    var tickInterval = setInterval(function() { if (tickCount >= 30) { clearInterval(tickInterval); return; } if (window.SoundManager) SoundManager.tick(); tickCount++; }, 200);

    var self = this;
    setTimeout(function() {
      clearInterval(tickInterval);
      if (window.SoundManager) SoundManager.reveal();

      var resultText = '';
      var state = window.game ? window.game.scene.getScene('Menu').registry.get('state') : null;

      if (state) {
        if (winner.type === 'coins') {
          state.coins += winner.value;
          state.stats.totalCoins += winner.value;
          resultText = '<span class="coin-icon"></span> ' + t('chest.reward_coins', '+{n} монет!', { n: winner.value });
        }
        else if (winner.type === 'gems') {
          state.gems += winner.value;
          resultText = '<span class="gem-icon"></span> ' + t('chest.reward_gems', '+{n} алмазов!', { n: winner.value });
        }
        else if (winner.type === 'booster_time') {
          state.boosters.time = (state.boosters.time || 0) + 1;
          resultText = '🕐 ' + t('chest.reward_booster_time', 'Бустер «+45 сек»!');
        }
        else if (winner.type === 'booster_reveal') {
          state.boosters.reveal = (state.boosters.reveal || 0) + 1;
          resultText = '👁 ' + t('chest.reward_booster_reveal', 'Бустер «Решение»!');
        }
        else if (winner.type === 'booster_skip') {
          state.boosters.skip = (state.boosters.skip || 0) + 1;
          resultText = '⏭ ' + t('chest.reward_booster_skip', 'Бустер «Пропуск»!');
        }

        window.game.scene.getScene('Menu').registry.set('state', state);
        if (window.YandexSDK) YandexSDK.saveProgress(state);
      }

      if (resultEl) resultEl.innerHTML = resultText;

      if (closeBtn) {
        closeBtn.style.display = '';
        closeBtn.textContent = t('chest.claim', 'Забрать');
        closeBtn.onclick = function() {
          if (window.SoundManager) SoundManager.click();
          overlay.classList.remove('active');
          self.onComplete();
        };
      }
    }, 6600);
  }
};

window.ChestReward = ChestReward;
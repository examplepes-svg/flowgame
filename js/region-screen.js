/* ============================================================
   ЭКРАН РЕГИОНА — 10 нодов на мини-карте
   ============================================================ */

var RegionScreen = {
  currentRegion: null,

  open: function(regionId) {
    var region = WORLD_REGIONS[regionId];
    if (!region) return;

    this.currentRegion = region;
    WorldMapUI.close();
    this.render(region);

    var overlay = document.getElementById('region-overlay');
    if (overlay) overlay.classList.add('active');
  },

  render: function(region) {
    var overlay = document.getElementById('region-overlay');
    if (!overlay) return;

    var completed = WorldMapProgress.getRegionCompleted(region.id);
    var regionName = getRegionName(region.id);

    var html = '';
    html += '<img src="assets/regions/' + region.id + '.webp" class="region-screen-bg" alt="">';
    html += '<div class="region-screen-dim"></div>';

    html += '<div class="region-screen-header">' +
            '<span class="region-screen-flag">' + region.flag + '</span>' +
            '<span class="region-screen-title">' + regionName + '</span>' +
            '<span class="region-screen-progress">' + completed + ' / 10</span>' +
            '</div>';

    html += '<div class="region-nodes">';
    for (var i = 1; i <= 10; i++) {
      html += this.renderNode(i, completed);
    }
    html += '</div>';

    html += '<div class="region-screen-back" id="region-back">' +
            '<img src="assets/ui/btn_back.png" alt="' + t('common.back', 'Назад') + '">' +
            '</div>';

    overlay.innerHTML = html;
    this.attachEvents(region);
  },

  renderNode: function(levelNum, completed) {
    if (levelNum > 10) return '';

    var isBoss = levelNum === 10;
    var isCompleted = levelNum <= completed;
    var isCurrent = levelNum === completed + 1 && completed < 10;

    var state = 'locked';
    if (isCompleted) state = 'completed';
    else if (isCurrent) state = 'current';

    var nodeFile = 'node_' + state + '.png';
    if (isBoss && isCurrent) nodeFile = 'node_boss.png';

    var col = (levelNum - 1) % 5;
    var row = Math.floor((levelNum - 1) / 5);
    var x = 15 + col * 17.5;
    var y = 45 + row * 20;

    return '<div class="region-node-level ' + state + (isBoss ? ' boss' : '') + '" ' +
           'data-level="' + levelNum + '" ' +
           'style="left: ' + x + '%; top: ' + y + '%;">' +
           '<img src="assets/nodes/' + nodeFile + '" class="node-img" alt="">' +
           '<span class="node-number">' + levelNum + '</span>' +
           '</div>';
  },

  attachEvents: function(region) {
    document.querySelectorAll('.region-node-level').forEach(function(el) {
      el.addEventListener('click', function() {
        var levelNum = parseInt(el.dataset.level);
        var completed = WorldMapProgress.getRegionCompleted(region.id);

        if (levelNum > 10) {
          if (window.UI) UI.showToast(t('region.completed', '🏆 Регион пройден!'));
          return;
        }

        if (completed >= 10) {
          if (window.SoundManager) SoundManager.click();
          RegionScreen.startLevel(region, levelNum);
          return;
        }

        if (levelNum <= completed) {
          if (window.SoundManager) SoundManager.click();
          RegionScreen.startLevel(region, levelNum);
          return;
        }

        if (levelNum === completed + 1) {
          if (window.SoundManager) SoundManager.click();
          RegionScreen.startLevel(region, levelNum);
          return;
        }

        if (window.SoundManager) SoundManager.error();
        if (window.UI) UI.showToast(t('region.locked', '🔒 Пройди предыдущий уровень'));
      });
    });

    var backBtn = document.getElementById('region-back');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        if (window.SoundManager) SoundManager.click();
        RegionScreen.close();
        WorldMapUI.show();
      });
    }
  },

  startLevel: function(region, levelNum) {
    if (levelNum > 10) levelNum = 10;

    this.close();
    if (window.game) {
      window.game.scene.start('Game', {
        level: levelNum,
        mode: 'normal',
        region: region.id
      });
    }
  },

  close: function() {
    var overlay = document.getElementById('region-overlay');
    if (overlay) overlay.classList.remove('active');
  }
};

window.RegionScreen = RegionScreen;
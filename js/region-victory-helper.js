/* ============================================================
   ПОМОЩНИК — проверяет и показывает экран победы над регионом
   ============================================================ */

var RegionVictoryHelper = {
  checkAndShow: function(regionId, onComplete) {
    if (!regionId) { if (onComplete) onComplete(); return; }

    var completed = WorldMapProgress.getRegionCompleted(regionId);

    // Если не 10/10 — пропускаем
    if (completed < 10) {
      if (onComplete) onComplete();
      return;
    }

    // Обновляем текущий регион для фишки
    WorldMapProgress.setCurrentRegion(regionId);

    // Если уже показывали — пропускаем
    var shownKey = 'flow_region_victory_' + regionId;
    if (localStorage.getItem(shownKey) === 'true') {
      if (onComplete) onComplete();
      return;
    }

    // Помечаем как показанный
    localStorage.setItem(shownKey, 'true');

    // Показываем экран победы региона
    RegionVictory.show(regionId, function() {
      RegionVictoryHelper.checkWaveUnlock(regionId, onComplete);
    });
  },

  checkWaveUnlock: function(regionId, onComplete) {
    var data = WorldMapProgress.get();
    var totalLevels = data.totalLevels;

    if (totalLevels >= 30 && !WorldMapProgress.isWaveRevealed(2)) {
      // Показываем через WorldMapUI
    }

    if (totalLevels >= 60 && !WorldMapProgress.isWaveRevealed(3)) {
      // Показываем через WorldMapUI
    }

    if (onComplete) onComplete();
  }
};

window.RegionVictoryHelper = RegionVictoryHelper;
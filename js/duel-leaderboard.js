/* ============================================================
   ДУЭЛИ — лидерборд
   ============================================================ */

var DuelLeaderboard = {
  MAX_SIZE: 250,

  getLocalData: function() {
    var key = 'flow_lb_duel';
    var saved = localStorage.getItem(key);
    if (saved) {
      try {
        var arr = JSON.parse(saved);
        if (arr && arr.length >= 200) return arr;
      } catch (e) {}
    }

    var bots = [];
    var names = ['Алекс', 'Мария', 'Иван', 'Ольга', 'Дмитрий', 'Екатерина', 'Сергей', 'Анна', 'Николай', 'Юлия',
                 'Павел', 'Елена', 'Максим', 'Татьяна', 'Артём', 'Ксения', 'Владимир', 'Дарья', 'Андрей', 'Наталья',
                 'Михаил', 'Оксана', 'Роман', 'Ирина', 'Денис', 'Алиса', 'Борис', 'Вера', 'Глеб', 'Диана',
                 'Егор', 'Жанна', 'Захар', 'Игорь', 'Кристина', 'Леонид', 'Марина', 'Никита', 'Олег', 'Полина'];

    for (var i = 0; i < 250; i++) {
      var score = Math.max(0, 1500 - i * 6 + Math.floor(Math.random() * 20));
      bots.push({
        name: names[i % names.length] + (i >= names.length ? ' ' + Math.floor(i / names.length) : ''),
        score: score,
        isBot: true
      });
    }

    bots.sort(function(a, b) { return b.score - a.score; });
    localStorage.setItem(key, JSON.stringify(bots));
    return bots;
  },

  getLeaderboard: function(playerName, playerScore) {
    return Promise.resolve(this.getLocalWithPlayer(playerName, playerScore));
  },

  getLocalWithPlayer: function(playerName, playerScore) {
    var data = this.getLocalData().slice();
    data.push({ name: playerName, score: playerScore, isMe: true });
    data.sort(function(a, b) { return b.score - a.score; });
    return data;
  },

  getPlayerPlace: function(playerScore) {
    var data = this.getLocalData();
    var place = 1;
    for (var i = 0; i < data.length; i++) {
      if (playerScore > data[i].score) break;
      place++;
    }
    return place;
  }
};

window.DuelLeaderboard = DuelLeaderboard;
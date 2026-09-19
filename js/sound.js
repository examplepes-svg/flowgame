/* ============================================================
   ЗВУКИ
   ============================================================ */
var SoundManager = {
  ctx: null, enabled: true, volume: 0.5, musicEnabled: true, musicTimer: null,
  init: function() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      var saved = localStorage.getItem('flow_sound');
      if (saved) { var s = JSON.parse(saved); this.enabled = s.enabled !== false; this.volume = typeof s.volume === 'number' ? s.volume : 0.5; this.musicEnabled = s.musicEnabled !== false; }
    } catch (e) {}
  },
  save: function() { try { localStorage.setItem('flow_sound', JSON.stringify({ enabled: this.enabled, volume: this.volume, musicEnabled: this.musicEnabled })); } catch (e) {} },
  resume: function() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  tone: function(freq, duration, type, volumeScale, delay) {
    if (!this.enabled || !this.ctx || this.volume <= 0) return;
    type = type || 'sine'; volumeScale = volumeScale || 1; delay = delay || 0;
    var vol = this.volume * 0.25 * volumeScale;
    var now = this.ctx.currentTime + delay;
    var osc = this.ctx.createOscillator(); var gain = this.ctx.createGain(); var filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 2500;
    osc.type = type; osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol, now + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + duration + 0.1);
  },
  sweep: function(f1, f2, duration, type, volumeScale) {
    if (!this.enabled || !this.ctx || this.volume <= 0) return;
    type = type || 'sine'; volumeScale = volumeScale || 1;
    var vol = this.volume * 0.2 * volumeScale; var now = this.ctx.currentTime;
    var osc = this.ctx.createOscillator(); var gain = this.ctx.createGain(); var filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 3000;
    osc.type = type; osc.frequency.setValueAtTime(f1, now); osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), now + duration);
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol, now + 0.03); gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + duration + 0.1);
  },
  click: function() { this.resume(); this.tone(720, 0.05, 'sine', 0.5); },
  connect: function() { this.resume(); this.sweep(440, 880, 0.22, 'sine', 1); this.sweep(660, 1320, 0.22, 'sine', 0.4); },
  disconnect: function() { this.resume(); this.sweep(500, 300, 0.15, 'sine', 0.6); },
  error: function() { this.resume(); this.tone(180, 0.18, 'sine', 0.7); this.tone(150, 0.22, 'sine', 0.5, 0.02); },
  victory: function() { this.resume(); var notes = [523.25, 659.25, 783.99, 1046.5]; for (var i = 0; i < notes.length; i++) this.tone(notes[i], 0.45, 'sine', 1, i * 0.13); this.tone(1567.98, 0.6, 'sine', 0.4, 0.55); },
  hint: function() { this.resume(); this.tone(880, 0.1, 'sine', 0.7); this.tone(1318.5, 0.15, 'sine', 0.7, 0.1); },
  tick: function() { this.resume(); this.tone(1200, 0.03, 'square', 0.3); },
  reveal: function() { this.resume(); this.tone(523.25, 0.2, 'sine', 1); this.tone(659.25, 0.2, 'sine', 1, 0.1); this.tone(783.99, 0.4, 'sine', 1, 0.2); },
  levelUp: function() { this.resume(); var notes = [659.25, 783.99, 987.77, 1174.66]; for (var i = 0; i < notes.length; i++) this.tone(notes[i], 0.4, 'triangle', 1, i * 0.15); },
  toggle: function() { this.enabled = !this.enabled; this.save(); if (this.enabled) this.click(); return this.enabled; },
  setVolume: function(v) { this.volume = Math.max(0, Math.min(1, v)); this.save(); },
  startMusic: function() {
    if (!this.musicEnabled || !this.ctx) return;
    this.stopMusic();
    var self = this;
    var chords = [
      { bass: 110.00, notes: [220.00, 261.63, 329.63] },
      { bass: 87.31,  notes: [174.61, 220.00, 261.63] },
      { bass: 130.81, notes: [261.63, 329.63, 392.00] },
      { bass: 98.00,  notes: [196.00, 246.94, 293.66] }
    ];
    var melody = [440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00, 392.00, 349.23, 392.00, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00];
    var mIdx = 0, cIdx = 0;
    this.musicTimer = setInterval(function() {
      if (!self.musicEnabled || !self.enabled) return;
      var vol = self.volume * 0.06; var now = self.ctx.currentTime;
      var chord = chords[cIdx % chords.length];
      var bass = self.ctx.createOscillator(); var bg = self.ctx.createGain();
      bass.type = 'sine'; bass.frequency.value = chord.bass;
      bg.gain.setValueAtTime(0, now); bg.gain.linearRampToValueAtTime(vol * 1.2, now + 0.1); bg.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      bass.connect(bg); bg.connect(self.ctx.destination); bass.start(now); bass.stop(now + 1.8);
      chord.notes.forEach(function(note, i) {
        var o = self.ctx.createOscillator(); var g = self.ctx.createGain();
        o.type = 'triangle'; o.frequency.value = note;
        var st = now + 0.05 + i * 0.02;
        g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(vol * 0.5, st + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, st + 1.5);
        o.connect(g); g.connect(self.ctx.destination); o.start(st); o.stop(st + 1.6);
      });
      var mel = melody[mIdx % melody.length];
      var mo = self.ctx.createOscillator(); var mg = self.ctx.createGain();
      mo.type = 'sine'; mo.frequency.value = mel;
      mg.gain.setValueAtTime(0, now); mg.gain.linearRampToValueAtTime(vol * 0.7, now + 0.1); mg.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      mo.connect(mg); mg.connect(self.ctx.destination); mo.start(now); mo.stop(now + 1.0);
      mIdx++; if (mIdx % 4 === 0) cIdx++;
    }, 800);
  },
  stopMusic: function() { if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; } },
  toggleMusic: function() { this.musicEnabled = !this.musicEnabled; this.save(); if (this.musicEnabled) this.startMusic(); else this.stopMusic(); return this.musicEnabled; }
};

/* ============================================================
   стоп звука при потере фокуса
   ============================================================ */
SoundManager.pauseAll = function() {
  if (this.ctx) {
    try { this.ctx.suspend(); } catch (e) {}
  }
  this.stopMusic();
};

SoundManager.resumeAll = function() {
  if (this.ctx && this.enabled) {
    try { this.ctx.resume(); } catch (e) {}
    if (this.musicEnabled) this.startMusic();
  }
};

document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    SoundManager.pauseAll();
  } else {
    SoundManager.resumeAll();
  }
});

window.addEventListener('blur', function() {
  SoundManager.pauseAll();
});

window.addEventListener('focus', function() {
  SoundManager.resumeAll();
});
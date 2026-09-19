/* ============================================================
   ГЕНЕРАТОР УРОВНЕЙ
   ============================================================ */
function LevelGenerator() {}
LevelGenerator.PALETTE = [0xff4757, 0x1e90ff, 0x2ed573, 0xffa502, 0xa55eea, 0x00d2d3, 0xff6b81, 0xfeca57];
LevelGenerator.getConfig = function(levelNumber) {
  if (levelNumber === 1) return { w: 3, h: 3, colors: 2, time: 60 };
  if (levelNumber === 2) return { w: 4, h: 4, colors: 3, time: 70 };
  if (levelNumber === 3) return { w: 4, h: 4, colors: 3, time: 80 };
  if (levelNumber === 4) return { w: 5, h: 5, colors: 4, time: 90 };
  if (levelNumber === 5) return { w: 5, h: 5, colors: 4, time: 100 };
  if (levelNumber === 6) return { w: 6, h: 6, colors: 5, time: 110 };
  if (levelNumber === 7) return { w: 6, h: 6, colors: 5, time: 120 };
  if (levelNumber === 8) return { w: 7, h: 7, colors: 6, time: 130 };
  if (levelNumber === 9) return { w: 7, h: 7, colors: 6, time: 140 };
  var size = Math.min(8, 7 + Math.floor((levelNumber - 9) / 3));
  var colors = Math.min(8, 6 + Math.floor((levelNumber - 9) / 2));
  return { w: size, h: size, colors: colors, time: 140 + (levelNumber - 9) * 5 };
};
LevelGenerator.generate = function(width, height, numColors, seed) {
  for (var attempt = 0; attempt < 300; attempt++) { var r = this.tryGenerate(width, height, numColors, seed, attempt); if (r) return r; }
  return this.fallback(width, height);
};
LevelGenerator.tryGenerate = function(width, height, numColors, seed, attempt) {
  var grid = [];
  for (var y = 0; y < height; y++) { grid.push([]); for (var x = 0; x < width; x++) grid[y].push(-1); }
  var paths = []; var remaining = width * height; var safety = 0;
  while (remaining > 0 && safety < 800) {
    safety++;
    if (paths.length >= numColors) { if (!this.extendExistingPath(grid, paths, width, height)) return null; remaining--; continue; }
    var path = this.carvePath(grid, width, height);
    if (!path) return null;
    paths.push(path); remaining -= path.cells.length;
  }
  if (remaining !== 0) return null;
  if (paths.length < numColors) return null;
  var result = { width: width, height: height, paths: [] };
  for (var i = 0; i < paths.length; i++) result.paths.push({ color: this.PALETTE[i % this.PALETTE.length], colorIndex: i, cells: paths[i].cells });
  return result;
};
LevelGenerator.carvePath = function(grid, width, height) {
  var free = [];
  for (var y = 0; y < height; y++) for (var x = 0; x < width; x++) if (grid[y][x] === -1) free.push({ x: x, y: y });
  if (free.length < 2) return null;
  var self = this;
  free.sort(function(a, b) { return self.freeNeighbors(grid, a.x, a.y, width, height).length - self.freeNeighbors(grid, b.x, b.y, width, height).length; });
  var start = free[0]; var cells = [{ x: start.x, y: start.y }]; grid[start.y][start.x] = -2; var current = start;
  var maxLen = Math.min(8, free.length); var targetLen = 3 + Math.floor(Math.random() * Math.max(1, maxLen - 2));
  while (cells.length < targetLen) {
    var neighbors = this.freeNeighbors(grid, current.x, current.y, width, height);
    if (neighbors.length === 0) break;
    neighbors.sort(function(a, b) { return self.freeNeighbors(grid, a.x, a.y, width, height).length - self.freeNeighbors(grid, b.x, b.y, width, height).length; });
    var next = Math.random() < 0.7 ? neighbors[0] : neighbors[Math.floor(Math.random() * neighbors.length)];
    cells.push(next); grid[next.y][next.x] = -2; current = next;
  }
  if (cells.length < 2) { for (var i = 0; i < cells.length; i++) grid[cells[i].y][cells[i].x] = -1; return null; }
  return { cells: cells };
};
LevelGenerator.extendExistingPath = function(grid, paths, width, height) {
  for (var i = 0; i < paths.length; i++) {
    var path = paths[i]; var last = path.cells[path.cells.length - 1];
    var n1 = this.freeNeighbors(grid, last.x, last.y, width, height);
    if (n1.length > 0) { var next = n1[Math.floor(Math.random() * n1.length)]; path.cells.push(next); grid[next.y][next.x] = -2; return true; }
    var first = path.cells[0]; var n2 = this.freeNeighbors(grid, first.x, first.y, width, height);
    if (n2.length > 0) { var next2 = n2[Math.floor(Math.random() * n2.length)]; path.cells.unshift(next2); grid[next2.y][next2.x] = -2; return true; }
  }
  return false;
};
LevelGenerator.freeNeighbors = function(grid, x, y, width, height) {
  var dirs = [[1,0],[-1,0],[0,1],[0,-1]]; var res = [];
  for (var i = 0; i < dirs.length; i++) { var nx = x + dirs[i][0], ny = y + dirs[i][1]; if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] === -1) res.push({ x: nx, y: ny }); }
  return res;
};
LevelGenerator.fallback = function(width, height) {
  var paths = [];
  for (var y = 0; y < height; y++) {
    var row = []; for (var x = 0; x < width; x++) row.push({ x: x, y: y });
    for (var i = 0; i < row.length; i += 2) { if (i + 1 < row.length) paths.push({ color: this.PALETTE[paths.length % this.PALETTE.length], colorIndex: paths.length, cells: [row[i], row[i+1]] }); }
  }
  return { width: width, height: height, paths: paths };
};
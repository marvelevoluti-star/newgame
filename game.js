const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const HUMAN = 'X';
const AI = 'O';

const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const modeAiBtn = document.getElementById('mode-ai');
const modePvpBtn = document.getElementById('mode-pvp');
const resetScoreBtn = document.getElementById('reset-score');
const scoreEls = {
  X: document.getElementById('score-x'),
  O: document.getElementById('score-o'),
  draw: document.getElementById('score-draw'),
};
const labelX = document.getElementById('label-x');
const labelO = document.getElementById('label-o');

let board;
let current;
let gameOver;
const levelsEl = document.getElementById('levels');
const levelBtns = document.querySelectorAll('.level');

let vsAi = true;
let level = 'hard';
let aiThinking = false;
let aiTimer = null;
const score = { X: 0, O: 0, draw: 0 };

// --- O'yin mantig'i (taxtani qabul qiladigan sof funksiyalar) ---

function winningLine(b) {
  return WIN_LINES.find(([x, y, z]) => b[x] && b[x] === b[y] && b[x] === b[z]);
}

function emptyCells(b) {
  return b.map((v, i) => (v ? null : i)).filter((i) => i !== null);
}

// Minimax: barcha mumkin holatlarni oxirigacha tahlil qiladi.
// AI yutsa +10, odam yutsa -10, durang 0. Tezroq yutish yaxshiroq.
function minimax(b, player, depth) {
  const line = winningLine(b);
  if (line) return b[line[0]] === AI ? 10 - depth : depth - 10;
  const moves = emptyCells(b);
  if (moves.length === 0) return 0;

  let best = player === AI ? -Infinity : Infinity;
  for (const i of moves) {
    b[i] = player;
    const score = minimax(b, player === AI ? HUMAN : AI, depth + 1);
    b[i] = null;
    best = player === AI ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

function bestMove(b) {
  let bestScore = -Infinity;
  let move = null;
  for (const i of emptyCells(b)) {
    b[i] = AI;
    const score = minimax(b, HUMAN, 1);
    b[i] = null;
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
}

// Qiyinlik: AI to'g'ri (minimax) yurish qilish ehtimoli
const SMARTNESS = { easy: 0, medium: 0.6, hard: 1 };

function chooseMove(b, level) {
  if (Math.random() < SMARTNESS[level]) return bestMove(b);
  const moves = emptyCells(b);
  return moves[Math.floor(Math.random() * moves.length)];
}

// --- Interfeys ---

function render() {
  cells.forEach((cell, i) => {
    cell.textContent = board[i] || '';
    cell.className = 'cell' + (board[i] ? ` ${board[i].toLowerCase()}` : '');
    cell.disabled = gameOver || aiThinking || Boolean(board[i]);
  });
}

function renderScore() {
  Object.keys(score).forEach((k) => (scoreEls[k].textContent = score[k]));
  labelX.textContent = vsAi ? 'Siz (X)' : 'X';
  labelO.textContent = vsAi ? 'Kompyuter (O)' : 'O';
}

function resetScore() {
  score.X = score.O = score.draw = 0;
  renderScore();
}

function start() {
  clearTimeout(aiTimer);
  board = Array(9).fill(null);
  current = 'X';
  gameOver = false;
  aiThinking = false;
  statusEl.textContent = `Navbat: ${current}`;
  render();
}

function finishIfOver() {
  const line = winningLine(board);
  if (line) {
    gameOver = true;
    score[current]++;
    renderScore();
    statusEl.textContent = vsAi
      ? (current === AI ? 'Kompyuter yutdi!' : 'Siz yutdingiz!')
      : `${current} g'alaba qozondi!`;
    render();
    line.forEach((i) => cells[i].classList.add('win'));
    return true;
  }
  if (board.every(Boolean)) {
    gameOver = true;
    score.draw++;
    renderScore();
    statusEl.textContent = 'Durang!';
    render();
    return true;
  }
  return false;
}

function play(index) {
  board[index] = current;
  if (finishIfOver()) return;
  current = current === 'X' ? 'O' : 'X';
  statusEl.textContent = `Navbat: ${current}`;
  render();
}

function aiTurn() {
  aiThinking = true;
  statusEl.textContent = 'Kompyuter o\'ylamoqda...';
  render();
  aiTimer = setTimeout(() => {
    aiThinking = false;
    play(chooseMove(board, level));
  }, 400);
}

function handleClick(e) {
  const index = Number(e.currentTarget.dataset.index);
  if (gameOver || aiThinking || board[index]) return;
  play(index);
  if (vsAi && !gameOver && current === AI) aiTurn();
}

function setMode(ai) {
  vsAi = ai;
  modeAiBtn.classList.toggle('active', ai);
  modePvpBtn.classList.toggle('active', !ai);
  levelsEl.hidden = !ai;
  resetScore();
  start();
}

function setLevel(l) {
  level = l;
  levelBtns.forEach((b) => b.classList.toggle('active', b.dataset.level === l));
  resetScore();
  start();
}

levelBtns.forEach((b) => b.addEventListener('click', () => setLevel(b.dataset.level)));

cells.forEach((cell) => cell.addEventListener('click', handleClick));
restartBtn.addEventListener('click', start);
resetScoreBtn.addEventListener('click', resetScore);
modeAiBtn.addEventListener('click', () => setMode(true));
modePvpBtn.addEventListener('click', () => setMode(false));

renderScore();
start();

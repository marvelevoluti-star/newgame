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

let board;
let current;
let gameOver;
let vsAi = true;
let aiThinking = false;

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

// --- Interfeys ---

function render() {
  cells.forEach((cell, i) => {
    cell.textContent = board[i] || '';
    cell.className = 'cell' + (board[i] ? ` ${board[i].toLowerCase()}` : '');
    cell.disabled = gameOver || aiThinking || Boolean(board[i]);
  });
}

function start() {
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
    statusEl.textContent = vsAi
      ? (current === AI ? 'Kompyuter yutdi!' : 'Siz yutdingiz!')
      : `${current} g'alaba qozondi!`;
    render();
    line.forEach((i) => cells[i].classList.add('win'));
    return true;
  }
  if (board.every(Boolean)) {
    gameOver = true;
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
  setTimeout(() => {
    aiThinking = false;
    play(bestMove(board));
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
  start();
}

cells.forEach((cell) => cell.addEventListener('click', handleClick));
restartBtn.addEventListener('click', start);
modeAiBtn.addEventListener('click', () => setMode(true));
modePvpBtn.addEventListener('click', () => setMode(false));

start();

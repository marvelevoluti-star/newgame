const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');

let board;
let current;
let gameOver;

function start() {
  board = Array(9).fill(null);
  current = 'X';
  gameOver = false;
  statusEl.textContent = `Navbat: ${current}`;
  cells.forEach((cell) => {
    cell.textContent = '';
    cell.disabled = false;
    cell.className = 'cell';
  });
}

function findWinner() {
  return WIN_LINES.find(([a, b, c]) =>
    board[a] && board[a] === board[b] && board[a] === board[c]
  );
}

function handleMove(e) {
  const index = Number(e.currentTarget.dataset.index);
  if (gameOver || board[index]) return;

  board[index] = current;
  e.currentTarget.textContent = current;
  e.currentTarget.classList.add(current.toLowerCase());
  e.currentTarget.disabled = true;

  const line = findWinner();
  if (line) {
    gameOver = true;
    statusEl.textContent = `${current} g'alaba qozondi!`;
    line.forEach((i) => cells[i].classList.add('win'));
    cells.forEach((c) => (c.disabled = true));
  } else if (board.every(Boolean)) {
    gameOver = true;
    statusEl.textContent = 'Durang!';
  } else {
    current = current === 'X' ? 'O' : 'X';
    statusEl.textContent = `Navbat: ${current}`;
  }
}

cells.forEach((cell) => cell.addEventListener('click', handleMove));
restartBtn.addEventListener('click', start);

start();

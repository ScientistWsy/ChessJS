//#region Variables

const pawnB = createChessPiece("Black", "Pawn");
const pawnW = createChessPiece("White", "Pawn");
const rookB = createChessPiece("Black", "Rook");
const rookW = createChessPiece("White", "Rook");
const kingB = createChessPiece("Black", "King");
const kingW = createChessPiece("White", "King");
const queenB = createChessPiece("Black", "Queen");
const queenW = createChessPiece("White", "Queen");
const bishopB = createChessPiece("Black", "Bishop");
const bishopW = createChessPiece("White", "Bishop");
const knightB = createChessPiece("Black", "Knight");
const knightW = createChessPiece("White", "Knight");

let piece = {
  position: null,
  type: null,
  color: null,
};

// Lances legais da peça selecionada no momento
let currentMoves = [];

let square = [];

let maps = new Map();

// Tudo que não dá para descobrir olhando só para o tabuleiro
const game = {
  turn: "White",
  enPassant: null, // casa que pode ser capturada en passant
  castling: {
    White: { kingSide: true, queenSide: true },
    Black: { kingSide: true, queenSide: true },
  },
  halfmove: 0, // lances sem captura e sem mover peão (regra dos 50 lances)
  repetition: 1, // quantas vezes a posição atual já apareceu
  seen: new Map(),
  lastMove: null,
  over: false,
};

const PIECE_NAMES = {
  Pawn: "Peão",
  Rook: "Torre",
  Knight: "Cavalo",
  Bishop: "Bispo",
  Queen: "Dama",
  King: "Rei",
};

const COLOR_NAMES = { White: "Brancas", Black: "Pretas" };

//#endregion

//#region Setup

window.addEventListener("DOMContentLoaded", () => {
  board();
  startPosition();
  setUpPositions();
  setUpControls();
  updateMap();
  registerPosition();
  updateStatus();
});

function createChessPiece(color, type) {
  let img = document.createElement("img");
  img.src = "ChessFiles/" + type + color[0].toUpperCase() + ".png";
  img.alt = type + " " + color;
  img.classList.add("piece");
  img.setAttribute("data-color", color);
  img.style.width = "100%";
  img.style.height = "100%";
  return img;
}

// Cria o tabuleiro --> (div) de cada posição.
// As casas são posicionadas em porcentagem, então elas acompanham o
// tamanho do tabuleiro sozinhas, sem precisar recalcular no resize.
function board() {
  const boardElement = document.getElementById("board");
  const size = 100 / 8;
  let squareHtml = "";

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      squareHtml += `<div id="${i.toString() + j.toString()}" class="square" style="top: ${
        j * size
      }%; left: ${i * size}%;"></div>`;
    }
  }

  boardElement.innerHTML = squareHtml;
}

// Um único listener no tabuleiro cuida de tudo, inclusive das peças
// que nascem depois (promoção)
function setUpPositions() {
  square = document.querySelectorAll(".square");

  document.getElementById("board").addEventListener("click", function (event) {
    const item = event.target.closest(".square");
    if (item) squareClick(item);
  });
}

function setUpControls() {
  document.getElementById("restart").addEventListener("click", newGame);
}

function squareClick(item) {
  if (game.over) return;

  const img = item.querySelector("img.piece");
  const isTarget = item.classList.contains("next");

  // Clicar numa peça própria seleciona; o resto é tentativa de lance
  if (img && !isTarget && img.getAttribute("data-color") === game.turn) {
    selected(item.id, img.alt, img.getAttribute("data-color"));
    return;
  }

  move(item);
}

function selected(position, type, color) {
  if (game.over) return;
  if (color != turnColor()) return;

  const from = toIndex(position);

  clearSelection();

  // Clicar de novo na mesma peça desmarca
  if (piece.position === from) {
    piece = { position: null, type: null, color: null };
    currentMoves = [];
    return;
  }

  piece.position = from;
  piece.color = color;
  piece.type = pieceType(type);

  currentMoves = legalMoves(from, piece.type, color, maps, game);

  squareElement(from).classList.add("selected");
  markPositions(currentMoves);
}

function markPositions(steps) {
  if (steps == null) return;

  steps.forEach((item) => {
    const position = squareElement(item.to);
    if (!position) return;

    position.classList.add("next");
    if (item.capture) position.classList.add("capture");
    if (item.special === "castleKing" || item.special === "castleQueen")
      position.classList.add("castle");
  });
}

function updateMap() {
  maps.clear();

  square.forEach((item) => {
    const img = item.querySelector("img.piece");
    if (!img) return;

    maps.set(toIndex(item.id), img.getAttribute("alt"));
  });
}

function getPieceByPosition(position) {
  const imgElement = document.querySelector(
    '[data-position="' + positionId(position) + '"]'
  );
  return imgElement;
}

function squareElement(position) {
  return document.getElementById(positionId(position));
}

// As posições no HTML sempre têm dois dígitos ("04", "47")
function positionId(position) {
  return String(position).padStart(2, "0");
}

function turnColor() {
  return game.turn;
}

//#endregion

//#region Start Position

function startPosition() {
  let refRook = [0, 7];
  let refKnight = [1, 6];
  let refBishop = [2, 5];
  let refQueen = [3];
  let refKing = [4];

  startPawn(pawnW);
  startPawn(pawnB);

  startPiece(kingB, refKing);
  startPiece(kingW, refKing);

  startPiece(rookW, refRook);
  startPiece(rookB, refRook);

  startPiece(queenB, refQueen);
  startPiece(queenW, refQueen);

  startPiece(knightW, refKnight);
  startPiece(knightB, refKnight);

  startPiece(bishopW, refBishop);
  startPiece(bishopB, refBishop);
}

function startPawn(img) {
  let color = img.getAttribute("data-color");
  let reference = color == "White" ? "6" : "1";

  for (let i = 0; i < 8; i++) {
    let squareId = i.toString() + reference;
    img.setAttribute("data-position", squareId);
    document.getElementById(squareId).appendChild(img.cloneNode(true));
  }
}

function startPiece(img, reference) {
  let color = img.getAttribute("data-color");
  let line = color == "White" ? "7" : "0";

  reference.forEach((item) => {
    let squareId = item + line;
    img.setAttribute("data-position", squareId);
    document.getElementById(squareId).appendChild(img.cloneNode(true));
  });
}

//#endregion

//#region Motion

function move(element) {
  if (piece.position === null) return;

  const to = toIndex(element.id);
  const chosen = currentMoves.find((item) => item.to === to);

  if (!chosen) {
    clearSelection();
    piece = { position: null, type: null, color: null };
    currentMoves = [];
    return;
  }

  if (chosen.promotion) {
    askPromotion(chosen.color, (type) => {
      chosen.promotedTo = type;
      applyMove(chosen);
    });
    return;
  }

  applyMove(chosen);
}

function applyMove(move) {
  const imgElement = getPieceByPosition(move.from);
  const target = squareElement(move.to);

  // Captura normal ou en passant (que come numa casa diferente do destino)
  if (move.captured !== null && move.captured !== undefined) {
    const capturedSquare = squareElement(move.captured);
    if (capturedSquare) capturedSquare.innerHTML = "";
  }

  target.innerHTML = "";

  if (move.promotedTo) {
    // O peão sai do tabuleiro e uma peça nova nasce no lugar dele
    if (imgElement) imgElement.remove();

    const promoted = createChessPiece(move.color, move.promotedTo);
    promoted.setAttribute("data-position", positionId(move.to));
    target.appendChild(promoted);
  } else {
    target.appendChild(imgElement);
    imgElement.setAttribute("data-position", positionId(move.to));
  }

  if (move.special === "castleKing" || move.special === "castleQueen")
    moveRookOfRoque(move);

  updateCastlingRights(move);
  updateEnPassant(move);

  game.halfmove =
    move.type === "Pawn" || move.capture ? 0 : game.halfmove + 1;

  game.lastMove = move;
  game.turn = opponentOf(game.turn);

  piece = { position: null, type: null, color: null };
  currentMoves = [];

  clearSelection();
  updateMap();
  registerPosition();
  highlightLastMove();
  updateStatus();
}

// No roque a torre também anda
function moveRookOfRoque(move) {
  const row = getRow(move.from);
  const isKingSide = move.special === "castleKing";
  const rookFrom = isKingSide ? toPosition(7, row) : toPosition(0, row);
  const rookTo = isKingSide ? toPosition(5, row) : toPosition(3, row);
  const rookImg = getPieceByPosition(rookFrom);

  if (!rookImg) return;

  squareElement(rookTo).appendChild(rookImg);
  rookImg.setAttribute("data-position", positionId(rookTo));
}

// Mover o rei tira os dois roques; mover (ou perder) uma torre tira o lado dela
function updateCastlingRights(move) {
  const rights = game.castling[move.color];

  if (move.type === "King") {
    rights.kingSide = false;
    rights.queenSide = false;
  }

  if (move.type === "Rook") {
    const row = move.color === "White" ? 7 : 0;
    if (move.from === toPosition(7, row)) rights.kingSide = false;
    if (move.from === toPosition(0, row)) rights.queenSide = false;
  }

  if (move.captured !== null && move.captured !== undefined) {
    const enemy = opponentOf(move.color);
    const enemyRow = enemy === "White" ? 7 : 0;

    if (move.captured === toPosition(7, enemyRow))
      game.castling[enemy].kingSide = false;
    if (move.captured === toPosition(0, enemyRow))
      game.castling[enemy].queenSide = false;
  }
}

// O en passant só vale no lance seguinte ao avanço duplo do peão
function updateEnPassant(move) {
  const distance = Math.abs(getRow(move.to) - getRow(move.from));

  if (move.type === "Pawn" && distance === 2) {
    const direction = move.color === "White" ? -1 : 1;
    game.enPassant = toPosition(getCol(move.from), getRow(move.from) + direction);
  } else {
    game.enPassant = null;
  }
}

function clearSelection() {
  square.forEach((item) => {
    item.classList.remove("next");
    item.classList.remove("capture");
    item.classList.remove("castle");
    item.classList.remove("selected");
  });
}

function highlightLastMove() {
  square.forEach((item) => item.classList.remove("last-move"));

  if (!game.lastMove) return;

  squareElement(game.lastMove.from).classList.add("last-move");
  squareElement(game.lastMove.to).classList.add("last-move");
}

//#endregion

//#region Promotion

function askPromotion(color, callback) {
  const overlay = document.getElementById("promotion");
  const options = document.getElementById("promotion-options");

  options.innerHTML = "";

  ["Queen", "Rook", "Bishop", "Knight"].forEach((type) => {
    const button = document.createElement("button");
    const img = createChessPiece(color, type);

    button.classList.add("promotion-option");
    button.title = PIECE_NAMES[type];
    button.appendChild(img);
    button.addEventListener("click", function () {
      overlay.classList.add("hidden");
      callback(type);
    });

    options.appendChild(button);
  });

  overlay.classList.remove("hidden");
}

//#endregion

//#region Game State

// Guarda a posição para detectar repetição (mesmas peças, mesma vez,
// mesmos direitos de roque e mesmo en passant)
function registerPosition() {
  const parts = [];

  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 8; row++) {
      const position = toPosition(col, row);
      if (maps.has(position)) parts.push(position + maps.get(position));
    }
  }

  const key = [
    parts.join("|"),
    game.turn,
    game.castling.White.kingSide,
    game.castling.White.queenSide,
    game.castling.Black.kingSide,
    game.castling.Black.queenSide,
    game.enPassant,
  ].join("#");

  const count = (game.seen.get(key) || 0) + 1;

  game.seen.set(key, count);
  game.repetition = count;
}

function updateStatus() {
  const status = gameStatus(game.turn, maps, game);
  const turnLabel = document.getElementById("turn-indicator");
  const message = document.getElementById("message");
  const color = COLOR_NAMES[game.turn];

  turnLabel.textContent = "Vez das " + color;
  turnLabel.setAttribute("data-color", game.turn);

  switch (status) {
    case "checkmate":
      message.textContent =
        "Xeque-mate! As " + COLOR_NAMES[opponentOf(game.turn)] + " venceram.";
      game.over = true;
      break;
    case "stalemate":
      message.textContent = "Empate por afogamento (rei afogado).";
      game.over = true;
      break;
    case "material":
      message.textContent = "Empate por material insuficiente.";
      game.over = true;
      break;
    case "fiftymoves":
      message.textContent = "Empate pela regra dos 50 lances.";
      game.over = true;
      break;
    case "repetition":
      message.textContent = "Empate por repetição de posição (3x).";
      game.over = true;
      break;
    case "check":
      message.textContent = "Xeque!";
      break;
    default:
      message.textContent = "";
  }

  if (game.over) turnLabel.textContent = "Fim de jogo";

  markCheck(status);
}

function markCheck(status) {
  square.forEach((item) => item.classList.remove("check"));

  if (status !== "check" && status !== "checkmate") return;

  const king = findKing(game.turn, maps);
  if (king !== null) squareElement(king).classList.add("check");
}

function newGame() {
  square.forEach((item) => {
    item.innerHTML = "";
    item.className = "square";
  });

  maps.clear();

  game.turn = "White";
  game.enPassant = null;
  game.castling = {
    White: { kingSide: true, queenSide: true },
    Black: { kingSide: true, queenSide: true },
  };
  game.halfmove = 0;
  game.repetition = 1;
  game.seen = new Map();
  game.lastMove = null;
  game.over = false;

  piece = { position: null, type: null, color: null };
  currentMoves = [];

  document.getElementById("promotion").classList.add("hidden");

  startPosition();
  updateMap();
  registerPosition();
  updateStatus();
}

//#endregion

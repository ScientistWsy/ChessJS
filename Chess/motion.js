// #region [HELPERS]

// Uma posição é guardada como um número: coluna * 10 + linha (ex.: "47" -> 47).
// Coluna 0 = esquerda, Linha 0 = topo (as brancas começam nas linhas 6 e 7).

const isValidPosition = (col, row) =>
  col >= 0 && col < 8 && row >= 0 && row < 8;

const toPosition = (col, row) => col * 10 + row;

const getCol = (position) => Math.floor(position / 10);

const getRow = (position) => position % 10;

const toIndex = (position) => parseInt(position, 10);

const pieceType = (value) => value.split(" ")[0];

const pieceColor = (value) => value.split(" ")[1];

const opponentOf = (color) => (color === "White" ? "Black" : "White");

const isEmpty = (board, position) => !board.has(position);

const isEnemy = (board, position, color) =>
  board.has(position) && pieceColor(board.get(position)) !== color;

// #endregion

// #region [STANDARD MOVIMENTS]

const getStepsInDirection = (position, color, increments, board = maps) => {
  const steps = [];
  const from = toIndex(position);
  const col = getCol(from);
  const row = getRow(from);

  for (const [incrementX, incrementY] of increments) {
    let nextCol = col + incrementX;
    let nextRow = row + incrementY;

    while (isValidPosition(nextCol, nextRow)) {
      const nextPosition = toPosition(nextCol, nextRow);

      if (isEmpty(board, nextPosition)) {
        steps.push(nextPosition);
      } else {
        if (isEnemy(board, nextPosition, color)) steps.push(nextPosition);
        break;
      }

      nextCol += incrementX;
      nextRow += incrementY;
    }
  }

  return steps;
};

const movePawn = (position, color, board = maps, state = game) => {
  const from = toIndex(position);
  const col = getCol(from);
  const row = getRow(from);
  const direction = color === "White" ? -1 : 1;
  const initialRow = color === "White" ? 6 : 1;
  const steps = [];

  // Andar para frente (de frente o peão nunca captura)
  if (isValidPosition(col, row + direction)) {
    const oneAhead = toPosition(col, row + direction);

    if (isEmpty(board, oneAhead)) {
      steps.push(oneAhead);

      const twoAhead = toPosition(col, row + direction * 2);
      if (row === initialRow && isEmpty(board, twoAhead)) steps.push(twoAhead);
    }
  }

  // Capturas na diagonal (incluindo en passant)
  for (const incrementX of [-1, 1]) {
    const nextCol = col + incrementX;
    const nextRow = row + direction;

    if (!isValidPosition(nextCol, nextRow)) continue;

    const target = toPosition(nextCol, nextRow);

    if (isEnemy(board, target, color)) steps.push(target);
    else if (state && state.enPassant === target && isEmpty(board, target))
      steps.push(target);
  }

  return steps;
};

const moveRook = (position, color, board = maps) => {
  const increments = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  return getStepsInDirection(position, color, increments, board);
};

const moveBishop = (position, color, board = maps) => {
  const increments = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  return getStepsInDirection(position, color, increments, board);
};

const moveKnight = (position, color, board = maps) => {
  const increments = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ];
  const from = toIndex(position);
  const col = getCol(from);
  const row = getRow(from);
  const steps = [];

  for (const [incrementX, incrementY] of increments) {
    const nextCol = col + incrementX;
    const nextRow = row + incrementY;

    if (!isValidPosition(nextCol, nextRow)) continue;

    const next = toPosition(nextCol, nextRow);
    if (isEmpty(board, next) || isEnemy(board, next, color)) steps.push(next);
  }

  return steps;
};

const moveQueen = (position, color, board = maps) => {
  const increments = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  return getStepsInDirection(position, color, increments, board);
};

const moveKing = (position, color, board = maps) => {
  const increments = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  const from = toIndex(position);
  const col = getCol(from);
  const row = getRow(from);
  const steps = [];

  for (const [incrementX, incrementY] of increments) {
    const nextCol = col + incrementX;
    const nextRow = row + incrementY;

    if (!isValidPosition(nextCol, nextRow)) continue;

    const next = toPosition(nextCol, nextRow);
    if (isEmpty(board, next) || isEnemy(board, next, color)) steps.push(next);
  }

  return steps;
};

// #endregion

// #region [SPECIAL MOVIMENTS]

// Roque: o rei anda duas casas e a torre pula para o outro lado dele.
// Só vale se rei e torre nunca se moveram, o caminho está livre e o rei
// não está em xeque nem passa por uma casa atacada.
const moveRoque = (position, color, board = maps, state = game) => {
  const steps = [];
  const rights = state && state.castling ? state.castling[color] : null;

  if (!rights) return steps;

  const row = color === "White" ? 7 : 0;
  const from = toIndex(position);

  if (from !== toPosition(4, row)) return steps;
  if (board.get(from) !== "King " + color) return steps;
  if (isSquareAttacked(from, color, board)) return steps;

  const pathIsFree = (cols) =>
    cols.every((col) => isEmpty(board, toPosition(col, row)));

  const pathIsSafe = (cols) =>
    cols.every((col) => !isSquareAttacked(toPosition(col, row), color, board));

  if (
    rights.kingSide &&
    board.get(toPosition(7, row)) === "Rook " + color &&
    pathIsFree([5, 6]) &&
    pathIsSafe([5, 6])
  ) {
    steps.push(toPosition(6, row));
  }

  if (
    rights.queenSide &&
    board.get(toPosition(0, row)) === "Rook " + color &&
    pathIsFree([1, 2, 3]) &&
    pathIsSafe([2, 3])
  ) {
    steps.push(toPosition(2, row));
  }

  return steps;
};

// #endregion

// #region [RULES]

// As casas que um peão ataca são diferentes das casas onde ele anda
const pawnAttacks = (position, color) => {
  const from = toIndex(position);
  const col = getCol(from);
  const row = getRow(from);
  const direction = color === "White" ? -1 : 1;
  const steps = [];

  for (const incrementX of [-1, 1]) {
    if (isValidPosition(col + incrementX, row + direction))
      steps.push(toPosition(col + incrementX, row + direction));
  }

  return steps;
};

// Casas atacadas por uma peça. O roque nunca entra aqui, senão a
// verificação de xeque cairia em recursão infinita.
const attacksFrom = (position, type, color, board) => {
  switch (type) {
    case "Pawn":
      return pawnAttacks(position, color);
    case "Rook":
      return moveRook(position, color, board);
    case "Knight":
      return moveKnight(position, color, board);
    case "Bishop":
      return moveBishop(position, color, board);
    case "Queen":
      return moveQueen(position, color, board);
    case "King":
      return moveKing(position, color, board);
    default:
      return [];
  }
};

const isSquareAttacked = (target, color, board = maps) => {
  const enemy = opponentOf(color);

  for (const [position, value] of board) {
    if (pieceColor(value) !== enemy) continue;
    if (attacksFrom(position, pieceType(value), enemy, board).includes(target))
      return true;
  }

  return false;
};

const findKing = (color, board = maps) => {
  for (const [position, value] of board) {
    if (value === "King " + color) return position;
  }
  return null;
};

const isInCheck = (color, board = maps) => {
  const king = findKing(color, board);
  return king !== null && isSquareAttacked(king, color, board);
};

// Descrição completa de um lance: captura, en passant, roque e promoção
const describeMove = (from, to, type, color, board = maps, state = game) => {
  const move = {
    from: from,
    to: to,
    type: type,
    color: color,
    capture: board.has(to),
    captured: board.has(to) ? to : null,
    special: null,
    promotion: false,
  };

  if (type === "Pawn") {
    if (
      state &&
      state.enPassant === to &&
      getCol(to) !== getCol(from) &&
      isEmpty(board, to)
    ) {
      move.special = "enPassant";
      move.capture = true;
      move.captured = toPosition(getCol(to), getRow(from));
    }

    const lastRow = color === "White" ? 0 : 7;
    if (getRow(to) === lastRow) move.promotion = true;
  }

  if (type === "King" && Math.abs(getCol(to) - getCol(from)) === 2) {
    move.special = getCol(to) === 6 ? "castleKing" : "castleQueen";
  }

  return move;
};

// Aplica um lance numa cópia do tabuleiro (usado para testar o xeque)
const simulateMove = (board, move) => {
  const next = new Map(board);
  const promoted = move.promotedTo || move.type;

  if (move.captured !== null) next.delete(move.captured);

  next.delete(move.from);
  next.set(move.to, promoted + " " + move.color);

  if (move.special === "castleKing" || move.special === "castleQueen") {
    const row = getRow(move.from);
    const rookFrom =
      move.special === "castleKing" ? toPosition(7, row) : toPosition(0, row);
    const rookTo =
      move.special === "castleKing" ? toPosition(5, row) : toPosition(3, row);

    next.delete(rookFrom);
    next.set(rookTo, "Rook " + move.color);
  }

  return next;
};

// Lances possíveis ignorando o xeque
const pseudoMoves = (position, type, color, board = maps, state = game) => {
  switch (type) {
    case "Pawn":
      return movePawn(position, color, board, state);
    case "Rook":
      return moveRook(position, color, board);
    case "Knight":
      return moveKnight(position, color, board);
    case "Bishop":
      return moveBishop(position, color, board);
    case "Queen":
      return moveQueen(position, color, board);
    case "King":
      return moveKing(position, color, board).concat(
        moveRoque(position, color, board, state)
      );
    default:
      return [];
  }
};

// Lances legais: os que não deixam o próprio rei em xeque
const legalMoves = (position, type, color, board = maps, state = game) => {
  const from = toIndex(position);

  return pseudoMoves(from, type, color, board, state)
    .map((to) => describeMove(from, to, type, color, board, state))
    .filter((move) => !isInCheck(color, simulateMove(board, move)));
};

const allLegalMoves = (color, board = maps, state = game) => {
  const moves = [];

  for (const [position, value] of board) {
    if (pieceColor(value) !== color) continue;
    moves.push(...legalMoves(position, pieceType(value), color, board, state));
  }

  return moves;
};

// Material insuficiente: rei sozinho, rei e bispo ou rei e cavalo
const hasInsufficientMaterial = (board = maps) => {
  let minorPieces = 0;

  for (const value of board.values()) {
    const type = pieceType(value);

    if (type === "King") continue;
    if (type === "Bishop" || type === "Knight") {
      minorPieces++;
      continue;
    }

    return false;
  }

  return minorPieces <= 1;
};

// Situação do jogador que está na vez
const gameStatus = (color, board = maps, state = game) => {
  const check = isInCheck(color, board);

  if (allLegalMoves(color, board, state).length === 0)
    return check ? "checkmate" : "stalemate";

  if (hasInsufficientMaterial(board)) return "material";
  if (state.halfmove >= 100) return "fiftymoves";
  if (state.repetition >= 3) return "repetition";

  return check ? "check" : "playing";
};

// #endregion

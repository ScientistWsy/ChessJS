// #region [STANDARD MOVIMENTS]

const isValidPosition = (col, row) =>
  col >= 0 && col < 8 && row >= 0 && row < 8;

const getStepsInDirection = (position, color, increments) => {
  const steps = [];
  const [col, row] = position.split("").map((char) => parseInt(char));

  steps.push(parseInt(position));

  for (const [incrementX, incrementY] of increments) {
    let nextCol = col + incrementX;
    let nextRow = row + incrementY;

    while (isValidPosition(nextCol, nextRow)) {
      const nextPosition = parseInt(nextCol.toString() + nextRow.toString());
      if (!maps.has(nextPosition)) {
        steps.push(nextPosition);
      } else if (!maps.get(nextPosition).includes(color)) {
        steps.push(nextPosition);
        break;
      } else {
        break;
      }
      nextCol += incrementX;
      nextRow += incrementY;
    }
  }

  return steps;
};

const movePawn = (position, color) => {
  const direction = color == "White" ? -1 : 1;
  const initialPosition = color == "White" ? 6 : 1;
  let next = parseInt(position) + direction;
  let steps = [];

  steps.push(parseInt(position));

  //Definir os passos possíveis da peça

  for (let i = 0; i < 2; i++) {
    const cut = i == 0 ? 10 : -10;
    const check = next + cut;
    if (maps.has(check)) {
      if (!maps.get(check).includes(color)) {
        steps.push(check);
      }
    }
  }

  if (!maps.has(next)) {
    if (next >= 00 && next <= 88) steps.push(parseInt(position) + direction);
    else return;
    if (initialPosition === parseInt(position[1])) {
      const checkPosition = parseInt(steps[steps.length - 1] + direction);
      if (!maps.has(checkPosition)) steps.push(checkPosition);
    }
  }

  return steps;
};

const moveRook = (position, color) => {
  const steps = [];
  const increments = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const stepsInDirection = getStepsInDirection(position, color, increments);
  steps.push(...stepsInDirection);
  return steps;
};

const moveBishop = (position, color) => {
  const increments = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  return getStepsInDirection(position, color, increments);
};

const moveKnight = (position, color) => {
  const knightMoves = [12, -8, 19, 21, -12, 8, -19, -21];
  const currentPosition = parseInt(position);
  let steps = [];

  steps.push(currentPosition);

  knightMoves.forEach((item) => {
    const newPosition = currentPosition + item;
    const check = newPosition.toString().padStart(2, "0");

    if (
      isValidPosition(check[0], check[1]) &&
      (!maps.has(newPosition) || !maps.get(newPosition).includes(color))
    ) {
      steps.push(newPosition);
    }
  });

  return steps;
};

const moveQueen = (position, color) => {
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
  return getStepsInDirection(position, color, increments);
};

// #endregion

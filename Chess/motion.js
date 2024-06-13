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

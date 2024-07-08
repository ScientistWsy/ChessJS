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

let turn = "White";

let square = [];

let maps = new Map();

let motion_white = []; //new Map()

let motion_black = []; //new Map()

//#endregion

//#region Setup

window.addEventListener("DOMContentLoaded", async () => {
  rezise();
  board(true);
  startPosition();
  pieceAction();
  setUpPositions();
});

function rezise() {
  window.addEventListener("resize", function () {
    board(false);
  });
}

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

function board(start) {
  let imgWidth = document.getElementById("img").offsetWidth;
  let imgHeight = document.getElementById("img").offsetHeight;

  if (start) {
    // Cria o tabuleiro --> (div) de cada posição

    let board = document.getElementById("board");
    let squareHtml = "";

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        squareHtml += ` <div id="${
          i.toString() + j.toString()
        }" class="square" style="position: absolute; top: ${
          j * (imgHeight / 8)
        }px; left: ${
          i * (imgWidth / 8)
        }px; transform: translate(0%, 0%); width: ${imgWidth / 8}px; height: ${
          imgHeight / 8
        }px;"></div>`;
      }
    }

    board.innerHTML = squareHtml;
  } else {
    // Caso o tabuleiro já exista, Rezise as posições
    for (let i = 0; i < 64; i++) {
      let check = square[i].id;
      let row,
        col = 0;

      row = parseInt(check[1]);
      col = parseInt(check[0]);

      square[i].style.height = imgHeight / 8 + "px";
      square[i].style.width = imgWidth / 8 + "px";
      square[i].style.left = col * (imgWidth / 8) + "px";
      square[i].style.top = row * (imgWidth / 8) + "px";
    }
  }
}

function setUpPositions() {
  square = document.querySelectorAll(".square");
  square.forEach((item) => {
    const element = document.getElementById(item.id);
    element.addEventListener("click", function () {
      move(item);
    });
  });
}

function pieceAction() {
  const elements = document.querySelectorAll(".piece");

  elements.forEach(function (img) {
    const color = img.getAttribute("data-color");
    const type = img.getAttribute("alt");
    img.addEventListener("click", function () {
      const position = img.getAttribute("data-position");
      selected(position, type, color);
    });
  });
}

function selected(position, type, color) {
  console.log(color);
  if (color != turn) return;

  let out = false;

  square.forEach((item) => {
    if (item.id === position && item.classList.contains("next")) {
      out = true;
      return;
    }
  });

  if (out) return;

  piece.position = position;
  piece.color = color;
  piece.type = type;

  clearSelection();

  if (type.includes("Pawn")) {
    square.forEach((item) => {
      if (item.id === position) {
        markPositions(movePawn(item.id, color));
      }
    });
  }

  if (type.includes("Rook")) {
    square.forEach((item) => {
      if (item.id === position) {
        markPositions(moveRook(item.id, color));
        //markPositions(moveRoque(position));
      }
    });
  }

  if (type.includes("Knight")) {
    square.forEach((item) => {
      if (item.id === position) {
        markPositions(moveKnight(item.id, color));
      }
    });
  }

  if (type.includes("Bishop")) {
    square.forEach((item) => {
      if (item.id === position) {
        markPositions(moveBishop(item.id, color));
      }
    });
  }

  if (type.includes("Queen")) {
    square.forEach((item) => {
      if (item.id === position) {
        markPositions(moveQueen(item.id, color));
      }
    });
  }

  if (type.includes("King")) {
    square.forEach((item) => {
      if (item.id === position) {
        markPositions(moveKing(item.id, color));
        markPositions(moveRoque(position));
      }
    });
  }
}

function markPositions(steps) {
  console.log(steps);
  if (steps == null) return;
  steps.forEach((item) => {
    square.forEach((next) => {
      const position = document.getElementById(next.id);
      if (next.id == item.toString().padStart(2, "0")) {
        position.classList.add("next");
      }
    });
  });
}

function updateMap() {
  square.forEach((item) => {
    const col = item.id[0];
    const row = item.id[1];

    if (item.innerHTML.trim() === "") {
      const index = parseInt(col + row);
      maps.delete(index);
    } else {
      const img = item.querySelector("img");
      const type = img.getAttribute("alt");
      const index = parseInt(col + row);
      maps.set(index, type);
    }
  });
}

function getPieceByPosition(position) {
  const imgElement = document.querySelector(
    '[data-position="' + position + '"]'
  );
  return imgElement;
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
    maps.set(parseInt(squareId), img.alt);
    document.getElementById(squareId).appendChild(img.cloneNode(true));
  }
}

function startPiece(img, reference) {
  let color = img.getAttribute("data-color");
  let name = img.getAttribute("alt").split();
  let line = color == "White" ? "7" : "0";

  reference.forEach((item) => {
    let squareId = item + line;
    img.setAttribute("data-position", squareId);
    img.addEventListener("click", () => selected(squareId, name[1], name[0]));
    maps.set(parseInt(squareId), img.alt);
    document.getElementById(squareId).appendChild(img.cloneNode(true));
  });
}

//#endregion

//#region Motion

function move(element) {
  const imgElement = getPieceByPosition(piece.position);

  if (element.id === piece.position) return;

  if (element.classList.contains("next")) {
    element.innerHTML = "";
    element.appendChild(imgElement);

    imgElement.setAttribute("data-position", element.id);

    turn = turn == "White" ? (turn = "Black") : (turn = "White");
  }

  clearSelection();
  updateMap();
}

function clearSelection() {
  square.forEach((item) => {
    item.classList.remove("next");
    item.classList.remove("orange");
  });
}

//#endregion

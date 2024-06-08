//#region Variables 

const pawnB = createChessPiece('Black', 'Pawn');
const pawnW = createChessPiece('White', 'Pawn');
const rookB = createChessPiece('Black', 'Rook');
const rookW = createChessPiece('White', 'Rook');
const kingB = createChessPiece('Black', 'King');
const kingW = createChessPiece('White', 'King');
const queenB = createChessPiece('Black', 'Queen');
const queenW = createChessPiece('White', 'Queen');
const bishopB = createChessPiece('Black', 'Bishop');
const bishopW = createChessPiece('White', 'Bishop');
const knightB = createChessPiece('Black', 'Knight');
const knightW = createChessPiece('White', 'Knight');

let piece = {
    position: null,
    type: null,
    color: null
}

//#endregion


//#region Setup

window.addEventListener("DOMContentLoaded", async () => {

})

function createChessPiece(color, type) {
    let img = document.createElement('img');
    img.src = 'ChessFiles/' + type + color[0].toUpperCase() + '.png';
    img.alt = type + ' ' + color;
    img.classList.add('piece');
    img.setAttribute('data-color', color);
    img.style.width = '100%';
    img.style.height = '100%';
    return img;
}

//#endregion


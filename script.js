const chessboard = document.getElementById('chessboard');
const currentTurnSpan = document.getElementById('current-turn');
const resetButton = document.getElementById('reset-button');

const pieces = {
    'R': '&#9820;', 'N': '&#9822;', 'B': '&#9821;', 'Q': '&#9819;', 'K': '&#9818;', 'P': '&#9823;', // Black
    'r': '&#9814;', 'n': '&#9816;', 'b': '&#9815;', 'q': '&#9813;', 'k': '&#9812;', 'p': '&#9817;'  // White
};

let board = [
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
];

let selectedPiece = null;
let currentTurn = 'white'; // 'white' or 'black'

function initializeBoard() {
    chessboard.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];
            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.classList.add('piece');
                if (piece === piece.toUpperCase()) { // Black piece
                    pieceElement.classList.add('black-piece');
                } else { // White piece
                    pieceElement.classList.add('white-piece');
                }
                pieceElement.innerHTML = pieces[piece];
                pieceElement.dataset.piece = piece; // Store piece type
                square.appendChild(pieceElement);
            }
            square.addEventListener('click', handleSquareClick);
            chessboard.appendChild(square);
        }
    }
    updateTurnDisplay();
}

function updateTurnDisplay() {
    currentTurnSpan.textContent = currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1);
}

function clearHighlights() {
    document.querySelectorAll('.square.selected').forEach(s => s.classList.remove('selected'));
    document.querySelectorAll('.square .highlight').forEach(h => h.remove());
}

function getPieceColor(piece) {
    if (piece === piece.toUpperCase()) return 'black';
    return 'white';
}

function handleSquareClick(event) {
    let targetSquare = event.currentTarget;
    let targetPieceElement = targetSquare.querySelector('.piece');

    if (selectedPiece) {
        const selectedRow = parseInt(selectedPiece.dataset.row);
        const selectedCol = parseInt(selectedPiece.dataset.col);
        const targetRow = parseInt(targetSquare.dataset.row);
        const targetCol = parseInt(targetSquare.dataset.col);

        // If clicking on a highlighted move square
        if (targetSquare.querySelector('.highlight')) {
            movePiece(selectedRow, selectedCol, targetRow, targetCol);
            clearHighlights();
            selectedPiece = null;
            switchTurn();
            return;
        }

        clearHighlights();
        selectedPiece = null;
    }

    if (targetPieceElement) {
        const pieceType = targetPieceElement.dataset.piece;
        const pieceColor = getPieceColor(pieceType);

        if (pieceColor === currentTurn) {
            selectedPiece = targetSquare;
            targetSquare.classList.add('selected');
            showPossibleMoves(parseInt(targetSquare.dataset.row), parseInt(targetSquare.dataset.col), pieceType);
        }
    }
}

function switchTurn() {
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    updateTurnDisplay();
}

function movePiece(startRow, startCol, endRow, endCol) {
    const piece = board[startRow][startCol];
    board[endRow][endCol] = piece; // Move piece
    board[startRow][startCol] = ''; // Clear original square
    initializeBoard(); // Redraw board
}

function isValidMove(startRow, startCol, endRow, endCol, piece) {
    const targetPiece = board[endRow][endCol];
    const pieceColor = getPieceColor(piece);
    const targetColor = targetPiece ? getPieceColor(targetPiece) : null;

    if (targetColor && targetColor === pieceColor) {
        return false; // Cannot capture your own piece
    }

    // Basic piece movement validation (simplified for demonstration)
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);

    switch (piece.toLowerCase()) {
        case 'p': // Pawn
            const forwardDirection = (pieceColor === 'white') ? -1 : 1;
            // Normal move
            if (colDiff === 0 && endRow === startRow + forwardDirection && targetPiece === '') {
                return true;
            }
            // Initial two-square move
            if (colDiff === 0 && targetPiece === '' &&
                ((pieceColor === 'white' && startRow === 6 && endRow === 4) ||
                 (pieceColor === 'black' && startRow === 1 && endRow === 3))) {
                return true;
            }
            // Capture
            if (colDiff === 1 && endRow === startRow + forwardDirection && targetPiece !== '') {
                return true;
            }
            break;
        case 'r': // Rook
            if ((rowDiff > 0 && colDiff === 0) || (rowDiff === 0 && colDiff > 0)) {
                return true; // Simple check, doesn't check for blocking pieces
            }
            break;
        case 'n': // Knight
            if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
                return true;
            }
            break;
        case 'b': // Bishop
            if (rowDiff === colDiff && rowDiff > 0) {
                return true; // Simple check, doesn't check for blocking pieces
            }
            break;
        case 'q': // Queen
            if ((rowDiff === colDiff && rowDiff > 0) || (rowDiff > 0 && colDiff === 0) || (rowDiff === 0 && colDiff > 0)) {
                return true; // Simple check, doesn't check for blocking pieces
            }
            break;
        case 'k': // King
            if (rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0)) {
                return true;
            }
            break;
    }
    return false;
}

function showPossibleMoves(row, col, piece) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (isValidMove(row, col, r, c, piece)) {
                const targetSquare = document.querySelector(`.square[data-row="${r}"][data-col="${c}"]`);
                const highlight = document.createElement('div');
                highlight.classList.add('highlight');
                targetSquare.appendChild(highlight);
            }
        }
    }
}

resetButton.addEventListener('click', () => {
    board = [
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
    ];
    selectedPiece = null;
    currentTurn = 'white';
    initializeBoard();
});

initializeBoard();
document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const piecesContainer = document.getElementById('pieces-container');
    const currentPlayerDisplay = document.getElementById('current-player');
    const selectedPieceContainer = document.getElementById('selected-piece-container');
    const selectedPieceElement = document.getElementById('selected-piece');
    const rotatePieceButton = document.getElementById('rotate-piece');
    const deselectPieceButton = document.getElementById('deselect-piece');
    let selectedPiece = null;
    let selectedPieceKey = null;
    const players = ['Blue', 'Red', 'Green', 'Yellow'];
    let currentPlayerIndex = 0;
    const firstMove = [true, true, true, true]; // Track if it's the first move for each player

    // Create a 20x20 grid
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => {
                if (selectedPiece) {
                    const dotPosition = getDotPosition(selectedPiece);
                    const startRow = i - dotPosition[0];
                    const startCol = j - dotPosition[1];
                    if (firstMove[currentPlayerIndex]) {
                        if (isValidFirstMove(startRow, startCol) && fitsInGrid(selectedPiece, startRow, startCol)) {
                            placePiece(selectedPiece, startRow, startCol);
                            firstMove[currentPlayerIndex] = false;
                            selectedPiece = null;
                            selectedPieceKey = null;
                            selectedPieceElement.innerHTML = '';
                            switchPlayer();
                        } else {
                            alert('First move must be in your designated corner and fit within the grid.');
                        }
                    } else {
                        if (fitsInGrid(selectedPiece, startRow, startCol) && isValidPlacement(selectedPiece, startRow, startCol)) {
                            placePiece(selectedPiece, startRow, startCol);
                            selectedPiece = null;
                            selectedPieceKey = null;
                            selectedPieceElement.innerHTML = '';
                            switchPlayer();
                        } else {
                            alert('Piece must fit within the grid, have at least one cell diagonally adjacent to another cell of the same color, and not touch any cell of another piece.');
                        }
                    }
                }
            });
            gameBoard.appendChild(cell);
        }
    }

    // Define Blokus pieces
    const pieces = {
        I1: [[0, 0]],
        I2: [[0, 0], [0, 1]],
        I3: [[0, 0], [0, 1], [0, 2]],
        I4: [[0, 0], [0, 1], [0, 2], [0, 3]],
        I5: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
        L3: [[0, 0], [1, 0], [1, 1]],
        L4: [[0, 0], [1, 0], [2, 0], [2, 1]],
        L5: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],
        T4: [[0, 0], [0, 1], [0, 2], [1, 1]],
        T5: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
        O: [[0, 0], [0, 1], [1, 0], [1, 1]],
        S4: [[0, 1], [0, 2], [1, 0], [1, 1]],
        S5: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 0]],
        L5_2: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
        P: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]],
        U: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]],
        X: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
        Z: [[0, 0], [0, 1], [1, 1], [1, 2]],
        ES: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]],
        F: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
        T: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 0]],
    };

    // Initialize player pieces
    const playerPieces = players.map(() => JSON.parse(JSON.stringify(pieces)));

    // Function to place a piece on the board
    const placePiece = (piece, startRow, startCol) => {
        piece.forEach(([rowOffset, colOffset]) => {
            const row = startRow + rowOffset;
            const col = startCol + colOffset;
            const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
            if (cell) {
                cell.classList.add('occupied');
                cell.style.backgroundColor = players[currentPlayerIndex].toLowerCase();
            }
        });
    };

    // Function to check if the first move is valid
    const isValidFirstMove = (row, col) => {
        if (currentPlayerIndex === 0 && row === 0 && col === 0) return true; // Blue
        if (currentPlayerIndex === 1 && row === 0 && col === 19) return true; // Red
        if (currentPlayerIndex === 2 && row === 19 && col === 0) return true; // Green
        if (currentPlayerIndex === 3 && row === 19 && col === 19) return true; // Yellow
        return false;
    };

    // Function to check if the piece fits within the grid
    const fitsInGrid = (piece, startRow, startCol) => {
        return piece.every(([rowOffset, colOffset]) => {
            const row = startRow + rowOffset;
            const col = startCol + colOffset;
            return row >= 0 && row < 20 && col >= 0 && col < 20;
        });
    };

    // Function to check if the placement is valid
    const isValidPlacement = (piece, startRow, startCol) => {
        let hasDiagonal = false;
        return piece.every(([rowOffset, colOffset]) => {
            const row = startRow + rowOffset;
            const col = startCol + colOffset;
            const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
            if (cell.classList.contains('occupied')) {
                return false;
            }
            const adjacentCells = [
                document.querySelector(`.cell[data-row='${row - 1}'][data-col='${col}']`),
                document.querySelector(`.cell[data-row='${row + 1}'][data-col='${col}']`),
                document.querySelector(`.cell[data-row='${row}'][data-col='${col - 1}']`),
                document.querySelector(`.cell[data-row='${row}'][data-col='${col + 1}']`)
            ];
            if (adjacentCells.some(adjCell => adjCell && adjCell.classList.contains('occupied') && adjCell.style.backgroundColor !== players[currentPlayerIndex].toLowerCase())) {
                return false;
            }
            const diagonalCells = [
                document.querySelector(`.cell[data-row='${row - 1}'][data-col='${col - 1}']`),
                document.querySelector(`.cell[data-row='${row - 1}'][data-col='${col + 1}']`),
                document.querySelector(`.cell[data-row='${row + 1}'][data-col='${col - 1}']`),
                document.querySelector(`.cell[data-row='${row + 1}'][data-col='${col + 1}']`)
            ];
            if (diagonalCells.some(diagCell => diagCell && diagCell.classList.contains('occupied') && diagCell.style.backgroundColor === players[currentPlayerIndex].toLowerCase())) {
                hasDiagonal = true;
            }
            return true;
        }) && hasDiagonal;
    };

    // Function to get the position of the dot on the piece
    const getDotPosition = (piece) => {
        const firstRow = Math.min(...piece.map(p => p[0]));
        const firstRowCells = piece.filter(p => p[0] === firstRow);
        const leftmostCell = Math.min(...firstRowCells.map(p => p[1]));
        return [firstRow, leftmostCell];
    };

    // Function to switch to the next player
    const switchPlayer = () => {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        currentPlayerDisplay.textContent = `Current Player: ${players[currentPlayerIndex]}`;
        renderPieces();
    };

    // Function to render pieces in the pieces container
    const renderPieces = () => {
        piecesContainer.innerHTML = '';
        const currentPieces = playerPieces[currentPlayerIndex];
        Object.keys(currentPieces).forEach(pieceKey => {
            const piece = currentPieces[pieceKey];
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece');
            pieceElement.style.gridTemplateColumns = `repeat(${Math.max(...piece.map(p => p[1])) + 1}, 20px)`;
            pieceElement.style.gridTemplateRows = `repeat(${Math.max(...piece.map(p => p[0])) + 1}, 20px)`;

            piece.forEach(([row, col]) => {
                const cell = document.createElement('div');
                cell.classList.add('piece-cell');
                cell.style.gridRowStart = row + 1;
                cell.style.gridColumnStart = col + 1;
                cell.style.backgroundColor = players[currentPlayerIndex].toLowerCase();
                if (row === 0 && col === Math.min(...piece.filter(p => p[0] === 0).map(p => p[1]))) {
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    cell.appendChild(dot);
                }
                pieceElement.appendChild(cell);
            });

            pieceElement.addEventListener('click', () => {
                selectedPiece = piece;
                selectedPieceKey = pieceKey;
                renderSelectedPiece();
            });

            piecesContainer.appendChild(pieceElement);
        });
    };

    // Function to render the selected piece
    const renderSelectedPiece = () => {
        selectedPieceElement.innerHTML = '';
        if (selectedPiece) {
            selectedPieceElement.style.gridTemplateColumns = `repeat(${Math.max(...selectedPiece.map(p => p[1])) + 1}, 20px)`;
            selectedPieceElement.style.gridTemplateRows = `repeat(${Math.max(...selectedPiece.map(p => p[0])) + 1}, 20px)`;

            selectedPiece.forEach(([row, col]) => {
                const cell = document.createElement('div');
                cell.classList.add('piece-cell');
                cell.style.gridRowStart = row + 1;
                cell.style.gridColumnStart = col + 1;
                cell.style.backgroundColor = players[currentPlayerIndex].toLowerCase();
                if (row === 0 && col === Math.min(...selectedPiece.filter(p => p[0] === 0).map(p => p[1]))) {
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    cell.appendChild(dot);
                }
                selectedPieceElement.appendChild(cell);
            });
        }
    };

    // Function to rotate the selected piece
    const rotatePiece = () => {
        if (selectedPiece) {
            const rotatedPiece = selectedPiece.map(([row, col]) => [-col, row]);
            const minRow = Math.min(...rotatedPiece.map(([row, _]) => row));
            const minCol = Math.min(...rotatedPiece.map(([_, col]) => col));
            selectedPiece = rotatedPiece.map(([row, col]) => [row - minRow, col - minCol]);
            renderSelectedPiece();
        }
    };

    // Function to deselect the selected piece
    const deselectPiece = () => {
        if (selectedPieceKey) {
            playerPieces[currentPlayerIndex][selectedPieceKey] = selectedPiece;
            selectedPiece = null;
            selectedPieceKey = null;
            selectedPieceElement.innerHTML = '';
            renderPieces();
        }
    };

    // Event listeners for rotate and deselect buttons
    rotatePieceButton.addEventListener('click', rotatePiece);
    deselectPieceButton.addEventListener('click', deselectPiece);

    // Render pieces
    renderPieces();
});
const GameBoard = (() => {
    let board = ["", "", "", "", "", "", "", "", ""];

    const getBoard = () => board;

    const updateBoard = (symbol, index) => {
        if (board[index] === "") {
            board[index] = symbol;
            return true;
        }

        return false;
    };

    const checkWinner = (newBoard, symbol) => {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (
                newBoard[a] === symbol &&
                newBoard[a] === newBoard[b] &&
                newBoard[a] === newBoard[c]
            ) {
                return true;
            }
        }
        return false;
    };

    const resetBoard = () => {
        board = Array(9).fill("");
    };

    const getEmptyIndex = (newBoard) => {
        let emptyIndex = [];
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === "") {
                emptyIndex.push(i);
            }
        }
        return emptyIndex;
    };

    const createNewBoard = (index, symbol) => {
        let newBoard = [...board];
        newBoard[index] = symbol;
        return newBoard;
    };
    return {
        getBoard,
        updateBoard,
        checkWinner,
        resetBoard,
        getEmptyIndex,
        createNewBoard,
    };
})();

const Game = (() => {
    let player1;
    let player2;
    let currentPlayer;
    let gameover = false;
    let easy;

    const startGame = () => {
        let playerName = Display.getInput("#player-name-input");
        let playerSymbol = Display.getPlayerSymbol();
        let computerSymbol = playerSymbol === "X" ? "O" : "X";

        player1 = Player(playerName, playerSymbol, 0);
        Display.updateScore(true, player1.score.toString());
        player2 = Player("Computer", computerSymbol, 0);
        Display.updateScore(false, player2.score.toString());
        currentPlayer = player1;
        Display.addPlayerNames(player1.name, player2.name);
        Display.renderBoard();
    };

    const playRound = (index) => {
        if (!gameover && currentPlayer === player1) {
            if (GameBoard.updateBoard(player1.symbol, index)) {
                Display.renderBoard();
                _switchPlayer();

                if (
                    GameBoard.checkWinner(GameBoard.getBoard(), player1.symbol)
                ) {
                    Display.winnerMessage(player1.name + " wins!");
                    player1.score++;
                    Display.updateScore(true, player1.score.toString());
                    gameover = true;
                } else if (
                    GameBoard.getEmptyIndex(GameBoard.getBoard()).length === 0
                ) {
                    Display.winnerMessage("Tie");
                    gameover = true;
                } else {
                    _computerPlayRound();
                }
            }
        }
        return;
    };

    const resetGame = () => {
        GameBoard.resetBoard();
        Display.renderBoard();
        gameover = false;
        Display.winnerMessage("");
        currentPlayer = player1;
    };

    const setDifficulty = (difficulty) => {
        if (difficulty == 1) {
            easy = true;
        } else {
            easy = false;
        }
    };

    const _computerPlayRound = () => {
        if (easy) {
            do {
                cellIndex = Math.floor(Math.random() * 9);
            } while (!GameBoard.updateBoard(player2.symbol, cellIndex));
        } else {
            let bestMove = _minimax(GameBoard.getBoard(), player2, false);
            GameBoard.updateBoard(player2.symbol, bestMove.index);
        }
        Display.renderBoard();
        if (GameBoard.checkWinner(GameBoard.getBoard(), player2.symbol)) {
            Display.winnerMessage(player2.name + " wins");
            player2.score++;
            Display.updateScore(false, player2.score.toString());
            gameover = true;
        } else if (GameBoard.getEmptyIndex(GameBoard.getBoard()).length === 0) {
            Display.winnerMessage("Tie");
            gameover = true;
        } else {
            _switchPlayer();
        }
    };

    const _switchPlayer = () => {
        if (currentPlayer == player1) {
            currentPlayer = player2;
        } else {
            currentPlayer = player1;
        }
    };

    const _minimax = (board, player, maximizingPlayer) => {
        let moves = [];
        let emptyIndices = GameBoard.getEmptyIndex(board);

        // Check if the game is at a terminal state
        if (GameBoard.checkWinner(board, player1.symbol)) {
            return { score: 10 };
        } else if (GameBoard.checkWinner(board, player2.symbol)) {
            return { score: -10 };
        } else if (emptyIndices.length === 0) {
            return { score: 0 };
        }

        emptyIndices.forEach((index) => {
            let move = {
                index: index,
                score: 0,
            };

            board[index] = player.symbol;
            let nextPlayer = maximizingPlayer ? player2 : player1;
            let result = _minimax(board, nextPlayer, !maximizingPlayer);
            move.score = result.score;
            board[index] = "";
            moves.push(move);
        });

        let bestMove;
        if (maximizingPlayer) {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = moves[i];
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = moves[i];
                }
            }
        }

        return bestMove;
    };

    return { startGame, playRound, resetGame, setDifficulty };
})();

const Player = (name, symbol, score) => {
    return { name, symbol, score };
};

const Display = (() => {
    const xChoice = document.querySelector("#X");
    const oChoice = document.querySelector("#O");
    const startButton = document.querySelector(".start-button");
    const cells = document.querySelectorAll(".cell");
    const resetButton = document.querySelector(".reset");

    const _changeSign = (sign) => {
        if (sign === "X" && !xChoice.classList.contains("chosen")) {
            xChoice.classList.add("chosen");
            oChoice.classList.remove("chosen");
        } else if (sign === "O" && !oChoice.classList.contains("chosen")) {
            oChoice.classList.add("chosen");
            xChoice.classList.remove("chosen");
        }
    };

    const _switchScreen = () => {
        document.querySelector(".start-options").classList.add("hidden");
        document.querySelector(".game-start-board").classList.remove("hidden");
    };

    const getInput = (queryString) => {
        return document.querySelector(queryString).value;
    };

    const getPlayerSymbol = () => {
        if (xChoice.classList.contains("chosen")) {
            return "X";
        }
        return "O";
    };

    const renderBoard = () => {
        const board = GameBoard.getBoard();
        cells.forEach((element, index) => {
            element.textContent = board[index];
        });
    };

    const addPlayerNames = (playerName1, playerName2) => {
        document.querySelector("#player-name-1").textContent = playerName1;
        document.querySelector("#player-name-2").textContent = playerName2;
    };

    const winnerMessage = (text) => {
        document.querySelector(".winner-msg").textContent = text;
    };

    const updateScore = (player, score) => {
        if (player) {
            document.querySelector("#player").textContent = score;
        } else {
            document.querySelector("#computer").textContent = score;
        }
    };

    const _getDifficulty = () => {
        Game.setDifficulty(document.querySelector("#difficulty").value);
    };

    xChoice.addEventListener("click", _changeSign.bind(this, "X"));
    oChoice.addEventListener("click", _changeSign.bind(this, "O"));
    startButton.addEventListener("click", _switchScreen);
    startButton.addEventListener("click", _getDifficulty);
    startButton.addEventListener("click", Game.startGame);
    resetButton.addEventListener("click", Game.resetGame);
    cells.forEach((cell, index) => {
        cell.addEventListener("click", () => {
            Game.playRound(index);
        });
    });

    return {
        getInput,
        getPlayerSymbol,
        renderBoard,
        addPlayerNames,
        winnerMessage,
        updateScore,
    };
})();

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

    const boardFull = () => {
        if (!board.includes("")) {
            return true;
        }
        return false;
    };

    const checkWinner = () => {
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
                board[a] !== "" &&
                board[a] === board[b] &&
                board[a] === board[c]
            ) {
                return true;
            }
        }
        return false;
    };

    const resetBoard = () => {
        board = board.map(() => "");
    };

    return { getBoard, updateBoard, boardFull, checkWinner, resetBoard };
})();

const Game = (() => {
    let player1;
    let player2;
    let currentPlayer;
    let gameover = false;

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

                if (GameBoard.checkWinner()) {
                    Display.winnerMessage(player1.name + " wins!");
                    player1.score++;
                    Display.updateScore(true, player1.score.toString());
                    gameover = true;
                } else if (GameBoard.boardFull()) {
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

    const _computerPlayRound = () => {
        let cellIndex;
        do {
            cellIndex = Math.floor(Math.random() * 9);
        } while (!GameBoard.updateBoard(player2.symbol, cellIndex));
        Display.renderBoard();

        if (GameBoard.checkWinner()) {
            Display.winnerMessage(player2.name + " wins");
            player2.score++;
            Display.updateScore(false, player2.score.toString());
            gameover = true;
        } else if (GameBoard.boardFull()) {
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

    return { startGame, playRound, resetGame };
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

    xChoice.addEventListener("click", _changeSign.bind(this, "X"));
    oChoice.addEventListener("click", _changeSign.bind(this, "O"));
    startButton.addEventListener("click", _switchScreen);
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

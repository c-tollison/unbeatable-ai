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
                return combination;
            }
        }
        return null;
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

    return {
        getBoard,
        updateBoard,
        checkWinner,
        resetBoard,
        getEmptyIndex,
    };
})();

const Game = (() => {
    let player1;
    let player2;
    let currentPlayer;
    let gameover = false;
    let easy = false;
    let computerThinking = false;

    const startGame = () => {
        let playerName = Display.getInput("#player-name-input");
        let playerSymbol = Display.getPlayerSymbol();
        let computerSymbol = playerSymbol === "X" ? "O" : "X";

        player1 = Player(playerName || "Player", playerSymbol, 0);
        Display.updateScore(true, player1.score.toString());
        player2 = Player("Computer", computerSymbol, 0);
        Display.updateScore(false, player2.score.toString());
        currentPlayer = player1;
        Display.addPlayerNames(player1.name, player2.name);
        Display.renderBoard();
        Display.turnMessage(currentPlayer.name + "'s turn");
    };

    const playRound = (index) => {
        if (gameover || computerThinking || currentPlayer !== player1) {
            return;
        }
        if (!GameBoard.updateBoard(player1.symbol, index)) {
            return;
        }
        Display.renderBoard();

        const winCombo = GameBoard.checkWinner(
            GameBoard.getBoard(),
            player1.symbol
        );
        if (winCombo) {
            Display.winnerMessage(player1.name + " wins!");
            Display.turnMessage("");
            Display.showWinLine(winCombo);
            player1.score++;
            Display.updateScore(true, player1.score.toString());
            gameover = true;
            return;
        }
        if (GameBoard.getEmptyIndex(GameBoard.getBoard()).length === 0) {
            Display.winnerMessage("Tie");
            Display.turnMessage("");
            gameover = true;
            return;
        }

        _switchPlayer();
        Display.turnMessage(currentPlayer.name + "'s turn");
        _computerPlayRound();
    };

    const resetGame = () => {
        GameBoard.resetBoard();
        Display.renderBoard();
        Display.hideWinLine();
        gameover = false;
        computerThinking = false;
        Display.winnerMessage("");
        if (player1) {
            currentPlayer = player1;
            Display.turnMessage(currentPlayer.name + "'s turn");
        }
    };

    const setDifficulty = (difficulty) => {
        easy = difficulty === "1";
    };

    const _computerPlayRound = () => {
        computerThinking = true;
        setTimeout(() => {
            if (easy) {
                let cellIndex;
                do {
                    cellIndex = Math.floor(Math.random() * 9);
                } while (!GameBoard.updateBoard(player2.symbol, cellIndex));
            } else {
                let bestMove = _minimax(
                    GameBoard.getBoard(),
                    player2,
                    false,
                    0
                );
                GameBoard.updateBoard(player2.symbol, bestMove.index);
            }
            Display.renderBoard();
            computerThinking = false;

            const winCombo = GameBoard.checkWinner(
                GameBoard.getBoard(),
                player2.symbol
            );
            if (winCombo) {
                Display.winnerMessage(player2.name + " wins");
                Display.turnMessage("");
                Display.showWinLine(winCombo);
                player2.score++;
                Display.updateScore(false, player2.score.toString());
                gameover = true;
            } else if (
                GameBoard.getEmptyIndex(GameBoard.getBoard()).length === 0
            ) {
                Display.winnerMessage("Tie");
                Display.turnMessage("");
                gameover = true;
            } else {
                _switchPlayer();
                Display.turnMessage(currentPlayer.name + "'s turn");
            }
        }, 250);
    };

    const _switchPlayer = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    };

    const _minimax = (board, player, maximizingPlayer, depth) => {
        let emptyIndices = GameBoard.getEmptyIndex(board);

        if (GameBoard.checkWinner(board, player1.symbol)) {
            return { score: 10 - depth };
        } else if (GameBoard.checkWinner(board, player2.symbol)) {
            return { score: depth - 10 };
        } else if (emptyIndices.length === 0) {
            return { score: 0 };
        }

        let moves = [];
        emptyIndices.forEach((index) => {
            let move = { index, score: 0 };
            board[index] = player.symbol;
            let nextPlayer = maximizingPlayer ? player2 : player1;
            let result = _minimax(
                board,
                nextPlayer,
                !maximizingPlayer,
                depth + 1
            );
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
            xChoice.setAttribute("aria-pressed", "true");
            oChoice.classList.remove("chosen");
            oChoice.setAttribute("aria-pressed", "false");
        } else if (sign === "O" && !oChoice.classList.contains("chosen")) {
            oChoice.classList.add("chosen");
            oChoice.setAttribute("aria-pressed", "true");
            xChoice.classList.remove("chosen");
            xChoice.setAttribute("aria-pressed", "false");
        }
    };

    const _showGameScreen = () => {
        document.querySelector(".start-options").classList.add("hidden");
        document.querySelector(".game-start-board").classList.remove("hidden");
        document.querySelector(".game-controls").classList.remove("hidden");
    };

    const showStartScreen = () => {
        document.querySelector(".game-start-board").classList.add("hidden");
        document.querySelector(".game-controls").classList.add("hidden");
        document.querySelector(".start-options").classList.remove("hidden");
        winnerMessage("");
        turnMessage("");
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

    let prevBoard = ["", "", "", "", "", "", "", "", ""];

    const renderBoard = () => {
        const board = GameBoard.getBoard();
        cells.forEach((element, index) => {
            const filled = board[index] !== "";
            const changed = board[index] !== prevBoard[index];

            if (changed) {
                element.innerHTML = "";
                if (filled) {
                    const span = document.createElement("span");
                    span.className = "mark just-placed";
                    span.textContent = board[index];
                    element.appendChild(span);
                }
            }

            element.disabled = filled;
            const label = filled
                ? `Cell ${index + 1}, ${board[index]}`
                : `Cell ${index + 1}, empty`;
            element.setAttribute("aria-label", label);
        });
        prevBoard = [...board];
    };

    const showWinLine = (combo) => {
        const boardEl = document.querySelector(".game-board");
        let svg = boardEl.querySelector(".win-line");
        if (!svg) {
            svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "win-line");
            svg.setAttribute("viewBox", "0 0 310 310");
            svg.setAttribute("preserveAspectRatio", "none");
            boardEl.appendChild(svg);
        }
        // Replace line each time so the draw-in animation restarts.
        svg.innerHTML = "";
        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );
        const center = (n) => 50 + 105 * n;
        const start = combo[0];
        const end = combo[2];
        line.setAttribute("x1", center(start % 3));
        line.setAttribute("y1", center(Math.floor(start / 3)));
        line.setAttribute("x2", center(end % 3));
        line.setAttribute("y2", center(Math.floor(end / 3)));
        svg.appendChild(line);
        svg.classList.remove("hidden");
    };

    const hideWinLine = () => {
        const svg = document.querySelector(".game-board .win-line");
        if (svg) {
            svg.classList.add("hidden");
            svg.innerHTML = "";
        }
    };

    const addPlayerNames = (playerName1, playerName2) => {
        document.querySelector("#player-name-1").textContent = playerName1;
        document.querySelector("#player-name-2").textContent = playerName2;
    };

    const winnerMessage = (text) => {
        document.querySelector(".winner-msg").textContent = text;
    };

    const turnMessage = (text) => {
        document.querySelector(".turn-msg").textContent = text;
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

    const backButton = document.querySelector(".back");

    xChoice.addEventListener("click", () => _changeSign("X"));
    oChoice.addEventListener("click", () => _changeSign("O"));
    startButton.addEventListener("click", _showGameScreen);
    startButton.addEventListener("click", _getDifficulty);
    startButton.addEventListener("click", Game.startGame);
    resetButton.addEventListener("click", Game.resetGame);
    backButton.addEventListener("click", () => {
        Game.resetGame();
        showStartScreen();
    });
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
        turnMessage,
        updateScore,
        showStartScreen,
        showWinLine,
        hideWinLine,
    };
})();

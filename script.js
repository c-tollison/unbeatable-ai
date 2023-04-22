const displayController = (() => {
    const xChoice = document.querySelector("#X");
    const oChoice = document.querySelector("#O");
    const startButton = document.querySelector(".start-button");

    const _changeSign = (sign) => {
        if (sign === "X" && !xChoice.classList.contains("chosen")) {
            xChoice.classList.add("chosen");
            oChoice.classList.remove("chosen");
        } else if (sign === "O" && !oChoice.classList.contains("chosen")) {
            oChoice.classList.add("chosen");
            xChoice.classList.remove("chosen");
        }
    };

    const _startGame = () => {
        document.querySelector(".start-options").classList.add("hidden");
        document.querySelector(".game-board").classList.remove("hidden");
        document.querySelectorAll(".score-card").forEach((div) => {
            div.classList.remove("hidden");
        });
    };

    xChoice.addEventListener("click", _changeSign.bind(this, "X"));
    oChoice.addEventListener("click", _changeSign.bind(this, "O"));
    startButton.addEventListener("click", _startGame);
})();

// Tic-Tac-Toe Game Module
const TicTacToeGame = (() => {
  // Game settings and initial variables value
  let humanPlayer = "X";
  let aiPlayer = "O";
  let origBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  let aiDifficulty = 0.3;
  let MAX = {index: 99, score: 1000};
  let MIN = {index: 99, score: -1000}

  // Function to check available moves on the board
  function checkAvailableMoves(board) {return board.filter(s => s !== "O" && s !== "X");}

  // Function to check if a player has won
  function winning(board, player) {

    // All possible winning combinations of Tic Tac Toe game
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    return winningCombinations.some(combination => combination.every(cell => board[cell] === player));
  }

  // Function to generate a random dumb AI move based on difficulty
  // The lower aiDifficulty value the higher chance AI makes dumb move.
  function generateDumbAIMove(Difficulty) {return Math.random() > Difficulty;}

  // Utility function: find the min and max of two values
  function max(a,b) {return a.score >= b.score ? a : b;}
  function min(a,b) {return a.score <= b.score ? a : b;}
  
  // Alpha-Beta Pruning Minimax Algorithm for AI move selection
  function minimax(newBoard, depth, player, alpha, beta) {
    const availableMoves = checkAvailableMoves(newBoard); // Get the list of available moves
    let theBestMove = {};

    // Check current state of game board: win, lose, or tie
    if (winning(newBoard, humanPlayer)) {return { score: -10 + depth }}
    else if (winning(newBoard, aiPlayer)) {return { score: 10 - depth }}
    else if (availableMoves.length === 0) {return { score: 0 }};

    if (player === aiPlayer) {
      // Maximize AI's score
      for (let i = 0; i < availableMoves.length; i++) {
        //Set new move to game board
        const index = availableMoves[i];
        newBoard[index] = player;

        // Make a recursive call to evaluate the move's score
        let result = minimax(newBoard, depth + 1, humanPlayer, alpha, beta);

        // Create a copy of Result using Object Spread Syntax
        // to avoid potential Object References bugs cause when Result referenced by Alpha or Beta
        result = {...result, index};

        alpha = max(alpha,result); // Update alpha using max function
        newBoard[index] = index; // Reset the move on the game board
        if (alpha.score >= beta.score) {break}
      }
      theBestMove = alpha; // Store the best move and its score
    } else if (player === humanPlayer) {
      // Minimize human's score
      for (let i = 0; i < availableMoves.length; i++) {
        const index = availableMoves[i];
        newBoard[index] = player;
        let result = minimax(newBoard, depth + 1, aiPlayer, alpha, beta);
        result = {...result, index}
        beta = min(beta, result);
        newBoard[index] = index;
        if (alpha.score >= beta.score){break}
      }
      theBestMove = beta;
    }
    return theBestMove; // Return the best move's score along with its index
  }

  // Public methods exposed by the module
  return {
    humanPlayer,
    aiPlayer,
    origBoard,
    aiDifficulty,
    MAX,
    MIN,
    checkAvailableMoves,
    winning,
    generateDumbAIMove,
    minimax,
  };
})();

// User Interface Module
const GAME_BOARD_DOM_CONTROLLER = (() => {
  // DOM elements
  const messageDiv = document.querySelector('.message');
  const cells = document.querySelectorAll('.cell');
  const form = document.getElementById('game-input');
  const resetButton = document.querySelector('.reset-game');
  // Game state variables
  let gameInput = {};
  let isGameEnd = false;

  // Function to introduce a delay using promises
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Make new game when user clicks 'Play Again' Button
  async function resetGame() {
    TicTacToeGame.origBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    isGameEnd = false;

    for (let cell of cells) {
      cell.textContent = '';
      cell.classList.remove("X-color", "O-color")
    }
    if (gameInput.player1 === "Human" && gameInput.player2 === 'AI'){
      displayMessage("Player X's Turn");
    }
    else if (gameInput.player1 === "AI" && gameInput.player2 === 'Human') {
      await delay(1000);
      performAIMove();
      displayMessage("Player O's Turn");
    }
    else if (gameInput.player1 === 'Human' && gameInput.player2 === 'Human') {
      TicTacToeGame.humanPlayer = "X";
      displayMessage("Player X's Turn");
    }
    else if (gameInput.player1 === 'AI' && gameInput.player2 === 'AI') {
      displayMessage('');
      await delay(1000);
      handleAIVsAI();
    }
  }

  // Handle form input to start the game
  async function handleGameInput(event) {
    event.preventDefault();
    const input = event.target.elements;
    const modal = document.querySelector(".modal");
    const gameContainter = document.querySelector(".container");

    modal.classList.add('hide-modal');
    form.classList.add('hide-form')
    gameContainter.classList.add('show-game');
    gameInput = {
      player1: input['player1'].value,
      player2: input['player2'].value,
      aiDifficulty: input['ai-difficulty'].value,
    };
    TicTacToeGame.aiDifficulty = parseFloat(gameInput.aiDifficulty);
    if (gameInput.player1 === "Human"){
      displayMessage("Player X's Turn");
    }
    else if (gameInput.player1 === "AI" && gameInput.player2 === "Human") {
      TicTacToeGame.aiPlayer = "X";
      TicTacToeGame.humanPlayer = "O";
      await delay(1500);
      performAIMove();
      displayMessage("Player O's Turn");
    } else if (gameInput.player1 === 'AI' && gameInput.player2 === 'AI') {
      TicTacToeGame.aiPlayer = "X";
      TicTacToeGame.humanPlayer = "O";
      await delay(1500);
      handleAIVsAI();
    }
  }

  // Display messages to the player
  function displayMessage(message) {messageDiv.textContent = message;}

  // Display the winner of the game
  function displayWinner(player) {
    isGameEnd = true;
    if (player === "X") {displayMessage(`Player ${player} (${gameInput.player1}) Won`)}
    else if (player === "O") {displayMessage(`Player ${player} (${gameInput.player2}) Won`)}
    else {displayMessage("It's a Tie")};
  }

  // Handle a move by a human player in Human vs AI mode
  function performHumanMove(event) {
    const cell = event.target;
    cell.textContent = TicTacToeGame.humanPlayer;
    TicTacToeGame.humanPlayer == "X" ? cell.classList.add('X-color') : cell.classList.add('O-color');
    TicTacToeGame.origBoard[event.target.dataset.index] = TicTacToeGame.humanPlayer;
  }

  // Handle a move by a AI player in Human vs AI mode
  function performAIMove() {
    let bestAIMove = {};

    // Check if the AI should make a random dumb move based on difficulty
    if (TicTacToeGame.generateDumbAIMove(TicTacToeGame.aiDifficulty)){
      const availableMoves = TicTacToeGame.checkAvailableMoves(TicTacToeGame.origBoard);
      bestAIMove.index = availableMoves[Math.floor(Math.random() * availableMoves.length)]
    }
    else{
      // Use the minimax algorithm to find the best move for AI
      bestAIMove = TicTacToeGame.minimax(TicTacToeGame.origBoard,0,TicTacToeGame.aiPlayer,TicTacToeGame.MIN,TicTacToeGame.MAX)
    }

    // Apply the chosen AI move to the game board
    TicTacToeGame.origBoard[bestAIMove.index] = TicTacToeGame.aiPlayer;
    const aiMove = document.querySelector(`[data-index="${bestAIMove.index}"]`)    
    aiMove.textContent = TicTacToeGame.aiPlayer;
    
    // Apply styling based on AI's symbol
    TicTacToeGame.aiPlayer == "X" ? aiMove.classList.add('X-color') : aiMove.classList.add('O-color');
    
    // Check if the AI has won
    if (TicTacToeGame.winning(TicTacToeGame.origBoard, TicTacToeGame.aiPlayer)){displayWinner(TicTacToeGame.aiPlayer)}
    else if (TicTacToeGame.checkAvailableMoves(TicTacToeGame.origBoard).length === 0) {displayWinner('TIE')}
  }

  // Handle the game between two human players
  function handleHumanVsHuman(event) {
    const cell = event.target;
    cell.textContent = TicTacToeGame.humanPlayer;
    TicTacToeGame.humanPlayer == "X" ? cell.classList.add('X-color') : cell.classList.add('O-color');
    TicTacToeGame.origBoard[event.target.dataset.index] = TicTacToeGame.humanPlayer;

    if (TicTacToeGame.winning(TicTacToeGame.origBoard, TicTacToeGame.humanPlayer)) {displayWinner(TicTacToeGame.humanPlayer);}
    else if (TicTacToeGame.checkAvailableMoves(TicTacToeGame.origBoard).length === 0) {displayWinner('TIE')}
    else{
      if (TicTacToeGame.humanPlayer === "X"){
        TicTacToeGame.humanPlayer = "O";
        displayMessage("Player O's Turn");
      }
      else {
        TicTacToeGame.humanPlayer = "X";
        displayMessage("Player X's Turn");
      }
    }  
  }
  
  // Handle the game between a human player and AI
  function handleHumanVsAI(event) {
    performHumanMove(event);
    if (TicTacToeGame.winning(TicTacToeGame.origBoard, TicTacToeGame.humanPlayer)) {displayWinner(TicTacToeGame.humanPlayer)}
    else if (TicTacToeGame.checkAvailableMoves(TicTacToeGame.origBoard).length === 0) {displayWinner('TIE')}
    else {performAIMove()}
  }

  // Handle the game between two AIs
  function handleAIVsAI() {
    let currentIndex = 0;

    // Handle the next move of each AI Player
    function playNextMove() {
      // Determine the current player based on the index
      const currentPlayer = (currentIndex % 2 === 0) ? TicTacToeGame.aiPlayer : TicTacToeGame.humanPlayer;
      let bestAIMove ={};

      // Check if the AI should make a random dumb move based on difficulty
      if (TicTacToeGame.generateDumbAIMove(TicTacToeGame.aiDifficulty)) {
        const availableMoves = TicTacToeGame.checkAvailableMoves(TicTacToeGame.origBoard);
        bestAIMove.index = availableMoves[Math.floor(Math.random() * availableMoves.length)]  
      }
      else {
        // Use the minimax algorithm to find the best move
        bestAIMove = TicTacToeGame.minimax(TicTacToeGame.origBoard, 0, currentPlayer,TicTacToeGame.MIN,TicTacToeGame.MAX);
      }

      // Apply the chosen AI move to the game board
      TicTacToeGame.origBoard[bestAIMove.index] = currentPlayer;
      const aiMove = document.querySelector(`[data-index="${bestAIMove.index}"]`);    
      aiMove.textContent = currentPlayer;

      // Apply styling based on current player's symbol
      currentPlayer == "X" ? aiMove.classList.add('X-color') : aiMove.classList.add('O-color');

      // Check if the current player has won
      if (TicTacToeGame.winning(TicTacToeGame.origBoard, currentPlayer)) {displayWinner(currentPlayer)}
      else if (TicTacToeGame.checkAvailableMoves(TicTacToeGame.origBoard).length === 0) {displayWinner('TIE');}
      else {
        currentIndex++; //Move to the next AI player's turn
        setTimeout(playNextMove, 150); // Delay before playing the next move
      }
    }
    playNextMove(); // Initialize the AI vs. AI game
  }

  // Handle clicks on the game cells
  function handleCellClick(event) {
    if (event.target.textContent == '' && !isGameEnd){
      if (gameInput.player1 == 'Human' && gameInput.player2 == 'Human'){handleHumanVsHuman(event)}
      else {handleHumanVsAI(event)}
    } 
  }

  // Update the footer year with the current year
  function updateFooterYear() {
    const currentYear = new Date().getFullYear();
    document.getElementById('currentYear').textContent = currentYear;
  }

  // Initialize the UI and Game Logic
  function initialize() {
    updateFooterYear()
    form.addEventListener("submit", handleGameInput);
    resetButton.addEventListener("click", resetGame);
    for (let cell of cells) {cell.addEventListener('click', handleCellClick)};      
  }
  // Public method to start the UI and Game Logic
  return {
    initialize,
  };
})();

const AI_MODE_DOM_CONTROLLER = (() => {
  const radioPlayer1 = document.querySelectorAll('input[type="radio"][name="player1"]');
  const radioPlayer2 = document.querySelectorAll('input[type="radio"][name="player2"]');
  let player1 = '';
  let player2 = '';

  // Function to check and update the AI mode div visibility
  function updateAIModeVisibility() {
    const div = document.querySelector('.input-box.ai');
    const isAIMode =
      (player1 === "Human" && player2 === "AI") ||
      (player1 === "AI" && player2 === "Human") ||
      (player1 === "AI" && player2 === "AI");
    if (isAIMode) {
      div.classList.add('show-ai');
    } else {
      div.classList.remove('show-ai');
    }
  }
  // Event listener function for radio input changes
  function onRadioChange(event, player) {
    if (player === 'player1') {
      player1 = event.target.value;
    } else if (player === 'player2') {
      player2 = event.target.value;
    }
    updateAIModeVisibility();
  }
  
  // Add event listeners to radio inputs
  function initialize() {
    for (let i = 0; i < radioPlayer1.length; i++) {
      radioPlayer1[i].addEventListener('change', (event) => onRadioChange(event, 'player1'));
      radioPlayer2[i].addEventListener('change', (event) => onRadioChange(event, 'player2'));
    }
  }

  return {
    initialize,
  };
})();

// Initialize the UI and Game Logic
AI_MODE_DOM_CONTROLLER.initialize();
GAME_BOARD_DOM_CONTROLLER.initialize();
let dictionary = new Set();

let startWord = "";
let endWord = "";
let currentWord = "";
let step = 0;
let bestScore = 0;
let ladderWords = [];
let gameOver = false;

async function loadDictionary() {
  const response = await fetch("words.txt");
  const text = await response.text();

  dictionary = new Set(
    text
      .split(/\r?\n/)
      .map(word => word.trim())
      .filter(word => word.length > 0)
  );
}

function inDictionary(word) {
  return dictionary.has(word);
}

function singleDiff(word1, word2) {
  if (word1.length !== word2.length) return false;

  let count = 0;

  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) {
      count++;
    }
  }

  return count === 1;
}

function startGame() {
  startWord = document.getElementById("startInput").value.trim();
  endWord = document.getElementById("endInput").value.trim();

  const setupMessage = document.getElementById("setupMessage");

  if (dictionary.size === 0) {
    setupMessage.textContent = "Dictionary is still loading. Please wait.";
    return;
  }

  if (startWord.length === 0 || endWord.length === 0) {
    setupMessage.textContent = "Start word and end word must not be empty.";
    return;
  }

  if (startWord.length !== endWord.length) {
    setupMessage.textContent = "Start word and end word must have the same length.";
    return;
  }

  if (startWord === endWord) {
    setupMessage.textContent = "Start word and end word must not be the same.";
    return;
  }

  if (!inDictionary(startWord) || !inDictionary(endWord)) {
    setupMessage.textContent = "Starting or ending word not found in words file.";
    return;
  }

  currentWord = startWord;
  step = 0;
  ladderWords = [startWord];
  gameOver = false;

  document.getElementById("startWord").textContent = startWord;
  document.getElementById("endWord").textContent = endWord;
  document.getElementById("steps").textContent = step;
  document.getElementById("gameMessage").textContent = "";
  document.getElementById("wordInput").value = "";

  renderLadder();

  document.getElementById("setupSection").classList.add("hidden");
  document.getElementById("gameSection").classList.remove("hidden");
}

function submitWord() {
  if (gameOver) return;

  const input = document.getElementById("wordInput");
  const newWord = input.value.trim();
  const gameMessage = document.getElementById("gameMessage");

  if (!inDictionary(newWord)) {
    gameMessage.textContent = `Error: ${newWord} does not belong to word file.`;
    return;
  }

  if (!singleDiff(currentWord, newWord)) {
    gameMessage.textContent = `Error: ${newWord} does not differ from ${currentWord} by exactly one character.`;
    return;
  }

  let warning = "";
  for (let i = 0; i < ladderWords.length - 1; i++) {
    if (singleDiff(ladderWords[i], newWord)) {
      warning = "Warning: This word could have been played earlier.";
      break;
    }
  }

  ladderWords.push(newWord);
  currentWord = newWord;
  step++;

  document.getElementById("steps").textContent = step;
  input.value = "";
  renderLadder();

  if (newWord === endWord) {
    const score = 8 - (step - 1);

    if (score > bestScore) {
      bestScore = score;
      document.getElementById("bestScore").textContent = bestScore;
    }

    gameMessage.textContent = `${warning} Congratulations! Your Score: ${score}, Best Score: ${bestScore}`;
    gameOver = true;
    return;
  }

  if (step === 8) {
    gameMessage.textContent = "You lose.";
    gameOver = true;
    return;
  }

  gameMessage.textContent = warning;
}

function resetGame() {
  document.getElementById("setupSection").classList.remove("hidden");
  document.getElementById("gameSection").classList.add("hidden");

  document.getElementById("wordInput").value = "";
  document.getElementById("setupMessage").textContent = "";
  document.getElementById("gameMessage").textContent = "";
}

function renderLadder() {
  const ladder = document.getElementById("ladder");
  ladder.innerHTML = "";

  for (const word of ladderWords) {
    const item = document.createElement("li");
    item.textContent = word;
    ladder.appendChild(item);
  }
}

loadDictionary();

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("submitBtn").addEventListener("click", submitWord);
document.getElementById("resetBtn").addEventListener("click", resetGame);

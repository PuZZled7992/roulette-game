const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

const wheel = document.getElementById("wheel");
const rouletteTable = document.getElementById("roulette-table");
const creditsEl = document.getElementById("credits");
const betTotalEl = document.getElementById("bet-total");
const lastSpinEl = document.getElementById("last-spin");
const spinBtn = document.getElementById("spin-btn");
const clearBtn = document.getElementById("clear-btn");

let selectedChip = 5;
let credits = 200;
let spinning = false;
let currentBetTotal = 0;
let lastResult = "-";

const currentBets = {
  red: 0,
  black: 0,
  odd: 0,
  even: 0,
  low: 0,
  high: 0,
  dozen1: 0,
  dozen2: 0,
  dozen3: 0,
  column1: 0,
  column2: 0,
  column3: 0,
  number: {}
};

function getColor(num) {
  if (num === 0) return "green";
  return num % 2 === 0 ? "black" : "red";
}

function getWheelAngle(num) {
  const index = numbers.indexOf(num);
  const segment = 360 / numbers.length;
  return index * segment;
}

function renderTable() {
  rouletteTable.innerHTML = "";

  numbers.forEach((num) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `num ${getColor(num)}`;
    cell.textContent = num;

    const chipTotal = currentBets.number[num] || 0;
    if (chipTotal > 0) {
      cell.classList.add("bet-on");
      const chipLabel = document.createElement("span");
      chipLabel.className = "num-bet-count";
      chipLabel.textContent = chipTotal;
      cell.appendChild(chipLabel);
    }

    cell.addEventListener("click", () => placeNumberBet(num));
    rouletteTable.appendChild(cell);
  });

  document.querySelectorAll(".bet-type").forEach((btn) => {
    const key = btn.dataset.bet;
    const isActive = currentBets[key] > 0;
    btn.classList.toggle("active", isActive);
    btn.textContent = getBetLabel(key, isActive);
  });

  creditsEl.textContent = credits;
  betTotalEl.textContent = currentBetTotal;
  lastSpinEl.textContent = lastResult;
}

function getBetLabel(key, isActive) {
  const labels = {
    red: "Red",
    black: "Black",
    odd: "Odd",
    even: "Even",
    low: "1-18",
    high: "19-36",
    dozen1: "1st 12",
    dozen2: "2nd 12",
    dozen3: "3rd 12",
    column1: "Column 1",
    column2: "Column 2",
    column3: "Column 3"
  };

  if (!isActive) return labels[key];
  return `${labels[key]} (${currentBets[key]})`;
}

function handleChipSelection() {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("chip-active", Number(chip.dataset.chip) === selectedChip);
  });
}

function setSelectedChip(value) {
  selectedChip = Number(value);
  handleChipSelection();
}

function placeNumberBet(num) {
  if (spinning) return;
  if (credits < selectedChip) return;

  currentBets.number[num] = (currentBets.number[num] || 0) + selectedChip;
  currentBetTotal += selectedChip;
  credits -= selectedChip;
  renderTable();
}

function placeSideBet(type) {
  if (spinning) return;
  if (credits < selectedChip) return;

  currentBets[type] += selectedChip;
  currentBetTotal += selectedChip;
  credits -= selectedChip;
  renderTable();
}

function clearBets() {
  if (spinning) return;

  Object.keys(currentBets).forEach((key) => {
    if (key === "number") {
      currentBets.number = {};
    } else {
      currentBets[key] = 0;
    }
  });

  currentBetTotal = 0;
  renderTable();
}

function getRandomNumber() {
  return numbers[Math.floor(Math.random() * numbers.length)];
}

function spinWheel() {
  if (spinning) return;

  if (currentBetTotal <= 0) {
    alert("Place a bet before spinning.");
    return;
  }

  spinning = true;
  spinBtn.disabled = true;
  clearBtn.disabled = true;

  const winningNumber = getRandomNumber();
  const fullTurns = 7 + Math.floor(Math.random() * 3);
  const randomOffset = Math.random() * 360;
  const targetAngle = getWheelAngle(winningNumber) + 360 * fullTurns + randomOffset;

  wheel.style.transform = `rotate(${targetAngle}deg)`;

  setTimeout(() => {
    resolveSpin(winningNumber);
    spinning = false;
    spinBtn.disabled = false;
    clearBtn.disabled = false;
  }, 4200);
}

function resolveSpin(winningNumber) {
  const winningColor = getColor(winningNumber);
  let winnings = 0;

  Object.entries(currentBets.number).forEach(([num, amount]) => {
    if (Number(num) === winningNumber) {
      winnings += amount * 35;
    }
  });

  if (currentBets.red > 0 && winningColor === "red") winnings += currentBets.red * 2;
  if (currentBets.black > 0 && winningColor === "black") winnings += currentBets.black * 2;
  if (currentBets.odd > 0 && winningNumber !== 0 && winningNumber % 2 !== 0) winnings += currentBets.odd * 2;
  if (currentBets.even > 0 && winningNumber !== 0 && winningNumber % 2 === 0) winnings += currentBets.even * 2;
  if (currentBets.low > 0 && winningNumber >= 1 && winningNumber <= 18) winnings += currentBets.low * 2;
  if (currentBets.high > 0 && winningNumber >= 19 && winningNumber <= 36) winnings += currentBets.high * 2;

  if (currentBets.dozen1 > 0 && winningNumber >= 1 && winningNumber <= 12) winnings += currentBets.dozen1 * 3;
  if (currentBets.dozen2 > 0 && winningNumber >= 13 && winningNumber <= 24) winnings += currentBets.dozen2 * 3;
  if (currentBets.dozen3 > 0 && winningNumber >= 25 && winningNumber <= 36) winnings += currentBets.dozen3 * 3;

  if (currentBets.column1 > 0 && [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].includes(winningNumber)) winnings += currentBets.column1 * 3;
  if (currentBets.column2 > 0 && [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].includes(winningNumber)) winnings += currentBets.column2 * 3;
  if (currentBets.column3 > 0 && [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].includes(winningNumber)) winnings += currentBets.column3 * 3;

  credits += winnings;
  lastResult = `${winningNumber} (${winningColor})`;

  Object.keys(currentBets).forEach((key) => {
    if (key === "number") currentBets.number = {};
    else currentBets[key] = 0;
  });

  currentBetTotal = 0;
  renderTable();
}

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => setSelectedChip(chip.dataset.chip));
});

document.querySelectorAll(".bet-type").forEach((button) => {
  button.addEventListener("click", () => {
    placeSideBet(button.dataset.bet);
  });
});

spinBtn.addEventListener("click", spinWheel);
clearBtn.addEventListener("click", clearBets);

renderTable();
handleChipSelection();
"use strict";
const pearls = Array.from(document.querySelectorAll(".pearl"));
const btnRules = document.querySelector(".btn-rules");
const popupXBtn = document.querySelector(".popup-close");
const checkBtn = document.querySelector(".btn-check");
const deleteBtn = document.querySelector(".btn-delete");
const newGameBtn = document.querySelector(".btn-new-game");
const allPearlContainer = document.querySelector(".pearl-container");
const tableBody = document.querySelector("tbody");

// array from all pearl choice
const allPearlColor = pearls.map((pearl) => pearl.dataset.pearlColor);

// computer choose 4 pearl
let computerChosenPearls = [];
const computerChoosePearls = () => {
  while (computerChosenPearls.length != 4) {
    const num = Math.floor(Math.random() * allPearlColor.length);
    computerChosenPearls.push(allPearlColor[num]);
  }
};

// currently played row
const findActiveRow = () => {
  const rows = tableBody.querySelectorAll("tr");
  const activeRow = [...rows].find((row) =>
    row.classList.contains("active-row-style")
  );
  return activeRow;
};

const setActiveCellandLastCell = () => {
  //first cell
  const activeRow = findActiveRow();
  activeRow.firstElementChild.setAttribute("id", "active-cell");

  //last pearl cell
  const lastCell = activeRow.children.item(3);
  lastCell.classList.add("last-cell");
};

const setActiveRowCells = () => {
  //remove class/id from prev active row cells
  const lastCell = document.querySelector(".last-cell");
  const activeCell = document.querySelector("#active-cell");
  lastCell.classList.remove("last-cell");
  activeCell.removeAttribute("id");
  //add class/id to current active row cells
  setActiveCellandLastCell();
};

// change active row
const changeActiveRow = () => {
  //if row unfinished return
  const isRowUnFinished = checkIfactiveRowIsFilled();
  if (isRowUnFinished) return;

  comparePearls();
  fillFeedbackCell();
  checkForWinOrLose();

  //change active row class
  const rows = tableBody.querySelectorAll("tr");
  rows.forEach((row, index) => {
    if (row.classList.contains("active-row-style")) {
      rows[index - 1].classList.add("active-row-style");
      row.classList.remove("active-row-style");
    }
  });
  setActiveRowCells();
};

const placePearl = (e) => {
  const selectedPearlColor = e.target.dataset.pearlColor;
  //click on pearl not on the container
  if (!e.target.classList.contains("pearl-container")) {
    const activeRow = findActiveRow();
    const activeCell = document.querySelector("#active-cell");

    //selected pearl goes to empty cell
    activeCell.style.backgroundColor = selectedPearlColor;

    //change active cell
    const nextActiveCell = activeCell.nextElementSibling;
    if (nextActiveCell.classList.contains("feedback-cell")) return;
    activeCell.removeAttribute("id");
    nextActiveCell.setAttribute("id", "active-cell");
  }
};

// compare player pearls to computer pearls
const comparePearls = () => {
  const activeRow = findActiveRow();
  const activeRowCells = [...activeRow.children];
  // create array from pearls in active row
  const pearlColorinRow = activeRowCells.map((pearlCell) =>
    pearlCell.style.getPropertyValue("background-color")
  );
  pearlColorinRow.pop();

  // check player colors right or not
  const playerPearlColorMatch = computerChosenPearls.map((computerPearlColor) =>
    pearlColorinRow.includes(computerPearlColor)
  );

  // check player color is right and the placement is right
  const pearlInRightPlace = [];
  for (let i = 0; i < 4; i++) {
    pearlColorinRow[i] == computerChosenPearls[i]
      ? pearlInRightPlace.push("match")
      : pearlInRightPlace.push(false);
  }

  return [playerPearlColorMatch, pearlInRightPlace];
};

const fillFeedbackCell = () => {
  const [rightColors, rightColorsAndPlace] = comparePearls();
  const activeRow = findActiveRow();
  const feedbackCell = activeRow.lastElementChild;

  //create random index 0-3
  const randomIndex = [];
  while (randomIndex.length != 4) {
    const randomnum = Math.floor(Math.random() * 4);
    if (!randomIndex.includes(randomnum)) randomIndex.push(randomnum);
  }
  for (let i = 0; i < 4; i++) {
    //if the pearl color is right pin change to black on a random index
    if (rightColors[i]) {
      const currentFeedbackCell = feedbackCell.children[randomIndex[i]];
      currentFeedbackCell.style.backgroundColor = "black";
      //if the color and the placement is right pin change to white
      if (rightColorsAndPlace[i]) {
        currentFeedbackCell.style.backgroundColor = "white";
      }
    }
  }
};

const checkForWinOrLose = () => {
  const [, rightColorsAndPlace] = comparePearls();

  //check for win
  const allpearlIsRight = rightColorsAndPlace.every((match) => match);
  if (allpearlIsRight) {
    displayComputerPearls();
    alert("Winner!");
  }

  //check for lose
  const activeRow = findActiveRow();
  const lastRow = activeRow.classList.contains("bodyrow-10");
  //if we are on last row and the pearls not true
  if (lastRow && !allpearlIsRight) {
    displayComputerPearls();
    alert("Loser!");
  }
};

//after win/lose can't use delete btn
const disableDeleteBtn = () => {
  const solutionCellOne = document.querySelector("th");
  const cellstyles = window.getComputedStyle(solutionCellOne, null);
  const cellColor = cellstyles.getPropertyValue("background-color");
  if (cellColor != "rgb(177, 173, 172)") {
    deleteBtn.disabled = true;
    return true;
  }
  return false;
};

const deletePearl = () => {
  const disableBtn = disableDeleteBtn();
  if (disableBtn) return;
  const activeRow = findActiveRow();

  const lastCell = [...activeRow.children].findLast((cell) => {
    // find last cell which does not have the base color
    const cellstyles = window.getComputedStyle(cell, null);
    const cellColor = cellstyles.getPropertyValue("background-color");
    if (
      cellColor != "rgb(177, 173, 172)" &&
      !cell.classList.contains("feedback-cell")
    )
      return cell;
  });
  //reset cell color to base color
  lastCell.style.backgroundColor = "rgb(177, 173, 172)";
  //reset active cell
  const activeCell = document.querySelector("#active-cell");
  activeCell.removeAttribute("id");
  lastCell.setAttribute("id", "active-cell");
};

const checkIfactiveRowIsFilled = () => {
  const activeRow = findActiveRow();

  //check cells color if one has a base color than row is unfilled
  const isRowUnFinished = [...activeRow.children].some((cell) => {
    const cellstyles = window.getComputedStyle(cell, null);
    const cellColor = cellstyles.getPropertyValue("background-color");
    if (
      !cell.classList.contains("feedback-cell") &&
      cellColor == "rgb(177, 173, 172)"
    ) {
      alert("You have to fill in the whole row!");
      return true;
    }
  });

  return isRowUnFinished;
};

const popupToggle = () => {
  const popupContainer = document.querySelector(".popup-rule");
  popupContainer.classList.toggle("popup-hidden");
};

//show computer pearls
const displayComputerPearls = () => {
  const solutionCells = document.querySelectorAll("th");
  solutionCells.forEach(
    (cell, index) => (cell.style.backgroundColor = computerChosenPearls[index])
  );
};

window.addEventListener("load", setActiveCellandLastCell);
window.addEventListener("load", computerChoosePearls);
checkBtn.addEventListener("click", changeActiveRow);
deleteBtn.addEventListener("click", deletePearl);
allPearlContainer.addEventListener("click", placePearl);
btnRules.addEventListener("click", popupToggle);
popupXBtn.addEventListener("click", popupToggle);

newGameBtn.addEventListener("click", () => {
  //computer choose new pearls
  computerChosenPearls = [];
  computerChoosePearls();

  //delete btn enable
  deleteBtn.disabled = false;

  //find prev active row remove class
  const activeRow = findActiveRow();
  activeRow.classList.remove("active-row-style");

  //set new active row
  const firstRow = tableBody.lastElementChild;
  firstRow.classList.add("active-row-style");

  setActiveRowCells();

  //reset cells color
  const allCell = document.getElementsByTagName("td");
  [...allCell].forEach((cell) => {
    if (!cell.classList.contains("feedback-cell"))
      cell.style.backgroundColor = "rgb(177, 173, 172)";
  });

  //reset solution row
  const solutionCells = document.querySelectorAll("th");
  solutionCells.forEach(
    (cell) => (cell.style.backgroundColor = "rgb(177, 173, 172)")
  );

  //reset pins
  const feedbackPins = document.querySelectorAll(".feedback");
  [...feedbackPins].forEach(
    (pin) => (pin.style.backgroundColor = "rgb(177, 173, 173)")
  );
});

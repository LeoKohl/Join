let shortStatus = { "0": "To-do", "1": "Work", "2": "Review", "3": "Done" };

/**
 * Adds click event listeners to all elements with the 'swap-icon' class,
 * enabling the switch dropdown functionality when clicked.
 */
function addSwitchEventsToCards() {
    document.querySelectorAll('.swap-icon').forEach(switchBtn => {
        switchBtn.addEventListener('click', openSwitchDropdown);
    });
}

/**
 * Opens the switch dropdown for a card, allowing the user to move the card to a valid column.
 *
 * @param {Event} event - The event triggered by the user interaction.
 */
function openSwitchDropdown(event) {
    let validColumnIdxArr = getValidSwitchColumns(event);
    let buttonsHTML = getSwitchButtons(validColumnIdxArr);
    let targetCard = event.target.parentElement;
    targetCard.classList.add('switch');
    targetCard.innerHTML += getSwitchDropdownTemplate(buttonsHTML);
    removeSwitchEvent(targetCard);
}

/**
 * Removes the switch dropdown element from the specified parent card when a click occurs outside of it.
 * Also removes the 'switch' class from the parent card and re-adds switch events to all cards.
 *
 * @param {HTMLElement} parentCard - The parent card element containing the switch dropdown.
 */
function removeSwitchEvent(parentCard) {
    let dropdownEl = parentCard.querySelector('.switch-dropdown');

    setTimeout(() => {   // wait until next tick so the "open" click is done
        document.addEventListener("click", event => {
            if (!dropdownEl.contains(event.target)) {
                dropdownEl.remove();
                parentCard.classList.remove('switch');
                addSwitchEventsToCards();
            }
        }, { once: true }); // remove listener automatically after first run
    });
}

/**
 * Returns an array of column indices that are valid for switching with the current column (adjacent columns).
 *
 * @param {Event} event - click event containing the target element.
 * @returns {string[]} An array of column indices (as strings) that are adjacent to the current column.
 */
function getValidSwitchColumns(event) {
    let currentColumn = event.target.closest('.board-column');
    let currentColumnIndex = parseInt(currentColumn.dataset.columnIndex);
    let columnsArray = Array.from(document.querySelectorAll('.board-column'));
    let filteredColumnssArr = columnsArray.filter((column) => {
        let columnIndex = parseInt(column.dataset.columnIndex);
        if (Math.abs(columnIndex - currentColumnIndex) == 1) {
            return true;
        }
    });
    return filteredColumnssArr.map((column) => column.dataset.columnIndex);
}

/**
 * Generates switch button templates based on the provided valid column indices.
 * If there is only one valid column index, returns either an "arrow up" or "arrow down" button template.
 * If there are multiple valid column indices, returns both "arrow up" and "arrow down" button templates.
 *
 * @param {number[]} validColumnIdxArr - Array of valid column indices.
 * @returns {string|undefined} HTML string containing button templates, or undefined if input is falsy.
 */
function getSwitchButtons(validColumnIdxArr) {
    if (!validColumnIdxArr) return;
    if (validColumnIdxArr.length == 1) {
        let singleColumnIndex = validColumnIdxArr[0];
        if (singleColumnIndex == 0) {
            return getArrowDownBtnTemplate(singleColumnIndex);
        } else {
            return getArrowUpBtnTemplate(singleColumnIndex);
        }
    } else {
        let btnUpIndex = Math.min(...validColumnIdxArr);
        let btnDownIndex = Math.max(...validColumnIdxArr);
        return getArrowUpBtnTemplate(btnUpIndex) + " " + getArrowDownBtnTemplate(btnDownIndex);
    }
}

/**
 * Handles switching a task to a different column on the board.
 * Finds the task element from the event, moves it to the specified category,
 * and updates the board UI accordingly.
 *
 * @param {Event} event - The event triggered by the user interaction.
 * @param {number} columnIndex - The index of the target column.
 */
function switchColumn(event, columnIndex) {
    let taskElement = event.target.closest('.board-card');
    moveTaskToCategory(
        categories[columnIndex],
        taskElement
    );
    renderAllTasks();
    updateEmptyMessages();
    addDragEventsToCards();
    addSwitchEventsToCards();
}
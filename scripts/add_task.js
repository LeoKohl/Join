let title = [];
let selectedPriority = "";
let task = [];
let subtask = [];
let assignedTo = [];

const btnUrgent = document.getElementById("urgent");
const btnMedium = document.getElementById("medium");
const btnLow = document.getElementById("low");

function getTaskData() {
    return {
        title: document.getElementById('title-task').value.trim(),
        description: document.getElementById('task-description').value.trim(),
        "due-date": document.getElementById('task-date').value,
        priority: selectedPriority,
        "assigned-to": assignedTo,
        category: document.getElementById('task-category').value,
        subtasks: subtask,
        status: {
            done: false,
            feedback: false,
            "in-progress": false,
            "to-do": true
        }
    };
}

/**
 * Removes all active color classes from the priority buttons.
 * This ensures only one button is visibly active at any time.
 */
function resetButtons() {
    btnUrgent.classList.remove("active-red");
    btnMedium.classList.remove("active-yellow");
    btnLow.classList.remove("active-green");
}

/**
 * Activates the given button by applying the corresponding color class.
 * Also resets all other buttons beforehand.
 * If the "medium" button is selected, it changes its icon as well.
 * 
 * @param {HTMLElement} button - The button to activate
 * @param {string} colorClass - The CSS class for the active color state
 */
function activateButton(button, colorClass) {
    resetButtons();
    button.classList.add(colorClass);
    selectedPriority = button.id;
    console.log("Aktuelle Priorität:", selectedPriority);
    // Only switch the icon for the medium priority button
    if (button.id === "medium") {
        setMediumIcon(true);
    } else {
        setMediumIcon(false);
    }
}

/**
 * Switches the icon of the medium priority button.
 * 
 * @param {boolean} active - true = use active icon, false = use default icon
 */
function setMediumIcon(active) {
    const icon = document.getElementById("medium-icon");
    if (active) {
        icon.src = "./assets/img/icons/add_task/medium_vector.svg";
    } else {
        icon.src = "./assets/img/icons/add_task/prio_medium_orange.svg";
    }
}

/**
 * Handles click on the "Urgent" button.
 * Prevents form submission and applies the red style.
 */
btnUrgent.addEventListener("click", function (event) {
    event.preventDefault();
    activateButton(btnUrgent, "active-red");
});

/**
 * Handles click on the "Medium" button.
 * Prevents form submission, applies yellow style, and changes icon.
 */
btnMedium.addEventListener("click", function (event) {
    event.preventDefault();
    activateButton(btnMedium, "active-yellow");
});

/**
 * Handles click on the "Low" button.
 * Prevents form submission and applies the grenn style.
 */
btnLow.addEventListener("click", function (event) {
    event.preventDefault();
    activateButton(btnLow, "active-green");
});

// Assigned
function toggleDropdown(event) {
    event.stopPropagation(); // Verhindert, dass der äußere Click mitschwingt
    const list = document.getElementById("contactList");
    const arrow = document.querySelector(".arrow");
    const visible = list.style.display === "block";
    list.style.display = visible ? "none" : "block";
    arrow.classList.toggle("rotate", !visible);
}

function handleDropdownClick(event) {
    const clickedInsideInput = event.target.closest(".dropdown-input");
    const clickedContactItem = event.target.closest(".contact-item");

    if (!clickedInsideInput && !clickedContactItem) {
        document.getElementById("contactList").style.display = "none";
        document.querySelector(".arrow").classList.remove("rotate");
    }
}



function rotateCategoryArrow(rotate) {
    const arrow = document.getElementById("category-arrow");
    if (arrow) {
        arrow.classList.toggle("rotate", rotate);
    }
}

function toggleCheckboxContact(container) {
    const checkbox = container.querySelector(".contact-checkbox");
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event("change")); 
}



function setupCheckboxListener() {
    const checkboxes = document.querySelectorAll(".contact-checkbox");
    const input = document.getElementById("searchInput");
    for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        checkbox.addEventListener("change", () => {
            const selected = [];
            for (let j = 0; j < checkboxes.length; j++) {
                if (checkboxes[j].checked) {
                    selected.push(checkboxes[j].dataset.name);
                }
            }
            input.value = selected.join(", ");
            assignedTo = selected;
            console.log("Aktuell zugewiesen:", assignedTo);
        });
    }
}

async function loadContactsIntoDropdown() {
    const data = await loadData("contacts");
    const list = document.getElementById("contactList");
    list.innerHTML = "";
    const contacts = Object.values(data);
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const name = contact.name;
        const initials = name["first-name"][0] + name["last-name"][0];
        list.innerHTML += getAssignedNameTemplate(initials, name);
    }
    setupCheckboxListener();
}

// Subtask Input Field
function showSubtaskInput() {
    const initialBox = document.getElementById("subtask-initial");
    const activeBox = document.getElementById("subtask-active");
    initialBox.classList.add("d-none");
    activeBox.classList.remove("d-none");
}

function cancelSubtaskInput() {
    const initialBox = document.getElementById("subtask-initial");
    const activeBox = document.getElementById("subtask-active");
    const inputField = document.getElementById("subtask-input-second");
    activeBox.classList.add("d-none");    // versteckt
    initialBox.classList.remove("d-none"); // Zeigt
    inputField.value = "";
}

function confirmSubtaskInput() {
    const inputField = document.getElementById("subtask-input-second");
    const outputBox = document.getElementById("subtask-output");
    const inputText = inputField.value.trim();
    if (inputText === "") {
        alert("Bitte Schreibe was du SACK ");
        return;
    }
    const subtaskHtml = getSubtaskTemplate(inputText);
    outputBox.innerHTML += subtaskHtml;
    subtask.push(inputText);
    inputField.value = "";
    cancelSubtaskInput();
}

/* closest sucht vom Bild (element wird von onclick übergeben) das div subtask-text-box und gelöscht  */
function deleteSubtask(element) {
    const subtaskBox = element.closest(".subtask-text-box");
    if (subtaskBox) {
        subtaskBox.remove();
    }
}

function startEditSubtask(element) {
    const box = element.closest(".subtask-text-box");
    const textElement = box.querySelector(".subtask-entry");
    const text = textElement.innerText;
    const iconBox = box.querySelector(".icon-edit-subtask-box");
    iconBox.querySelector(".edit-icon").classList.add("d-none");         // Stift aus
    iconBox.querySelector(".confirm-icon").classList.remove("d-none");   // OK an
    textElement.outerHTML = changeDivtoInputTemplate(text);
}

function finishEditSubtask(iconElement) {
    const box = iconElement.closest(".subtask-text-box");
    const inputElement = box.querySelector("input.subtask-entry");
    const text = inputElement.value.trim();
    inputElement.outerHTML = getReturnToDivTemplate(text);
    box.querySelector(".edit-icon")?.classList.remove("d-none");
    box.querySelector(".confirm-icon")?.classList.add("d-none");
    box.querySelector(".delete-icon")?.classList.remove("d-none");
}

document.getElementById("form-element").addEventListener("submit", async function (event) {
    event.preventDefault();
    const taskData = getTaskData();

    await postData("tasks", taskData); // Jetzt wird gesendet!
    const messageBox = document.getElementById("task-message");
    messageBox.textContent = "Task added to Board";
    messageBox.classList.remove("d-none");
    setTimeout(() => {
        messageBox.classList.add("d-none");
    }, 4000);
    messageBox.classList.remove("d-none");
setTimeout(() => {
    messageBox.classList.add("d-none");
}, 3000);
document.getElementById("form-element").reset();
});



document.addEventListener("click", function(event) {
    const dropdown = document.querySelector(".custom-dropdown");
    const list = document.getElementById("contactList");
    if (!dropdown.contains(event.target)) {
        list.style.display = "none"; // Dropdown schließen
        document.querySelector(".arrow").classList.remove("rotate");
    }
});


window.onload = () => {
    setupCheckboxListener();
    loadContactsIntoDropdown();
};
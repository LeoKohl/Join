
const categories = { 0: "to-do", 1: "in-progess", 2: "feedback", 3: "done" };

let currentDraggedTask = null;
let dragged = false;
let fromCol;

// ===================================
// BOARD RENDERING FUNCTIONS
// ===================================

function updateEmptyMessages() {
    document.querySelectorAll(".tasks-list").forEach((list) => {
        const tasks = Array.from(list.children).filter((c) =>
            c.classList.contains("board-card")
        );
        let msg = list.querySelector(".empty-msg");
        if (tasks.length === 0) {
            if (!msg) {
                let header = list.parentElement.querySelector(".column-header");
                let headerText = (header ? header.textContent : "");
                list.innerHTML = getKanbanEmptyMessage(headerText);
            } else msg.style.display = '';
        } else {
            if (msg) msg.remove();
        }
    });
}

/**
 * Renders "No tasks" areas for each category column if there are no tasks present.
 * For each category, it removes all existing drag areas (including previous "No tasks" divs),
 * checks if there are any task cards, and if none are found, inserts a "No tasks" area.
 *
 * Assumes the existence of a global `categories` array with objects containing `columnId` and `label` properties,
 * and an `insertNoTasksArea` function to add the "No tasks" area to the DOM.
 */
function renderWithNoTasksAreas() {
    updateEmptyMessages();

    // Add Drag & Drop events to all task cards
    addDragEventsToCards();
}

// ===================================
// DRAG & DROP FUNCTIONS
// ===================================

function addDragEventsToCards() {
    document.querySelectorAll('.board-card').forEach(card => {
        card.draggable = true;
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    // Add drop events to all lists
    document.querySelectorAll(".board-column").forEach((col) => {
        const list = col.querySelector('.tasks-list');
        if (list) {
            list.addEventListener('dragover', handleDragOver);
            list.addEventListener('drop', handleDrop);
            list.addEventListener('dragleave', handleDragLeave);
        }
    });
}

function handleDragStart(e) {
    fromCol = e.target.closest(".board-column");
    dragged = true;
    currentDraggedTask = {
        element: e.target,
        taskData: displayedTasks[e.target.dataset.displayedidIndex],
        sourceColumn: fromCol.dataset.columnIndex
    };
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    highlightAllowedDropZones();
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    currentDraggedTask = null;
    fromCol = '';
    setTimeout(() => (dragged = false), 0);
    document
        .querySelectorAll(".placeholder")
        .forEach((ph) => ph.remove());
    updateEmptyMessages();
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    let dropZone = e.target;
    if (isValidDropZone(dropZone)) {
        dropZone.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    if (!currentDraggedTask) return;
    let dropZone = e.target;
    let targetColumn = dropZone.closest('.board-column');
    let targetColumnId = targetColumn.dataset.index;
    if (!isValidDropZone(dropZone)) return;
    // Update task status in Firebase
    moveTaskToCategory(currentDraggedTask.taskData, categories[targetColumnId], e.target);
}

function isValidDropZone(dropZoneElement) {
    if (!currentDraggedTask) return false;
    if (!fromCol || !dropZoneElement) return false;
    if (!dropZoneElement.classList.contains('placeholder')) return false;
    let targetColumn = dropZoneElement.closest('.board-column');
    let targetColumnId = targetColumn.dataset.columnIndex;
    let sourceIndex = fromCol.dataset.columnIndex;
    return Math.abs(sourceIndex - targetColumnId) === 1;
}

function highlightAllowedDropZones() {
    let fromIdx = parseInt(fromCol.dataset.columnIndex);
    document.querySelectorAll(".board-column").forEach((col, idx) => {
        if (Math.abs(idx - fromIdx) === 1) {
            let list = col.querySelector(".tasks-list");
            if (!list.querySelector(".placeholder")) {
                list.innerHTML += getTaskPlaceholderTemplate();
            }
            let msg = list.querySelector(".empty-msg");
            if (msg) msg.style.display = "none";
        }
    });
}

async function moveTaskToCategory(taskData, newStatus, taskElement) {
    if (!taskData) return;
    let tasksId = taskElement.dataset.tasksId;
    let displayedTasksId = taskElement.dataset.displayedTasksId;
    updateTask(taskData, newStatus);
    tasks[tasksId] = taskData;
    displayedTasks[displayedTasksId] = taskData;
    updateTaskInFirebase(taskData);
}

function updateTask(taskData, newStatus) {
    Object.values(categories).forEach((stat) => {
        if (stat == newStatus) {
            taskData.status[stat] = true;
        } else {
            taskData.status[stat] = false;
        }
    });
}

async function updateTaskInFirebase(taskData) {
    try {
        let path = "/tasks/" + taskData.id + "/";
        await putData(path, taskData);
    } catch (e) {
        console.error("Put Task to Firebase:", e);
    }
}
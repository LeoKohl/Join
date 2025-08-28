
/**
 * Maps task status to corresponding column element IDs.
 */
const statusToColumnId = {
    "to-do": "tasks-list-open",
    "in-progress": "tasks-list-inprogress",
    "feedback": "tasks-list-awaitfeedback",
    "done": "tasks-list-done"
};

/**
 * Determines which column ID a task belongs to, based on its status.
 */
function getColumnIdByStatus(statusObj) {
    if (!statusObj || typeof statusObj !== "object") return null;
    for (const status in statusObj) {
        if (statusObj[status] === true && statusToColumnId[status]) {
            return statusToColumnId[status];
        }
    }
    return null;
}

/**
 * Returns contact info (like color & initials) for a given full name.
 */
function getContactByName(fullName) {
    return contactsMap[fullName] || null;
}

/**
 * Renders the avatars of assigned users (up to 3).
 * Extra users are grouped into a "+X" overflow avatar.
 */
function renderAssignedAvatars(users = []) {
    const maxVisible = 3;
    const visible = users.slice(0, maxVisible);
    const hidden = users.slice(maxVisible);
    const avatars = visible.map(renderSingleAvatar);
    if (hidden.length > 0) {
        avatars.push(renderOverflowAvatar(hidden));
    }
    return avatars.join("");
}

/**
 * Renders a single user's avatar with initials and color.
 */
function renderSingleAvatar(name) {
    const contact = getContactByName(name);
    const initials = getInitials(name);
    const color = contact?.color || "fallback-gray";
    return `<div class="avatar ${color}" title="${name}">${initials}</div>`;
}

/**
 * Renders the overflow avatar that shows how many users are hidden.
 */
function renderOverflowAvatar(users) {
    const tooltip = users.join(", ");
    return `
        <div class="avatar overflow-avatar">
            +${users.length}
            <div class="custom-tooltip">${tooltip}</div>
        </div>
    `;
}

/**
 * Calculates progress for subtasks.
 * Returns % progress, completed count, and total.
 */
function getSubtaskProgress(subtasks = {}) {
    if (typeof subtasks !== "object" || Array.isArray(subtasks)) {
        return { progressPercent: 0, total: 0, maxSubtasks: 0 };
    }
    const keys = Object.keys(subtasks);
    const totalSubtasks = keys.length;
    const doneCount = keys.filter(key => subtasks[key].done === true).length;
    const progressPercent = totalSubtasks > 0 ? (doneCount / totalSubtasks) * 100 : 0;
    return {
        progressPercent,
        total: doneCount,
        maxSubtasks: totalSubtasks
    };
}

/**
 * Returns the correct CSS class for the given category.
 */
function getCategoryClass(category) {
    if (!category) return "category-default";
    if (category.toLowerCase() === "technical task") {
        return "category-technical";
    }
    if (category.toLowerCase() === "user story") {
        return "category-userstory";
    }
    return "category-default";
}

/**
 * Returns the HTML icon for a given priority.
 */
function getPriorityIcon(priority) {
    if (!priority) return "";
    const validPriorities = ["low", "medium", "urgent"];
    const cleanPriority = priority.toLowerCase();
    if (!validPriorities.includes(cleanPriority)) return "";
    return priorityRender(cleanPriority); 
}

/**
 * Clears all task columns before re-rendering cards.
 */
function clearAllTaskLists() {
    const columns = [
        "tasks-list-open",
        "tasks-list-inprogress",
        "tasks-list-awaitfeedback",
        "tasks-list-done"
    ];
    columns.forEach(id => {
        const column = document.getElementById(id);
        if (column) column.innerHTML = "";
    });
}

/**
 * Renders all tasks to their appropriate columns.
 * @param {Object} tasksObject - Task ID mapped to task data.
 */
function renderAllTasks(tasksObject) {
    clearAllTaskLists();
    for (const taskId in tasksObject) {
        const task = tasksObject[taskId];
        const columnId = getColumnIdByStatus(task.status);
        if (columnId) {
            renderTaskToColumn(taskId, task, columnId);
        }
    }

    // Optional: render placeholders if no tasks are present
    if (typeof renderWithNoTasksAreas === 'function') {
        renderWithNoTasksAreas();
    }
}

/**
 * Renders a single task card to the specified column.
 */
function renderTaskToColumn(taskId, task, columnId) {
    const container = document.getElementById(columnId);
    if (!container) return console.warn(`Column with ID '${columnId}' not found.`);
    const avatarsHTML = renderAssignedAvatars(task['assigned-to']);
    const progress = getSubtaskProgress(task.subtasks);
    const card = document.createElement('div');
    card.classList.add('board-card');
    card.innerHTML = cardRender(taskId,task,avatarsHTML,progress.progressPercent,progress.maxSubtasks,progress.total,'#4589FF' );
    container.appendChild(card);
}

/**
 * Initializes the board view:
 * - Loads tasks and contacts via init()
 * - Builds contactsMap (name → color & initials)
 * - Converts tasks array into object format
 * - Renders all tasks
 */
async function initBoardView() {
    await init();
    window.contactsMap = {};
    contacts.forEach(contact => {
        const fullName = `${contact.name["first-name"]} ${contact.name["last-name"]}`.trim();
        contactsMap[fullName] = {
            color: contact.color,
            initials: getInitials(fullName)
        };
    });

    // Convert array to task object (taskId → task)
    const tasksObject = {};
    tasks.forEach(task => {
        tasksObject[task.id] = task;
    });

    renderAllTasks(tasksObject);
}
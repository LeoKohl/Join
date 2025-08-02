// Load tasks from Firebase and return them as an array
async function loadTasks() {
    const data = await loadData("tasks");
    if (!data) return [];
    if (Array.isArray(data)) {
        return data.filter(task => task !== null && typeof task === "object");
    }
    return Object.values(data);
}

// Determine the status of a single task using switch
function getTaskStatus(task) {
    if (!task || !task.status) return "unknown";
    switch (true) {
        case task.status["to-do"]: return "todo";
        case task.status["in-progress"]: return "in-progress";
        case task.status["feedback"]: return "feedback";
        case task.status["done"]: return "done";
        default: return "unknown";
    }
}

// Count how many tasks have a specific status
function countTasksByStatus(tasks, status) {
    let count = 0;
    for (let i = 0; i < tasks.length; i++) {
        let taskStatus = getTaskStatus(tasks[i]);
        if (taskStatus === status) {
            count++;
        }
    }
    return count;
}

// Count how many tasks are marked as "urgent"
function countUrgentTasks(tasks) {
    let count = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].priority === "urgent") {
            count++;
        }
    }
    return count;
}

// Find the earliest due date among tasks marked as "urgent"
// Returns the date string or null if no urgent tasks are found
function findEarliestUrgentDate(tasks) {
    var earliest = null;
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        if (task.priority === "urgent" && task["due-date"]) {
            if (!earliest || new Date(task["due-date"]) < new Date(earliest["due-date"])) {
                earliest = task;
            }
        }
    }
    if (!earliest) return null;
    return earliest["due-date"];
}

// Replace the text content of a DOM element by ID
function updateDOM(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = value;
    }
}

// Load task summary and update all related counters and values in the DOM
async function updateSummary() {
    const tasks = await loadTasks();
    updateDOM("board-counter", countTasksByStatus(tasks, "todo"));
    updateDOM("done-counter", countTasksByStatus(tasks, "done"));
    updateDOM("inProgress-counter", countTasksByStatus(tasks, "in-progress"));
    updateDOM("awaitingFeedback-counter", countTasksByStatus(tasks, "feedback"));
    updateDOM("urgency-counter", countUrgentTasks(tasks));
    updateDOM("inBord-counter", tasks.length);
    const deadline = findEarliestUrgentDate(tasks);
    updateDOM("deadline", deadline ? new Date(deadline).toLocaleDateString("de-DE") : "Keine");
}

// Ensure the summary is updated when the page loads
window.onload = updateSummary;
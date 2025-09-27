let tasks = [];

/**
 * Loads tasks from Firebase and returns them as an array.
 * @async
 * @function
 * @returns {Promise<Object[]>} A promise that resolves to an array of task objects, or an empty array if none found.
 */
async function loadTasks() {
    const data = await loadData("tasks");
    if (!data) return [];
    if (Array.isArray(data)) {
        return data.filter(task => task !== null && typeof task === "object");
    }
    return Object.values(data);
}

/**
 * Determines the status of a single task based on its `status` field.
 * @param {Object} task - The task object to evaluate.
 * @returns {string} The task status ("todo", "in-progress", "feedback", "done", or "unknown").
 */
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

/**
 * Counts how many tasks have a specific status.
 * @param {Object[]} tasks - An array of task objects.
 * @param {string} status - The status to count ("todo", "in-progress", "feedback", or "done").
 * @returns {number} The number of tasks with the specified status.
 */
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

/**
 * Counts how many tasks are marked as "urgent".
 * @param {Object[]} tasks - An array of task objects.
 * @returns {number} The number of urgent tasks.
 */
function countUrgentTasks(tasks) {
    let count = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].priority === "urgent") {
            count++;
        }
    }
    return count;
}

/**
 * Finds the earliest due date among tasks marked as "urgent".
 * @param {Object[]} tasks - An array of task objects.
 * @returns {string|null} The earliest due date (in YYYY-MM-DD format) or null if no urgent tasks found.
 */
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

/**
 * Returns a greeting message based on the current time of day.
 * @returns {string} A greeting string like "Good morning,", "Good afternoon," or "Good evening,".
 */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

/**
 * Replaces the text content of a DOM element by its ID.
 * @param {string} id - The ID of the DOM element.
 * @param {string|number} value - The value to set as the element's text content.
 */
function updateDOM(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = value;
    }
}

/**
 * Loads task data and updates all related summary counters and elements in the DOM.
 * @async
 * @function
 */
    function updateSummary() {
        updateDOM("board-counter", countTasksByStatus(tasks, "todo"));
        updateDOM("done-counter", countTasksByStatus(tasks, "done"));
        updateDOM("inProgress-counter", countTasksByStatus(tasks, "in-progress"));
        updateDOM("awaitingFeedback-counter", countTasksByStatus(tasks, "feedback"));
        updateDOM("urgency-counter", countUrgentTasks(tasks));
        updateDOM("inBord-counter", tasks.length);
        const deadline = findEarliestUrgentDate(tasks);
        updateDOM("deadline", deadline ? new Date(deadline).toLocaleDateString("de-DE") : "No");
        document.querySelector(".summary-section").style.visibility = "visible";
        document.querySelector(".title-section").style.visibility = "visible";
  }

/**
 * Updates the #userName DOM element with the currently logged-in user's name.
 * Reads the name from localStorage. If not found, logs an error.
 */
function showUserName() {
    const localStorageName = localStorage.getItem("name");
    if (localStorageName) {
        document.getElementById("userName").textContent = JSON.parse(localStorageName);
    } else {
        console.error("Kein gültiger Name im Login gefunden!");
    }
}

// Run showUserName and updateSummary after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    tasks = await loadTasks();

    const name = getUserNameFromStorage();
    const isMobile = window.innerWidth <= 1000;

    setUserName(name);
    setGreeting(name);

    if (isMobile) {
        showGreetingMobile();
    } else {
        updateSummary();
    }
});

/**
 * Retrieves the user's name from localStorage.
 * @returns {string} The user's name from localStorage, or an empty string if not found.
 */
function getUserNameFromStorage() {
    return JSON.parse(localStorage.getItem("name")) || "";
}

/**
 * Sets the user's name in the DOM element with ID "userName".
 * @param {string} name 
 */
function setUserName(name) {
    const el = document.getElementById("userName");
    if (el) el.textContent = name === "Guest" ? "" : name;
}

/**
 * Sets a greeting message in the DOM element with ID "greetUser" based on the user's name and time of day.
 * @param {string} name 
 */
function setGreeting(name) {
    const greeting = getGreeting();
    const el = document.getElementById("greetUser");
    const userContainer = document.querySelector(".user");
    if (el){ el.textContent = name === "Guest" ? `${greeting}!` : `${greeting},`;
    }
    if (userContainer && window.innerWidth > 1000) {
        userContainer.style.visibility = "visible";
    }
}

/**
 * Handles the mobile greeting display by showing the user container for 2 seconds before revealing the summary and title sections.
 */
function showGreetingMobile() {
    const userContainer = document.querySelector(".user");
    const summarySection = document.querySelector(".summary-section");
    const titleSection = document.querySelector(".title-section");

    if (userContainer) {
        userContainer.classList.remove("hidden");
        userContainer.style.display = "flex";
        userContainer.style.visibility = "visible";
    }
    if (summarySection) summarySection.style.display = "none";
    if (titleSection) titleSection.style.display = "none";

    setTimeout(() => {
        if (userContainer) {
            userContainer.style.display = "none";
        }
        if (summarySection) {
            summarySection.style.display = "block";
            summarySection.style.visibility = "visible";
        }
        if (titleSection) {
            titleSection.style.display = "block";
            titleSection.style.visibility = "visible";
        }
        updateSummary();
    }, 2000);
}

const categories = [
    { key: 'to-do', id: 'open', label: 'To do', columnId: 'tasks-list-open' },
    { key: 'in-progress', id: 'inprogress', label: 'In progress', columnId: 'tasks-list-inprogress' },
    { key: 'feedback', id: 'awaitfeedback', label: 'Await feedback', columnId: 'tasks-list-awaitfeedback' },
    { key: 'done', id: 'done', label: 'Done', columnId: 'tasks-list-done' }
];

let currentDraggedTask = null;

// ===================================
// BOARD RENDERING FUNCTIONS
// ===================================

function insertNoTasksArea(listElement, label) {
    // Remove any existing drag areas
    listElement.querySelectorAll('.drag-area').forEach(e => e.remove());

    // Create and insert the "No tasks" area
    const dragArea = document.createElement('div');
    dragArea.className = 'drag-area';
    dragArea.innerHTML = `<span class="no-tasks-message">No tasks ${label.toLowerCase()}</span>`;
    
    // Drag & Drop Events for empty areas
    dragArea.addEventListener('dragover', handleDragOver);
    dragArea.addEventListener('drop', handleDrop);
    dragArea.addEventListener('dragleave', handleDragLeave);
    
    listElement.appendChild(dragArea);
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
    // Check for each category if tasks are present - AFTER normal rendering
    categories.forEach(cat => {
        const list = document.getElementById(cat.columnId);
        if (!list) return;
        
        // Remove ALL old drag-areas (including "No tasks" divs)
        list.querySelectorAll('.drag-area').forEach(e => e.remove());
        
        // Check if tasks are present
        const taskCards = list.querySelectorAll('.board-card');
        
        // Only if NO tasks -> add "No tasks" div
        if (taskCards.length === 0) {
            insertNoTasksArea(list, cat.label);
        }
    });
    
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
    categories.forEach(cat => {
        const list = document.getElementById(cat.columnId);
        if (list) {
            list.addEventListener('dragover', handleDragOver);
            list.addEventListener('drop', handleDrop);
            list.addEventListener('dragleave', handleDragLeave);
        }
    });
}

function handleDragStart(e) {
    currentDraggedTask = {
        element: e.target,
        taskData: getTaskDataFromCard(e.target),
        sourceColumn: e.target.parentElement.id
    };
    
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    
    // Highlight allowed drop zones
    highlightAllowedDropZones();
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    removeAllHighlights();
    currentDraggedTask = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const dropZone = e.currentTarget;
    if (isValidDropZone(dropZone)) {
        dropZone.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!currentDraggedTask) return;
    
    const targetColumnId = e.currentTarget.id || e.currentTarget.parentElement.id;
    const targetCategory = getCategoryByColumnId(targetColumnId);
    
    if (!targetCategory || !isValidDropZone(e.currentTarget)) return;
    
    // Update task status in Firebase
    moveTaskToCategory(currentDraggedTask.taskData, targetCategory.key);
}

function getTaskDataFromCard(cardElement) {
    // Extract task data from the card (will be extended when tasks have IDs)
    const title = cardElement.querySelector('.task-title')?.textContent || 'Unknown Task';
    
    // Find task in the loaded data based on title (temporary until IDs are available)
    const taskData = findTaskByTitle(title);
    
    return taskData || { title: title };
}

function findTaskByTitle(title) {
    // Search in the globally loaded tasks (from loadTasksFromFirebase)
    if (typeof window.allTasks === 'object') {
        for (const taskId in window.allTasks) {
            const task = window.allTasks[taskId];
            if (task.title === title) {
                return { ...task, id: taskId };
            }
        }
    }
    return null;
}

function getCategoryByColumnId(columnId) {
    return categories.find(cat => 
        cat.columnId === columnId || 
        columnId.includes(cat.id)
    );
}

function isValidDropZone(element) {
    if (!currentDraggedTask) return false;
    
    const sourceCategory = getCategoryByColumnId(currentDraggedTask.sourceColumn);
    const targetColumnId = element.id || element.parentElement.id;
    const targetCategory = getCategoryByColumnId(targetColumnId);
    
    if (!sourceCategory || !targetCategory) return false;
    
    // Only allow adjacent categories
    const sourceIndex = categories.indexOf(sourceCategory);
    const targetIndex = categories.indexOf(targetCategory);
    
    return Math.abs(sourceIndex - targetIndex) === 1;
}

function highlightAllowedDropZones() {
    if (!currentDraggedTask) return;
    
    const sourceCategory = getCategoryByColumnId(currentDraggedTask.sourceColumn);
    if (!sourceCategory) return;
    
    const sourceIndex = categories.indexOf(sourceCategory);
    
    // Highlight adjacent categories
    [sourceIndex - 1, sourceIndex + 1].forEach(index => {
        if (index >= 0 && index < categories.length) {
            const category = categories[index];
            const list = document.getElementById(category.columnId);
            if (list) {
                list.classList.add('valid-drop-zone');
            }
        }
    });
}

function removeAllHighlights() {
    document.querySelectorAll('.valid-drop-zone, .drag-over').forEach(el => {
        el.classList.remove('valid-drop-zone', 'drag-over');
    });
}

async function moveTaskToCategory(taskData, newCategoryKey) {
    if (!taskData) return;
    
    try {
        // Update task status
        const updatedTask = {
            ...taskData,
            status: {
                [newCategoryKey]: true
            }
        };
        
        // Save to Firebase (if task ID is present)
        if (taskData.id) {
            await putData(`tasks/${taskData.id}`, updatedTask);
        }
        
        // Update UI
        if (typeof loadTasksFromFirebase === 'function') {
            loadTasksFromFirebase();
        }
        
    } catch (error) {
        console.error('Error moving task:', error);
    }
}

// Initialize Drag & Drop when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait until tasks are loaded, then initialize Drag & Drop
    setTimeout(addDragEventsToCards, 1000);
});
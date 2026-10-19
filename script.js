/* =========================================
   FOCUSFLOW — SMART TASK MANAGER
   SkillCraft Technology | Task 04
========================================= */


// ---------- STATE ----------

let tasks = JSON.parse(
    localStorage.getItem("focusflow_tasks")
) || [];

let currentFilter = "all";
let editingTaskId = null;


// ---------- DOM ELEMENTS ----------

const taskForm = document.getElementById("taskForm");

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const overdueTasks = document.getElementById("overdueTasks");

const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const progressText = document.getElementById("progressText");

const visibleCount = document.getElementById("visibleCount");

const submitText = document.getElementById("submitText");
const cancelEdit = document.getElementById("cancelEdit");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

const liveDate = document.getElementById("liveDate");

const themeToggle = document.getElementById("themeToggle");


// ---------- INITIALIZATION ----------

document.addEventListener("DOMContentLoaded", () => {

    updateDate();

    loadTheme();

    renderTasks();

    updateStats();

});


// ---------- DATE ----------

function updateDate() {

    const today = new Date();

    liveDate.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                day: "numeric",
                month: "short"
            }
        );
}


// ---------- TASK CREATION ----------

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = taskTitle.value.trim();

    if (!title) {
        showToast("Please enter a task name.", "!");
        return;
    }


    const taskData = {

        title,

        description:
            taskDescription.value.trim(),

        category:
            taskCategory.value,

        priority:
            taskPriority.value,

        date:
            taskDate.value,

        time:
            taskTime.value

    };


    // EDIT MODE

    if (editingTaskId !== null) {

        const task = tasks.find(
            item => item.id === editingTaskId
        );

        if (task) {

            task.title = taskData.title;
            task.description = taskData.description;
            task.category = taskData.category;
            task.priority = taskData.priority;
            task.date = taskData.date;
            task.time = taskData.time;

        }

        showToast("Task updated successfully.");

        resetEditMode();

    }

    // CREATE MODE

    else {

        const newTask = {

            id: Date.now(),

            ...taskData,

            completed: false,

            createdAt:
                new Date().toISOString()

        };

        tasks.unshift(newTask);

        showToast("Task added to your board.");

    }


    saveTasks();

    renderTasks();

    updateStats();

    taskForm.reset();

});


// ---------- SAVE ----------

function saveTasks() {

    localStorage.setItem(
        "focusflow_tasks",
        JSON.stringify(tasks)
    );
}


// ---------- RENDER ----------

function renderTasks() {

    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();


    let visibleTasks = tasks.filter(task => {

        const matchesSearch =
            task.title
                .toLowerCase()
                .includes(searchTerm) ||

            task.description
                .toLowerCase()
                .includes(searchTerm) ||

            task.category
                .toLowerCase()
                .includes(searchTerm);


        if (!matchesSearch) {
            return false;
        }


        if (currentFilter === "active") {
            return !task.completed;
        }


        if (currentFilter === "completed") {
            return task.completed;
        }


        if (currentFilter === "high") {
            return task.priority === "High";
        }


        return true;

    });


    taskList.innerHTML = "";


    visibleCount.textContent =
        visibleTasks.length;


    emptyState.style.display =
        visibleTasks.length === 0
            ? "block"
            : "none";


    visibleTasks.forEach(task => {

        const taskElement =
            createTaskElement(task);

        taskList.appendChild(taskElement);

    });

}


// ---------- CREATE TASK ELEMENT ----------

function createTaskElement(task) {

    const article =
        document.createElement("article");

    article.className =
        `task-item ${task.completed ? "completed" : ""}`;


    const dueInfo =
        getDueInformation(task);


    article.innerHTML = `

        <button
            class="check-btn"
            onclick="toggleTask(${task.id})"
            aria-label="Complete task"
        >
            ✓
        </button>


        <div class="task-content">

            <div class="task-title-row">

                <span class="task-title">
                    ${escapeHTML(task.title)}
                </span>

            </div>


            ${
                task.description
                    ? `
                    <p class="task-description">
                        ${escapeHTML(task.description)}
                    </p>
                    `
                    : ""
            }


            <div class="task-meta">

                <span class="badge category">
                    ${escapeHTML(task.category)}
                </span>


                <span class="badge priority-${task.priority.toLowerCase()}">
                    ${task.priority}
                </span>


                ${
                    dueInfo
                        ? `
                        <span class="due-date ${dueInfo.overdue ? "overdue" : ""}">
                            ${dueInfo.text}
                        </span>
                        `
                        : ""
                }

            </div>

        </div>


        <div class="task-actions">

            <button
                class="action-btn"
                onclick="editTask(${task.id})"
                title="Edit task"
            >
                ✎
            </button>


            <button
                class="action-btn delete"
                onclick="deleteTask(${task.id})"
                title="Delete task"
            >
                ×
            </button>

        </div>

    `;


    return article;

}


// ---------- COMPLETE / UNCOMPLETE ----------

function toggleTask(id) {

    const task =
        tasks.find(item => item.id === id);

    if (!task) return;


    task.completed =
        !task.completed;


    saveTasks();

    renderTasks();

    updateStats();


    if (task.completed) {

        showToast(
            "Nice work — task completed!"
        );

    } else {

        showToast(
            "Task moved back to active."
        );

    }

}


// ---------- DELETE ----------

function deleteTask(id) {

    const task =
        tasks.find(item => item.id === id);

    if (!task) return;


    tasks =
        tasks.filter(item => item.id !== id);


    saveTasks();

    renderTasks();

    updateStats();

    showToast("Task removed.");

}


// ---------- EDIT ----------

function editTask(id) {

    const task =
        tasks.find(item => item.id === id);

    if (!task) return;


    editingTaskId = id;


    taskTitle.value =
        task.title;

    taskDescription.value =
        task.description;

    taskCategory.value =
        task.category;

    taskPriority.value =
        task.priority;

    taskDate.value =
        task.date;

    taskTime.value =
        task.time;


    submitText.textContent =
        "Update task";

    cancelEdit.style.display =
        "block";


    taskTitle.focus();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ---------- CANCEL EDIT ----------

cancelEdit.addEventListener(
    "click",
    resetEditMode
);


function resetEditMode() {

    editingTaskId = null;

    submitText.textContent =
        "Add task";

    cancelEdit.style.display =
        "none";

    taskForm.reset();

}


// ---------- FILTERS ----------

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                currentFilter =
                    button.dataset.filter;


                renderTasks();

            }
        );

    });


// ---------- SEARCH ----------

searchInput.addEventListener(
    "input",
    renderTasks
);


// ---------- STATISTICS ----------

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const pending =
        total - completed;


    const overdue =
        tasks.filter(
            task =>
                !task.completed &&
                isOverdue(task)
        ).length;


    totalTasks.textContent =
        total;

    pendingTasks.textContent =
        pending;

    completedTasks.textContent =
        completed;

    overdueTasks.textContent =
        overdue;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    progressFill.style.width =
        `${percentage}%`;

    progressPercent.textContent =
        `${percentage}%`;

    progressText.textContent =
        `${completed} of ${total} tasks completed`;

}


// ---------- DUE DATE ----------

function getDueInformation(task) {

    if (!task.date && !task.time) {
        return null;
    }


    let dueDate;


    if (task.date && task.time) {

        dueDate =
            new Date(
                `${task.date}T${task.time}`
            );

    }

    else if (task.date) {

        dueDate =
            new Date(
                `${task.date}T23:59:59`
            );

    }

    else {

        return {
            text: `Today at ${task.time}`,
            overdue: false
        };

    }


    const overdue =
        !task.completed &&
        dueDate < new Date();


    const dateText =
        dueDate.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short"
            }
        );


    const timeText =
        task.time
            ? ` · ${task.time}`
            : "";


    return {

        text:
            `${overdue ? "Overdue · " : "Due · "}${dateText}${timeText}`,

        overdue

    };

}


// ---------- OVERDUE ----------

function isOverdue(task) {

    if (!task.date) {
        return false;
    }


    let dueDate;


    if (task.time) {

        dueDate =
            new Date(
                `${task.date}T${task.time}`
            );

    } else {

        dueDate =
            new Date(
                `${task.date}T23:59:59`
            );

    }


    return dueDate < new Date();

}


// ---------- ESCAPE HTML ----------

function escapeHTML(value) {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ---------- TOAST ----------

let toastTimer;


function showToast(message, icon = "✓") {

    toastMessage.textContent =
        message;

    document.getElementById(
        "toastIcon"
    ).textContent = icon;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


// ---------- THEME ----------

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );


        const isLight =
            document.body.classList.contains(
                "light"
            );


        localStorage.setItem(
            "focusflow_theme",
            isLight
                ? "light"
                : "dark"
        );


        themeToggle.textContent =
            isLight ? "☾" : "☼";

    }
);


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "focusflow_theme"
        );


    if (savedTheme === "light") {

        document.body.classList.add(
            "light"
        );

        themeToggle.textContent =
            "☾";

    }

}


// ---------- KEYBOARD SHORTCUT ----------

document.addEventListener(
    "keydown",
    event => {

        // Ctrl + K focuses search

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            searchInput.focus();

        }


        // Escape cancels editing

        if (
            event.key === "Escape" &&
            editingTaskId !== null
        ) {

            resetEditMode();

        }

    }
);
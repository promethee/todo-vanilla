function updateTitles(tasksCount, h1El, h2El) {
    if (tasksCount == 0) {
        h1El.textContent = "no tasks";
        h2El.textContent = "create one or import a JSON";
    } else {
        h1El.textContent = `${tasksCount} task${tasksCount == 1 ? "" : "s"}`;
        h2El.textContent = "import a JSON";
    }
}

function loadTasks() {
    if (localStorage.getItem("tasks") == null) {
        localStorage.setItem("tasks", "[]");
    }
    const tasks = JSON.parse(localStorage.getItem("tasks"));
    return tasks;
}

function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function clearTaskTextInput(inputEl) {
    return function() {
        inputEl.value = "";
    }
}

function addTask(inputEl) {
    return function(ev) {
        const text = inputEl.value;
        if (text.length === 0 || ev.key !== "Enter") {
            return;
        }
        const task = { id: Date.now(), text, done: false };
        const updatedTasks = loadTasks().concat(task);
        saveTasks(updatedTasks);
        clearTaskTextInput(inputEl)();
    }
}

function start() {
    const appEl = document.getElementById("app");
    const titleH1El = appEl.querySelector("h1");
    const titleH2El = appEl.querySelector("h2");

    const taskTextClearBtn = document.getElementById("task-text-clear");
    const taskTextInput = document.getElementById("task-text-input");
    const taskTextAddBtn = document.getElementById("task-text-add");

    const loadedTasks = loadTasks();
    updateTitles(loadedTasks.length, titleH1El, titleH2El);

    taskTextClearBtn.addEventListener("click", clearTaskTextInput(taskTextInput));
    taskTextInput.addEventListener("keydown", addTask(taskTextInput));
    taskTextAddBtn.addEventListener("click", addTask(taskTextInput));
}

document.addEventListener("DOMContentLoaded", start);
function getElements() {
    const h1El = document.querySelector("#title-container h1");
    const h2El = document.querySelector("#title-container h2");

    const taskTextClearBtn = document.getElementById("task-text-clear");
    const taskTextInput = document.getElementById("task-text-input");
    const taskTextAddBtn = document.getElementById("task-text-add");
    const taskTextEditBtn = document.getElementById("task-text-edit");
    const tasksContainerEl = document.getElementById("tasks-container");

    const tasksFilterAllBtn = document.getElementById("tasks-filter-all");
    const tasksFilterDoneBtn = document.getElementById("tasks-filter-done");
    const tasksFilterTodoBtn = document.getElementById("tasks-filter-todo");

    return {
        h1El, h2El,
        taskTextClearBtn, taskTextInput, taskTextAddBtn, taskTextEditBtn,
        tasksFilterAllBtn, tasksFilterDoneBtn, tasksFilterTodoBtn,
        tasksContainerEl
    };
}

function updateTitles(tasksCount) {
    const { h1El, h2El } = getElements();

    h2El.innerHTML = tasksCount === 0 ? "create one or import a JSON" : "<br/>";

    if (tasksCount === 0) {
        h1El.textContent = "no tasks";
    } else {
        h1El.textContent = `${tasksCount} task${tasksCount === 1 ? "" : "s"}`;
    }
}

function cycleTasksFilter(viewMode) {
    return function() {
        Array.from(document.querySelectorAll("[task-done]")).forEach(element => element.classList.remove("hide"));
        if (viewMode === "todo") {
            Array.from(document.querySelectorAll("[task-done=false]")).forEach(element => element.classList.add("hide"));
        } else if (viewMode === "done") {
            Array.from(document.querySelectorAll("[task-done=true]")).forEach(element => element.classList.add("hide"));
        }
    }
}

function disableTask(id) {
    const taskEl = document.querySelector(`div[task-id="${id}"]`);
    taskEl.querySelector(`input`).setAttribute("disabled", "disabled");
    taskEl.querySelector(`span`).classList.add("edit");
    taskEl.querySelector(`button`).setAttribute("disabled", "disabled");
}

function disableTasks() {
    const tasks = loadTasks();
    tasks.forEach(task => {
        disableTask(task.id);
    });
}

function makeHtmlFromTask(tasksContainerEl, taskTextEditBtn) {
    return function(task) {
        const taskEl = document.createElement("div");
        taskEl.setAttribute("task-id", task.id);
        taskEl.setAttribute("task-done", task.done);
        
        const taskDoneCheckBox = document.createElement("input");
        taskDoneCheckBox.setAttribute("type", "checkbox");
        taskDoneCheckBox.setAttribute("task-id", task.id);
        taskDoneCheckBox.addEventListener("click", updateTask({ ...task, done: !task.done }));

        if (task.done) {
            taskDoneCheckBox.setAttribute("checked", "");
        }

        const taskTextEl = document.createElement("span");
        taskTextEl.textContent = task.text;
        taskTextEl.setAttribute("task-id", task.id);
        taskTextEl.classList.add(task.done ? "done" : "todo");
        taskTextEl.addEventListener("click", function() {
            taskTextEditBtn.setAttribute("task-id", task.id);
        });
        taskTextEl.addEventListener("click", editTask(task));

        const taskDeleteBtn = document.createElement("button");
        taskDeleteBtn.setAttribute("task-id", task.id);
        taskDeleteBtn.textContent = "x";
        taskDeleteBtn.addEventListener("click", deleteTask);

        taskEl.appendChild(taskDoneCheckBox);
        taskEl.appendChild(taskTextEl);
        taskEl.appendChild(taskDeleteBtn);

        tasksContainerEl.appendChild(taskEl);
    }
}

function updateTasksList(tasks) {
    const { tasksContainerEl, taskTextEditBtn } = getElements();
    tasksContainerEl.innerHTML = "";

    tasks.forEach(makeHtmlFromTask(tasksContainerEl, taskTextEditBtn));

    updateTitles(tasks.length);
}

function loadTasks() {
    if (localStorage.getItem("tasks") == null) {
        localStorage.setItem("tasks", "[]");
    }
    const tasks = JSON.parse(localStorage.getItem("tasks"));
    return tasks;
}

function saveTasks(tasks) {
    clearTaskTextInput();
    localStorage.setItem("tasks", JSON.stringify(tasks));
    reset()
}

function getTask(id) {
    return loadTasks().find(task => task.id == id);
}

function clearTaskTextInput() {
    const { taskTextInput } = getElements();
    if (taskTextInput.value.length === 0 ) {
        return;
    }
    reset();
}

function editTask(task) {
    return function(ev) {
        if (ev.target.classList.contains("edit")) {
            return;
        }
        reset();
        const { taskTextInput, taskTextAddBtn, taskTextEditBtn } = getElements();
        taskTextEditBtn.classList.remove("hide");
        taskTextAddBtn.classList.add("hide");
        taskTextInput.value = task.text;
        taskTextInput.setAttribute("task-id", task.id);
        disableTasks();
    }
}
function updatedTaskText(ev) {
    const { taskTextInput } = getElements();
    const id = +ev.target.getAttribute("task-id");
    const text = taskTextInput.value;
    const updatedTask = { ...getTask(id), text };
    const previousTasks = loadTasks();
    const updatedTasks = previousTasks.map((task) => ({
        ...task,
        ...(task.id === id ? updatedTask : {})
    }));
    saveTasks(updatedTasks);
}

function validateTaskText(ev) {
    console.info("validateTaskText", { ev });
    const { taskTextInput } = getElements();
    const text = taskTextInput.value;
    if (text.length === 0 || (ev.type === "keydown" && ev.key !== "Enter")) {
        return;
    }
    const id = +ev.target.getAttribute("task-id");
    if (id) {
        updateTask({ text })(ev);
    } else {
        const task = { id: Date.now(), text, done: false };
        const updatedTasks = loadTasks().concat(task);
        saveTasks(updatedTasks);
    }
}

function updateTask(updatedTask) {
    return function(ev) {
        const id = +ev.target.getAttribute("task-id");
        const previousTasks = loadTasks();
        const updatedTasks = previousTasks.map((task) => ({
            ...task,
            ...(task.id === id ? updatedTask : {})
        }));
        saveTasks(updatedTasks);
    }
}

function deleteTask(ev) {
    const { tasksContainerEl } = getElements();
    const id = +ev.target.getAttribute("task-id");
    const previousTasks = loadTasks();
    const updatedTasks = previousTasks.filter((task) => task.id !== id);
    saveTasks(updatedTasks, tasksContainerEl);
}

function reset() {
    const {
        taskTextInput, taskTextAddBtn, taskTextEditBtn, tasksFilterToggleBtn, tasksFilterDescription
    } = getElements();

    taskTextInput.value = "";
    taskTextAddBtn.classList.remove("hide");
    taskTextEditBtn.classList.add("hide");

    const loadedTasks = loadTasks();
    updateTitles(loadedTasks.length);
    updateTasksList(loadedTasks);
}

function start() {
    const {
        taskTextClearBtn, taskTextInput, taskTextAddBtn,
        taskTextEditBtn, tasksFilterAllBtn, tasksFilterDoneBtn, tasksFilterTodoBtn
    } = getElements();

    reset();

    taskTextClearBtn.addEventListener("click", clearTaskTextInput);
    taskTextInput.addEventListener("keydown", validateTaskText);
    taskTextAddBtn.addEventListener("click", validateTaskText);
    taskTextEditBtn.addEventListener("click", updatedTaskText);
    tasksFilterAllBtn.addEventListener("click", cycleTasksFilter("all"));
    tasksFilterDoneBtn.addEventListener("click", cycleTasksFilter("done"));
    tasksFilterTodoBtn.addEventListener("click", cycleTasksFilter("todo"));
}

document.addEventListener("DOMContentLoaded", start);

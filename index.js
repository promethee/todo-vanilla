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
    const initialTasks = JSON.parse(localStorage.getItem("tasks"));
    return initialTasks;
}

function start() {
    const appEl = document.getElementById("app");
    const titleH1El = appEl.querySelector("h1");
    const titleH2El = appEl.querySelector("h2");

    const loadedTasks = loadTasks();
    updateTitles(loadedTasks.length, titleH1El, titleH2El);

    console.info({loadedTasks});
}

document.addEventListener("DOMContentLoaded", start);
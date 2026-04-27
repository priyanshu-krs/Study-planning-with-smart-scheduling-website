// ===============================
// SMART STUDY PLANNER PRO
// ===============================

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".sidebar li");

const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const studyHoursEl = document.getElementById("studyHours");
const examCountEl = document.getElementById("examCount");
const streakCountEl = document.getElementById("streakCount");

const taskName = document.getElementById("taskName");
const taskHours = document.getElementById("taskHours");
const taskPriority = document.getElementById("taskPriority");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const examName = document.getElementById("examName");
const examDate = document.getElementById("examDate");
const addExamBtn = document.getElementById("addExamBtn");
const examList = document.getElementById("examList");

const notesArea = document.getElementById("notesArea");
const saveNotesBtn = document.getElementById("saveNotesBtn");

const themeBtn = document.getElementById("themeBtn");

const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimerBtn");
const resetTimerBtn = document.getElementById("resetTimerBtn");

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let exams = JSON.parse(localStorage.getItem("studyExams")) || [];
let completed = Number(localStorage.getItem("completedTasks")) || 0;
let streak = Number(localStorage.getItem("studyStreak")) || 0;

const quotes = [
  "Success is built daily.",
  "Small progress is still progress.",
  "Discipline beats motivation.",
  "Focus on becoming better.",
  "Study now, shine later.",
  "Consistency creates success."
];

// ------------------ Navigation ------------------
navItems.forEach(item => {
  item.addEventListener("click", () => {
    navItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const section = item.dataset.section;

    pages.forEach(page => page.classList.remove("active-page"));
    document.getElementById(section).classList.add("active-page");
  });
});

// ------------------ Theme ------------------
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const mode = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("themeMode", mode);
});

function loadTheme() {
  const mode = localStorage.getItem("themeMode");
  if (mode === "dark") {
    document.body.classList.add("dark");
  }
}

// ------------------ Tasks ------------------
addTaskBtn.addEventListener("click", addTask);

function addTask() {
  const name = taskName.value.trim();
  const hours = Number(taskHours.value);
  const priority = taskPriority.value;

  if (!name || !hours) {
    alert("Please fill task and hours.");
    return;
  }

  const task = {
    id: Date.now(),
    name,
    hours,
    priority,
    done: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  clearTaskFields();
  updateDashboard();
  updateChart();
}

function clearTaskFields() {
  taskName.value = "";
  taskHours.value = "";
  taskPriority.selectedIndex = 0;
}

function saveTasks() {
  localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  updateDashboard();
  updateChart();
}

function completeTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id && !task.done) {
      task.done = true;
      completed++;
      localStorage.setItem("completedTasks", completed);
      streak++;
      localStorage.setItem("studyStreak", streak);
    }
    return task;
  });

  saveTasks();
  renderTasks();
  updateDashboard();
  updateChart();
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = "<li>No tasks added yet.</li>";
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${task.name}</strong>
        (${task.priority}) • ${task.hours} hrs
        ${task.done ? "✅ Completed" : ""}
      </div>

      <div style="display:flex; gap:10px;">
        ${!task.done ? `<button onclick="completeTask(${task.id})">Done</button>` : ""}
        <button onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

// ------------------ Exams ------------------
addExamBtn.addEventListener("click", addExam);

function addExam() {
  const name = examName.value.trim();
  const date = examDate.value;

  if (!name || !date) {
    alert("Please add exam name and date.");
    return;
  }

  exams.push({
    id: Date.now(),
    name,
    date
  });

  localStorage.setItem("studyExams", JSON.stringify(exams));

  examName.value = "";
  examDate.value = "";

  renderExams();
  updateDashboard();
}

function deleteExam(id) {
  exams = exams.filter(exam => exam.id !== id);
  localStorage.setItem("studyExams", JSON.stringify(exams));
  renderExams();
  updateDashboard();
}

function renderExams() {
  examList.innerHTML = "";

  if (exams.length === 0) {
    examList.innerHTML = "<li>No exams added yet.</li>";
    return;
  }

  exams.forEach(exam => {
    const today = new Date();
    const examDay = new Date(exam.date);
    const diff = Math.ceil((examDay - today) / (1000 * 60 * 60 * 24));

    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${exam.name}</strong> — ${diff} days left
      </div>

      <button onclick="deleteExam(${exam.id})">Delete</button>
    `;

    examList.appendChild(li);
  });
}

// ------------------ Notes ------------------
saveNotesBtn.addEventListener("click", () => {
  localStorage.setItem("studyNotes", notesArea.value);
  alert("Notes saved.");
});

function loadNotes() {
  notesArea.value = localStorage.getItem("studyNotes") || "";
}

// ------------------ Timer ------------------
let timeLeft = 1500;
let timer;

function updateTimerUI() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;

  timerDisplay.textContent =
    `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

startTimerBtn.addEventListener("click", () => {
  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("Pomodoro finished 🎉");
      timeLeft = 1500;
      updateTimerUI();
    }
  }, 1000);
});

resetTimerBtn.addEventListener("click", () => {
  clearInterval(timer);
  timeLeft = 1500;
  updateTimerUI();
});

// ------------------ Dashboard ------------------
function updateDashboard() {
  totalTasksEl.textContent = tasks.length;
  completedTasksEl.textContent = completed;
  streakCountEl.textContent = streak;
  examCountEl.textContent = exams.length;

  const hours = tasks.reduce((sum, task) => sum + task.hours, 0);
  studyHoursEl.textContent = hours;
}

// ------------------ Quote ------------------
function loadQuote() {
  const random = Math.floor(Math.random() * quotes.length);
  document.getElementById("quote").textContent = quotes[random];
}

// ------------------ Chart ------------------
let chart;

function updateChart() {
  const completedCount = tasks.filter(task => task.done).length;
  const pendingCount = tasks.filter(task => !task.done).length;

  const ctx = document.getElementById("studyChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Pending"],
      datasets: [{
        data: [completedCount, pendingCount]
      }]
    },
    options: {
      responsive: true
    }
  });
}

// ------------------ Init ------------------
function init() {
  loadTheme();
  loadQuote();
  loadNotes();
  renderTasks();
  renderExams();
  updateDashboard();
  updateTimerUI();
  updateChart();
}

init();
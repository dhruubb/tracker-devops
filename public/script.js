const API = "";

async function fetchTasks() {
  const res = await fetch("/tasks");
  const tasks = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  tasks.forEach(t => {
    const li = document.createElement("li");

    li.innerHTML = `
      <input type="checkbox" ${t.done ? "checked" : ""} onchange="toggleTask(${t.id})">
      ${t.text}
      <button onclick="deleteTask(${t.id})">❌</button>
    `;

    list.appendChild(li);
  });
}

async function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value) return;

  await fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input.value })
  });

  input.value = "";
  fetchTasks();
}

async function toggleTask(id) {
  await fetch(`/tasks/${id}`, { method: "PUT" });
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`/tasks/${id}`, { method: "DELETE" });
  fetchTasks();
}

fetchTasks();
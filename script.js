let tasks = JSON.parse(localStorage.getItem('tasks')) || [
    { id: 1, title: 'Setup GitHub Repository', desc: 'Initialize the main project repo and add collaborators.', priority: 'High', completed: true },
    { id: 2, title: 'Wireframe User Dashboard', desc: 'Draft layout designs for mobile and desktop screens.', priority: 'Medium', completed: false },
    { id: 3, title: 'Configure Bootstrap Framework', desc: 'Import CSS and JS CDNs and verify responsiveness.', priority: 'Low', completed: false }
];

let currentFilter = 'all';
let searchQuery = '';

const taskContainer = document.getElementById('task-container');
const taskForm = document.getElementById('task-form');
const searchInput = document.getElementById('search-input');
const emptyState = document.getElementById('empty-state');
const statTotal = document.getElementById('stat-total');
const statProgress = document.getElementById('stat-progress');
const statCompleted = document.getElementById('stat-completed');
const currentDateEl = document.getElementById('current-date');

function init() {
    displayCurrentDate();
    renderTasks();
    updateStats();
}

function displayCurrentDate() {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
}

function renderTasks() {
    taskContainer.innerHTML = '';

    let filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (searchQuery.trim() !== '') {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.desc.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (filteredTasks.length === 0) {
        emptyState.classList.remove('d-none');
        return;
    } else {
        emptyState.classList.add('d-none');
    }

    filteredTasks.forEach(task => {
        const col = document.createElement('div');
        col.className = 'col-md-4';

        const priorityBadgeColor = 
            task.priority === 'High' ? 'bg-danger' : 
            task.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary';

        col.innerHTML = `
            <div class="card h-100 shadow-sm ${task.completed ? 'task-card-completed' : 'task-card-pending'}">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge ${priorityBadgeColor}">${task.priority} Priority</span>
                        <span class="badge ${task.completed ? 'bg-success' : 'bg-warning text-dark'}">
                            ${task.completed ? 'Completed' : 'In Progress'}
                        </span>
                    </div>
                    <h5 class="card-title fw-bold ${task.completed ? 'text-decoration-line-through text-muted' : ''}">${escapeHTML(task.title)}</h5>
                    <p class="card-text text-muted small flex-grow-1">${escapeHTML(task.desc)}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                        <button class="btn btn-sm ${task.completed ? 'btn-outline-secondary' : 'btn-outline-success'}" onclick="toggleTaskStatus(${task.id})">
                            <i class="bi ${task.completed ? 'bi-arrow-counterclockwise' : 'bi-check2'} me-1"></i> 
                            ${task.completed ? 'Mark Pending' : 'Mark Done'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        taskContainer.appendChild(col);
    });
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const progress = total - completed;

    statTotal.textContent = total;
    statProgress.textContent = progress;
    statCompleted.textContent = completed;
}

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('task-title').value;
    const desc = document.getElementById('task-desc').value;
    const priority = document.getElementById('task-priority').value;

    const newTask = {
        id: Date.now(),
        title,
        desc,
        priority,
        completed: false
    };

    tasks.push(newTask);
    saveAndRefresh();

    taskForm.reset();
    const modalEl = document.getElementById('addTaskModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();
});

window.toggleTaskStatus = function(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRefresh();
};

window.deleteTask = function(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRefresh();
};

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderTasks();
    });
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasks();
});

function saveAndRefresh() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    updateStats();
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

init();
// Mentee-side task logic (role-specific)
const TaskStatus = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed'
};
console.log('TaskStatus object:', TaskStatus);

const menteeTasks = [
    {
        id: 1,
        title: "Build a REST API",
        description: "Create a RESTful API using Node.js and Express. Implement CRUD operations for a todo list application. Ensure proper error handling and validation.",
        status: TaskStatus.NOT_STARTED,
        dueDate: "Mar 30, 2024",
        assignedBy: {
            name: "John Smith",
            title: "Senior Backend Developer",
            avatar: "../../assets/images/mentor-avatar.jpg"
        },
        assignedTo: { id: 1 },
        requirements: ["Node.js", "Express.js", "Postman", "MongoDB (optional)"],
        resources: ["https://expressjs.com/", "https://www.mongodb.com/docs/manual/tutorial/crud-operations/"]
    },
    {
        id: 2,
        title: "Frontend Implementation",
        description: "Implement the frontend for the todo list application using React. Components should include task list, task item, add task form. State management can be done with Context API or Redux (optional).",
        status: TaskStatus.IN_PROGRESS,
        dueDate: "Mar 31, 2024",
        assignedBy: {
            name: "John Smith",
            title: "Senior Backend Developer",
            avatar: "../../assets/images/mentor-avatar.jpg"
        },
        assignedTo: { id: 1 },
        requirements: ["React", "HTML", "CSS", "API Integration"],
        resources: ["https://react.dev/learn"]
    },
    {
        id: 3,
        title: "Database Design",
        description: "Design a database schema for an e-commerce platform. Consider products, categories, users, orders, and reviews. Create an ERD (Entity Relationship Diagram).",
        status: TaskStatus.COMPLETED,
        dueDate: "Apr 2, 2024",
        assignedBy: {
            name: "Emily Davis",
            title: "Senior Database Engineer",
            avatar: "../../assets/images/mentor-avatar.jpg"
        },
        assignedTo: { id: 1 },
        requirements: ["SQL or NoSQL knowledge", "ERD Tool (e.g., draw.io, Lucidchart)"],
        resources: []
    },
    {
        id: 4,
        title: "Authentication System",
        description: "Implement user authentication using JWT tokens. Include login, registration, and password reset functionality. Secure password storage using hashing.",
        status: TaskStatus.NOT_STARTED,
        dueDate: "Apr 5, 2024",
        assignedBy: {
            name: "John Smith",
            title: "Senior Backend Developer",
            avatar: "../../assets/images/mentor-avatar.jpg"
        },
        assignedTo: { id: 1 },
        requirements: ["JWT", "Hashing (bcrypt)", "Backend framework (e.g., Node/Express)"],
        resources: ["https://jwt.io/introduction"]
    }
];
console.log('Initial menteeTasks:', JSON.parse(JSON.stringify(menteeTasks)));

const currentMenteeId = 1;
let currentFilter = 'all';

// Selectors for main view elements
const tasksHeaderWrapper = document.querySelector('.tasks-header-wrapper');
const taskDetailContainer = document.querySelector('.task-detail-container');


function renderMenteeTasks() {
    console.log('renderMenteeTasks called. Current filter:', currentFilter);
    const tasksList = document.querySelector('.tasks-list'); // tasksList is inside tasksHeaderWrapper now
    if (!tasksList) {
        console.error('.tasks-list element not found!');
        return;
    }

    // Ensure list view is visible and detail view is hidden
    if (tasksHeaderWrapper) tasksHeaderWrapper.style.display = 'block';
    if (taskDetailContainer) taskDetailContainer.style.display = 'none';


    const filteredTasksForCurrentMentee = menteeTasks.filter(task => (task.assignedTo ? task.assignedTo.id : -1) === currentMenteeId);
    let tasksToRender = filteredTasksForCurrentMentee;
    if (currentFilter !== 'all') {
        tasksToRender = filteredTasksForCurrentMentee.filter(task => task.status === currentFilter);
    }

    let html = '';
    if (tasksToRender.length === 0 && currentFilter !== 'all') {
        html = `<p style="text-align:center; margin-top:2rem; color: var(--secondary);">No tasks in this category.</p>`;
    } else if (currentFilter === 'all') {
        const statusOrder = [
            { key: TaskStatus.NOT_STARTED, label: 'Not Started', icon: 'fa-clock' },
            { key: TaskStatus.IN_PROGRESS, label: 'In Progress', icon: 'fa-spinner' },
            { key: TaskStatus.COMPLETED, label: 'Completed', icon: 'fa-check-circle' }
        ];
        let hasAnyTaskInAllView = false;
        statusOrder.forEach(statusObj => {
            const group = filteredTasksForCurrentMentee.filter(task => task.status === statusObj.key);
            if (group.length > 0) {
                hasAnyTaskInAllView = true;
                html += `<div class="all-status-header"><i class="fas ${statusObj.icon}"></i> ${statusObj.label}</div>`;
                html += group.map(task => createMenteeTaskCard(task)).join('');
            }
        });
        if (!hasAnyTaskInAllView && filteredTasksForCurrentMentee.length === 0) {
             html = `<p style="text-align:center; margin-top:2rem; color: var(--secondary);">No tasks assigned to you yet.</p>`;
        }
    } else {
        html = tasksToRender.map(task => createMenteeTaskCard(task)).join('');
         if (tasksToRender.length === 0) {
            html = `<p style="text-align:center; margin-top:2rem; color: var(--secondary);">No tasks currently ${currentFilter.replace('-', ' ')}.</p>`;
        }
    }
    tasksList.innerHTML = html;
    updateFilterCounts(filteredTasksForCurrentMentee);
    addMenteeTaskEventListeners();
}

function createMenteeTaskCard(task) {
    // Simplified action button from your last version
    let actionBtn = '';
    if (task.status === TaskStatus.NOT_STARTED) {
        actionBtn = `<button class="btn btn-primary start-btn" data-id="${task.id}"><i class="fas fa-play"></i> Start</button>`;
    } else if (task.status === TaskStatus.IN_PROGRESS) {
        actionBtn = `<button class="btn btn-primary complete-btn" data-id="${task.id}"><i class="fas fa-check"></i> Complete</button>`;
    }
    let statusText = '';
    if (task.status === TaskStatus.NOT_STARTED) {
        statusText = 'Not Started';
    } else if (task.status === TaskStatus.IN_PROGRESS) {
        statusText = 'In Progress';
    } else if (task.status === TaskStatus.COMPLETED) {
        statusText = 'Completed';
    }
    return `
        <div class="task-item" data-task-id="${task.id}" data-status="${task.status}">
            <div class="task-info">
                <h3 class="task-title">${task.title}</h3>
                <p class="task-description">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
            </div>
            <div class="task-meta">
                <div class="task-due-date"><i class="fas fa-calendar"></i> Due: ${task.dueDate}</div>
                <span class="task-status status-${task.status}">${statusText}</span>
            </div>
            <div class="task-mentor">
                <img src="${task.assignedBy.avatar}" alt="${task.assignedBy.name}" class="mentor-avatar">
                <div class="mentor-info">
                    <h4>${task.assignedBy.name}</h4>
                    <p>${task.assignedBy.title}</p> <!-- Added back mentor title -->
                </div>
            </div>
            <div class="task-actions">${actionBtn}</div>
        </div>
    `;
}

function addMenteeTaskEventListeners() {
    console.log('addMenteeTaskEventListeners called.');

    // Listeners for Start/Complete buttons (stopPropagation for these)
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', function handler(event) {
            event.stopPropagation(); // Prevent task-item click when button is clicked
            console.log('>>> CLICK HANDLER: START BUTTON WAS ACTUALLY CLICKED! <<< Element:', this);
            const id = parseInt(this.getAttribute('data-id'));
            const task = menteeTasks.find(t => t.id === id);
            if (task) {
                task.status = TaskStatus.IN_PROGRESS;
                renderMenteeTasks();
            }
        });
    });
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', function handler(event) {
            event.stopPropagation(); // Prevent task-item click when button is clicked
            console.log('>>> CLICK HANDLER: COMPLETE BUTTON WAS ACTUALLY CLICKED! <<< Element:', this);
            const id = parseInt(this.getAttribute('data-id'));
            const task = menteeTasks.find(t => t.id === id);
            if (task) {
                task.status = TaskStatus.COMPLETED;
                renderMenteeTasks();
            }
        });
    });

    // NEW: Listeners for clicking on the task item itself
    document.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            console.log('Task item clicked, ID:', taskId);
            const task = menteeTasks.find(t => t.id === taskId);
            if (task) {
                renderTaskDetails(task);
            }
        });
    });

    console.log('Start button listeners attached to:', document.querySelectorAll('.start-btn').length, 'elements');
    console.log('Complete button listeners attached to:', document.querySelectorAll('.complete-btn').length, 'elements');
    console.log('Task item listeners attached to:', document.querySelectorAll('.task-item').length, 'elements');
}


function renderTaskDetails(task) {
    console.log('Rendering details for task:', task);
    if (!tasksHeaderWrapper || !taskDetailContainer) {
        console.error('View containers not found!');
        return;
    }

    let statusText = '';
    if (task.status === TaskStatus.NOT_STARTED) statusText = 'Not Started';
    else if (task.status === TaskStatus.IN_PROGRESS) statusText = 'In Progress';
    else if (task.status === TaskStatus.COMPLETED) statusText = 'Completed';

    let requirementsHTML = task.requirements && task.requirements.length > 0
        ? `<ul>${task.requirements.map(req => `<li>${req}</li>`).join('')}</ul>`
        : '<p>No specific requirements listed.</p>';

    let resourcesHTML = task.resources && task.resources.length > 0
        ? `<ul>${task.resources.map(res => `<li><a href="${res}" target="_blank" rel="noopener noreferrer">${res}</a></li>`).join('')}</ul>`
        : '<p>No resources listed.</p>';

    taskDetailContainer.innerHTML = `
        <button class="btn btn-outline" id="back-to-tasks-btn"><i class="fas fa-arrow-left"></i> Back to Tasks</button>
        <h2>${task.title}</h2>
        <p><strong class="detail-label">Status:</strong> <span class="task-status status-${task.status}">${statusText}</span></p>
        <p><strong class="detail-label">Due Date:</strong> ${task.dueDate}</p>

        <p class="detail-label">Description:</p>
        <p>${task.description.replace(/\n/g, '<br>')}</p>

        <div class="task-detail-mentor-info">
            <img src="${task.assignedBy.avatar}" alt="${task.assignedBy.name}" class="mentor-avatar">
            <div>
                <h4>Assigned by: ${task.assignedBy.name}</h4>
                <p>${task.assignedBy.title}</p>
            </div>
        </div>
        
        <p class="detail-label">Requirements:</p>
        ${requirementsHTML}

        <p class="detail-label">Resources:</p>
        ${resourcesHTML}
        
        <!-- You can add the action buttons here too if needed -->
    `;

    // Add event listener for the new "Back" button
    document.getElementById('back-to-tasks-btn').addEventListener('click', () => {
        tasksHeaderWrapper.style.display = 'block';
        taskDetailContainer.style.display = 'none';
        taskDetailContainer.innerHTML = ''; // Clear details
    });

    // Switch views
    tasksHeaderWrapper.style.display = 'none';
    taskDetailContainer.style.display = 'block';
}


function updateFilterCounts(tasksForCurrentMentee) {
    const counts = {
        all: tasksForCurrentMentee.length,
        [TaskStatus.NOT_STARTED]: tasksForCurrentMentee.filter(t => t.status === TaskStatus.NOT_STARTED).length,
        [TaskStatus.IN_PROGRESS]: tasksForCurrentMentee.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        [TaskStatus.COMPLETED]: tasksForCurrentMentee.filter(t => t.status === TaskStatus.COMPLETED).length
    };
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const status = btn.getAttribute('data-status');
        const countSpan = btn.querySelector('.count');
        if (countSpan) countSpan.textContent = counts[status] || 0;
        btn.classList.toggle('active', status === currentFilter);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired.');
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // If already in detail view, switch back to list view before applying filter
            if (tasksHeaderWrapper && taskDetailContainer && tasksHeaderWrapper.style.display === 'none') {
                tasksHeaderWrapper.style.display = 'block';
                taskDetailContainer.style.display = 'none';
                taskDetailContainer.innerHTML = '';
            }

            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-status');
            renderMenteeTasks(); // This will re-render the list and hide details
        });
    });

    const initialActiveButton = document.querySelector(`.filter-btn[data-status="${currentFilter}"]`);
    if (initialActiveButton) initialActiveButton.classList.add('active');
    else {
        const allButton = document.querySelector(`.filter-btn[data-status="all"]`);
        if (allButton) allButton.classList.add('active');
    }
    renderMenteeTasks();
    console.log('Initial renderMenteeTasks complete.');
});
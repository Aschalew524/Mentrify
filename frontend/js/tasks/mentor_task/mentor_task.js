// Mentor-side task logic (role-specific)
const TaskStatus = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed'
};

// Sample tasks assigned by the mentor
let mentorTasks = [
    {
        id: 1,
        title: "Build a REST API",
        description: "Create a RESTful API using Node.js and Express. Implement CRUD operations for a todo list application.",
        status: TaskStatus.IN_PROGRESS,
        dueDate: "Mar 15, 2024",
        mentee: {
            name: "Sarah Johnson",
            title: "Web Development",
            avatar: "../../assets/images/mentee-avatar.jpg"
        },
        resource: "https://example.com/api-docs",
        comments: "Focus on RESTful principles."
    },
    {
        id: 2,
        title: "Frontend Implementation",
        description: "Implement the frontend for the todo list application using React. Include state management and API integration.",
        status: TaskStatus.IN_PROGRESS,
        dueDate: "Mar 20, 2024",
        mentee: {
            name: "Michael Brown",
            title: "Frontend Development",
            avatar: "../../assets/images/mentee-avatar.jpg"
        },
        resource: "",
        comments: "Use hooks and context API."
    },
    {
        id: 3,
        title: "Database Design",
        description: "Design a database schema for an e-commerce platform. Include tables for users, products, orders, and reviews.",
        status: TaskStatus.COMPLETED,
        dueDate: "Mar 10, 2024",
        mentee: {
            name: "Emily Davis",
            title: "Database Design",
            avatar: "../../assets/images/mentee-avatar.jpg"
        },
        resource: "",
        comments: "Include indexes for performance."
    },
    {
        id: 4,
        title: "Authentication System",
        description: "Implement user authentication using JWT tokens. Include login, registration, and password reset functionality.",
        status: TaskStatus.NOT_STARTED,
        dueDate: "Mar 25, 2024",
        mentee: {
            name: "Sarah Johnson",
            title: "Web Development",
            avatar: "../../assets/images/mentee-avatar.jpg"
        },
        resource: "",
        comments: ""
    }
];

function renderMentorTasks() {
    const tasksList = document.querySelector('.tasks-list');
    if (!tasksList) return;
    tasksList.innerHTML = mentorTasks.map(task => createMentorTaskCard(task)).join('');
    addMentorTaskEventListeners();
}

function createMentorTaskCard(task) {
    let actionBtns = '';
    if (task.status === TaskStatus.NOT_STARTED || task.status === TaskStatus.IN_PROGRESS) {
        actionBtns = `<button class="btn btn-outline edit-btn" data-id="${task.id}"><i class="fas fa-edit"></i> Edit</button>`;
    } else if (task.status === TaskStatus.COMPLETED) {
        actionBtns = `
            <button class="btn btn-outline details-btn" data-id="${task.id}"><i class="fas fa-eye"></i> Details</button>
            <button class="btn btn-danger delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i> Delete</button>
        `;
    }
    let resourceHtml = task.resource ? `<div class='task-resource' style='margin-top:0.5rem;'><i class='fas fa-paperclip'></i> <a href='${task.resource}' target='_blank' rel='noopener'>Resource</a></div>` : '';
    let commentsHtml = task.comments ? `<div class='task-comments' style='margin-top:0.5rem;'><i class='fas fa-comment'></i> ${task.comments}</div>` : '';
    return `
        <div class="task-item" data-task-id="${task.id}" data-status="${task.status}">
            <div class="task-info">
                <h3 class="task-title">${task.title}</h3>
                <p class="task-description">${task.description}</p>
                ${resourceHtml}
                ${commentsHtml}
            </div>
            <div class="task-meta">
                <div class="task-due-date"><i class="fas fa-calendar"></i> Due: ${task.dueDate}</div>
                <span class="task-status status-${task.status}">${task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
            <div class="task-mentee">
                <img src="${task.mentee.avatar}" alt="Mentee" class="mentee-avatar">
                <div class="mentee-info">
                    <h4>${task.mentee.name}</h4>
                    <p>${task.mentee.title}</p>
                </div>
            </div>
            <div class="task-actions">${actionBtns}</div>
        </div>
    `;
}

function addMentorTaskEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(btn.getAttribute('data-id'));
            // Open modal and prefill for editing (implementation depends on your modal setup)
            alert('Edit Task ' + id + ' (implement modal logic)');
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(btn.getAttribute('data-id'));
            const idx = mentorTasks.findIndex(t => t.id === id);
            if (idx !== -1 && confirm('Delete this task?')) {
                mentorTasks.splice(idx, 1);
                renderMentorTasks();
            }
        });
    });
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(btn.getAttribute('data-id'));
            alert('Show details for Task ' + id);
        });
    });
}

document.addEventListener('DOMContentLoaded', renderMentorTasks);

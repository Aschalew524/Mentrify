// Mentor-side task logic (role-specific)
const TaskStatus = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed'
};

// Array to store tasks from API
let mentorTasks = [];

// Function to fetch tasks from API
async function fetchMentorTasks() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found. Please log in.');
        }

        const response = await fetch('https://mentrifyapis.biruk.tech/api/mentor/tasks', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch tasks. Status: ${response.status}`);
        }

        const data = await response.json();
        mentorTasks = Array.isArray(data) ? data : data.data || [];
        renderMentorTasks();
        return mentorTasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showToast('Error fetching tasks. Please try again.', 'error');
        mentorTasks = [];
        renderMentorTasks();
        return [];
    }
}

function renderMentorTasks() {
    const tasksList = document.querySelector('.tasks-list');
    if (!tasksList) return;

    if (!mentorTasks || mentorTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="text-center py-4">
                <div style="margin-bottom: 1rem;">
                    <i class="fas fa-tasks" style="font-size: 3rem; color: #6c757d;"></i>
                </div>
                <h3 style="color: #495057; margin-bottom: 0.5rem;">No Tasks Found</h3>
                <p style="color: #6c757d;">You haven't created any tasks yet. Click the "Assign New Task" button to get started!</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = mentorTasks.map(task => createMentorTaskCard(task)).join('');
    addMentorTaskEventListeners();
}

function createMentorTaskCard(task) {
    const statusClass = `status-${task.status || 'pending'}`;
    const statusText = (task.status || 'pending').split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Get mentee information from the API response
    const mentee = task.assignee || {};
    const menteeName = mentee.first_name && mentee.last_name 
        ? `${mentee.first_name} ${mentee.last_name}`
        : 'Unknown Mentee';
    const menteeTitle = mentee.job_title || 'General';

    // Format the due date
    const dueDate = new Date(task.due_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Show edit and delete buttons only for pending tasks
    let actionBtns = '';
    if (task.status === 'pending') {
        actionBtns = `
            <div class="task-actions">
                <button class="btn btn-outline edit-btn" data-id="${task.id}" title="Edit Task">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger delete-btn" data-id="${task.id}" title="Delete Task">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
    }

    // Truncate description to 100 characters
    const truncatedDescription = task.description.length > 100 
        ? task.description.substring(0, 100).trim() + '...' 
        : task.description;

    return `
        <div class="task-item" data-task-id="${task.id}" data-status="${task.status}">
            <div class="task-info">
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <span class="task-status ${statusClass}">
                        ${statusText}
                    </span>
                </div>
                <div class="task-description" id="task-description-${task.id}">
                    ${truncatedDescription}
                    ${task.description.length > 100 ? 
                        '<span class="view-more">(Click to view full description)</span>' : 
                        ''
                    }
                </div>
            </div>
            <div class="task-meta">
                <div class="task-due-date">
                    <i class="fas fa-calendar"></i>
                    <span>Due: ${dueDate}</span>
                </div>
            </div>
            <div class="task-mentee">
                <div class="mentee-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="mentee-info">
                    <h4>${menteeName}</h4>
                    <p>${menteeTitle}</p>
                </div>
            </div>
            ${actionBtns}
        </div>
    `;
}

function addMentorTaskEventListeners() {
    // Edit button listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(btn.getAttribute('data-id'));
            editTask(id);
        });
    });

    // Delete button listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(btn.getAttribute('data-id'));
            const taskTitle = btn.closest('.task-item').querySelector('.task-title').textContent;
            const confirmDelete = confirm(`Are you sure you want to delete the task "${taskTitle}"?`);
            if (confirmDelete) {
                deleteTask(id);
            }
        });
    });

    // Description click listeners for modal
    document.querySelectorAll('.task-description').forEach(desc => {
        desc.addEventListener('click', function() {
            const taskItem = this.closest('.task-item');
            const title = taskItem.querySelector('.task-title').textContent;
            const taskId = taskItem.getAttribute('data-task-id');
            const task = mentorTasks.find(t => t.id === parseInt(taskId));
            if (task) {
                openDescriptionModal(title, task.description);
            }
        });
    });
}

// Add click outside to close modal
document.addEventListener('click', function(e) {
    const descriptionModal = document.getElementById('descriptionModal');
    if (e.target === descriptionModal) {
        closeDescriptionModal();
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchMentorTasks().then(() => {
        setupMentorFilterListeners();
        updateMentorTaskCounts();
    });
});

// Add CSS styles for the updated task card
const taskStyles = document.createElement('style');
taskStyles.textContent = `
    .task-item {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        gap: 2rem;
        align-items: center;
    }

    .task-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .task-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .task-title {
        font-size: 1.2rem;
        color: #2c3e50;
        margin: 0;
        font-weight: 600;
    }

    .task-description {
        color: #6c757d;
        font-size: 0.95rem;
        line-height: 1.5;
        margin: 0;
    }

    .task-meta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .task-due-date {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #6c757d;
        font-size: 0.9rem;
    }

    .task-due-date i {
        color: #17a2b8;
    }

    .task-status {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .task-mentee {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .mentee-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e9ecef;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
    }

    .mentee-info h4 {
        margin: 0;
        font-size: 0.95rem;
        color: #2c3e50;
    }

    .mentee-info p {
        margin: 0;
        font-size: 0.85rem;
        color: #6c757d;
    }

    .task-actions {
        display: flex;
        gap: 0.75rem;
    }

    .btn {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
    }

    .btn-outline {
        background: transparent;
        border: 1px solid #17a2b8;
        color: #17a2b8;
    }

    .btn-outline:hover {
        background: #17a2b8;
        color: white;
    }

    .btn-danger {
        background: #dc3545;
        border: 1px solid #dc3545;
        color: white;
    }

    .btn-danger:hover {
        background: #c82333;
        border-color: #bd2130;
    }

    @media (max-width: 1200px) {
        .task-item {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        .task-meta {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }

        .task-mentee {
            width: 100%;
            justify-content: flex-start;
        }

        .task-actions {
            width: 100%;
            justify-content: flex-start;
        }
    }
`;
document.head.appendChild(taskStyles);

async function editTask(taskId) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found. Please log in.');
        }

        // Show loading state
        showToast('Loading task details...', 'info');

        // Fetch task details from API
        const response = await fetch(`https://mentrifyapis.biruk.tech/api/tasks/${taskId}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Please log in to continue');
            } else if (response.status === 403) {
                throw new Error('You are not authorized to edit this task');
            } else if (response.status === 404) {
                throw new Error('Task not found');
            } else {
                throw new Error('Failed to fetch task details');
            }
        }

        const taskData = await response.json();
        console.log('Task details from API:', taskData);

        // Hide mentee and status fields when editing
        const menteeGroup = document.getElementById('menteeGroup');
        const statusGroup = document.getElementById('statusGroup');
        menteeGroup.style.display = 'none';
        statusGroup.style.display = 'none';

        // Remove required attribute from hidden fields
        document.getElementById('mentee').removeAttribute('required');
        document.getElementById('taskStatus').removeAttribute('required');

        // Set form values
        document.getElementById('taskTitle').value = taskData.title || '';
        document.getElementById('taskDescription').value = taskData.description || '';
        
        // Format the date properly for the date input
        try {
            const dueDate = taskData.due_date;
            const dateObj = new Date(dueDate);
            const formattedDate = dateObj.toISOString().split('T')[0];
            document.getElementById('dueDate').value = formattedDate;
        } catch (error) {
            console.error('Error formatting date:', error);
            document.getElementById('dueDate').value = '';
        }

        // Set the task ID for update
        document.getElementById('editTaskId').value = taskId;

        // Open the modal
        document.getElementById('newTaskModal').style.display = 'flex';
    } catch (error) {
        console.error('Error editing task:', error);
        showToast(error.message || 'Failed to load task details. Please try again.', 'error');
    }
}

async function updateTask(taskId, taskData) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found. Please log in.');
        }

        // Format the date to ISO format with time set to end of day
        const formattedDueDate = new Date(taskData.due_date);
        formattedDueDate.setHours(23, 59, 59, 999);
        const isoDueDate = formattedDueDate.toISOString();

        // Prepare the request body with only allowed fields
        const requestBody = {
            title: taskData.title,
            description: taskData.description,
            due_date: isoDueDate
        };

        console.log('Updating task with data:', requestBody);

        const response = await fetch(`https://mentrifyapis.biruk.tech/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Error response:', errorData);
            
            if (response.status === 401) {
                throw new Error('Please log in to continue');
            } else if (response.status === 403) {
                throw new Error('You are not authorized to update this task');
            } else if (response.status === 404) {
                throw new Error('Task not found');
            } else if (response.status === 422) {
                throw new Error(errorData?.message || 'Invalid task data. Please check your input.');
            } else {
                throw new Error(errorData?.message || `Failed to update task. Status: ${response.status}`);
            }
        }

        const updatedTask = await response.json();
        console.log('Task updated successfully:', updatedTask);

        // Update the task in the local array
        const index = mentorTasks.findIndex(task => task.id === taskId);
        if (index !== -1) {
            mentorTasks[index] = updatedTask;
        }

        // Re-render the tasks
        renderMentorTasks();
        showToast('Task updated successfully!', 'success');
        return updatedTask;
    } catch (error) {
        console.error('Error updating task:', error);
        showToast(error.message || 'Error updating task. Please try again.', 'error');
        throw error;
    }
}

// Create a new task for a mentee (API: POST /api/mentorships/{mentorship_id}/tasks)
async function createTask({ mentorship_id, title, description, due_date }) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found. Please log in.');
        }

        // Format the due date to ISO string (end of day)
        const formattedDueDate = new Date(due_date);
        formattedDueDate.setHours(23, 59, 59, 999);
        const isoDueDate = formattedDueDate.toISOString();

        const requestBody = {
            title,
            description,
            due_date: isoDueDate
        };

        const response = await fetch(`https://mentrifyapis.biruk.tech/api/mentorships/${mentorship_id}/tasks`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to create task. Status: ${response.status}`);
        }

        const data = await response.json();
        showToast('Task created successfully!', 'success');
        // Optionally, refresh the task list here
        fetchMentorTasks();
        return data;
    } catch (error) {
        showToast(error.message || 'Error creating task. Please try again.', 'error');
        throw error;
    }
}

// Update the form submission handler
document.getElementById('newTaskForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const editTaskId = document.getElementById('editTaskId').value;
    
    if (editTaskId) {
        // Handle task update
        try {
            const taskData = {
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDescription').value,
                due_date: document.getElementById('dueDate').value
            };
            
            // Validate due date
            const selectedDate = new Date(taskData.due_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                showToast('Due date must be today or later', 'error');
                return;
            }

            // Show loading state
            const submitButton = document.querySelector('#newTaskForm button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            submitButton.disabled = true;

            await updateTask(editTaskId, taskData);
            closeNewTaskModal();
            event.target.reset();
            document.getElementById('editTaskId').value = '';
            
            // Show mentee and status fields again and restore required attributes
            const menteeGroup = document.getElementById('menteeGroup');
            const statusGroup = document.getElementById('statusGroup');
            menteeGroup.style.display = 'block';
            statusGroup.style.display = 'block';
            document.getElementById('mentee').setAttribute('required', '');
            document.getElementById('taskStatus').setAttribute('required', '');
        } catch (error) {
            showToast(error.message || 'Error updating task. Please try again.', 'error');
        } finally {
            const submitButton = document.querySelector('#newTaskForm button[type="submit"]');
            submitButton.innerHTML = 'Save Task';
            submitButton.disabled = false;
        }
    } else {
        // Handle new task creation
        try {
            const menteeSelect = document.getElementById('mentee');
            const selectedOption = menteeSelect.options[menteeSelect.selectedIndex];
            if (!selectedOption.value) {
                showToast('Please select a mentee', 'error');
                return;
            }
            let menteeData;
            try {
                menteeData = JSON.parse(selectedOption.getAttribute('data-mentee'));
            } catch (error) {
                showToast('Invalid mentee data. Please try again.', 'error');
                return;
            }
            const mentorshipId = menteeData.mentorship_id;
            if (!mentorshipId) {
                showToast('Cannot determine mentorship ID. Please try again.', 'error');
                return;
            }
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDescription').value;
            const dueDate = document.getElementById('dueDate').value;
            // Validate due date
            const selectedDate = new Date(dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                showToast('Due date must be today or later', 'error');
                return;
            }
            // Show loading state
            const submitButton = document.querySelector('#newTaskForm button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            submitButton.disabled = true;
            try {
                await createTask({
                    mentorship_id: mentorshipId,
                    title,
                    description,
                    due_date: dueDate
                });
                closeNewTaskModal();
                event.target.reset();
            } catch (error) {
                showToast(error.message || 'Error creating task. Please try again.', 'error');
            } finally {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        } catch (error) {
            showToast('An unexpected error occurred. Please try again.', 'error');
        }
    }
});

// --- Assign Task Modal Logic ---

// Open the Assign Task modal
function openNewTaskModal() {
    // Ensure mentee and status fields are visible and required
    const menteeGroup = document.getElementById('menteeGroup');
    const statusGroup = document.getElementById('statusGroup');
    menteeGroup.style.display = 'block';
    statusGroup.style.display = 'block';
    document.getElementById('mentee').setAttribute('required', '');
    document.getElementById('taskStatus').setAttribute('required', '');
    
    // Clear the edit task ID
    document.getElementById('editTaskId').value = '';
    
    fetchActiveMentees().then(mentees => {
        populateMenteesDropdown(mentees);
        document.getElementById('newTaskModal').style.display = 'flex';
    }).catch(() => {
        showToast('Failed to load mentees. Please try again.', 'error');
    });
}

// Close the Assign Task modal
function closeNewTaskModal() {
    document.getElementById('newTaskModal').style.display = 'none';
}

// Fetch active mentees from backend API
async function fetchActiveMentees() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found. Please log in.');
        }
        const response = await fetch('https://mentrifyapis.biruk.tech/api/mentorships/mentor/active', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch mentees');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching mentees:', error);
        return [];
    }
}

// Populate mentees dropdown
function populateMenteesDropdown(mentees) {
    const menteeSelect = document.getElementById('mentee');
    menteeSelect.innerHTML = '<option value="">Choose a mentee...</option>';
    if (!mentees || mentees.length === 0) {
        const noMenteesOption = document.createElement('option');
        noMenteesOption.value = "";
        noMenteesOption.textContent = "No active mentees found";
        noMenteesOption.disabled = true;
        menteeSelect.appendChild(noMenteesOption);
        return;
    }
    mentees.forEach(mentorship => {
        const mentee = mentorship.mentee;
        const option = document.createElement('option');
        option.value = mentee.id;
        const displayName = `${mentee.first_name || ''} ${mentee.last_name || ''}`.trim() || `Mentee #${mentee.id}`;
        const jobTitle = mentee.job_title || mentee.expertise || '';
        option.textContent = `${displayName}${jobTitle ? ` - ${jobTitle}` : ''}`;
        mentee.mentorship_id = mentorship.id;
        option.setAttribute('data-mentee', JSON.stringify(mentee));
        menteeSelect.appendChild(option);
    });
}

// Attach event listener to the Assign New Task button
const openTaskBtn = document.getElementById('openNewTaskBtn');
if (openTaskBtn) {
    openTaskBtn.addEventListener('click', openNewTaskModal);
}

// All task-list-related logic has been removed from this file. Task fetching, rendering, and event listeners are now handled exclusively in pages/tasks/mentor_tasks.html.
// You may keep unrelated helper functions or exports here if needed.

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: slideIn 0.5s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 3000);

    // Add CSS for toast animations if not already present
    if (!document.getElementById('toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add the deleteTask function
async function deleteTask(taskId) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found. Please log in.');
        }

        // Show loading state
        showToast('Deleting task...', 'info');

        const response = await fetch(`https://mentrifyapis.biruk.tech/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            
            if (response.status === 401) {
                throw new Error('Please log in to continue');
            } else if (response.status === 403) {
                throw new Error('You are not authorized to delete this task');
            } else if (response.status === 404) {
                throw new Error('Task not found');
            } else {
                throw new Error(errorData?.message || `Failed to delete task. Status: ${response.status}`);
            }
        }

        // Remove the task from the local array
        mentorTasks = mentorTasks.filter(task => task.id !== taskId);
        
        // Re-render the tasks
        renderMentorTasks();
        
        showToast('Task deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast(error.message || 'Error deleting task. Please try again.', 'error');
    }
}

// Add these functions for description modal
function openDescriptionModal(title, description) {
    const modal = document.getElementById('descriptionModal');
    const modalTitle = document.getElementById('modalTaskTitle');
    const modalDescription = document.getElementById('modalTaskDescription');

    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modal.style.display = 'flex';
}

function closeDescriptionModal() {
    const modal = document.getElementById('descriptionModal');
    modal.style.display = 'none';
}

// --- FILTER FUNCTIONALITY FOR MENTOR TASKS ---
let currentMentorFilter = 'all';

// Map filter button status to actual task status values
const FILTER_STATUS_MAP = {
    'all': 'all',
    'not-started': 'pending',
    'in-progress': 'in_progress',
    'completed': 'completed'
};

function setupMentorFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const status = button.dataset.status;
            filterMentorTasks(status);
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function filterMentorTasks(status) {
    currentMentorFilter = status;
    let filtered = [];
    if (status === 'all') {
        filtered = mentorTasks;
    } else {
        const mappedStatus = FILTER_STATUS_MAP[status];
        filtered = mentorTasks.filter(task => (task.status || 'pending') === mappedStatus);
    }
    renderMentorTasks(filtered);
    updateMentorTaskCounts();
}

function updateMentorTaskCounts() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const counts = {
        all: mentorTasks.length,
        'not-started': mentorTasks.filter(t => (t.status || 'pending') === 'pending').length,
        'in-progress': mentorTasks.filter(t => (t.status || 'pending') === 'in_progress').length,
        completed: mentorTasks.filter(t => (t.status || 'pending') === 'completed').length
    };
    filterButtons.forEach(btn => {
        const status = btn.dataset.status;
        const countEl = btn.querySelector('.count');
        if (countEl) countEl.textContent = counts[status] || 0;
    });
}

// Update renderMentorTasks to accept an optional filtered list
function renderMentorTasks(filteredList) {
    const tasksList = document.querySelector('.tasks-list');
    if (!tasksList) return;
    const tasksToRender = filteredList || mentorTasks;
    if (!tasksToRender || tasksToRender.length === 0) {
        tasksList.innerHTML = `
            <div class="text-center py-4">
                <div style="margin-bottom: 1rem;">
                    <i class="fas fa-tasks" style="font-size: 3rem; color: #6c757d;"></i>
                </div>
                <h3 style="color: #495057; margin-bottom: 0.5rem;">No Tasks Found</h3>
            </div>
        `;
        return;
    }
    tasksList.innerHTML = tasksToRender.map(task => createMentorTaskCard(task)).join('');
    addMentorTaskEventListeners();
}

// Global variables
let allTasks = [];
let currentFilter = 'all';

// DOM Elements
const tasksList = document.querySelector('.tasks-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const descriptionModal = document.getElementById('descriptionModal');
const modalTaskTitle = document.getElementById('modalTaskTitle');
const modalTaskDescription = document.getElementById('modalTaskDescription');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing tasks page');
    fetchTasks();
    setupFilterListeners();
});

// Setup filter button listeners
function setupFilterListeners() {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const status = button.dataset.status;
            filterTasks(status);
            
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

// Fetch tasks from API
async function fetchTasks() {
    try {
        const token = localStorage.getItem('access_token');
        console.log('Token check:', {
            access_token: localStorage.getItem('access_token') ? 'exists' : 'not found',
            finalToken: token ? 'exists' : 'not found'
        });
        
        if (!token) {
            console.error('No authentication token found in storage');
            showError('Please log in to view your tasks');
            renderTasks([]);
        return;
    }

        console.log('Fetching tasks from API...');
        
        const response = await fetch('https://mentrifyapis.biruk.tech/api/mentee/tasks', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        console.log('API Response status:', response.status);
        console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('API Error Response:', errorData);
            throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Successfully fetched tasks:', data);
        
        if (!Array.isArray(data)) {
            console.error('API returned non-array data:', data);
            throw new Error('Invalid response format from API');
        }
        
        allTasks = data;
        updateTaskCounts();
        filterTasks(currentFilter);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showError(`Failed to load tasks: ${error.message}`);
        renderTasks([]);
    }
}

// Update task counts in filter buttons
function updateTaskCounts() {
    const counts = {
        all: allTasks.length,
        pending: allTasks.filter(task => task.status === 'pending').length,
        'in-progress': allTasks.filter(task => task.status === 'in-progress').length,
        completed: allTasks.filter(task => task.status === 'completed').length
    };

    filterButtons.forEach(button => {
        const status = button.dataset.status;
        const countElement = button.querySelector('.count');
        if (countElement) {
            countElement.textContent = counts[status] || 0;
        }
    });
}

// Filter tasks based on status
function filterTasks(status) {
    currentFilter = status;
    const filteredTasks = status === 'all' 
        ? allTasks 
        : allTasks.filter(task => task.status === status);

    renderTasks(filteredTasks);
}

// Render tasks to the DOM
function renderTasks(tasks) {
    tasksList.innerHTML = '';

    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="no-tasks">
                <p>No tasks found.</p>
            </div>
        `;
        return;
    }

    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksList.appendChild(taskCard);
    });
}

// Create task card element
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-item';
    
    // Format due date
    const dueDate = new Date(task.due_date);
    const formattedDate = dueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Truncate description if it's too long
    const truncatedDescription = task.description.length > 100 
        ? task.description.substring(0, 100) + '...' 
        : task.description;

    // Get mentor (assigner) information
    const mentor = task.assigner;
    const mentorName = mentor ? `${mentor.first_name} ${mentor.last_name}` : 'Unknown Mentor';
    const mentorPhoto = mentor?.photo_url || '../../assets/images/default-avatar.png';

    taskCard.innerHTML = `
            <div class="task-info">
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <span class="task-status status-${task.status}">${formatStatus(task.status)}</span>
            </div>
            <p class="task-description">
                ${truncatedDescription}
                ${task.description.length > 100 ? '<span class="view-more">Click to view full description</span>' : ''}
            </p>
            </div>
            <div class="task-meta">
            <div class="task-due-date">
                <i class="fas fa-calendar"></i>
                ${formattedDate}
            </div>
        </div>
        <div class="task-mentee">
            <div class="mentee-avatar">
                <img src="${mentorPhoto}" alt="${mentorName}" onerror="this.src='../../assets/images/default-avatar.png'">
                </div>
            <div class="mentee-info">
                <h4>${mentorName}</h4>
                <p>Mentor</p>
            </div>
        </div>
        <div class="task-actions">
            ${getStatusUpdateButton(task)}
        </div>
    `;

    // Add event listeners
    const descriptionElement = taskCard.querySelector('.task-description');
    descriptionElement.addEventListener('click', () => showDescriptionModal(task));

    const statusButton = taskCard.querySelector('.status-update-btn');
    if (statusButton) {
        statusButton.addEventListener('click', () => updateTaskStatus(task.id, getNextStatus(task.status)));
    }

    return taskCard;
}

// Get status update button based on current status
function getStatusUpdateButton(task) {
    if (task.status === 'completed') {
        return '';
    }

    const nextStatus = getNextStatus(task.status);
    return `
        <button class="btn btn-primary status-update-btn">
            Mark as ${formatStatus(nextStatus)}
        </button>
    `;
}

// Get next status in the workflow
function getNextStatus(currentStatus) {
    switch (currentStatus) {
        case 'pending':
            return 'in_progress';
        case 'in_progress':
            return 'completed';
        default:
            return currentStatus;
    }
}

// Format status for display
function formatStatus(status) {
    return status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Show description modal
function showDescriptionModal(task) {
    const modalContent = `
        <div class="modal-content">
            <p class="task-description-full">${task.description}</p>
        </div>
    `;
    modalTaskDescription.innerHTML = modalContent;
    descriptionModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

// View mentor profile
window.viewMentorProfile = function(mentorId) {
    if (mentorId) {
        window.location.href = `../mentor_profile/mentor_profile.html?id=${mentorId}`;
    } else {
        showError('Mentor information not available');
    }
};

// Close description modal
function closeDescriptionModal() {
    descriptionModal.style.display = 'none';
    document.body.style.overflow = ''; // Restore background scroll
}

// Update task status
async function updateTaskStatus(taskId, newStatus) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`https://mentrifyapis.biruk.tech/api/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('API Error Response:', errorData);
            throw new Error(`Failed to update task status: ${response.status} ${response.statusText}`);
        }

        // Optionally, you can use the updated task from the response
        // const updatedTask = await response.json();

        // Update local task data
        const taskIndex = allTasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            allTasks[taskIndex].status = newStatus;
            updateTaskCounts();
            filterTasks(currentFilter);
        }
    } catch (error) {
        console.error('Error updating task status:', error);
        showError(`Failed to update task status: ${error.message}`);
    }
}

// Show error message
function showError(message) {
    // You can implement a proper error notification system here
    alert(message);
}

// Ensure modal closes and restores scroll
window.addEventListener('click', (event) => {
    if (event.target === descriptionModal) {
        closeDescriptionModal();
    }
});

// Add some CSS styles for the new elements
const style = document.createElement('style');
style.textContent = `
    .task-item {
        width: 100%;
        margin-bottom: 1.5rem;
        background: var(--white);
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        padding: 1.5rem;
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        gap: 2rem;
        align-items: start;
        transition: var(--transition-smooth);
        position: relative;
        overflow: visible;
    }

    .task-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--card-hover-shadow);
    }

    .task-info {
        max-width: 500px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
    }

    .task-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .task-title {
        font-size: 1.1rem;
        color: var(--secondary);
        font-weight: 600;
        margin: 0;
        line-height: 1.4;
        flex: 1;
        min-width: 0;
    }

    .task-description {
        color: var(--text);
        font-size: 0.95rem;
        line-height: 1.5;
        margin: 0;
        cursor: pointer;
        transition: color 0.2s ease;
        padding: 0.5rem 0;
        max-height: 4.5em;
        overflow: hidden;
    }

    .task-description:hover {
        color: var(--primary);
    }

    .view-more {
        color: var(--primary);
        font-size: 0.9rem;
        font-style: italic;
        margin-left: 0.5rem;
        cursor: pointer;
        transition: color 0.2s ease;
    }

    .view-more:hover {
        color: var(--primary-dark);
        text-decoration: underline;
    }

    .task-meta {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 150px;
        flex-shrink: 0;
    }

    .task-mentee {
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 200px;
        flex-shrink: 0;
    }

    .mentee-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
    }

    .mentee-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .mentee-info {
        min-width: 0;
    }

    .mentee-info h4 {
        margin: 0;
        font-size: 0.95rem;
        color: var(--secondary);
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .mentee-info p {
        margin: 0;
        font-size: 0.85rem;
        color: var(--text);
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .task-due-date {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text);
        font-size: 0.9rem;
        white-space: nowrap;
    }

    .task-due-date i {
        color: var(--primary);
    }

    .task-status {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        white-space: nowrap;
    }

    .status-pending {
        background: #e9ecef;
        color: #495057;
    }

    .status-in-progress {
        background: #cce5ff;
        color: #004085;
    }

    .status-completed {
        background: #d4edda;
        color: #155724;
    }

    .task-actions {
        display: flex;
        gap: 0.75rem;
        min-width: 160px;
        justify-content: flex-end;
        flex-shrink: 0;
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
            width: 100%;
        }

        .task-mentee {
            width: 100%;
            justify-content: flex-start;
        }

        .task-actions {
            width: 100%;
            justify-content: flex-start;
        }

        .task-info {
            max-width: 100%;
        }
    }

    @media (max-width: 768px) {
        .task-actions {
            flex-direction: column;
        }

        .btn {
            width: 100%;
            justify-content: center;
        }

        .task-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .task-status {
            align-self: flex-start;
        }

        .task-meta {
            flex-direction: column;
            align-items: flex-start;
        }
    }
`;
document.head.appendChild(style);

// Add some CSS styles for the modal
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    #descriptionModal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: var(--white);
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        padding: 2rem;
        position: relative;
        overflow-y: auto;
        box-sizing: border-box;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none;  /* IE and Edge */
    }
    .modal-content::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
    }

    .task-description-full {
        color: var(--text);
        font-size: 1rem;
        line-height: 1.6;
        margin: 0;
        white-space: pre-wrap;
    }

    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
            padding: 1.5rem;
        }
    }
`;
document.head.appendChild(modalStyle); 
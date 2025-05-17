// Define global variables first
let currentSessionId = null;

// Define global functions first
window.viewNotes = function(sessionId) {
    console.log('Opening notes for session:', sessionId);
    currentSessionId = sessionId;

    const isMentorPage = window.location.pathname.includes('mentor_sessions');
    
    if (isMentorPage) {
        // Mentor view - create or use existing modal
        let modal = document.getElementById('notesModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'notesModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Session Notes</h2>
                        <button class="close-modal" onclick="window.closeNotesModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="notesForm">
                            <div class="form-group">
                                <label for="sessionNotes">Your Notes</label>
                                <textarea id="sessionNotes" name="notes" rows="6" placeholder="Add your notes here..."></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Save Notes</button>
                                <button type="button" class="btn btn-outline" onclick="window.closeNotesModal()">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Show modal and fetch notes
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const notesTextarea = document.getElementById('sessionNotes');
        notesTextarea.value = 'Loading notes...';
        
        fetchSessionNotes(sessionId)
            .then(session => {
                const notes = session.notes_mentor;
                notesTextarea.value = notes || '';
                notesTextarea.readOnly = false;
                
                // Set up form submission
                const form = document.getElementById('notesForm');
                form.onsubmit = (e) => {
                    e.preventDefault();
                    saveSessionNotes(sessionId, notesTextarea.value, true);
                };
            })
            .catch(error => {
                console.error('Error fetching notes:', error);
                notesTextarea.value = 'Error loading notes. Please try again.';
                notesTextarea.style.color = '#dc3545';
                notesTextarea.style.fontStyle = 'italic';
            });
    } else {
        // Mentee view - use new mentee modal
        let menteeModal = document.getElementById('menteeNotesModal');
        if (!menteeModal) {
            menteeModal = document.createElement('div');
            menteeModal.id = 'menteeNotesModal';
            menteeModal.className = 'modal';
            menteeModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Mentor's Notes</h2>
                        <button class="close-modal" onclick="window.closeMenteeNotesModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Mentor's Notes</label>
                            <div class="notes-container">
                                <div class="notes-content" id="menteeNotesContent">
                                    <div class="loading-spinner">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        <span>Loading notes...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline" onclick="window.closeMenteeNotesModal()">Close</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(menteeModal);
            
            // Add mentee modal styles
            const style = document.createElement('style');
            style.textContent = `
                .modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                }

                .modal-content {
                    position: relative;
                    background-color: white;
                    margin: 10% auto;
                    padding: 2rem;
                    width: 90%;
                    max-width: 600px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .modal-header h2 {
                    margin: 0;
                    color: #333;
                    font-size: 1.5rem;
                }

                .close-modal {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                }

                .close-modal:hover {
                    color: #333;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #333;
                    font-weight: 500;
                }

                .notes-container {
                    background: #f8f9fa;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 1rem;
                    min-height: 150px;
                }

                .notes-content {
                    font-size: 1rem;
                    line-height: 1.6;
                    color: #333;
                    white-space: pre-wrap;
                }

                .loading-spinner {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    color: #666;
                    font-style: italic;
                }

                .loading-spinner i {
                    font-size: 1.5rem;
                    color: #4a90e2;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-primary {
                    background: #4a90e2;
                    color: white;
                    border: none;
                }

                .btn-primary:hover {
                    background: #357abd;
                }

                .btn-outline {
                    background: transparent;
                    color: #4a90e2;
                    border: 1px solid #4a90e2;
                }

                .btn-outline:hover {
                    background: rgba(74, 144, 226, 0.1);
                }

                .empty-notes, .error-message {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 10px 0;
                }

                .empty-notes {
                    background-color: #e9ecef;
                    color: #495057;
                }

                .empty-notes i { 
                    color: #6c757d; 
                }

                .error-message {
                    background-color: #f8d7da;
                    color: #721c24;
                }

                .error-message i { 
                    color: #721c24; 
                }
            `;
            document.head.appendChild(style);
        }
        
        // Show modal and fetch notes
        menteeModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const notesContent = document.getElementById('menteeNotesContent');
        // Show loading state initially
        notesContent.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Loading notes...</span>
            </div>`;
        
        fetchSessionNotes(sessionId)
            .then(session => {
                const notes = session.notes_mentor;
                if (notes === null || notes === undefined || notes.trim() === '') {
                    notesContent.innerHTML = `
                        <div class="empty-notes">
                            <i class="fas fa-info-circle"></i>
                            <p>No notes available from mentor yet.</p>
                        </div>
                    `;
                } else {
                    const p = document.createElement('p');
                    p.textContent = notes;
                    notesContent.innerHTML = '';
                    notesContent.appendChild(p);
                }
            })
            .catch(error => {
                console.error('Error fetching notes:', error);
                notesContent.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Error loading notes. Please try again.</p>
                    </div>
                `;
            });
    }
};

window.closeNotesModal = function() {
    const modal = document.getElementById('notesModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    // currentSessionId = null; // Only set to null if this modal was the 'active' notes modal.
                           // Consider if viewNotes should always be the one to set/clear it.
                           // For now, keeping original behavior of clearing it on close.
    currentSessionId = null;
};

window.closeMenteeNotesModal = function() {
    const modal = document.getElementById('menteeNotesModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    currentSessionId = null;
};

// DOM Elements
const createSessionBtn = document.querySelector('.btn-primary'); // Ensure this selector is correct for your create session button
const modal = document.getElementById('createSessionModal'); // Assumes createSessionModal exists in HTML
const closeModalBtn = modal ? modal.querySelector('.close-modal') : null; // Scope to createSessionModal
const createSessionForm = document.getElementById('createSessionForm');
const mentorshipSelect = document.getElementById('mentorship');
const sessionsGrid = document.getElementById('sessionsGrid');
const emptyState = document.getElementById('emptyState');
const statusFilter = document.getElementById('status-filter');
const searchInput = document.querySelector('.search-input');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // REMOVED: The problematic creation of a 'notesModal' here.
    // viewNotes function will now handle creation of 'notesModal' (for mentor) if needed.

    loadSessions();
    setupEventListeners();
});

function setupEventListeners() {
    if (createSessionBtn) {
    createSessionBtn.addEventListener('click', openModal);
    }
    if (closeModalBtn) { // This is the close button for createSessionModal
    closeModalBtn.addEventListener('click', closeModal);
    }
    if (createSessionForm) {
    createSessionForm.addEventListener('submit', handleSessionCreation);
    }
    
    // Close createSessionModal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) { // modal here refers to createSessionModal
            closeModal();
        }
    });

    // Add filter and search listeners
    if (statusFilter) {
    statusFilter.addEventListener('change', loadSessions);
    }
    if (searchInput) {
    searchInput.addEventListener('input', debounce(loadSessions, 300));
    }
}

// Load Sessions
async function loadSessions() {
    try {
        const status = statusFilter?.value || 'all';
        const search = searchInput?.value || '';
        
        const isMentorPage = window.location.pathname.includes('mentor_sessions');
        let endpoint = isMentorPage 
            ? 'http://mentrifyapis.biruk.tech/api/mentor/sessions'
            : 'http://mentrifyapis.biruk.tech/api/mentee/sessions'; // Corrected variable name 'url' to 'endpoint'
        
        const params = new URLSearchParams();
        
        if (status !== 'all') {
            params.append('status', status);
        }
        if (search) {
            params.append('search', search);
        }
        
        if (params.toString()) {
            endpoint += `?${params.toString()}`; // Use endpoint here
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            // Don't throw error here directly, let UI show login prompt or similar
            showNotification('Please log in to view sessions.', 'error');
            if (sessionsGrid) sessionsGrid.innerHTML = '<p>Please log in to view sessions.</p>'; // Clear grid
            if (emptyState) emptyState.style.display = 'none';
            return; // Stop further execution
        }

        const response = await fetch(endpoint, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Error response:', errorData);
            
            if (response.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else if (response.status === 403) {
                throw new Error('You are not authorized to view these sessions.');
            } else {
                throw new Error(errorData?.message || `Failed to load sessions. Status: ${response.status}`);
            }
        }

        const sessions = await response.json();
        // console.log('Raw sessions data:', JSON.stringify(sessions, null, 2)); // Keep for debugging if needed
        
        const sessionsWithDetails = sessions.map(session => {
            if (isMentorPage) {
            if (session.mentorship && session.mentorship.mentee) {
                session.mentee = session.mentorship.mentee;
                }
            } else {
                if (session.mentorship && session.mentorship.mentor) {
                    session.mentor = session.mentorship.mentor;
                }
            }
            return session;
        });

        // console.log('Processed sessions with details:', sessionsWithDetails); // Keep for debugging
        displaySessions(sessionsWithDetails);
    } catch (error) {
        console.error('Error loading sessions:', error);
        showNotification(error.message || 'Failed to load sessions. Please try again.', 'error');
        if (sessionsGrid) sessionsGrid.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        if (emptyState) emptyState.style.display = 'none';
    }
}

function displaySessions(sessions) {
    if (!sessionsGrid) return;
    
    sessionsGrid.innerHTML = '';
    
    if (!sessions || sessions.length === 0) { // Added !sessions check
        if (emptyState) {
        emptyState.style.display = 'block';
        }
        return;
    }

    if (emptyState) {
    emptyState.style.display = 'none';
    }
    
    sessions.forEach(session => {
        const sessionCard = createSessionCard(session);
        sessionsGrid.appendChild(sessionCard);
    });
}

function createSessionCard(session) {
    // console.log('Creating card for session:', session); // Keep for debugging
    
    const card = document.createElement('div');
    card.className = 'session-card';
    // Ensure showSessionDetails is available globally or handle click differently
    if (window.showSessionDetails) {
      card.onclick = () => window.showSessionDetails(session);
    } else {
      console.warn('showSessionDetails function not found. Card click will do nothing.');
    }
    
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    
    const isMentorPage = window.location.pathname.includes('mentor_sessions');
    const userData = isMentorPage ? session.mentee : session.mentor;
    
    const userName = userData?.first_name && userData?.last_name 
        ? `${userData.first_name} ${userData.last_name}`
        : (userData?.first_name || (isMentorPage ? 'Mentee' : 'Mentor')); // Fallback to first_name or generic role
    
    const photoUrl = userData?.photo_url || '../../assets/images/default-avatar.jpg'; // Ensure this path is correct
    const jobTitle = userData?.job_title || '';
    const sessionStatus = session.status?.toLowerCase() || 'unknown'; // Ensure lowercase for class
    
    card.innerHTML = `
        <div class="session-header">
            <img src="${photoUrl}" alt="${isMentorPage ? 'Mentee' : 'Mentor'}" class="session-avatar">
            <div class="session-info">
                <h3>${userName} (${isMentorPage ? 'Mentee' : 'Mentor'})</h3>
                <p title="${session.title || 'Untitled Session'}">${session.title || 'Untitled Session'}</p>
                ${jobTitle ? `<span class="job-title">${jobTitle}</span>` : ''}
            </div>
        </div>
        <div class="session-details">
            <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span>${startTime ? formatDate(startTime) : 'N/A'}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-clock"></i>
                <span>${startTime && endTime ? `${formatTime(startTime)} - ${formatTime(endTime)}` : 'N/A'}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-video"></i>
                <span>${session.session_type || 'Not specified'}</span>
            </div>
        </div>
        <div class="session-right">
            <div class="session-status status-${sessionStatus}">${session.status || 'Unknown'}</div>
            <div class="session-actions">
                ${getSessionActions(session)}
            </div>
        </div>
    `;
    
    return card;
}

function getSessionActions(session) {
    const actions = [];
    const isMentorPage = window.location.pathname.includes('mentor_sessions');
    
    if (session.status === 'upcoming') {
        if (session.session_type !== 'In Person' && session.join_url) { // Check join_url exists
            actions.push(`
                <button class="btn btn-primary" onclick="event.stopPropagation(); joinSession('${session.join_url}')">
                    <i class="fas fa-video"></i>Join
                </button>
            `);
        }
    }
    
    if (session.status === 'completed' && !isMentorPage) {
        // Assuming provideFeedback function exists and is global
        if (window.provideFeedback) {
    actions.push(`
                <button class="btn btn-outline" onclick="event.stopPropagation(); window.provideFeedback(${session.id})">
                    <i class="fas fa-star"></i>Feedback
                </button>
            `);
        }
    }
    
    // Notes button should always call window.viewNotes
    actions.push(`
        <button class="btn btn-outline notes-btn" data-session-id="${session.id}" onclick="event.stopPropagation(); window.viewNotes(${session.id})">
            <i class="fas fa-sticky-note"></i>Notes
        </button>
    `);
    
    return actions.join('');
}

// Utility Functions
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(date) {
    if (!(date instanceof Date) || isNaN(date)) return 'Invalid Time';
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Session Actions
function joinSession(joinUrl) {
    if (joinUrl) {
        window.open(joinUrl, '_blank');
    } else {
        showNotification('No meeting link available for this session.', 'warning');
    }
}

// Placeholder for rescheduleSession if not fully implemented
function rescheduleSession(sessionId) {
    showNotification(`Reschedule functionality for session ${sessionId} is not yet implemented.`, 'info');
}
// Placeholder for provideFeedback if not fully implemented
if (!window.provideFeedback) {
    window.provideFeedback = function(sessionId) {
        showNotification(`Feedback functionality for session ${sessionId} is not yet implemented.`, 'info');
    }
}


// Modal Functions for Create Session Modal
function openModal() {
    if (!modal) {
        console.error('createSessionModal not found');
        return;
    }
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    fetchActiveMentees()
        .then(mentees => {
            populateMenteesDropdown(mentees);
        })
        .catch(error => {
            console.error('Error loading mentees for dropdown:', error);
            showNotification('Failed to load mentees. Please try creating session later.', 'error');
            // Optionally disable parts of the form or show message in dropdown
             if (mentorshipSelect) {
                mentorshipSelect.innerHTML = '<option value="">Error loading mentees</option>';
                mentorshipSelect.disabled = true;
            }
        });
}

function closeModal() { // This is for createSessionModal
    if (!modal) {
        console.error('createSessionModal not found');
        return;
    }
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    if (createSessionForm) createSessionForm.reset();
    // Reset session type dependent field
    const joinUrlField = document.getElementById('join_url');
    if (joinUrlField) joinUrlField.disabled = false;
}

// Fetch active mentees from backend API
async function fetchActiveMentees() {
        const token = localStorage.getItem('access_token');
        if (!token) {
        // This error should ideally be caught by the caller (openModal)
        throw new Error('Authentication required to fetch mentees. Please log in.');
        }
        const response = await fetch('http://mentrifyapis.biruk.tech/api/mentorships/mentor/active', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
        if (response.status === 401) throw new Error('Session expired. Please log in again to fetch mentees.');
        throw new Error(`Failed to fetch mentees (Status: ${response.status})`);
        }
        const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []); // Adapt based on actual API response structure
}

// Populate mentees dropdown
function populateMenteesDropdown(mentees) {
    if (!mentorshipSelect) return;
    mentorshipSelect.innerHTML = '<option value="" disabled selected>Choose a mentee...</option>'; // Added disabled selected
    mentorshipSelect.disabled = false; // Ensure it's enabled
    
    if (!mentees || mentees.length === 0) {
        const noMenteesOption = document.createElement('option');
        noMenteesOption.value = "";
        noMenteesOption.textContent = "No active mentees found";
        noMenteesOption.disabled = true;
        mentorshipSelect.appendChild(noMenteesOption);
        return;
    }
    
    mentees.forEach(mentorship => {
        // Assuming mentorship object has 'id' (mentorship_id) and 'mentee' object
        if (!mentorship.mentee || !mentorship.id) {
            console.warn('Skipping mentorship due to missing mentee data or mentorship ID:', mentorship);
            return;
        }
        const mentee = mentorship.mentee;
        const option = document.createElement('option');
        option.value = mentorship.id; // Use mentorship ID as value
        const displayName = `${mentee.first_name || ''} ${mentee.last_name || ''}`.trim() || `Mentee (ID: ${mentee.id || 'N/A'})`;
        const jobTitle = mentee.job_title || mentee.expertise || '';
        option.textContent = `${displayName}${jobTitle ? ` - ${jobTitle}` : ''}`;
        // Storing full mentee and mentorship data might be excessive; only store what's needed for submission.
        // For this form, only mentorship_id (option.value) is needed for the API call.
        mentorshipSelect.appendChild(option);
    });
}

// Session Creation
async function handleSessionCreation(e) {
    e.preventDefault();
    
    const mentorshipId = mentorshipSelect.value; // This is now the mentorship_id
    
    if (!mentorshipId) {
        showNotification('Please select a mentee.', 'error');
        return;
    }

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const scheduledAt = document.getElementById('scheduled_at').value;
    const durationMinutesInput = document.getElementById('duration_minutes').value;
    const sessionType = document.getElementById('session_type').value;
    let joinUrl = document.getElementById('join_url').value;

    if (!title || !scheduledAt || !durationMinutesInput || !sessionType) {
        showNotification('Please fill in title, schedule, duration, and session type.', 'error');
        return;
    }
    if (sessionType !== 'In Person' && !joinUrl) {
        showNotification('Please provide a join URL for remote sessions.', 'error');
        return;
    }
     if (sessionType === 'In Person') {
        joinUrl = null; // Ensure join_url is null for In Person sessions
    }


    const durationMinutes = parseInt(durationMinutesInput);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
        showNotification('Please enter a valid positive number for duration.', 'error');
        return;
    }

    const sessionData = {
        title: title,
        description: description,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: durationMinutes,
        session_type: sessionType,
        join_url: joinUrl || null // API might expect null if empty
    };
    
    const token = localStorage.getItem('access_token');
    if (!token) {
        showNotification('Authentication error. Please log in again.', 'error');
        return;
    }

    try {
        const response = await fetch(`http://mentrifyapis.biruk.tech/api/mentorships/${mentorshipId}/sessions`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sessionData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
            console.error('Session creation error response:', errorData);
            let userMessage = errorData.message || `Failed to create session. Status: ${response.status}`;
            if (response.status === 422 && errorData.errors) { // Handle Laravel validation errors
                userMessage = Object.values(errorData.errors).flat().join(' ');
            }
            throw new Error(userMessage);
        }

        // const newSession = await response.json(); // If needed
        await response.json();
        showNotification('Session created successfully!', 'success');
        closeModal(); // Close the creation modal
        loadSessions(); // Refresh the sessions list
    } catch (error) {
        console.error('Error creating session:', error);
        showNotification(error.message || 'An unexpected error occurred while creating the session.', 'error');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // A more robust notification system should be used in a real app
    console.log(`Notification (${type}):`, message); // Log to console for now
    alert(`${type.toUpperCase()}: ${message}`); // Basic alert
}

// Session Type Change Handler for Create Session Form
const sessionTypeSelect = document.getElementById('session_type');
if (sessionTypeSelect) {
    sessionTypeSelect.addEventListener('change', function(e) {
    const joinUrlField = document.getElementById('join_url');
        if (!joinUrlField) return;
    if (e.target.value === 'In Person') {
        joinUrlField.disabled = true;
        joinUrlField.value = '';
    } else {
        joinUrlField.disabled = false;
    }
});
}


// Add session details modal (assuming HTML structure is already in place or managed elsewhere)
// This script creates it dynamically if needed.
let sessionDetailsModalElement = document.getElementById('sessionDetailsModal');
if (!sessionDetailsModalElement) {
    sessionDetailsModalElement = document.createElement('div');
    sessionDetailsModalElement.className = 'modal';
    sessionDetailsModalElement.id = 'sessionDetailsModal';
    sessionDetailsModalElement.innerHTML = `
    <div class="modal-content">
            <span class="close-modal" style="float:right; cursor:pointer; font-size:1.5em;">×</span>
        <div class="modal-body">
                <div class="session-details-content" style="padding-top: 20px;"></div>
        </div>
    </div>
`;
    document.body.appendChild(sessionDetailsModalElement);

    // Add basic styles for sessionDetailsModal if not already covered by global .modal styles
    const sessionDetailStyle = document.createElement('style');
    sessionDetailStyle.textContent = `
        #sessionDetailsModal .modal-content {
            position: relative; background-color: white; margin: 10% auto; padding: 2rem;
            width: 90%; max-width: 600px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        #sessionDetailsModal .session-details-content { display: flex; flex-direction: column; gap: 1rem; }
        #sessionDetailsModal .detail-section h3 { margin: 0 0 0.5rem 0; color: #333; font-size: 1.1rem; font-weight: 600; }
        #sessionDetailsModal .detail-section p, #sessionDetailsModal .detail-row { margin: 0; color: #666; font-size: 1rem; line-height: 1.5; }
        #sessionDetailsModal .detail-row { display: flex; align-items: center; gap: 0.75rem; }
        #sessionDetailsModal .detail-row i { color: #4a90e2; width: 20px; text-align: center; }
        #sessionDetailsModal .modal-actions { margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end; }
        /* Add more specific styles as needed, reusing .btn, .btn-primary, .btn-outline if defined globally */
    `;
    document.head.appendChild(sessionDetailStyle);
}


// General Modal Styles (apply to all modals with class="modal")
// This should be one of the first style blocks if it defines base .modal properties.
const globalModalStyles = document.createElement('style');
globalModalStyles.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6); /* Darker overlay */
        z-index: 1050; /* Bootstrap's modal z-index, ensure it's high enough */
        overflow-y: auto; /* Allow scrolling for long modals */
    }

    .modal-content { /* General styling for modal content boxes */
        position: relative;
        background-color: #fff;
        margin: 50px auto; /* Adjusted margin for better centering */
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 600px; /* Max width for larger screens */
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,.5);
        animation: fadeInModal 0.3s ease-out;
    }

    @keyframes fadeInModal {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .modal-header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .modal-header h2 { margin: 0; font-size: 1.25rem; }
    .close-modal { /* General close button style */
        background: transparent;
        border: 0;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        color: #000;
        text-shadow: 0 1px 0 #fff;
        opacity: .5;
        cursor: pointer;
    }
    .close-modal:hover { opacity: .75; }

    .modal-body { padding: 1.5rem; }
    .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #dee2e6;
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }
    /* Basic button styling (can be overridden by more specific .btn classes) */
    .btn {
        display: inline-block; font-weight: 400; color: #212529; text-align: center;
        vertical-align: middle; cursor: pointer; user-select: none; background-color: transparent;
        border: 1px solid transparent; padding: .375rem .75rem; font-size: 1rem;
        line-height: 1.5; border-radius: .25rem; transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    }
    .btn-primary { color: #fff; background-color: #007bff; border-color: #007bff; }
    .btn-primary:hover { background-color: #0056b3; border-color: #0056b3; }
    .btn-outline { color: #007bff; border-color: #007bff; }
    .btn-outline:hover { color: #fff; background-color: #007bff; border-color: #007bff; }
`;
// Prepend to head so other specific modal styles can override
if (document.head.firstChild) {
    document.head.insertBefore(globalModalStyles, document.head.firstChild);
} else {
    document.head.appendChild(globalModalStyles);
}


// Add session details modal functionality
window.showSessionDetails = function(session) {
    const modalElement = document.getElementById('sessionDetailsModal'); // Use the consistent variable name
    if (!modalElement) {
        console.error("sessionDetailsModal element not found in DOM.");
        return;
    }
    const content = modalElement.querySelector('.session-details-content');
    if (!content) {
        console.error(".session-details-content not found in sessionDetailsModal.");
        return;
    }

    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    
    const isMentorPage = window.location.pathname.includes('mentor_sessions');
    const otherUser = isMentorPage ? session.mentee : session.mentor;
    const otherUserName = otherUser 
        ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || (isMentorPage ? 'Mentee' : 'Mentor')
        : (isMentorPage ? 'Unknown Mentee' : 'Unknown Mentor');

    // Determine which notes to show (mentor's notes or mentee's notes)
    // Typically, on session details, you might show notes relevant to the current user or both if permissions allow.
    // For this example, let's assume we show mentor's notes if available, then mentee's.
    let notesToShow = "No notes available for this session.";
    if (session.notes_mentor) {
        notesToShow = `<strong>Mentor's Notes:</strong><p style="white-space: pre-wrap;">${session.notes_mentor}</p>`;
    } else if (session.notes_mentee && isMentorPage) { // Mentor might see mentee's notes
        notesToShow = `<strong>Mentee's Notes:</strong><p style="white-space: pre-wrap;">${session.notes_mentee}</p>`;
    }
    // Mentee usually doesn't see other mentee's notes unless it's their own.
    // If mentee can write notes, they would see their own `session.notes_mentee`.

    content.innerHTML = `
        <div class="detail-section">
            <h3>Session: ${session.title || 'Untitled Session'}</h3>
            <div class="detail-row">
                <i class="fas fa-user"></i>
                <span>With: ${otherUserName}</span>
            </div>
            <div class="detail-row">
                <i class="fas fa-calendar"></i>
                <span>${formatDate(startTime)}</span>
            </div>
            <div class="detail-row">
                <i class="fas fa-clock"></i>
                <span>${formatTime(startTime)} - ${formatTime(endTime)}</span>
            </div>
            <div class="detail-row">
                <i class="fas ${session.session_type === 'In Person' ? 'fa-users' : 'fa-video'}"></i>
                <span>${session.session_type || 'Not specified'}</span>
            </div>
        </div>
        ${session.description ? `
            <div class="detail-section">
                <h3>Description</h3>
                <p style="white-space: pre-wrap;">${session.description}</p>
            </div>
        ` : ''}
        <div class="detail-section">
            <h3>Status</h3>
            <div class="session-status status-${session.status?.toLowerCase() || 'unknown'}">${session.status || 'Unknown'}</div>
        </div>
        <div class="detail-section notes-section-details">
            <h3>Notes Overview</h3>
            <div>${notesToShow}</div>
        </div>
        <div class="modal-actions">
            ${session.status === 'upcoming' && window.rescheduleSession ? `
                <button class="btn btn-outline" onclick="event.stopPropagation(); window.rescheduleSession(${session.id})">
                    <i class="fas fa-edit"></i>Reschedule
                </button>
            ` : ''}
            ${session.status === 'upcoming' && session.session_type !== 'In Person' && session.join_url ? `
                <button class="btn btn-primary" onclick="event.stopPropagation(); joinSession('${session.join_url}')">
                    <i class="fas fa-video"></i>Join
                </button>
            ` : ''}
            <button class="btn btn-outline" onclick="event.stopPropagation(); window.viewNotes(${session.id})">
                <i class="fas fa-sticky-note"></i>View/Edit Notes
            </button>
        </div>
    `;

    modalElement.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const closeBtn = modalElement.querySelector('.close-modal');
    if (closeBtn) {
    closeBtn.onclick = function() {
            modalElement.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
    }
    // Click outside to close (ensure this doesn't conflict with other outside click handlers)
    // Storing the handler to remove it later if necessary, or use a more robust modal system.
    modalElement._outsideClickHandler = function(event) {
        if (event.target === modalElement) {
            modalElement.style.display = 'none';
            document.body.style.overflow = 'auto';
            window.removeEventListener('click', modalElement._outsideClickHandler); // Clean up
        }
    };
    window.addEventListener('click', modalElement._outsideClickHandler);
};


// Styles for the editable notes modal (`notesModal` and potentially `menteeNotesModal` if it were editable)
// This is appended later, so its .modal z-index might take precedence if not careful.
// However, the globalModalStyles now sets a high z-index.
const notesSpecificModalStyle = document.createElement('style');
notesSpecificModalStyle.textContent = `
    /* #notesModal specific styles if different from general .modal-content */
    #notesModal .modal-content, #menteeNotesModal .modal-content { /* Apply to both notes modals */
        /* max-width: 700px; */ /* Example: notes modals can be wider */
    }
    #notesModal textarea, #menteeNotesModal textarea { /* If mentee modal had textarea */
        width: 100%;
        padding: 1rem;
        border: 1px solid #ced4da; /* Bootstrap-like border */
        border-radius: .25rem;
        font-size: 1rem;
        resize: vertical;
        min-height: 150px;
        font-family: inherit;
    }
    #notesModal .form-group label, #menteeNotesModal .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #495057; /* Bootstrap-like label color */
        font-weight: 500;
    }
    /* Styling for notes-content in mentee modal is already in viewNotes */
`;
document.head.appendChild(notesSpecificModalStyle);


// Add function to fetch session notes
async function fetchSessionNotes(sessionId) {
    console.log('Fetching notes for session:', sessionId);
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('Authentication required. Please log in.');
    }

    const response = await fetch(`http://mentrifyapis.biruk.tech/api/sessions/${sessionId}`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error from server." }));
        console.error('Error fetching session notes, response:', errorData);
        throw new Error(errorData.message || `Failed to fetch session details (Status: ${response.status})`);
    }
    const data = await response.json();
    // console.log('Fetched session data for notes:', data); // Keep for debugging
    return data; // Assuming API returns the full session object including notes_mentor, notes_mentee
}

// Add function to save session notes
async function saveSessionNotes(sessionId, notes, isMentorPage) {
    const token = localStorage.getItem('access_token');
    if (!token) {
        showNotification('Authentication error. Please log in to save notes.', 'error');
        return; // Or throw error
    }

    // Determine which note field to update based on context
    // This example assumes mentor edits notes_mentor, mentee would edit notes_mentee
    const notesData = isMentorPage 
        ? { notes_mentor: notes }
        : { notes_mentee: notes }; // If mentees could edit their own notes

    console.log('Saving notes for session', sessionId, ':', notesData);

    try {
        const response = await fetch(`http://mentrifyapis.biruk.tech/api/sessions/${sessionId}/notes`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(notesData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error from server.' }));
            console.error('Error saving notes, response:', errorData);
            let userMessage = errorData.message || `Failed to save notes. Status: ${response.status}`;
            if (response.status === 422 && errorData.errors) {
                userMessage = Object.values(errorData.errors).flat().join(' ');
            }
            throw new Error(userMessage);
        }

        const updatedSession = await response.json();
        console.log('Notes saved successfully, updated session:', updatedSession);
        
        showNotification('Notes saved successfully!', 'success');
        
        // Update the session details modal if it's open and showing this session
        // Pass the full updated session object.
        updateSessionDetailsNotes(updatedSession);

        // Close the specific notes editing/viewing modal (e.g., notesModal for mentor)
        if (isMentorPage) {
            closeNotesModal();
        } else {
            // closeMenteeNotesModal(); // If mentee notes modal was for editing
            // Since mentee notes modal is view-only, it might not need this specific logic here
            // but if it were for editing, it would be closed.
            // For now, this function is primarily called by mentor's save.
        }
        // Reload sessions to reflect changes in the main list, especially if notes summaries are shown there
        loadSessions();


    } catch (error) {
        console.error('Error saving notes:', error);
        showNotification(error.message || 'An unexpected error occurred while saving notes.', 'error');
    }
}

// Update notes in the sessionDetailsModal if it's open
function updateSessionDetailsNotes(updatedSession) {
    const modal = document.getElementById('sessionDetailsModal');
    // Check if modal is currently displayed and if the session ID matches
    // This requires sessionDetailsModal to store which session.id it is showing, or re-render.
    // For simplicity, if it's open, we'll re-render its content if it MIGHT be the same session.
    // A more robust way is to check if modal.dataset.sessionId === updatedSession.id
    if (modal && modal.style.display === 'block') {
        // This is a simplified update. For a robust solution, you'd check if
        // the sessionDetailsModal is indeed showing the `updatedSession`.
        // If `showSessionDetails` stores the current session ID on the modal element, e.g., modal.dataset.sessionId,
        // you could check `if (modal.dataset.sessionId == updatedSession.id)`.
        // For now, we'll assume if it's open, it might need an update.
        // The best would be to re-call showSessionDetails if it's for the same session.
        // console.log("Attempting to update session details modal with new notes data.");

        // Locate the specific notes section within the session details modal
        const notesSection = modal.querySelector('.notes-section-details div'); // Assuming this structure from showSessionDetails
        if (notesSection) {
            let notesToShow = "No notes available for this session.";
            if (updatedSession.notes_mentor) {
                notesToShow = `<strong>Mentor's Notes:</strong><p style="white-space: pre-wrap;">${updatedSession.notes_mentor}</p>`;
            } else if (updatedSession.notes_mentee && window.location.pathname.includes('mentor_sessions')) {
                notesToShow = `<strong>Mentee's Notes:</strong><p style="white-space: pre-wrap;">${updatedSession.notes_mentee}</p>`;
            }
            notesSection.innerHTML = notesToShow;
        } else {
            // Fallback: if specific notes section not found, re-render the whole details modal.
            // This requires checking if the currently shown session matches updatedSession.id.
            // For now, we log a warning. A full re-render would be showSessionDetails(updatedSession).
            console.warn("Notes section in sessionDetailsModal not found for update. Full refresh might be needed.");
        }
    }
}


// REMOVED: The redundant and faulty DOMContentLoaded event listener for notes buttons.
// Inline onclick handlers on the buttons are sufficient.
/*
document.addEventListener('DOMContentLoaded', () => {
    // Add click event listeners for the notes buttons (REMOVED)
});
*/
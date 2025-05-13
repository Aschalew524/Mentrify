import { getPendingMentorRequests, cancelMentorship } from '../mentorship.js';

const DEFAULT_AVATAR_URL = '../../assets/images/default-avatar.png';

export async function loadRequests() {
    const requestsGrid = document.getElementById('requestsGrid');
    if (!requestsGrid) {
        console.error("Element with ID 'requestsGrid' not found.");
        return;
    }
    requestsGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Loading requests...</p>';

    try {
        const requests = await getPendingMentorRequests();
        if (!requests || requests.length === 0) {
            requestsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-inbox"></i>
                    <h3>No Pending Requests</h3>
                    <p>You don't have any pending mentorship requests at the moment.</p>
                </div>
            `;
            return;
        }
        requestsGrid.innerHTML = requests.map(request => {
            const status = String(request.status).toLowerCase();
            const isPending = status === 'pending';
            return `
                <div class="request-card" data-request-id="${request.id}">
                    <div class="request-header">
                        <img src="${request.mentor.photo_url || DEFAULT_AVATAR_URL}" 
                             alt="${request.mentor.first_name} ${request.mentor.last_name}" 
                             class="mentor-avatar"
                             onerror="this.src='${DEFAULT_AVATAR_URL}'">
                        <div class="mentor-info">
                            <h3>${request.mentor.first_name} ${request.mentor.last_name}</h3>
                            <p>${request.mentor.job_title || 'Mentor'}</p>
                        </div>
                    </div>
                    <div class="request-actions">
                        <div class="request-status status-${status}">
                            <i class="fas ${getStatusIcon(request.status)}"></i>
                            ${request.status}
                        </div>
                        ${isPending ? `
                            <div class="action-buttons">
                                <button class="btn btn-danger cancel-btn" data-request-id="${request.id}">
                                    <i class="fas fa-times"></i>
                                    Cancel Request
                                </button>
                                <button class="btn btn-danger delete-btn" data-request-id="${request.id}">
                                    <i class="fas fa-trash"></i>
                                    Delete
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const requestId = this.dataset.requestId;
                if (confirm('Are you sure you want to cancel this mentorship request?')) {
                    try {
                        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Canceling...';
                        this.disabled = true;
                        
                        await cancelMentorship(requestId);
                        const cardToRemove = document.querySelector(`.request-card[data-request-id="${requestId}"]`);
                        if (cardToRemove) cardToRemove.remove();
                        
                        if (requestsGrid.querySelectorAll('.request-card').length === 0) {
                            requestsGrid.innerHTML = `
                                <div class="empty-state" style="grid-column: 1 / -1;">
                                    <i class="fas fa-inbox"></i>
                                    <h3>No Pending Requests</h3>
                                    <p>You don't have any pending mentorship requests at the moment.</p>
                                </div>
                            `;
                        }
                    } catch (error) {
                        console.error('Error canceling request:', error);
                        alert('Failed to cancel request. Please try again.');
                        this.innerHTML = '<i class="fas fa-times"></i> Cancel Request';
                        this.disabled = false;
                    }
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const requestId = this.dataset.requestId;
                if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
                    try {
                        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
                        this.disabled = true;
                        
                        await cancelMentorship(requestId);
                        const cardToRemove = document.querySelector(`.request-card[data-request-id="${requestId}"]`);
                        if (cardToRemove) cardToRemove.remove();
                        
                        if (requestsGrid.querySelectorAll('.request-card').length === 0) {
                            requestsGrid.innerHTML = `
                                <div class="empty-state" style="grid-column: 1 / -1;">
                                    <i class="fas fa-inbox"></i>
                                    <h3>No Pending Requests</h3>
                                    <p>You don't have any pending mentorship requests at the moment.</p>
                                </div>
                            `;
                        }
                    } catch (error) {
                        console.error('Error deleting request:', error);
                        alert('Failed to delete request. Please try again.');
                        this.innerHTML = '<i class="fas fa-trash"></i> Delete';
                        this.disabled = false;
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error loading requests:', error);
        let errorMessage = 'Failed to load mentorship requests.';
        if (error.message) {
            if (error.message.includes('401')) {
                errorMessage = 'Your session has expired. Please log in again.';
            } else if (error.message.includes('403')) {
                errorMessage = 'You do not have permission to view these requests.';
            } else {
                errorMessage = `Error: ${error.message}`;
            }
        }
        requestsGrid.innerHTML = `
            <div class="empty-state error-state" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Requests</h3>
                <p>${errorMessage}</p>
                <p style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-light);">
                    Please check your internet connection and try again. If the problem persists, contact support.
                </p>
            </div>
        `;
    }
}

function getStatusIcon(status) {
    const lowerStatus = (status === null || status === undefined) ? "" : String(status).toLowerCase().trim();
    switch (lowerStatus) {
        case 'pending':
            return 'fa-clock';
        case 'accepted':
            return 'fa-check-circle';
        case 'rejected':
            return 'fa-times-circle';
        default:
            return 'fa-question-circle';
    }
}

export { getStatusIcon };

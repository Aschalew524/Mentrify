import { getPendingMenteeRequests, acceptMentorship, rejectMentorship, cancelMentorship } from '../mentorship.js';

const DEFAULT_AVATAR_URL = '../../assets/images/default-avatar.png';

// Add styles for the request card
const style = document.createElement('style');
style.textContent = `
    .request-card {
        background: var(--white);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        padding: 1.25rem;
        margin-bottom: 1.25rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        border: 1px solid rgba(40, 167, 69, 0.2);
        position: relative;
        overflow: hidden;
    }

    .request-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--success);
    }

    .request-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
    }

    .request-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .mentee-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;
    }

    .mentee-avatar:hover {
        transform: scale(1.05);
    }

    .mentee-info h3 {
        margin: 0;
        color: var(--text);
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .mentee-info p {
        margin: 0.25rem 0;
        color: var(--secondary);
        font-size: 0.9rem;
    }

    .mentee-stats {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.5rem;
        font-size: 0.85rem;
        color: var(--secondary);
    }

    .mentee-stats span {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background: rgba(0, 0, 0, 0.03);
        padding: 0.3rem 0.6rem;
        border-radius: 15px;
        transition: background-color 0.2s ease;
    }

    .mentee-stats span:hover {
        background: rgba(0, 0, 0, 0.06);
    }

    .mentee-stats i {
        color: var(--primary);
        font-size: 0.85rem;
    }

    .mentee-expertise {
        margin: 0.75rem 0;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 8px;
        transition: background-color 0.2s ease;
    }

    .mentee-expertise:hover {
        background: rgba(0, 0, 0, 0.04);
    }

    .mentee-expertise h4 {
        margin: 0 0 0.75rem 0;
        color: var(--text);
        font-size: 0.95rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .mentee-expertise h4 i {
        color: var(--primary);
    }

    .expertise-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }

    .expertise-tag {
        background: var(--white);
        color: var(--secondary);
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.8rem;
        border: 1px solid rgba(0, 0, 0, 0.08);
        transition: all 0.2s ease;
    }

    .expertise-tag:hover {
        background: var(--primary);
        color: var(--white);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .request-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    .request-status {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.85rem;
        padding: 0.4rem 0.8rem;
        border-radius: 15px;
        background: rgba(0, 0, 0, 0.03);
    }

    .status-pending {
        color: var(--warning);
        background: rgba(255, 193, 7, 0.1);
    }

    .status-accepted {
        color: var(--success);
        background: rgba(40, 167, 69, 0.1);
    }

    .status-rejected {
        color: var(--danger);
        background: rgba(220, 53, 69, 0.1);
    }

    .action-buttons {
        display: flex;
        gap: 0.5rem;
        opacity: 1;
        visibility: visible;
        transition: opacity 0.2s ease;
    }

    .btn {
        padding: 0.5rem 1rem;
        border-radius: 15px;
        border: none;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        transition: all 0.2s ease;
        opacity: 1;
        visibility: visible;
        background: transparent;
    }

    .btn-success {
        color: var(--success);
    }

    .btn-success:hover {
        color: #28a745;
        transform: translateY(-1px);
    }

    .btn-danger {
        color: var(--danger);
    }

    .btn-danger:hover {
        color: #dc3545;
        transform: translateY(-1px);
    }

    .btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }

    .empty-state {
        text-align: center;
        padding: 2rem 1rem;
        background: var(--white);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .empty-state i {
        font-size: 2.5rem;
        color: var(--primary);
        margin-bottom: 0.75rem;
    }

    .empty-state h3 {
        color: var(--text);
        margin-bottom: 0.5rem;
    }

    .empty-state p {
        color: var(--secondary);
        margin-bottom: 0;
    }

    .error-state i {
        color: var(--danger);
    }
`;
document.head.appendChild(style);

async function fetchUserProfile(userId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`https://mentrifyapis.biruk.tech/api/mentee/details/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch mentee profile:', errorText);
        throw new Error(errorText || 'Failed to fetch user profile');
    }
    const profile = await response.json();
    console.log('Fetched mentee profile:', profile);
    return profile;
}

export async function loadRequests() {
    const requestsGrid = document.getElementById('requestsGrid');
    if (!requestsGrid) {
        console.error("Element with ID 'requestsGrid' not found.");
        return;
    }
    requestsGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Loading requests...</p>';

    try {
        // Check if we have a valid access token
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('No access token found');
            requestsGrid.innerHTML = `
                <div class="empty-state error-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Authentication Error</h3>
                    <p>Please log in to view mentorship requests.</p>
                </div>
            `;
            return;
        }

        console.log('Fetching pending mentee requests...');
        const response = await getPendingMenteeRequests();
        console.log('Received response:', response);

        // Handle both array and object responses
        const requests = Array.isArray(response) ? response : (response.data || []);
        console.log('Processed requests:', requests);

        if (!requests || requests.length === 0) {
            console.log('No requests found');
            requestsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-inbox"></i>
                    <h3>No Pending Requests</h3>
                    <p>You don't have any pending mentorship requests at the moment.</p>
                </div>
            `;
            return;
        }

        requestsGrid.innerHTML = '';
        for (const request of requests) {
            console.log('Processing request:', request);
            const status = String(request.status).toLowerCase();
            const isPending = status === 'pending';
            
            // Get mentee information directly from the request
            const mentee = request.mentee;
            if (!mentee) {
                console.error('No mentee information found in request:', request);
                continue;
            }

            const displayName = `${mentee.first_name || ''} ${mentee.last_name || ''}`.trim() || `User #${mentee.id}`;
            
            // Handle interests and goals data
            let interests = [];
            if (mentee.interests) {
                if (Array.isArray(mentee.interests)) {
                    interests = mentee.interests;
                } else if (typeof mentee.interests === 'string') {
                    interests = mentee.interests.split(',').map(interest => interest.trim()).filter(interest => interest);
            }
            }

            let goals = [];
            if (mentee.goals) {
                if (Array.isArray(mentee.goals)) {
                    goals = mentee.goals;
                } else if (typeof mentee.goals === 'string') {
                    goals = mentee.goals.split(',').map(goal => goal.trim()).filter(goal => goal);
                }
            }
            
            const yearsExp = mentee.years_of_experience || 0;
            
            console.log('Creating request card for:', displayName);
            requestsGrid.innerHTML += `
                <div class="request-card" data-request-id="${request.id}" data-mentee-id="${mentee.id}">
                    <div class="request-header">
                        <img src="${mentee.photo_url || DEFAULT_AVATAR_URL}" 
                             alt="${displayName}" 
                             class="mentee-avatar"
                             onerror="this.src='${DEFAULT_AVATAR_URL}'">
                        <div class="mentee-info">
                            <h3>${displayName}</h3>
                            <p>${mentee.job_title || 'Mentee'} ${mentee.company ? `at ${mentee.company}` : ''}</p>
                            <div class="mentee-stats">
                                <span><i class="fas fa-briefcase"></i> ${yearsExp} years experience</span>
                                ${mentee.location ? `<span><i class="fas fa-map-marker-alt"></i> ${mentee.location}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="mentee-expertise">
                        <h4><i class="fas fa-heart"></i> Interests</h4>
                        <div class="expertise-tags">
                            ${interests.length > 0 
                                ? interests.map(interest => `<span class="expertise-tag">${interest}</span>`).join('')
                                : '<span class="expertise-tag">No interests listed</span>'}
                        </div>
                    </div>
                    <div class="mentee-expertise">
                        <h4><i class="fas fa-bullseye"></i> Goals</h4>
                        <div class="expertise-tags">
                            ${goals.length > 0 
                                ? goals.map(goal => `<span class="expertise-tag">${goal}</span>`).join('')
                                : '<span class="expertise-tag">No goals listed</span>'}
                        </div>
                    </div>
                    <div class="request-actions">
                        <div class="request-status status-${status}">
                            <i class="fas ${getStatusIcon(request.status)}"></i>
                            ${request.status}
                        </div>
                        ${isPending ? `
                            <div class="action-buttons">
                                <button class="btn btn-success accept-btn" data-request-id="${request.id}" data-mentee-id="${mentee.id}">
                                <i class="fas fa-check"></i>
                                Accept
                            </button>
                                <button class="btn btn-danger reject-btn" data-request-id="${request.id}" data-mentee-id="${mentee.id}">
                                <i class="fas fa-times"></i>
                                Reject
                            </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // Add event listeners for accept/reject buttons
        document.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const requestId = this.dataset.requestId;
                const menteeId = this.dataset.menteeId;
                if (confirm('Are you sure you want to accept this mentorship request?')) {
                    try {
                        // Show loading state
                        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Accepting...';
                        this.disabled = true;
                        
                        await acceptMentorship(requestId);
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
                        console.error('Error accepting request:', error);
                        alert('Failed to accept request. Please try again.');
                        // Reset button state
                        this.innerHTML = '<i class="fas fa-check"></i> Accept';
                        this.disabled = false;
                    }
                }
            });
        });

        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const requestId = this.dataset.requestId;
                const menteeId = this.dataset.menteeId;
                if (confirm('Are you sure you want to reject this mentorship request?')) {
                    try {
                        // Show loading state
                        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rejecting...';
                        this.disabled = true;
                        
                        await rejectMentorship(requestId);
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
                        console.error('Error rejecting request:', error);
                        alert('Failed to reject request. Please try again.');
                        // Reset button state
                        this.innerHTML = '<i class="fas fa-times"></i> Reject';
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

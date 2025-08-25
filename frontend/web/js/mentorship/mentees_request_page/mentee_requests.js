import { getPendingMentorRequests, cancelMentorship, getActiveMentors, getActiveMentees } from '../mentorship.js';

const DEFAULT_AVATAR_URL = '../../assets/images/default-avatar.png';

// Add styles for the request card (same as mentor requests)
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

    .mentor-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;
        display: block;
        flex-shrink: 0;
        aspect-ratio: 1;
        background-color: #f8f9fa;
    }

    .mentor-avatar:hover {
        transform: scale(1.05);
    }

    .mentor-info h3 {
        margin: 0;
        color: var(--text);
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .mentor-info p {
        margin: 0.25rem 0;
        color: var(--secondary);
        font-size: 0.9rem;
    }

    .request-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    .request-status-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        width: 100%;
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

    .cancel-btn {
        color: #dc3545; /* Explicit red color */
        background: transparent;
        border: 1px solid #dc3545;
        padding: 0.5rem 1rem;
        border-radius: 15px;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        transition: all 0.2s ease;
        margin-left: auto;
    }

    .cancel-btn:hover {
        background: #dc3545;
        color: white;
    }

    .cancel-btn:disabled {
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

    .mentor-stats {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.5rem;
        font-size: 0.85rem;
        color: var(--secondary);
        flex-wrap: wrap;
    }

    .mentor-stats span {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background: rgba(0, 0, 0, 0.03);
        padding: 0.3rem 0.6rem;
        border-radius: 15px;
        transition: background-color 0.2s ease;
    }

    .mentor-stats span:hover {
        background: rgba(0, 0, 0, 0.06);
    }

    .mentor-stats i {
        color: var(--primary);
        font-size: 0.85rem;
    }

    .mentor-bio {
        margin: 0.75rem 0;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 8px;
        transition: background-color 0.2s ease;
    }

    .mentor-bio:hover {
        background: rgba(0, 0, 0, 0.04);
    }

    .mentor-bio h4 {
        margin: 0 0 0.5rem 0;
        color: var(--text);
        font-size: 0.95rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .mentor-bio h4 i {
        color: var(--primary);
    }

    .mentor-bio p {
        margin: 0;
        color: var(--secondary);
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .mentor-expertise {
        margin: 0.75rem 0;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 8px;
        transition: background-color 0.2s ease;
    }

    .mentor-expertise:hover {
        background: rgba(0, 0, 0, 0.04);
    }

    .mentor-expertise h4 {
        margin: 0 0 0.75rem 0;
        color: var(--text);
        font-size: 0.95rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .mentor-expertise h4 i {
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
`;
document.head.appendChild(style);

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
            
            // Handle mentor skills
            let skills = [];
            if (request.mentor.skills) {
                if (Array.isArray(request.mentor.skills)) {
                    skills = request.mentor.skills;
                } else if (typeof request.mentor.skills === 'string') {
                    skills = request.mentor.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
                }
            }
            
            return `
                <div class="request-card" data-request-id="${request.id}">
                    <div class="request-header">
                        <img src="${request.mentor.photo_url || DEFAULT_AVATAR_URL}" 
                             alt="${request.mentor.first_name} ${request.mentor.last_name}" 
                             class="mentor-avatar"
                             onerror="this.src='${DEFAULT_AVATAR_URL}'">
                        <div class="mentor-info">
                            <h3>${request.mentor.first_name} ${request.mentor.last_name}</h3>
                            <p>${request.mentor.job_title || 'Mentor'} ${request.mentor.company ? `at ${request.mentor.company}` : ''}</p>
                            <div class="mentor-stats">
                                <span><i class="fas fa-briefcase"></i> ${request.mentor.years_of_experience || 0}+ years experience</span>
                                ${request.mentor.location ? `<span><i class="fas fa-map-marker-alt"></i> ${request.mentor.location}</span>` : ''}
                                ${request.mentor.availability_hours_week ? `<span><i class="fas fa-clock"></i> ${request.mentor.availability_hours_week}h/week</span>` : ''}
                            </div>
                        </div>
                    </div>
                    ${request.mentor.bio ? `
                        <div class="mentor-bio">
                            <h4><i class="fas fa-user"></i> About</h4>
                            <p>${request.mentor.bio}</p>
                        </div>
                    ` : ''}
                    <div class="mentor-expertise">
                        <h4><i class="fas fa-star"></i> Skills & Expertise</h4>
                        <div class="expertise-tags">
                            ${skills.length > 0 
                                ? skills.map(skill => `<span class="expertise-tag">${skill}</span>`).join('')
                                : '<span class="expertise-tag">No skills listed</span>'}
                        </div>
                    </div>
                    <div class="request-actions">
                        <div class="request-status-container">
                            <div class="request-status status-${status}">
                                <i class="fas ${getStatusIcon(request.status)}"></i>
                                <span class="status-text">${request.status}</span>
                            </div>
                            ${isPending ? `
                                <button class="cancel-btn" data-request-id="${request.id}">
                                    <i class="fas fa-times"></i>
                                    Cancel Request
                                </button>
                            ` : ''}
                        </div>
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
                        this.innerHTML = '<i class="fas fa-times"></i> Cancel';
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

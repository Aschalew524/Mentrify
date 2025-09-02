// Handle session actions
document.addEventListener('click', function(e) {
    if (e.target.matches('.session-actions .btn')) {
        const action = e.target.textContent.trim();
        const sessionCard = e.target.closest('.session-card');
        const menteeName = sessionCard.querySelector('h4')?.textContent;
        const sessionDate = sessionCard.querySelector('.session-date')?.textContent;

        if (action === 'Join Session') {
            // Handle join session
            console.log(`Joining session with ${menteeName} on ${sessionDate}`);
            // Add your join session logic here
        }
    }
});

// Handle profile dropdown
const profileTrigger = document.querySelector('.profile-trigger');
const dropdownMenu = document.querySelector('.dropdown-menu');

if (profileTrigger && dropdownMenu) {
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdownMenu.style.display = 'none';
    });

    // Prevent dropdown from closing when clicking inside it
    dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Handle logout
const logoutBtn = document.querySelector('.dropdown-item.text-danger');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Add your logout logic here
        console.log('Logging out...');
    });
}

// Handle Schedule Session button
const scheduleBtn = document.querySelector('.quick-actions .btn');
if (scheduleBtn) {
    scheduleBtn.addEventListener('click', function() {
        console.log('Opening session scheduler...');
        // Add your session scheduling logic here
    });
}

// Handle navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        this.classList.add('active');
    });
});

// Handle mobile menu (if needed in the future)
const handleMobileMenu = () => {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768) {
        // Add mobile menu logic here
        console.log('Mobile view active');
    }
};

// Initial check for mobile view
handleMobileMenu();
// Listen for window resize
window.addEventListener('resize', handleMobileMenu);

// Display user profile from stored data
function displayUserProfile() {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            window.location.href = '/pages/auth/login.html';
            return;
        }
        
        // Update welcome message
        const welcomeText = document.querySelector('.welcome-text');
        if (welcomeText) {
            welcomeText.textContent = `Welcome back, ${userData.first_name}!`;
        }

        // Update profile dropdown
        const profileName = document.querySelector('.profile-name');
        const profileAvatar = document.querySelector('.profile-avatar');
        
        if (profileName) {
            profileName.textContent = userData.first_name;
        }
        
        if (profileAvatar) {
            if (userData.photo_url && userData.photo_url.trim() !== '') {
                profileAvatar.src = userData.photo_url;
                profileAvatar.onerror = function() {
                    this.onerror = null;
                    this.src = '../../assets/images/default-avatar.jpg';
                };
            } else {
                profileAvatar.src = '../../assets/images/default-avatar.jpg';
            }
        }

        // Update additional profile information if needed
        const userType = userData.user_type;
        const jobTitle = userData.job_title;
        const company = userData.company;
        const location = userData.location;

        // You can add more profile information updates here as needed

    } catch (error) {
        console.error('Error displaying user profile:', error);
    }
}

// Load dashboard statistics from backend
async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('No access token found');
            return;
        }

        const response = await fetch('http://mentrifyapis.biruk.tech/api/mentor/dashboard', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const dashboardData = await response.json();
        
        // Update statistics on the page
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 3) {
            // Update Active Mentees
            const activeMenteesCard = statCards[0];
            const activeMenteesValue = activeMenteesCard.querySelector('.stat-value');
            if (activeMenteesValue) {
                activeMenteesValue.textContent = dashboardData.active_mentees_count || 0;
            }

            // Update Average Rating
            const averageRatingCard = statCards[1];
            const averageRatingValue = averageRatingCard.querySelector('.stat-value');
            if (averageRatingValue) {
                const rating = dashboardData.average_rating || 0;
                averageRatingValue.textContent = rating > 0 ? rating.toFixed(1) : '0.0';
            }

            // Update Hours Mentored
            const hoursMentoredCard = statCards[2];
            const hoursMentoredValue = hoursMentoredCard.querySelector('.stat-value');
            if (hoursMentoredValue) {
                hoursMentoredValue.textContent = dashboardData.hours_mentored || 0;
            }
        }

        // Update upcoming sessions
        updateUpcomingSessions(dashboardData.upcoming_sessions || []);
        
        // Update recent feedback
        updateRecentFeedback(dashboardData.recent_feedback || []);

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Update upcoming sessions
function updateUpcomingSessions(sessions) {
    const upcomingSessionsList = document.querySelector('.upcoming-sessions .session-list');
    if (!upcomingSessionsList) return;

    if (!sessions || sessions.length === 0) {
        upcomingSessionsList.innerHTML = `
            <div class="session-card" style="text-align: center; padding: 2rem;">
                <p>No upcoming sessions scheduled.</p>
                <button class="btn btn-primary" onclick="window.location.href='../sessions/mentor_sessions.html'">
                    View All Sessions
                </button>
            </div>
        `;
        return;
    }

    upcomingSessionsList.innerHTML = sessions.map(session => {
        const mentee = session.mentee;
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);
        const timeString = `${startTime.toLocaleDateString()} • ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        return `
            <div class="session-card">
                <div class="session-info">
                    <img src="${mentee?.photo_url || '../../assets/images/default-avatar.jpg'}" alt="Mentee" class="mentee-avatar"
                         onerror="this.onerror=null;this.src='../../assets/images/default-avatar.jpg'">
                    <div class="session-details">
                        <h4>${mentee?.first_name || ''} ${mentee?.last_name || ''}</h4>
                        <p class="session-date">${timeString}</p>
                        <p>${session.title || 'Mentorship Session'}</p>
                    </div>
                </div>
                <div class="session-actions">
                    <button class="btn btn-primary">Join Session</button>
                </div>
            </div>
        `;
    }).join('');
}

// Update recent feedback
function updateRecentFeedback(feedback) {
    const recentFeedbackList = document.querySelector('.recent-feedback .session-list');
    if (!recentFeedbackList) return;

    if (!feedback || feedback.length === 0) {
        recentFeedbackList.innerHTML = `
            <div class="session-card" style="text-align: center; padding: 2rem;">
                <p>No recent feedback yet.</p>
            </div>
        `;
        return;
    }

    recentFeedbackList.innerHTML = feedback.map(item => {
        const mentee = item.mentee;
        const rating = item.rating || 0;
        const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
        const feedbackDate = new Date(item.created_at);
        const timeAgo = getTimeAgo(feedbackDate);
        
        return `
            <div class="session-card">
                <div class="session-info">
                    <img src="${mentee?.photo_url || '../../assets/images/default-avatar.jpg'}" alt="Mentee" class="mentee-avatar"
                         onerror="this.onerror=null;this.src='../../assets/images/default-avatar.jpg'">
                    <div class="session-details">
                        <h4>${mentee?.first_name || ''} ${mentee?.last_name || ''}</h4>
                        <p>"${item.feedback_text || 'No feedback text provided.'}"</p>
                        <div class="rating">
                            <span class="stars">${stars}</span>
                            <span class="date">${timeAgo}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Helper function to calculate time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInHours === 0) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
        }
        return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
        return '1 day ago';
    } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    } else {
        const diffInWeeks = Math.floor(diffInDays / 7);
        return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
    }
}

// Call the functions when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayUserProfile();
    loadDashboardStats();
});

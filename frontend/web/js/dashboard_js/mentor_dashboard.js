// Handle session actions
document.querySelectorAll('.session-actions .btn').forEach(button => {
    button.addEventListener('click', function() {
        const action = this.textContent.trim();
        const sessionCard = this.closest('.session-card');
        const menteeName = sessionCard.querySelector('h4').textContent;
        const sessionDate = sessionCard.querySelector('.session-date').textContent;

        if (action === 'Join Session') {
            // Handle join session
            console.log(`Joining session with ${menteeName} on ${sessionDate}`);
            // Add your join session logic here
        }
    });
});

// Handle profile dropdown
const profileTrigger = document.querySelector('.profile-trigger');
const dropdownMenu = document.querySelector('.dropdown-menu');

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

// Handle logout
document.querySelector('.dropdown-item.text-danger').addEventListener('click', (e) => {
    e.preventDefault();
    // Add your logout logic here
    console.log('Logging out...');
});

// Handle Schedule Session button
document.querySelector('.quick-actions .btn').addEventListener('click', function() {
    console.log('Opening session scheduler...');
    // Add your session scheduling logic here
});

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
        
        if (profileAvatar && userData.photo_url) {
            profileAvatar.src = userData.photo_url;
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

// Helper: escape
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Stats for mentor
async function renderMentorStats() {
    const token = localStorage.getItem('access_token');
    const menteesEl = document.getElementById('stat-active-mentees');
    const ratingEl = document.getElementById('stat-average-rating');
    const hoursEl = document.getElementById('stat-hours-mentored');
    if (!menteesEl || !ratingEl || !hoursEl) return;
    if (!token) { menteesEl.textContent = ratingEl.textContent = hoursEl.textContent = '-'; return; }
    try {
        // Active mentees
        const menteesResp = await fetch('http://mentrifyapis.biruk.tech/api/mentorships/mentor/active', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (menteesResp.ok) {
            const mentees = await menteesResp.json();
            menteesEl.textContent = Array.isArray(mentees) ? mentees.length : (mentees?.length || mentees?.data?.length || 0);
        } else { menteesEl.textContent = '-'; }

        // Sessions for hours; rating left as '-' unless API available
        const sessionsResp = await fetch('http://mentrifyapis.biruk.tech/api/mentor/sessions', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (sessionsResp.ok) {
            const sessions = await sessionsResp.json();
            const list = Array.isArray(sessions) ? sessions : (sessions?.data || []);
            let totalMinutes = 0;
            list.forEach(s => {
                if (s.status === 'completed') {
                    let minutes = Number(s.duration_minutes);
                    if (!Number.isFinite(minutes) || minutes <= 0) {
                        const start = new Date(s.start_time);
                        const end = new Date(s.end_time);
                        if (isFinite(start) && isFinite(end) && end > start) {
                            minutes = (end - start) / 60000;
                        } else {
                            minutes = 0;
                        }
                    }
                    totalMinutes += Math.max(0, minutes);
                }
            });
            const hours = totalMinutes / 60;
            hoursEl.textContent = hours % 1 === 0 ? String(hours) : hours.toFixed(1);
        } else { hoursEl.textContent = '-'; }

        ratingEl.textContent = '-';
    } catch (e) {
        console.error('Failed to render mentor stats', e);
        menteesEl.textContent = ratingEl.textContent = hoursEl.textContent = '-';
    }
}

// Sessions and feedback lists
async function renderMentorLists() {
    const token = localStorage.getItem('access_token');
    const upcomingEl = document.getElementById('upcoming-sessions-list');
    const feedbackEl = document.getElementById('recent-feedback-list');
    if (!upcomingEl || !feedbackEl) return;
    if (!token) { upcomingEl.innerHTML = '<p>Please log in to view sessions.</p>'; feedbackEl.innerHTML = ''; return; }
    try {
        const resp = await fetch('http://mentrifyapis.biruk.tech/api/mentor/sessions', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (!resp.ok) throw new Error('Failed to fetch sessions');
        const data = await resp.json();
        const sessions = Array.isArray(data) ? data : (data?.data || []);
        const now = new Date();
        const categorized = sessions.reduce((acc, s) => {
            const start = new Date(s.start_time);
            const end = new Date(s.end_time);
            if (isFinite(end) && end < now) {
                acc.completed.push(s);
            } else {
                // Includes ongoing and future
                acc.upcoming.push(s);
            }
            return acc;
        }, { upcoming: [], completed: [] });
        // Sort lists: upcoming by soonest start, completed by most recent end
        categorized.upcoming.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        categorized.completed.sort((a, b) => new Date(b.end_time) - new Date(a.end_time));

        const renderSessions = (arr, isUpcoming) => {
            if (arr.length === 0) return '<p>No sessions found.</p>';
            return arr.slice(0, 5).map(s => {
                const other = s.mentorship?.mentee || {};
                const start = new Date(s.start_time);
                const end = new Date(s.end_time);
                const timeStr = isFinite(start) && isFinite(end)
                    ? `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                    : '';
                return `
                    <div class="session-card">
                        <div class="session-info">
                            <img src="${escapeHtml(other.photo_url) || '../../assets/images/default-avatar.jpg'}" alt="Mentee" class="mentee-avatar" onerror="this.src='../../assets/images/default-avatar.jpg'">
                            <div class="session-details">
                                <h4>${escapeHtml(other.first_name || '')} ${escapeHtml(other.last_name || '')}</h4>
                                <p class="session-date">${escapeHtml(timeStr)}</p>
                                <p>${escapeHtml(s.title || 'Session')}</p>
                            </div>
                        </div>
                        <div class="session-actions">
                            ${isUpcoming && s.session_type !== 'In Person' && s.join_url ? `<button class="btn btn-primary" onclick="window.open('${escapeHtml(s.join_url)}','_blank')">Join Session</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        };
        upcomingEl.innerHTML = renderSessions(categorized.upcoming, true);

        // Feedback: if API provides feedbacks elsewhere, wire it. For now, extract from completed sessions if available.
        const renderFeedback = categorized.completed.slice(0, 5).map(s => {
            const other = s.mentorship?.mentee || {};
            const dateStr = new Date(s.end_time).toLocaleDateString();
            const text = s.feedback_text || '';
            const stars = s.feedback_rating ? '★'.repeat(Math.round(s.feedback_rating)) : '';
            return `
                <div class="session-card">
                    <div class="session-info">
                        <img src="${escapeHtml(other.photo_url) || '../../assets/images/default-avatar.jpg'}" alt="Mentee" class="mentee-avatar" onerror="this.src='../../assets/images/default-avatar.jpg'">
                        <div class="session-details">
                            <h4>${escapeHtml(other.first_name || '')} ${escapeHtml(other.last_name || '')}</h4>
                            <p>${escapeHtml(text) || 'No feedback yet.'}</p>
                            <div class="rating">
                                <span class="stars">${stars}</span>
                                <span class="date">${escapeHtml(dateStr)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        feedbackEl.innerHTML = renderFeedback || '<p>No recent feedback.</p>';
    } catch (e) {
        console.error('Failed to render mentor lists', e);
        upcomingEl.innerHTML = '<p>Error loading sessions.</p>';
        feedbackEl.innerHTML = '';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayUserProfile();
    renderMentorStats();
    renderMentorLists();
});

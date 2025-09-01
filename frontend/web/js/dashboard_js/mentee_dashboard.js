document.querySelectorAll('.session-actions .btn').forEach(button => {
            button.addEventListener('click', function() {
                const action = this.textContent.trim();
                const sessionCard = this.closest('.session-card');
                const mentorName = sessionCard.querySelector('h4').textContent;
                const sessionDate = sessionCard.querySelector('.session-date').textContent;

                if (action === 'Join Session') {
                    // Handle join session
                    console.log(`Joining session with ${mentorName} on ${sessionDate}`);
                    // Add your join session logic here
                } else if (action === 'Give Feedback') {
                    // Handle feedback
                    console.log(`Opening feedback form for session with ${mentorName} on ${sessionDate}`);
                    // Add your feedback form logic here
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

        // Handle Find a Mentor button
        document.querySelector('.quick-actions .btn').addEventListener('click', function() {
            window.location.href = '../../pages/find_mentor/find_mentor.html';
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

        // Helper: safe text
        function escapeHtml(str) {
            if (str == null) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        // Fetch and render mentee dashboard stats
        async function renderMenteeStats() {
            const token = localStorage.getItem('access_token');
            const activeMentorsEl = document.getElementById('stat-active-mentors');
            const learningHoursEl = document.getElementById('stat-learning-hours');
            const tasksCompletedEl = document.getElementById('stat-tasks-completed');
            if (!activeMentorsEl || !learningHoursEl || !tasksCompletedEl) return;

            if (!token) {
                activeMentorsEl.textContent = '-';
                learningHoursEl.textContent = '-';
                tasksCompletedEl.textContent = '-';
                return;
            }

            try {
                // Active mentors
                const mentorsResp = await fetch('http://mentrifyapis.biruk.tech/api/mentorships/mentee/active', {
                    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                if (mentorsResp.ok) {
                    const mentors = await mentorsResp.json();
                    activeMentorsEl.textContent = Array.isArray(mentors) ? mentors.length : (mentors?.length || mentors?.data?.length || 0);
                } else {
                    activeMentorsEl.textContent = '-';
                }

                // Sessions for learning hours
                const sessionsResp = await fetch('http://mentrifyapis.biruk.tech/api/mentee/sessions', {
                    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                if (sessionsResp.ok) {
                    const sessions = await sessionsResp.json();
                    const list = Array.isArray(sessions) ? sessions : (sessions?.data || []);
                    let hours = 0;
                    list.forEach(s => {
                        if (s.status === 'completed') {
                            const minutes = Number(s.duration_minutes || 0);
                            hours += (isNaN(minutes) ? 0 : minutes) / 60;
                        }
                    });
                    learningHoursEl.textContent = Math.round(hours);
                } else {
                    learningHoursEl.textContent = '-';
                }

                // Tasks completed count
                try {
                    const tasksResp = await fetch('http://mentrifyapis.biruk.tech/api/mentee/tasks', {
                        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
                    });
                    if (tasksResp.ok) {
                        const tasksData = await tasksResp.json();
                        const tasks = Array.isArray(tasksData) ? tasksData : (tasksData?.data || []);
                        const completed = tasks.filter(t => t.status === 'completed').length;
                        tasksCompletedEl.textContent = completed;
                    } else {
                        tasksCompletedEl.textContent = '-';
                    }
                } catch (err) {
                    tasksCompletedEl.textContent = '-';
                }
            } catch (e) {
                console.error('Failed to render mentee stats', e);
                activeMentorsEl.textContent = '-';
                learningHoursEl.textContent = '-';
                tasksCompletedEl.textContent = '-';
            }
        }

        // Fetch and render mentee sessions (upcoming/past)
        async function renderMenteeSessions() {
            const token = localStorage.getItem('access_token');
            const upcomingEl = document.getElementById('upcoming-sessions-list');
            const pastEl = document.getElementById('past-sessions-list');
            if (!upcomingEl || !pastEl) return;
            if (!token) {
                upcomingEl.innerHTML = '<p>Please log in to view sessions.</p>';
                pastEl.innerHTML = '';
                return;
            }
            try {
                const resp = await fetch('http://mentrifyapis.biruk.tech/api/mentee/sessions', {
                    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                if (!resp.ok) throw new Error('Failed to fetch sessions');
                const data = await resp.json();
                const sessions = Array.isArray(data) ? data : (data?.data || []);
                const now = new Date();
                const categorized = sessions.reduce((acc, s) => {
                    const start = new Date(s.start_time);
                    const end = new Date(s.end_time);
                    if (isFinite(end) && end < now) {
                        acc.past.push(s);
                    } else {
                        // Includes ongoing and future
                        acc.upcoming.push(s);
                    }
                    return acc;
                }, { upcoming: [], past: [] });
                // Sort: upcoming by soonest start, past by most recent end
                categorized.upcoming.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
                categorized.past.sort((a, b) => new Date(b.end_time) - new Date(a.end_time));

                const renderList = (arr, isUpcoming) => {
                    if (arr.length === 0) {
                        return '<p>No sessions found.</p>';
                    }
                    return arr.slice(0, 5).map(s => {
                        const other = s.mentorship?.mentor || {};
                        const start = new Date(s.start_time);
                        const end = new Date(s.end_time);
                        const timeStr = isFinite(start) && isFinite(end)
                            ? `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                            : '';
                        return `
                            <div class="session-card">
                                <div class="session-info">
                                    <img src="${escapeHtml(other.photo_url) || '../../assets/images/default-avatar.jpg'}" alt="Mentor" class="mentor-avatar" onerror="this.src='../../assets/images/default-avatar.jpg'">
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

                upcomingEl.innerHTML = renderList(categorized.upcoming, true);
                pastEl.innerHTML = renderList(categorized.past, false);
            } catch (e) {
                console.error('Failed to render mentee sessions', e);
                upcomingEl.innerHTML = '<p>Error loading sessions.</p>';
                pastEl.innerHTML = '';
            }
        }

        // Initialize on DOM load
        document.addEventListener('DOMContentLoaded', () => {
            displayUserProfile();
            renderMenteeStats();
            renderMenteeSessions();
        });

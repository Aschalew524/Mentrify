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

                const response = await fetch('http://mentrifyapis.biruk.tech/api/mentee/dashboard', {
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
                    // Update Active Mentors
                    const activeMentorsCard = statCards[0];
                    const activeMentorsValue = activeMentorsCard.querySelector('.stat-value');
                    if (activeMentorsValue) {
                        activeMentorsValue.textContent = dashboardData.active_mentors_count || 0;
                    }

                    // Update Learning Hours
                    const learningHoursCard = statCards[1];
                    const learningHoursValue = learningHoursCard.querySelector('.stat-value');
                    if (learningHoursValue) {
                        learningHoursValue.textContent = dashboardData.learning_hours || 0;
                    }

                    // Update Goals Completed
                    const goalsCompletedCard = statCards[2];
                    const goalsCompletedValue = goalsCompletedCard.querySelector('.stat-value');
                    if (goalsCompletedValue) {
                        goalsCompletedValue.textContent = dashboardData.goals_completed_count || 0;
                    }
                }

                // Update upcoming sessions
                updateUpcomingSessions(dashboardData.upcoming_sessions || []);
                
                // Update past sessions
                updatePastSessions(dashboardData.past_sessions || []);

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
                        <button class="btn btn-primary" onclick="window.location.href='../sessions/mentee_sessions.html'">
                            Schedule a Session
                        </button>
                    </div>
                `;
                return;
            }

            upcomingSessionsList.innerHTML = sessions.map(session => {
                const mentor = session.mentor;
                const startTime = new Date(session.start_time);
                const endTime = new Date(session.end_time);
                const timeString = `${startTime.toLocaleDateString()} • ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                
                return `
                    <div class="session-card">
                        <div class="session-info">
                            <img src="${mentor?.photo_url || '../../assets/images/default-avatar.jpg'}" alt="Mentor" class="mentor-avatar"
                                 onerror="this.onerror=null;this.src='../../assets/images/default-avatar.jpg'">
                            <div class="session-details">
                                <h4>${mentor?.first_name || ''} ${mentor?.last_name || ''}</h4>
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

        // Update past sessions
        function updatePastSessions(sessions) {
            const pastSessionsList = document.querySelector('.past-sessions .session-list');
            if (!pastSessionsList) return;

            if (!sessions || sessions.length === 0) {
                pastSessionsList.innerHTML = `
                    <div class="session-card" style="text-align: center; padding: 2rem;">
                        <p>No past sessions yet.</p>
                    </div>
                `;
                return;
            }

            pastSessionsList.innerHTML = sessions.map(session => {
                const mentor = session.mentor;
                const startTime = new Date(session.start_time);
                const endTime = new Date(session.end_time);
                const timeString = `${startTime.toLocaleDateString()} • ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                
                return `
                    <div class="session-card">
                        <div class="session-info">
                            <img src="${mentor?.photo_url || '../../assets/images/default-avatar.jpg'}" alt="Mentor" class="mentor-avatar"
                                 onerror="this.onerror=null;this.src='../../assets/images/default-avatar.jpg'">
                            <div class="session-details">
                                <h4>${mentor?.first_name || ''} ${mentor?.last_name || ''}</h4>
                                <p class="session-date">${timeString}</p>
                                <p>${session.title || 'Mentorship Session'}</p>
                            </div>
                        </div>
                        <div class="session-actions">
                            <button class="btn btn-outline ${session.feedback_given ? 'disabled' : ''}" 
                                    ${session.feedback_given ? 'disabled' : ''}>
                                ${session.feedback_given ? 'Feedback Given' : 'Give Feedback'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Call the functions when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            displayUserProfile();
            loadDashboardStats();
        });

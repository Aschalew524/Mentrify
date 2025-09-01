// Display user profile from stored data
function displayUserProfile() {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            window.location.href = '/pages/auth/login.html';
            return;
        }

        // Update profile header
        const profileAvatar = document.querySelector('.profile-avatar');
        const profileName = document.querySelector('.profile-name');
        const profileTitle = document.querySelector('.profile-title');
        const profileBio = document.querySelector('.profile-bio');

        if (profileAvatar && userData.photo_url) {
            profileAvatar.src = userData.photo_url;
        }

        if (profileName) {
            profileName.textContent = `${userData.first_name} ${userData.last_name}`;
        }

        if (profileTitle) {
            const title = userData.job_title || '';
            const company = userData.company ? ` at ${userData.company}` : '';
            profileTitle.textContent = `${title}${company}`;
        }

        if (profileBio) {
            profileBio.textContent = userData.bio || 'No bio available';
        }

        // Update stats
        const statsContainer = document.querySelector('.profile-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${userData.years_of_experience || 0}</div>
                    <div class="stat-label">Years Experience</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${userData.interests ? userData.interests.split(',').length : 0}</div>
                    <div class="stat-label">Interests</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${userData.goals ? userData.goals.split(',').length : 0}</div>
                    <div class="stat-label">Goals</div>
                </div>
            `;
        }

        // Update personal information
        const infoGrid = document.querySelector('.info-grid');
        if (infoGrid) {
            infoGrid.innerHTML = `
                <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">${userData.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Location</span>
                    <span class="info-value">${userData.location || 'Not specified'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Interests</span>
                    <span class="info-value">${userData.interests || 'No interests listed'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Goals</span>
                    <span class="info-value">${userData.goals || 'No goals listed'}</span>
                </div>
            `;
        }

        // Update interests and goals as tags
        const interestsContainer = document.querySelector('.interests-container');
        if (interestsContainer && userData.interests) {
            const interests = userData.interests.split(',').map(interest => interest.trim());
            interestsContainer.innerHTML = interests
                .map(interest => `<span class="interest-tag">${interest}</span>`)
                .join('');
        }

        const goalsContainer = document.querySelector('.goals-container');
        if (goalsContainer && userData.goals) {
            const goals = userData.goals.split(',').map(goal => goal.trim());
            goalsContainer.innerHTML = goals
                .map(goal => `<span class="goal-tag">${goal}</span>`)
                .join('');
        }

    } catch (error) {
        console.error('Error displaying user profile:', error);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', displayUserProfile); 
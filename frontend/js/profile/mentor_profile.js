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

        // Add bio right after the title using API data
        if (profileBio) {
            // Use the bio from the API data
            profileBio.textContent = userData.bio || 'No bio available';
            // Ensure the bio is visible in the profile header
            profileBio.style.display = 'block';
            profileBio.style.marginBottom = '1.5rem';
            profileBio.style.color = 'var(--secondary)';
            profileBio.style.fontSize = '1rem';
            profileBio.style.lineHeight = '1.6';
        }

        // Update stats
        const statsContainer = document.querySelector('.profile-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${userData.years_of_experience || 0}+</div>
                    <div class="stat-label">Years Experience</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${userData.availability_hours_week || 0}</div>
                    <div class="stat-label">Hours/Week</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${userData.category || 'N/A'}</div>
                    <div class="stat-label">Category</div>
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
                    <span class="info-label">Bio</span>
                    <span class="info-value">${userData.bio || 'No bio available'}</span>
                </div>
            `;
        }

        // Update skills
        const skillsContainer = document.querySelector('.skills-container');
        if (skillsContainer && userData.skills) {
            const skills = userData.skills.split(',').map(skill => skill.trim());
            skillsContainer.innerHTML = skills
                .map(skill => `<span class="skill-tag">${skill}</span>`)
                .join('');
        }

    } catch (error) {
        console.error('Error displaying user profile:', error);
    }
}

// Function to open edit modal and populate form with current data
function openEditModal() {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) return;

    const modal = document.getElementById('editProfileModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Populate form fields with current data
    document.getElementById('edit-email').value = userData.email || '';
    document.getElementById('edit-location').value = userData.location || '';
    document.getElementById('edit-bio').value = userData.bio || '';
    document.getElementById('edit-skills').value = userData.skills || '';
}

// Function to close edit modal
function closeEditModal() {
    const modal = document.getElementById('editProfileModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Function to handle profile update
async function updateProfile(formData) {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('access_token');

        if (!token || !userData) {
            throw new Error('No authentication token or user data found');
        }

        const response = await fetch('http://mentrifyapis.biruk.tech/api/users/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        const updatedData = await response.json();
        
        // Update localStorage with new data
        const currentUserData = JSON.parse(localStorage.getItem('user'));
        const updatedUserData = { ...currentUserData, ...updatedData };
        localStorage.setItem('user', JSON.stringify(updatedUserData));

        // Refresh the profile display
        displayUserProfile();

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.style.position = 'fixed';
        successMessage.style.top = '20px';
        successMessage.style.right = '20px';
        successMessage.style.backgroundColor = 'var(--primary)';
        successMessage.style.color = 'white';
        successMessage.style.padding = '1rem 2rem';
        successMessage.style.borderRadius = 'var(--radius)';
        successMessage.style.boxShadow = 'var(--shadow)';
        successMessage.style.zIndex = '1000';
        successMessage.textContent = 'Profile updated successfully!';
        document.body.appendChild(successMessage);

        setTimeout(() => {
            successMessage.remove();
        }, 3000);

        closeEditModal();
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    }
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayUserProfile();

    // Add click event listener to edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openEditModal();
        });
    }

    // Add submit event listener to edit form
    const editForm = document.getElementById('editProfileForm');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                email: document.getElementById('edit-email').value,
                location: document.getElementById('edit-location').value,
                bio: document.getElementById('edit-bio').value,
                skills: document.getElementById('edit-skills').value
            };
            updateProfile(formData);
        });
    }

    // Add click event listener to close modal button
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditModal);
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('editProfileModal');
        if (e.target === modal) {
            closeEditModal();
        }
    });
}); 
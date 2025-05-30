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

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', displayUserProfile);

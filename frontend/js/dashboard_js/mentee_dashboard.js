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
            console.log('Opening mentor search...');
            // Add your mentor search logic here
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

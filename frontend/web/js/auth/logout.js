async function logout() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            window.location.href = '../../index.html';
            return;
        }

        const response = await fetch('http://mentrifyapis.biruk.tech/api/logout', {
            
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include' // Include cookies if any
        });

        const data = await response.json();
        console.log('Logout response:', data);

        if (response.ok) {
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userType');

            // Redirect to login page
            window.location.href = '../../index.html';
        } else {
            console.error('Logout failed:', data);
            // Even if the API call fails, we should still clear local storage and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            window.location.href = '../../index.html';
        }
    } catch (error) {
        console.error('Error during logout:', error);
        // Even if there's an error, we should still clear local storage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        window.location.href = '../../index.html';
    }
}

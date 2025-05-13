const BASE_URL = 'http://mentrifyapis.biruk.tech';

// Send mentorship request
export async function requestMentorship(mentorId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found. Please log in.');
    }

    console.log('Sending mentorship request to mentor:', mentorId);
    const response = await fetch(`http://mentrifyapis.biruk.tech/api/mentorships/request/${mentorId}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Failed to send mentorship request');
    }

    const data = await response.json();
    console.log('Request response:', data);
    return data;
}

// Cancel mentorship request
export async function cancelMentorship(requestId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${BASE_URL}/api/mentorships/${requestId}/cancel`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Cancel request failed:', errorText);
        throw new Error(errorText || 'Failed to cancel request');
    }
    return response.json();
}

// Accept mentorship request
export async function acceptMentorship(requestId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${BASE_URL}/accept/${requestId}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Failed to accept mentorship request');
    }
    return await response.json();
}

// Reject mentorship request
export async function rejectMentorship(requestId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${BASE_URL}/reject/${requestId}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Failed to reject mentorship request');
    }
    return await response.json();
}

// Get mentee's pending requests
export async function getPendingMentorRequests() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${BASE_URL}/api/mentorships/mentee/pending`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch mentee pending requests:', errorText);
        throw new Error(errorText || 'Failed to fetch mentee pending requests');
    }
    const data = await response.json();
    console.log('Received mentee pending requests:', data);
    return data;
}

// Get mentor's pending requests
export async function getPendingMenteeRequests() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found. Please log in.');
    }

    console.log('Fetching pending mentee requests...');
    const response = await fetch('http://mentrifyapis.biruk.tech/api/mentorships/mentor/pending', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Failed to fetch pending requests');
    }

    const data = await response.json();
    console.log('Received pending requests:', data);
    return data;
}

// Get mentee's active mentors
export async function getActiveMentors() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${BASE_URL}/api/mentorships/mentee/active`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch active mentors:', errorText);
        throw new Error(errorText || 'Failed to fetch active mentors');
    }
    const data = await response.json();
    console.log('Received active mentors:', data);
    return data;
}

// Get mentor's active mentees
export async function getActiveMentees() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${BASE_URL}/api/mentorships/mentor/active`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch active mentees:', errorText);
        throw new Error(errorText || 'Failed to fetch active mentees');
    }
    const data = await response.json();
    console.log('Received active mentees:', data);
    return data;
}

async function fetchUserProfile(userId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`http://mentrifyapis.biruk.tech/api/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    const profile = await response.json();
    console.log('Fetched mentee profile:', profile);
    return profile;
} 
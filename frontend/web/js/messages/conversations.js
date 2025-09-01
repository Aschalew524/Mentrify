// Integrate backend chat API for conversations and messages
// Get details of a specific conversation
export async function fetchConversationDetails(conversationId) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found. Please log in.');
    let response = await fetch(`${BASE_URL}/api/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        // Fallback to singular endpoint
        try {
            response = await fetch(`${BASE_URL}/api/conversation/${conversationId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (_) {}
    }
    if (!response.ok) throw new Error('Failed to fetch conversation details');
    return await response.json();
}

// Get messages for a specific conversation (with pagination)
export async function fetchConversationMessages(conversationId, page = 1, perPage = 50) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found. Please log in.');
    let response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages?page=${page}&per_page=${perPage}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        // Fallback to singular endpoint variant
        try {
            response = await fetch(`${BASE_URL}/api/conversation/${conversationId}/messages?page=${page}&per_page=${perPage}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (_) {}
    }
    if (!response.ok) throw new Error('Failed to fetch conversation messages');
    return await response.json();
}

// Send a message in a conversation
export async function sendMessage(conversationId, content, type = 'text') {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found. Please log in.');
    // First attempt with { content, type }
    let response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, type })
    });
    if (!response.ok) {
        // Try fallback with { content } only
        try {
            response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
        } catch (_) {}
    }
    if (!response.ok) {
        // Try alternative payload key { message }
        try {
            response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: content })
            });
        } catch (_) {}
    }
    if (!response || !response.ok) {
        // Try including conversation_id in payload
        try {
            response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content, conversation_id: conversationId })
            });
        } catch (_) {}
    }
    if (!response || !response.ok) {
        // Try singular endpoint path
        try {
            response = await fetch(`${BASE_URL}/api/conversation/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content, type })
            });
        } catch (_) {}
    }
    if (!response || !response.ok) {
        // Last-resort fallback: POST /api/messages
        try {
            response = await fetch(`${BASE_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ conversation_id: conversationId, content, type })
            });
        } catch (_) {}
    }
    if (!response || !response.ok) {
        let errorMessage = 'Failed to send message';
        try {
            const errJson = await response.json();
            errorMessage = errJson?.message || errorMessage;
        } catch (_) {
            try {
                const errText = await response.text();
                if (errText) errorMessage = errText;m
            } catch (_) {}
        }
        throw new Error(errorMessage);
    }
    return await response.json();
}

// Mark a specific message as read
export async function markMessageAsRead(messageId) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found. Please log in.');
    const response = await fetch(`${BASE_URL}/api/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to mark message as read');
    return await response.json();
}

// Mark all messages in a conversation as read
export async function markConversationAsRead(conversationId) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found. Please log in.');
    const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/read`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to mark conversation as read');
    return await response.json();
}
const BASE_URL = 'http://mentrifyapis.biruk.tech';

export async function fetchConversations() {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found. Please log in.');
    let response = await fetch(`${BASE_URL}/api/conversations`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        // Fallback to singular endpoint path
        try {
            response = await fetch(`${BASE_URL}/api/conversation`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (_) {}
    }
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return await response.json();
}

export async function createConversation(mentorshipId, title) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found. Please log in.');
    let response = await fetch(`${BASE_URL}/api/conversations`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mentorship_id: mentorshipId, title })
    });
    if (!response.ok && (response.status === 404 || response.status === 405)) {
        // Fallback to singular path
        try {
            response = await fetch(`${BASE_URL}/api/conversation`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mentorship_id: mentorshipId, title })
            });
        } catch (_) {}
    }
    if (!response.ok) {
        let errorMessage = `Failed to create conversation (HTTP ${response.status})`;
        try {
            const errJson = await response.json();
            errorMessage = errJson?.message || errorMessage;
        } catch (_) {
            try {
                const errText = await response.text();
                if (errText) errorMessage = errText;
            } catch (_) {}
        }
        throw new Error(errorMessage);
    }
    return await response.json();
}

// Find an existing conversation for a mentorship or create one, returning the conversation object
export async function getOrCreateConversation(mentorshipId, title = "Mentorship Chat") {
    // Prefer creating first to avoid list queries on backends without the table ready
    try {
        const created = await createConversation(mentorshipId, title);
        if (created && created.conversation) return created.conversation;
        if (created && created.id) return created;
    } catch (err) {
        const msg = String(err?.message || '').toLowerCase();
        // If backend indicates duplicate/existing conversation, try to find it
        if (msg.includes('already') || msg.includes('exists') || msg.includes('duplicate')) {
            try {
                const list = await fetchConversations();
                const existing = (list.conversations || []).find(c => String(c.mentorship_id) === String(mentorshipId));
                if (existing) return existing;
            } catch (_) {}
        }
        // If the DB table is missing, surface a clearer message
        if (msg.includes('sqlstate') || msg.includes('base table or view not found') || msg.includes('1146')) {
            throw new Error('Messaging is temporarily unavailable. Backend conversations table is missing. Please run migrations or contact support.');
        }
        throw err;
    }
    // If creation returned no conversation, try listing
    try {
        const list = await fetchConversations();
        const existing = (list.conversations || []).find(c => String(c.mentorship_id) === String(mentorshipId));
        if (existing) return existing;
    } catch (_) {}
    throw new Error('Conversation could not be created or found');
}

// Example usage:
// import { fetchConversations, createConversation } from '../messages/conversations.js';
// fetchConversations().then(data => console.log(data));
// createConversation(1, "Let's discuss your goals").then(data => console.log(data));

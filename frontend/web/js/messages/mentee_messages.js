import { fetchConversations } from './conversations.js';
import { fetchConversationDetails, fetchConversationMessages, sendMessage, markConversationAsRead } from './conversations.js';
import { getActiveMentors } from '../mentorship/mentorship.js';

// Fetch and render conversations for mentee
async function renderConversations() {
    try {
        const data = await fetchConversations();
        const conversations = data.conversations || [];
        const messagesList = document.querySelector('.messages-list');
        messagesList.innerHTML = '';
        conversations.forEach(conv => {
            const other = conv.other_participant || conv.mentor || conv.mentee;
            const lastMsg = conv.last_message || {};
            const unread = conv.unread_count || 0;
            const preview = document.createElement('div');
            preview.className = 'message-preview';
            preview.setAttribute('data-conversation-id', conv.id);
            preview.innerHTML = `
                <div class="message-preview-header">
                    <img src="${other.photo_url || '../../../assets/images/default-avatar.jpg'}" alt="${other.first_name}" class="message-avatar">
                    <div class="message-info">
                        <h3 class="message-name">${other.first_name} ${other.last_name}</h3>
                        <span class="message-time">${new Date(conv.last_message_at).toLocaleString()}</span>
                    </div>
                    ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}
                </div>
                <p class="message-content">${lastMsg.content || ''}</p>
            `;
            preview.addEventListener('click', () => renderChat(conv.id));
            messagesList.appendChild(preview);
        });
        // Get conversation id from URL
        const urlParams = new URLSearchParams(window.location.search);
        const conversationId = urlParams.get('conversation');
        if (conversationId) {
            renderChat(conversationId);
        } else if (conversations.length > 0) {
            renderChat(conversations[0].id);
        }
    } catch (err) {
        console.error(err);
    }

function renderChat(conversation) {
async function renderChat(conversationId) {
    try {
        let details, conversation, other;
        try {
            details = await fetchConversationDetails(conversationId);
            conversation = details.conversation;
            other = conversation?.other_participant || conversation?.mentor || conversation?.mentee;
        } catch (err) {
            document.querySelector('.chat-header').innerHTML = `<div class='empty-state'><i class='fas fa-user'></i><h3>Mentor info not found</h3><p>Could not load mentor profile.</p></div>`;
            document.querySelector('.chat-messages').innerHTML = `<div class='empty-state'><i class='fas fa-comments'></i><h3>No messages</h3></div>`;
            return;
        }
        const chatHeader = document.querySelector('.chat-header');
        if (!other) {
            chatHeader.innerHTML = `<div class='empty-state'><i class='fas fa-user'></i><h3>Mentor info not found</h3><p>Could not load mentor profile.</p></div>`;
        } else {
            chatHeader.innerHTML = `
                <div class="mentor-header">
                    <img src="${other.photo_url || '../../../assets/images/default-avatar.jpg'}" alt="${other.first_name}" class="mentor-avatar" onerror="this.src='../../../assets/images/default-avatar.jpg'">
                    <div class="mentor-info">
                        <h3 class="mentor-name">${other.first_name} ${other.last_name}</h3>
                        ${other.job_title ? `<p class='mentor-title'>${other.job_title}${other.company ? ` • ${other.company}` : ''}</p>` : ''}
                        <div class="mentor-stats">
                            ${other.years_of_experience ? `<div class='mentor-stat-item'><i class='fas fa-briefcase'></i><span>${other.years_of_experience}+ years</span></div>` : ''}
                            ${other.location ? `<div class='mentor-stat-item'><i class='fas fa-map-marker-alt'></i><span>${other.location}</span></div>` : ''}
                            ${other.availability_hours_week ? `<div class='mentor-stat-item'><i class='fas fa-clock'></i><span>${other.availability_hours_week}h/week</span></div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        let messages = [];
        try {
            const messagesResp = await fetchConversationMessages(conversationId);
            messages = messagesResp.messages?.data || [];
        } catch (err) {
            document.querySelector('.chat-messages').innerHTML = `<div class='empty-state'><i class='fas fa-comments'></i><h3>Could not load messages</h3></div>`;
            return;
        }
        const chatMessages = document.querySelector('.chat-messages');
        if (messages.length === 0) {
            chatMessages.innerHTML = `<div class='empty-state'><i class='fas fa-comments'></i><h3>No messages yet</h3><p>Start the conversation with your mentor!</p></div>`;
        } else {
            chatMessages.innerHTML = messages.map(msg => `
                <div class="message-bubble ${msg.sender_id === other.id ? 'received' : 'sent'}">
                    <p>${msg.content}</p>
                    <span class="message-time">${new Date(msg.created_at).toLocaleTimeString()}</span>
                </div>
            `).join('');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        // Mark all as read
        await markConversationAsRead(conversationId);
        // Setup send message
        setupSendMessage(conversationId, other);
    } catch (err) {
        alert('An unexpected error occurred while rendering the chat.');
        console.error(err);
    }
}
    }
}

function setupSendMessage(conversationId, other) {
    const input = document.querySelector('.chat-input input');
    const button = document.querySelector('.chat-input button');
    button.onclick = async () => {
        const content = input.value.trim();
        if (!content) return;
        button.disabled = true;
        try {
            await sendMessage(conversationId, content, 'text');
            input.value = '';
            // Re-render chat after sending
            await renderChat(conversationId);
        } catch (err) {
            alert('Failed to send message. Please try again.');
            console.error(err);
        }
        button.disabled = false;
    };
}

// Render connected mentors in sidebar
async function renderMentorSidebar() {
    const sidebarList = document.querySelector('.messages-list');
    if (!sidebarList) return;
    sidebarList.innerHTML = '<p>Loading mentors...</p>';
    try {
        const mentors = await getActiveMentors();
        if (!mentors || mentors.length === 0) {
            sidebarList.innerHTML = '<p>No connected mentors found.</p>';
            return;
        }
        sidebarList.innerHTML = mentors.map(mentor => `
            <div class="message-preview" data-mentor-id="${mentor.id}">
                <div class="message-preview-header">
                    <img src="${mentor.photo_url || '../../../assets/images/default-avatar.jpg'}" alt="${mentor.first_name}" class="message-avatar">
                    <div class="message-info">
                        <h3 class="message-name">${mentor.first_name} ${mentor.last_name}</h3>
                        <span class="message-time">${mentor.job_title || ''}</span>
                    </div>
                </div>
                <button class="btn btn-outline btn-message" data-mentor-id="${mentor.id}">Message</button>
            </div>
        `).join('');
        sidebarList.querySelectorAll('.btn-message').forEach(btn => {
            btn.addEventListener('click', function() {
                const mentorId = this.getAttribute('data-mentor-id');
                // Open chat with this mentor
                window.location.href = `/pages/messages/mentee_messages/mentee_messages.html?mentor=${mentorId}`;
            });
        });
    } catch (err) {
        sidebarList.innerHTML = '<p>Error loading mentors.</p>';
    }
}

document.addEventListener('DOMContentLoaded', renderMentorSidebar);

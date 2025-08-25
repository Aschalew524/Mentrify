import { fetchConversations } from './conversations.js';
import { fetchConversationDetails, fetchConversationMessages, sendMessage, markConversationAsRead } from './conversations.js';
import { getActiveMentees } from '../mentorship/mentorship.js';

// Fetch and render conversations for mentor
async function renderConversations() {
    try {
        const data = await fetchConversations();
        const conversations = data.conversations || [];
        const messagesList = document.querySelector('.messages-list');
        messagesList.innerHTML = '';
        conversations.forEach(conv => {
            const other = conv.other_participant || conv.mentee || conv.mentor;
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
        if (conversations.length > 0) renderChat(conversations[0].id);
    } catch (err) {
        console.error(err);
    }
}

function renderChat(conversation) {
async function renderChat(conversationId) {
    try {
        const details = await fetchConversationDetails(conversationId);
        const conversation = details.conversation;
        const other = conversation.other_participant || conversation.mentee || conversation.mentor;
        const chatHeader = document.querySelector('.chat-header');
        chatHeader.innerHTML = `
            <img src="${other.photo_url || '../../../assets/images/default-avatar.jpg'}" alt="${other.first_name}" class="message-avatar">
            <div class="message-info">
                <h3 class="message-name">${other.first_name} ${other.last_name}</h3>
                <span class="message-time">${other.job_title || ''}</span>
            </div>
        `;
        // Fetch messages (paginated)
        const messagesResp = await fetchConversationMessages(conversationId);
        const messages = messagesResp.messages?.data || [];
        const chatMessages = document.querySelector('.chat-messages');
        chatMessages.innerHTML = messages.map(msg => `
            <div class="message-bubble ${msg.sender_id === other.id ? 'received' : 'sent'}">
                <p>${msg.content}</p>
                <span class="message-time">${new Date(msg.created_at).toLocaleTimeString()}</span>
            </div>
        `).join('');
        chatMessages.scrollTop = chatMessages.scrollHeight;
        // Mark all as read
        await markConversationAsRead(conversationId);
        // Setup send message
        setupSendMessage(conversationId, other);
    } catch (err) {
        console.error(err);
    }
}

function setupSendMessage(conversationId, other) {
    const input = document.querySelector('.chat-input input');
    const button = document.querySelector('.chat-input button');
    button.onclick = async () => {
        const content = input.value.trim();
        if (!content) return;
        try {
            await sendMessage(conversationId, content, 'text');
            input.value = '';
            // Re-render chat after sending
            await renderChat(conversationId);
        } catch (err) {
            console.error(err);
        }
    };
}
}

// Render connected mentees in sidebar
async function renderMenteeSidebar() {
    const sidebarList = document.querySelector('.messages-list');
    if (!sidebarList) return;
    sidebarList.innerHTML = '<p>Loading mentees...</p>';
    try {
        const mentees = await getActiveMentees();
        if (!mentees || mentees.length === 0) {
            sidebarList.innerHTML = '<p>No connected mentees found.</p>';
            return;
        }
        sidebarList.innerHTML = mentees.map(mentee => `
            <div class="message-preview" data-mentee-id="${mentee.id}">
                <div class="message-preview-header">
                    <img src="${mentee.photo_url || '../../../assets/images/default-avatar.jpg'}" alt="${mentee.first_name}" class="message-avatar">
                    <div class="message-info">
                        <h3 class="message-name">${mentee.first_name} ${mentee.last_name}</h3>
                        <span class="message-time">${mentee.job_title || ''}</span>
                    </div>
                </div>
                <button class="btn btn-outline btn-message" data-mentee-id="${mentee.id}">Message</button>
            </div>
        `).join('');
        sidebarList.querySelectorAll('.btn-message').forEach(btn => {
            btn.addEventListener('click', function() {
                const menteeId = this.getAttribute('data-mentee-id');
                // Open chat with this mentee
                window.location.href = `/pages/messages/mentor_messages/mentor_messages.html?mentee=${menteeId}`;
            });
        });
    } catch (err) {
        sidebarList.innerHTML = '<p>Error loading mentees.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderConversations();
    renderMenteeSidebar();
});

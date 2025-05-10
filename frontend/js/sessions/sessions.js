// sessions.js (Example Data)

const SessionStatus = {
    UPCOMING: 'upcoming',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    // Add more if needed: PENDING_CONFIRMATION: 'pending_confirmation', IN_PROGRESS: 'in-progress'
};

// Mock User Data (simplified for this example)
const mockUsers = {
    1: { id: 1, name: "John Smith", avatar: "../../assets/images/mentor-avatar.jpg", role: 'mentor' },
    2: { id: 2, name: "Sarah Johnson", avatar: "../../assets/images/mentor-avatar.jpg", role: 'mentor' },
    3: { id: 3, name: "Michael Brown", avatar: "../../assets/images/mentor-avatar.jpg", role: 'mentor' },
    4: { id: 4, name: "Emily Davis", avatar: "../../assets/images/mentor-avatar.jpg", role: 'mentor' },
    101: { id: 101, name: "Alice Wonder", avatar: "../../assets/images/mentee-avatar.jpg", role: 'mentee' }, // Logged-in Mentee
    102: { id: 102, name: "Bob The Builder", avatar: "../../assets/images/mentee-avatar.jpg", role: 'mentee' },
};

const allSessions = [
    {
        id: 1,
        mentor_id: 1,
        mentee_id: 101,
        title: "Career Development Strategy",
        description: "Discussing long-term career goals and next steps.",
        start_time: "2024-07-25T10:00:00Z",
        end_time: "2024-07-25T11:00:00Z",
        status: SessionStatus.UPCOMING,
        join_url: "https://zoom.us/j/1234567890",
        created_at: "2024-07-01T00:00:00Z",
        updated_at: "2024-07-01T00:00:00Z",
        mentor: mockUsers[1],
        mentee: mockUsers[101]
    },
    {
        id: 2,
        mentor_id: 2,
        mentee_id: 101,
        title: "Leadership Skills Workshop",
        description: "Interactive session on improving leadership qualities.",
        start_time: "2024-07-14T14:00:00Z",
        end_time: "2024-07-14T15:00:00Z",
        status: SessionStatus.COMPLETED,
        join_url: "https://zoom.us/j/0987654321",
        created_at: "2024-07-01T00:00:00Z",
        updated_at: "2024-07-01T00:00:00Z",
        mentor: mockUsers[2],
        mentee: mockUsers[101]
    },
    {
        id: 3,
        mentor_id: 101, // If a mentor is viewing sessions they are *giving*
        mentee_id: 102,
        title: "Project Review",
        description: "Review of Bob's current project progress.",
        start_time: "2024-07-26T09:00:00Z",
        end_time: "2024-07-26T09:30:00Z",
        status: SessionStatus.UPCOMING,
        join_url: "https://zoom.us/j/1122334455",
        created_at: "2024-07-02T00:00:00Z",
        updated_at: "2024-07-02T00:00:00Z",
        mentor: mockUsers[101], // Here, Alice (101) is the mentor
        mentee: mockUsers[102]
    },
    {
        id: 4,
        mentor_id: 4,
        mentee_id: 101,
        title: "Communication Skills Practice",
        description: "Role-playing and feedback on communication.",
        start_time: "2024-07-10T15:00:00Z",
        end_time: "2024-07-10T16:00:00Z",
        status: SessionStatus.CANCELLED,
        join_url: null,
        created_at: "2024-07-01T00:00:00Z",
        updated_at: "2024-07-05T00:00:00Z",
        mentor: mockUsers[4],
        mentee: mockUsers[101]
    },
    // Add more sessions to test filtering and different scenarios
];


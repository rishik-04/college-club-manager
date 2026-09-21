const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('ccm_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await res.json();
      errorMsg = data.detail || data.message || errorMsg;
    } catch (e) {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    updateMe: async (data) => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },

  // Clubs
  clubs: {
    getAll: async ({ search = '', category = '' } = {}) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All') params.append('category', category);
      const res = await fetch(`${API_BASE}/clubs?${params.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/clubs/${id}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/clubs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/clubs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/clubs/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    addBoardMember: async (clubId, memberData) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/board-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(memberData),
      });
      return handleResponse(res);
    },
    updateBoardMember: async (clubId, memberId, memberData) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/board-members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(memberData),
      });
      return handleResponse(res);
    },
    deleteBoardMember: async (clubId, memberId) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/board-members/${memberId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    // Demographics Analytics & Roster APIs
    join: async (clubId) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });
      return handleResponse(res);
    },
    getMyMemberships: async () => {
      const res = await fetch(`${API_BASE}/clubs/my-memberships`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    getAnalytics: async (clubId) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/analytics`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    getMembers: async (clubId) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/members`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    addMember: async (clubId, studentId) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ student_id: Number(studentId) }),
      });
      return handleResponse(res);
    },
    removeMember: async (clubId, studentId) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/members/${studentId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },

  // Events
  events: {
    getAll: async ({ filter_type = 'all', club_id = null } = {}) => {
      const params = new URLSearchParams();
      if (filter_type) params.append('filter_type', filter_type);
      if (club_id) params.append('club_id', club_id);
      const res = await fetch(`${API_BASE}/events?${params.toString()}`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    register: async (eventId) => {
      const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });
      return handleResponse(res);
    },
    getMyRegistrations: async () => {
      const res = await fetch(`${API_BASE}/events/my-registrations`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    create: async (clubId, eventData) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(eventData),
      });
      return handleResponse(res);
    },
    update: async (eventId, eventData) => {
      const res = await fetch(`${API_BASE}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(eventData),
      });
      return handleResponse(res);
    },
    delete: async (eventId) => {
      const res = await fetch(`${API_BASE}/events/${eventId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },

  // Announcements Newsfeed
  announcements: {
    getAll: async (clubIdOrOptions = null) => {
      let clubId = clubIdOrOptions;
      if (typeof clubIdOrOptions === 'object' && clubIdOrOptions !== null) {
        clubId = clubIdOrOptions.club_id;
      }
      const params = clubId ? `?club_id=${clubId}` : '';
      const res = await fetch(`${API_BASE}/announcements${params}`);
      return handleResponse(res);
    },
    getNotifications: async () => {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    create: async (clubId, annData) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(annData),
      });
      return handleResponse(res);
    },
    update: async (id, annData) => {
      const res = await fetch(`${API_BASE}/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(annData),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/announcements/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },

  // Saved Clubs
  saved: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/users/me/saved-clubs`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    save: async (clubId) => {
      const res = await fetch(`${API_BASE}/users/me/saved-clubs/${clubId}`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    unsave: async (clubId) => {
      const res = await fetch(`${API_BASE}/users/me/saved-clubs/${clubId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },

  // Admin
  admin: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    getUsers: async () => {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    updateRole: async (userId, role) => {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ role }),
      });
      return handleResponse(res);
    },
    getMyClub: async () => {
      const res = await fetch(`${API_BASE}/admin/my-club`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    getAssignments: async () => {
      const res = await fetch(`${API_BASE}/admin/assignments`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    assignClubAdmin: async (userId, clubId) => {
      const res = await fetch(`${API_BASE}/admin/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ user_id: userId, club_id: clubId }),
      });
      return handleResponse(res);
    },
    deleteAssignment: async (assignmentId) => {
      const res = await fetch(`${API_BASE}/admin/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },

  // AI & Smart Match
  ai: {
    recommend: async (interests) => {
      const res = await fetch(`${API_BASE}/ai/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ interests }),
      });
      return handleResponse(res);
    },
    ask: async (question) => {
      const res = await fetch(`${API_BASE}/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ question }),
      });
      return handleResponse(res);
    },
  },
};

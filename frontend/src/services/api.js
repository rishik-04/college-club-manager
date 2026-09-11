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
  },

  // Applications & Recruitment Kanban (Phase 26)
  applications: {
    apply: async (clubId, appData) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(appData),
      });
      return handleResponse(res);
    },
    getMyApplications: async () => {
      const res = await fetch(`${API_BASE}/users/me/applications`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    getClubApplications: async (clubId) => {
      const res = await fetch(`${API_BASE}/clubs/${clubId}/applications`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    getAllApplications: async () => {
      const res = await fetch(`${API_BASE}/admin/applications`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    updateStatus: async (appId, status, admin_notes = '') => {
      const res = await fetch(`${API_BASE}/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status, admin_notes }),
      });
      return handleResponse(res);
    },
  },

  // Events & QR Ticketing (Phase 27)
  events: {
    getAll: async ({ filter_type = 'all', club_id = null } = {}) => {
      const params = new URLSearchParams();
      if (filter_type) params.append('filter_type', filter_type);
      if (club_id) params.append('club_id', club_id);
      const res = await fetch(`${API_BASE}/events?${params.toString()}`);
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
    delete: async (eventId) => {
      const res = await fetch(`${API_BASE}/events/${eventId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    rsvp: async (eventId) => {
      const res = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    getMyTickets: async () => {
      const res = await fetch(`${API_BASE}/users/me/tickets`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    checkIn: async (eventId, ticket_code) => {
      const res = await fetch(`${API_BASE}/events/${eventId}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ ticket_code }),
      });
      return handleResponse(res);
    },
  },

  // Announcements Newsfeed (Phase 28)
  announcements: {
    getAll: async (clubId = null) => {
      const params = clubId ? `?club_id=${clubId}` : '';
      const res = await fetch(`${API_BASE}/announcements${params}`);
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

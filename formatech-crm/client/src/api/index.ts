// API client for FormaTech CRM

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API Error');
  }

  return data;
}

// Stats API
export const statsAPI = {
  getDashboard: () => fetchAPI<{ success: boolean; data: any }>('/stats/dashboard'),
  getMonthlyRevenue: () => fetchAPI<{ success: boolean; data: any[] }>('/stats/monthly-revenue'),
  getSources: () => fetchAPI<{ success: boolean; data: any[] }>('/stats/sources'),
  getUserPerformance: () => fetchAPI<{ success: boolean; data: any[] }>('/stats/user-performance'),
  getNextToClose: () => fetchAPI<{ success: boolean; data: any[] }>('/stats/next-to-close'),
  getFunnel: () => fetchAPI<{ success: boolean; data: any[] }>('/stats/funnel'),
};

// Users API
export const usersAPI = {
  getAll: () => fetchAPI<{ success: boolean; data: any[] }>('/users'),
  getById: (id: string) => fetchAPI<{ success: boolean; data: any }>(`/users/${id}`),
  getStats: (id: string) => fetchAPI<{ success: boolean; data: any }>(`/users/${id}/stats`),
  create: (data: any) => fetchAPI<{ success: boolean; data: any }>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI<{ success: boolean; data: any }>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Companies API
export const companiesAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI<{ success: boolean; data: any[] }>(`/companies${query}`);
  },
  getById: (id: string) => fetchAPI<{ success: boolean; data: any }>(`/companies/${id}`),
  create: (data: any) => fetchAPI<{ success: boolean; data: any }>('/companies', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI<{ success: boolean; data: any }>(`/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI<{ success: boolean }>(`/companies/${id}`, {
    method: 'DELETE',
  }),
};

// Contacts API
export const contactsAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI<{ success: boolean; data: any[] }>(`/contacts${query}`);
  },
  getById: (id: string) => fetchAPI<{ success: boolean; data: any }>(`/contacts/${id}`),
  create: (data: any) => fetchAPI<{ success: boolean; data: any }>('/contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI<{ success: boolean; data: any }>(`/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI<{ success: boolean }>(`/contacts/${id}`, {
    method: 'DELETE',
  }),
};

// Deals API
export const dealsAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI<{ success: boolean; data: any[] }>(`/deals${query}`);
  },
  getById: (id: string) => fetchAPI<{ success: boolean; data: any }>(`/deals/${id}`),
  create: (data: any) => fetchAPI<{ success: boolean; data: any }>('/deals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI<{ success: boolean; data: any }>(`/deals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updateStage: (id: string, stage: string, userId: string) =>
    fetchAPI<{ success: boolean; data: any }>(`/deals/${id}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stage, user_id: userId }),
    }),
  updateQualification: (id: string, data: any) =>
    fetchAPI<{ success: boolean; data: any }>(`/deals/${id}/qualification`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateDemo: (id: string, data: any) =>
    fetchAPI<{ success: boolean; data: any }>(`/deals/${id}/demo`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateProposal: (id: string, data: any) =>
    fetchAPI<{ success: boolean; data: any }>(`/deals/${id}/proposal`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  addNegotiationEntry: (id: string, content: string, userId: string) =>
    fetchAPI<{ success: boolean; data: any }>(`/deals/${id}/negotiation`, {
      method: 'POST',
      body: JSON.stringify({ content, user_id: userId }),
    }),
  updateNegotiation: (id: string, data: any) =>
    fetchAPI<{ success: boolean; data: any }>(`/deals/${id}/negotiation`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  markAsWon: (id: string, data: any) =>
    fetchAPI<{ success: boolean; data: any }>(`/deals/${id}/won`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  markAsLost: (id: string, data: any) =>
    fetchAPI<{ success: boolean; data: any }>(`/deals/${id}/lost`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchAPI<{ success: boolean }>(`/deals/${id}`, {
    method: 'DELETE',
  }),
};

// Activities API
export const activitiesAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI<{ success: boolean; data: any[] }>(`/activities${query}`);
  },
  getRecent: () => fetchAPI<{ success: boolean; data: any[] }>('/activities/recent'),
  create: (data: any) => fetchAPI<{ success: boolean; data: any }>('/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Reminders API
export const remindersAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI<{ success: boolean; data: any[] }>(`/reminders${query}`);
  },
  getCount: () => fetchAPI<{ success: boolean; data: { count: number } }>('/reminders/count'),
  markAsRead: (id: string) => fetchAPI<{ success: boolean }>(`/reminders/${id}/read`, {
    method: 'PUT',
  }),
  markAllAsRead: () => fetchAPI<{ success: boolean }>('/reminders/read-all', {
    method: 'PUT',
  }),
};

// Export API
export const exportAPI = {
  deals: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return `${API_BASE}/export/deals${query}`;
  },
  contacts: () => `${API_BASE}/export/contacts`,
  companies: () => `${API_BASE}/export/companies`,
};

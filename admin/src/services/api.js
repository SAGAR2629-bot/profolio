const CLOUD_API_URL = 'https://profolio-api-2zt9.onrender.com';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }
  }
  return CLOUD_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanUrl}`;
}

export function getAuthToken() {
  return localStorage.getItem('archive_admin_token');
}

export function setAuthToken(token) {
  localStorage.setItem('archive_admin_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('archive_admin_token');
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    removeAuthToken();
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Authentication session expired. Please log in again.');
  }

  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        errMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  // If 204 or empty response
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  login: async (username, password) => {
    const data = await request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },
  logout: () => {
    removeAuthToken();
  },
  getMe: () => request('/api/admin/me'),
  changePassword: (old_password, new_password) =>
    request('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password })
    }),

  // Dashboard
  getStats: () => request('/api/admin/dashboard/stats'),

  // Profile
  getProfile: () => request('/api/admin/profile'),
  updateProfile: (data) =>
    request('/api/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Content (Home / Contact)
  getContent: (section) => request(`/api/admin/content/${section}`),
  updateContent: (section, data) =>
    request(`/api/admin/content/${section}`, {
      method: 'PUT',
      body: JSON.stringify({ data })
    }),

  // Projects
  getProjects: () => request('/api/admin/projects'),
  getProject: (id) => request(`/api/admin/projects/${id}`),
  createProject: (data) =>
    request('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateProject: (id, data) =>
    request(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteProject: (id) =>
    request(`/api/admin/projects/${id}`, {
      method: 'DELETE'
    }),
  duplicateProject: (id) =>
    request(`/api/admin/projects/${id}/duplicate`, {
      method: 'POST'
    }),
  archiveProject: (id) =>
    request(`/api/admin/projects/${id}/archive`, {
      method: 'PUT'
    }),
  addProjectImage: (id, data) =>
    request(`/api/admin/projects/${id}/images`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  reorderProjectImages: (id, items) =>
    request(`/api/admin/projects/${id}/images/reorder`, {
      method: 'PUT',
      body: JSON.stringify(items)
    }),
  removeProjectImage: (id, imageId) =>
    request(`/api/admin/projects/${id}/images/${imageId}`, {
      method: 'DELETE'
    }),

  // Achievements
  getAchievements: () => request('/api/admin/achievements'),
  getAchievement: (id) => request(`/api/admin/achievements/${id}`),
  createAchievement: (data) =>
    request('/api/admin/achievements', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAchievement: (id, data) =>
    request(`/api/admin/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteAchievement: (id) =>
    request(`/api/admin/achievements/${id}`, {
      method: 'DELETE'
    }),
  duplicateAchievement: (id) =>
    request(`/api/admin/achievements/${id}/duplicate`, {
      method: 'POST'
    }),
  archiveAchievement: (id) =>
    request(`/api/admin/achievements/${id}/archive`, {
      method: 'PUT'
    }),
  addAchievementImage: (id, data) =>
    request(`/api/admin/achievements/${id}/images`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  reorderAchievementImages: (id, items) =>
    request(`/api/admin/achievements/${id}/images/reorder`, {
      method: 'PUT',
      body: JSON.stringify(items)
    }),
  removeAchievementImage: (id, imageId) =>
    request(`/api/admin/achievements/${id}/images/${imageId}`, {
      method: 'DELETE'
    }),

  // Certificates
  getCertificates: () => request('/api/admin/certificates'),
  createCertificate: (data) =>
    request('/api/admin/certificates', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateCertificate: (id, data) =>
    request(`/api/admin/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteCertificate: (id) =>
    request(`/api/admin/certificates/${id}`, {
      method: 'DELETE'
    }),
  duplicateCertificate: (id) =>
    request(`/api/admin/certificates/${id}/duplicate`, {
      method: 'POST'
    }),
  archiveCertificate: (id) =>
    request(`/api/admin/certificates/${id}/archive`, {
      method: 'PUT'
    }),

  // Skills
  getSkills: () => request('/api/admin/skills'),
  createSkill: (data) =>
    request('/api/admin/skills', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSkill: (id, data) =>
    request(`/api/admin/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteSkill: (id) =>
    request(`/api/admin/skills/${id}`, {
      method: 'DELETE'
    }),
  duplicateSkill: (id) =>
    request(`/api/admin/skills/${id}/duplicate`, {
      method: 'POST'
    }),
  archiveSkill: (id) =>
    request(`/api/admin/skills/${id}/archive`, {
      method: 'PUT'
    }),

  // Education
  getEducation: () => request('/api/admin/education'),
  createEducation: (data) =>
    request('/api/admin/education', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateEducation: (id, data) =>
    request(`/api/admin/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteEducation: (id) =>
    request(`/api/admin/education/${id}`, {
      method: 'DELETE'
    }),
  duplicateEducation: (id) =>
    request(`/api/admin/education/${id}/duplicate`, {
      method: 'POST'
    }),
  archiveEducation: (id) =>
    request(`/api/admin/education/${id}/archive`, {
      method: 'PUT'
    }),

  // Experience
  getExperience: () => request('/api/admin/experience'),
  createExperience: (data) =>
    request('/api/admin/experience', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateExperience: (id, data) =>
    request(`/api/admin/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteExperience: (id) =>
    request(`/api/admin/experience/${id}`, {
      method: 'DELETE'
    }),
  duplicateExperience: (id) =>
    request(`/api/admin/experience/${id}/duplicate`, {
      method: 'POST'
    }),
  archiveExperience: (id) =>
    request(`/api/admin/experience/${id}/archive`, {
      method: 'PUT'
    }),

  // Media
  getMedia: async () => {
    const list = await request('/api/admin/media');
    return (list || []).map((item) => ({
      ...item,
      public_url: resolveMediaUrl(item.public_url)
    }));
  },
  uploadMedia: async (file, title = '', alt_text = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (alt_text) formData.append('alt_text', alt_text);

    const item = await request('/api/admin/media/upload', {
      method: 'POST',
      body: formData
    });
    return {
      ...item,
      public_url: resolveMediaUrl(item.public_url)
    };
  },
  getMediaReferences: (id) => request(`/api/admin/media/${id}/references`),
  updateMedia: (id, data) =>
    request(`/api/admin/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteMedia: (id, force = false) =>
    request(`/api/admin/media/${id}?force=${force}`, {
      method: 'DELETE'
    }),
  resolveMediaUrl
};

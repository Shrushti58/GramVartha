import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Auth APIs
export const adminRegister = (email, password, village = null) => {
  return api.post('/admin/register', { email, password, ...(village && { village }) });
};

export const adminLogin = (email, password) => {
  return api.post('/admin/login', { email, password });
};

export const adminLogout = () => {
  return api.post('/admin/logout');
};

export const getAdminProfile = () => {
  return api.get('/admin/me');
};

// Village APIs
export const registerVillage = (villageData, documentFile) => {
  const formData = new FormData();
  
  // Add all village data to FormData
  Object.keys(villageData).forEach(key => {
    if (villageData[key] !== undefined && villageData[key] !== null) {
      formData.append(key, villageData[key]);
    }
  });
  
  // Add document file if provided
  if (documentFile) {
    formData.append('document', documentFile);
  }
  
  return api.post('/villages/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getPendingVillages = () => {
  return api.get('/villages/pending');
};

export const approveVillage = (villageId) => {
  return api.put(`/villages/approve/${villageId}`);
};

export const rejectVillage = (villageId) => {
  return api.put(`/villages/reject/${villageId}`);
};

export const getAllVillages = () => {
  return api.get('/villages');
};

export const createVillage = (villageData) => {
  return api.post('/villages/create', villageData);
};

export const updateVillage = (villageId, data) => {
  return api.put(`/villages/${villageId}`, data);
};

export const updateVillageCoordinates = (villageId, coordinates) => {
  return api.put(`/villages/coordinates/${villageId}`, coordinates);
};

export const deleteVillage = (villageId) => {
  return api.delete(`/villages/${villageId}`);
};

// Admin Management APIs
export const getPendingAdmins = () => {
  return api.get('/admin/pending-admins');
};

export const approveAdmin = (adminId) => {
  return api.put(`/admin/approve-admin/${adminId}`);
};

export const rejectAdmin = (adminId) => {
  return api.put(`/admin/reject-admin/${adminId}`);
};

// Official APIs
export const registerOfficial = (officialData) => {
  return api.post('/officials/register', officialData);
};

export const getPendingOfficials = () => {
  return api.get('/officials/pending');
};

export const approveOfficial = (officialId) => {
  return api.put(`/officials/approve/${officialId}`);
};

export const rejectOfficial = (officialId) => {
  return api.put(`/officials/reject/${officialId}`);
};

export const getAllOfficials = () => {
  return api.get('/officials/all');
};

export const deleteOfficial = (officialId) => {
  return api.delete(`/officials/${officialId}`);
};

// Notice APIs
export const uploadNotice = (formData) => {
  return api.post('/notice/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const fetchOfficialNotices = (filters = {}) => {
  return api.get('/notice/official/fetch', { params: filters });
};

export const getNoticesByLocation = (latitude, longitude, radiusKm = 10) => {
  return api.get('/notice/location', {
    params: { latitude, longitude, radiusKm }
  });
};

export const updateNotice = (noticeId, formData) => {
  return api.put(`/notice/update/${noticeId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const deleteNotice = (noticeId) => {
  return api.delete(`/notice/delete/${noticeId}`);
};

export const getNoticeById = (noticeId) => {
  return api.get(`/notice/${noticeId}`);
};

export const trackNoticeView = (noticeId, visitorId) => {
  return api.post(`/notice/${noticeId}/view`, { visitorId });
};

// Official Auth APIs
export const officialRegister = (officialData, profileImage = null) => {
  const formData = new FormData();

  // Add text fields
  Object.keys(officialData).forEach(key => {
    if (officialData[key] !== null && officialData[key] !== undefined) {
      formData.append(key, officialData[key]);
    }
  });

  // Add profile image if provided
  if (profileImage) {
    formData.append('profileImage', profileImage);
  }

  return api.post('/officials/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const officialLogin = (email, password) => {
  return api.post('/officials/login', { email, password });
};

export const officialLogout = () => {
  return api.post('/officials/logout');
};

export const getCurrentOfficial = () => {
  return api.get('/officials/me');
};

// Official Profile APIs
export const getOfficialProfile = () => {
  return api.get('/officials/profile');
};

export const uploadOfficialProfileImage = (imageFile) => {
  const formData = new FormData();
  formData.append('profileImage', imageFile);
  return api.post('/officials/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;

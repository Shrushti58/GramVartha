import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_TOKEN_KEY = 'gramvarthaAuthToken';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
    delete axios.defaults.headers.common.Authorization;
  }
};

setAuthToken(getStoredToken());

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 ||
      (error.response?.status === 403 && error.response?.data?.message === "Invalid token")
    ) {
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const adminRegister = (email, password, village = null) => {
  return api.post('/admin/register', { email, password, ...(village && { village }) });
};

export const adminLogin = (email, password) => {
  return api.post('/admin/login', { email, password });
};

export const adminLogout = () => {
  return api.post('/admin/logout').finally(() => setAuthToken(null));
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

export const updateOfficial = (officialId, officialData) => {
  return api.put(`/officials/${officialId}`, officialData);
};

// Admin Management APIs
export const getAllAdmins = () => {
  return api.get('/admin/all-admins');
};

export const editAdmin = (adminId, adminData) => {
  return api.put(`/admin/edit-admin/${adminId}`, adminData);
};

export const deleteAdmin = (adminId) => {
  return api.delete(`/admin/delete-admin/${adminId}`);
};

// Official Management APIs (for admins)
export const getAllOfficialsAdmin = () => {
  return api.get('/admin/all-officials');
};

export const editOfficialAdmin = (officialId, officialData) => {
  return api.put(`/admin/edit-official/${officialId}`, officialData);
};

export const deleteOfficialAdmin = (officialId) => {
  return api.delete(`/admin/delete-official/${officialId}`);
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

  // Add document proof if provided
  if (officialData.documentProof) {
    formData.append('documentProof', officialData.documentProof);
  }

  if (officialData.phoneVerified) {
    formData.append('phoneVerified', 'true');
  }

  return api.post('/officials/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const sendOfficialOtp = (phone) => {
  return api.post('/officials/send-otp', { phone });
};

export const verifyOfficialOtp = (phone, otp) => {
  return api.post('/officials/verify-otp', { phone, otp });
};

export const officialLogin = (email, password) => {
  return api.post('/officials/login', { email, password });
};

export const officialLogout = () => {
  return api.post('/officials/logout').finally(() => setAuthToken(null));
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

// QR Code APIs
export const getVillageByQRCode = (qrCodeId) => {
  return api.get(`/villages/qr/${qrCodeId}`);
};

export const getVillageQRCode = (villageId) => {
  return api.get(`/villages/${villageId}/qrcode`);
};

export const generateVillageQRCode = (villageId) => {
  return api.post(`/villages/${villageId}/qrcode/generate`);
};

export const downloadVillageQRCode = (villageId) => {
  return api.get(`/villages/${villageId}/qrcode/download`);
};

export const getNoticesByVillage = (villageId, params = {}) => {
  return api.get(`/notice/village/${villageId}`, { params });
};

export default api;
export { setAuthToken };

import axios from 'axios';
import { API_BASE } from '../utils/constants';

// const api = axios.create({ baseURL: API_BASE, timeout: 15000 });
const api = axios.create({ 
  baseURL: API_BASE, 
  timeout: 60000  // 60 seconds instead of 15
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});



export const authAPI = {
  login:    (email, password) => api.post('/auth/login', { email, password }),
  register: (data)            => api.post('/auth/register', data),
};

export const shipmentAPI = {
  getAll:   ()      => api.get('/shipments/all'),
  getById:  (tid)   => api.get(`/shipments/${tid}`),
  create:   (data)  => api.post('/shipments/create', data),
  delete:   (id)    => api.delete(`/shipments/${id}`),
  getRoute: (tid)   => api.get(`/shipments/${tid}/route`),
};

export const trackingAPI = {
  track:           (tid) => axios.get(`${API_BASE}/track/${tid}`),
  getExpectedDate: (tid) => axios.get(`${API_BASE}/delivery/expected-date/${tid}`),
};

export const deliveryAPI = {
  updateStatus:  (data)      => api.post('/delivery/update-status', data),
  getTimeline:   (tid)       => api.get(`/delivery/timeline/${tid}`),
  updateHubStep: (data)      => api.put('/delivery/hub/update-step', {
    shipmentId:    data.shipmentId,
    stepOrder:     data.stepOrder,
    status:        data.status,
    failureReason: data.failureReason || null,
  }),
  getMyTasks:  ()            => api.get('/delivery/hub/my-tasks'),
  confirmOtp:  (tid, otp)   => api.post('/delivery/confirm-otp', { trackingId: tid, otp }),
  resendOtp:   (tid)         => api.post(`/delivery/resend-otp?trackingId=${tid}`),
  reportDelay: (data)        =>  api.post('/delivery/report-delay', data),
  reschedule:  (tid)         => api.put(`/delivery/reschedule?trackingId=${tid}`),
};

export const historyAPI = {
  getAll:               ()                    => api.get('/history/all'),
  getByShipment:        (tid)                 => api.get(`/history/shipment/${tid}`),
  getByDateRange:       (from, to)            => api.get('/history/date-range', { params: { from, to } }),
  getByHub:             (hubId)               => api.get(`/history/hub/${hubId}`),
  getByHubAndDateRange: (hubId, from, to)     => api.get(`/history/hub/${hubId}/date-range`, { params: { from, to } }),
};

export const hubAPI = {
  getAll:        ()              => api.get('/admin/hubs'),
  create:        (data)          => api.post('/admin/hubs', data),
  update:        (id, data)      => api.put(`/admin/hubs/${id}`, data),
  activate:      (id)            => api.put(`/admin/hubs/${id}/activate`),
  deactivate:    (id)            => api.put(`/admin/hubs/${id}/deactivate`),
  assignManager: (hubId, userId) => api.put(`/admin/hubs/${hubId}/assign-manager/${userId}`),
  deassignManager: (hubId) =>
  api.put(`/users/hub/${hubId}/deassign-manager`),
};

export const userAPI = {
  getAll:        ()             => api.get('/users/all'),
  updateRole:    (id, role)     => api.put(`/users/${id}/role?role=${role}`),
  deleteUser:    (id)           => api.delete(`/users/${id}`),
  getStaffByHub: (hubId)        => api.get(`/users/hub/${hubId}/staff`),
  assignToHub:   (uid, hubId)   => api.put(`/users/${uid}/assign-hub/${hubId}`),
};

export const orsAPI = {
  getRoute: async (waypoints, apiKey) => {
    try {
      const res = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
        { coordinates: waypoints.map(w => [w.lng, w.lat]) },
        { headers: { Authorization: apiKey, 'Content-Type': 'application/json' }, timeout: 12000 }
      );
      return res.data;
    } catch { return null; }
  },
};

export default api;
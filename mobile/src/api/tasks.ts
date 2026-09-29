import { apiRequest } from './client';
import { Task, UserRequest, UrgencyOption } from '../types';

export const tasksApi = {
  async getTasks(category?: string, query?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (query) params.append('q', query);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Task[]>(`/api/tasks${queryString}`, {
      method: 'GET',
    });
  },

  async createRequest(requestData: {
    category: string;
    serviceTitle: string;
    subServices: string[];
    urgency: UrgencyOption;
    notes?: string;
  }) {
    return apiRequest<UserRequest>('/api/tasks/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  async getUserRequests() {
    return apiRequest<UserRequest[]>('/api/tasks/user/requests', {
      method: 'GET',
    });
  },
};

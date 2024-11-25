import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (userData: { username: string; email: string; password: string }) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};


export const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

export const getProjectProgress = async (projectId: number) => {
  const response = await api.get(`/projects/${projectId}/progress`);
  return response.data;
};

export const createProject = async (projectData: object) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

export const deleteProject = async (projectId: number) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

export const getAvailableUsers = async (projectId: number) => {
  const response = await api.get(`/projects/${projectId}/available_users`);
  return response.data;
};

export const searchUsers = async (projectId: number, query: string) => {
  const response = await api.get(`/projects/${projectId}/search_users`, {
    params: { query },
  }); 
  return response.data;
};

export const addUserToProject = async (projectId: number, userId: number) => {
  const response = await api.post(`/projects/${projectId}/add_user`, {
    user_id: userId,
  });
  return response.data;
};


export const removeUserFromProject = async (projectId: number, userId: number) => {
  const response = await api.delete(`/projects/${projectId}/remove_user`, {
    params: { user_id: userId },
  });
  return response.data;
};

export const getTasksByProject = async (projectId: number) => {
    const response = await api.get(`/tasks?project_id=${projectId}`);
    return response.data;
  };

  
  export const createTask = async (taskData: { title: string; description?: string; project_id: number }) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  };
  
  export const updateTask = async (taskId: number, isCompleted: boolean) => {
    const response = await api.put(`/tasks/${taskId}/status`, null, {
      params: { is_completed: isCompleted },
    });
    return response.data;
  };
  
  export const deleteTask = async (taskId: number) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  };

  export const subscribe = async (plan: string = "monthly") => {
    const response = await api.post('/payment/subscribe', { plan });
    return response.data;
  };
  
  export const unsubscribe = async () => {
    const response = await api.post('/unsubscribe');
    return response.data;
  };

  export const getSubscriptionStatus = async () => {
    const response = await api.get('/subscription/status');
    return response.data;
  };
  

export default api;

import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const fetchTodos = (params) => api.get('/todos', { params }).then(r => r.data);
export const createTodo = (data) => api.post('/todos', data).then(r => r.data);
export const updateTodo = (id, data) => api.put(`/todos/${id}`, data).then(r => r.data);
export const deleteTodo = (id) => api.delete(`/todos/${id}`).then(r => r.data);
export const toggleTodo = (id) => api.patch(`/todos/${id}/toggle`).then(r => r.data);

export const fetchCategories = () => api.get('/categories').then(r => r.data);
export const createCategory = (name) => api.post('/categories', { name }).then(r => r.data);
export const updateCategory = (id, name) => api.put(`/categories/${id}`, { name }).then(r => r.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then(r => r.data);

export default api;

import React, { useEffect, useState } from 'react';
import { Plus, CheckSquare, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const Tasks = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', project: '', assignee: '', status: 'To Do', priority: 'Medium', dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/users').catch(() => ({ data: { data: [] } })) // Fallback if user endpoint fails
      ]);
      setTasks(tasksRes.data.data);
      setProjects(projectsRes.data.data);
      setUsers(usersRes.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        project: task.project._id,
        assignee: task.assignee?._id || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', project: projects[0]?._id || '', assignee: '', status: 'To Do', priority: 'Medium', dueDate: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        // Members can only update status
        const updateData = user.role === 'Member' ? { status: formData.status } : formData;
        await api.put(`/tasks/${editingTask._id}`, updateData);
      } else {
        await api.post('/tasks', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'High': 'badge-high',
      'Medium': 'badge-medium',
      'Low': 'badge-low'
    };
    return colors[priority] || 'badge-todo';
  };

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="skeleton mb-2" style={{ height: '36px', width: '200px' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '300px' }}></div>
          </div>
        </div>
        <div className="glass-panel skeleton" style={{ height: '400px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
          <p className="text-muted">Manage and track your tasks.</p>
        </div>
        {user?.role === 'Admin' && projects.length > 0 && (
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <Plus size={20} /> New Task
          </button>
        )}
      </div>

      <div className="glass-panel">
        {tasks.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <CheckSquare size={40} className="text-muted" opacity={0.3} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">No tasks found</h3>
            <p className="text-muted max-w-sm mx-auto mb-6">You have no tasks assigned or created yet. Start by creating a new task.</p>
            {user?.role === 'Admin' && projects.length > 0 && (
              <button onClick={() => handleOpenModal()} className="btn btn-outline">
                <Plus size={16} /> Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="py-3 px-4 font-semibold text-muted">Title</th>
                  <th className="py-3 px-4 font-semibold text-muted">Project</th>
                  <th className="py-3 px-4 font-semibold text-muted">Assignee</th>
                  <th className="py-3 px-4 font-semibold text-muted">Priority</th>
                  <th className="py-3 px-4 font-semibold text-muted">Status</th>
                  <th className="py-3 px-4 font-semibold text-muted">Due Date</th>
                  <th className="py-3 px-4 font-semibold text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id} className="border-b border-[var(--border-color)] hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold">{task.title}</div>
                      <div className="text-xs text-muted truncate max-w-[200px]">{task.description}</div>
                    </td>
                    <td className="py-4 px-4 text-sm">{task.project?.name || 'N/A'}</td>
                    <td className="py-4 px-4 text-sm text-muted">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="avatar avatar-sm text-[10px]">
                            {task.assignee.name.substring(0, 2)}
                          </div>
                          <span>{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge ${getPriorityBadge(task.priority)}`}>{task.priority}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge badge-${task.status.toLowerCase().replace(' ', '')}`}>{task.status}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(task)} className="p-2 rounded hover:bg-[rgba(99,102,241,0.1)] text-[var(--primary-color)] transition-colors">
                          <Edit2 size={16} />
                        </button>
                        {user?.role === 'Admin' && (
                          <button onClick={() => handleDelete(task._id)} className="p-2 rounded hover:bg-[rgba(239,68,68,0.1)] text-[var(--danger)] transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            <form onSubmit={handleSubmit}>
              
              {/* Only Admins can edit details other than status */}
              {(user?.role === 'Admin' || !editingTask) && (
                <>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Project</label>
                      <select className="form-control" value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} required>
                        <option value="">Select Project</option>
                        {projects.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Assignee</label>
                      <select className="form-control" value={formData.assignee} onChange={e => setFormData({...formData, assignee: e.target.value})}>
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select className="form-control" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Due Date</label>
                      <input type="date" className="form-control" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                    </div>
                  </div>
                </>
              )}

              {/* Status can be updated by members too */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Save Changes' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;

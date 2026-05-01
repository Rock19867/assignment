import React, { useEffect, useState } from 'react';
import { Plus, Folder, Trash2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const Projects = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  
  // Simple form state for creating a project
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', members: [] });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users').catch(() => ({ data: { data: [] } }))
      ]);
      setProjects(projectsRes.data.data);
      setUsers(usersRes.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '', members: [] });
      fetchProjects();
    } catch (error) {
      console.error(error);
      alert('Failed to create project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? All tasks inside this project will also be permanently deleted!')) {
      return;
    }
    
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error(error);
      alert('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="skeleton mb-2" style={{ height: '36px', width: '150px' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '250px' }}></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card skeleton" style={{ height: '200px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted">Manage your team's projects.</p>
        </div>
        {user?.role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={20} /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project._id} className="card flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(99,102,241,0.1)] flex items-center justify-center text-[var(--primary-color)]">
                  <Folder size={20} />
                </div>
                <h3 className="text-lg font-bold truncate max-w-[150px]">{project.name}</h3>
              </div>
              {user?.role === 'Admin' && (
                <button 
                  onClick={() => handleDeleteProject(project._id)} 
                  className="p-2 rounded hover:bg-[rgba(239,68,68,0.1)] text-[var(--danger)] transition-colors"
                  title="Delete Project"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="text-muted text-sm mb-6 flex-1">{project.description}</p>
            <div className="mt-auto flex justify-between items-center border-t border-[var(--border-color)] pt-4">
              <span className={`badge ${project.status === 'Active' ? 'badge-progress' : 'badge-completed'}`}>
                {project.status}
              </span>
              <span className="text-xs text-muted font-medium text-right">
                {project.members?.length || 0} Members
              </span>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-20 flex flex-col items-center mt-6">
          <div className="w-24 h-24 mb-6 rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center">
            <Folder size={40} className="text-muted" opacity={0.3} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">No projects found</h3>
          <p className="text-muted max-w-sm mx-auto mb-6">Create a new project to start organizing tasks and collaborating with your team.</p>
          {user?.role === 'Admin' && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus size={20} /> Create First Project
            </button>
          )}
        </div>
      )}

      {/* Simple Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  required 
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Assign Members</label>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto p-3 border border-[var(--border-color)] rounded-md bg-[var(--surface-color)]">
                  {users.map(u => (
                    <label key={u._id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input 
                        type="checkbox" 
                        checked={newProject.members.includes(u._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewProject({ ...newProject, members: [...newProject.members, u._id] });
                          } else {
                            setNewProject({ ...newProject, members: newProject.members.filter(id => id !== u._id) });
                          }
                        }}
                      />
                      {u.name} <span className="text-muted text-xs">({u.role})</span>
                    </label>
                  ))}
                  {users.length === 0 && <div className="text-xs text-muted">No users found.</div>}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

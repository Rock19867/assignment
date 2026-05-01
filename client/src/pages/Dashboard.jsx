import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { LayoutDashboard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    todoTasks: 0,
    overdueTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks')
        ]);
        
        const tasks = tasksRes.data.data;
        setStats({
          totalProjects: projectsRes.data.count,
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'Completed').length,
          todoTasks: tasks.filter(t => t.status === 'To Do' || t.status === 'In Progress').length,
          overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length,
        });

        // Sort by created date, get top 5
        setRecentTasks(tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <div className="skeleton mb-2" style={{ height: '40px', width: '250px' }}></div>
        <div className="skeleton mb-8" style={{ height: '20px', width: '400px' }}></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card skeleton" style={{ height: '112px' }}></div>
          ))}
        </div>
        <div className="glass-panel skeleton" style={{ height: '256px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-muted">Here's what's happening with your projects today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card flex items-center gap-4">
          <div className="p-4 rounded-full bg-[rgba(99,102,241,0.1)] text-[var(--primary-color)]">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <div className="text-muted text-sm font-medium">Active Projects</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-4 rounded-full bg-[rgba(16,185,129,0.1)] text-[var(--success)]">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <div className="text-muted text-sm font-medium">Tasks Completed</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-4 rounded-full bg-[rgba(245,158,11,0.1)] text-[var(--warning)]">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.todoTasks}</div>
            <div className="text-muted text-sm font-medium">Tasks In Progress</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-4 rounded-full bg-[rgba(239,68,68,0.1)] text-[var(--danger)]">
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.overdueTasks}</div>
            <div className="text-muted text-sm font-medium">Overdue Tasks</div>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <CheckCircle size={40} className="text-muted" opacity={0.3} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">No tasks yet</h3>
            <p className="text-muted max-w-sm mx-auto">You're all caught up! When you or your team create new tasks, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="py-3 px-4 font-semibold text-muted">Task</th>
                  <th className="py-3 px-4 font-semibold text-muted">Project</th>
                  <th className="py-3 px-4 font-semibold text-muted">Status</th>
                  <th className="py-3 px-4 font-semibold text-muted">Date Created</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map(task => (
                  <tr key={task._id} className="border-b border-[var(--border-color)] hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="py-3 px-4 font-medium">{task.title}</td>
                    <td className="py-3 px-4 text-muted">{task.project?.name || 'Unknown'}</td>
                    <td className="py-3 px-4">
                      <span className={`badge badge-${task.status.toLowerCase().replace(' ', '')}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted">{format(new Date(task.createdAt), 'MMM dd, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

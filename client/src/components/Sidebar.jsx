import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Sidebar = () => {
  const { logout, user } = useAuthStore();

  return (
    <div className="sidebar">
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white font-bold text-xl">
          TM
        </div>
        <div>
          <h2 className="text-lg font-bold m-0">Task Manager</h2>
          <span className="text-xs text-[var(--primary-color)] font-semibold uppercase tracking-wider">{user?.role}</span>
        </div>
      </div>

      <nav className="flex-1">
        <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/dashboard/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FolderKanban size={20} />
          <span>Projects</span>
        </NavLink>
        <NavLink to="/dashboard/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CheckSquare size={20} />
          <span>My Tasks</span>
        </NavLink>
      </nav>

      <div className="mt-auto pt-4 px-2">
        <div className="mb-4 flex items-center gap-3 p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
          <div className="avatar avatar-md">
            {user?.name ? user.name.substring(0, 2) : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="font-semibold text-sm truncate text-white">{user?.name}</div>
            <div className="text-xs text-muted truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} className="nav-item w-full text-left hover:text-[var(--danger)]">
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

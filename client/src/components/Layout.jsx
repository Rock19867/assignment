import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="container" style={{ maxWidth: '100%', padding: '0' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

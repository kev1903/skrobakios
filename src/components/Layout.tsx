
import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-main">
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

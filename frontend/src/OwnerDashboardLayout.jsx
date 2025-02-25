// src/OwnerDashboardLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'

export default function OwnerDashboardLayout() {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-grow-1">
        {/* Top Bar / Header */}
        <header className="navbar bg-light p-2 border-bottom">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <div>
              <h4 className="m-0">LOGO</h4>
            </div>
            <div>
              <i className="bi bi-bell mx-3" style={{ fontSize: '1.2rem' }}></i>
              <span>Profile <img src="https://via.placeholder.com/30" alt="profile" className="rounded-circle ms-2"/></span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

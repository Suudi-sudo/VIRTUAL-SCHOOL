// src/components/Sidebar.jsx
import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <div className="bg-dark text-white vh-100 p-2" style={{ width: '220px' }}>
      <nav className="nav flex-column">
        <NavLink
          to="/dashboard"
          className="nav-link text-white mb-2"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
            backgroundColor: isActive ? '#495057' : '',
          })}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/schools"
          className="nav-link text-white mb-2"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
            backgroundColor: isActive ? '#495057' : '',
          })}
        >
          Manage Schools
        </NavLink>
        <NavLink
          to="/teacher"
          className="nav-link text-white mb-2"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
            backgroundColor: isActive ? '#495057' : '',
          })}
        >
          Manage Educators
        </NavLink>
        <NavLink
          to="/student"
          className="nav-link text-white mb-2"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
            backgroundColor: isActive ? '#495057' : '',
          })}
        >
          Manage Students
        </NavLink>
        <NavLink
          to="/resources"
          className="nav-link text-white mb-2"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
            backgroundColor: isActive ? '#495057' : '',
          })}
        >
          Resource Management
        </NavLink>
        <NavLink
          to="/settings"
          className="nav-link text-white mb-2"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
            backgroundColor: isActive ? '#495057' : '',
          })}
        >
          Settings
        </NavLink>
        <NavLink
          to="/logout"
          className="nav-link text-white mt-5"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
            backgroundColor: isActive ? '#495057' : '',
          })}
        >
          Logout
        </NavLink>
      </nav>
    </div>
  )
}

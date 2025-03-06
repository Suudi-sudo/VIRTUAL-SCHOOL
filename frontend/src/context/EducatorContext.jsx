import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceContext = createContext();

export const useAttendance = () => useContext(AttendanceContext);

export const AttendanceProvider = ({ children }) => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAttendance = async (page = 1) => {
        try {
            const response = await axios.get(`/attendance?page=${page}`);
            setAttendance(response.data.attendance);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const markAttendance = async (data) => {
        try {
            const response = await axios.post('/attendance', data);
            fetchAttendance(); // Refresh the list
            return response.data;
        } catch (err) {
            setError(err.message);
        }
    };

    const updateAttendance = async (id, data) => {
        try {
            const response = await axios.put(`/attendance/${id}`, data);
            fetchAttendance(); // Refresh the list
            return response.data;
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteAttendance = async (id) => {
        try {
            await axios.delete(`/attendance/${id}`);
            fetchAttendance(); // Refresh the list
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    return (
        <AttendanceContext.Provider value={{
            attendance,
            loading,
            error,
            fetchAttendance,
            markAttendance,
            updateAttendance,
            deleteAttendance
        }}>
            {children}
        </AttendanceContext.Provider>
    );
};
import { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const API_BASE_URL = "http://localhost:5000"; 

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch Classes
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/classes`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setClasses(data.classes || []);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
      setLoading(false);
    };
    fetchClasses();
  }, []);

  // Fetch Students when a class is selected
  const handleClassSelect = async (classId) => {
    setSelectedClass(classId);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students?class_id=${classId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setStudents(data.students || []);
      setAttendance(
        data.students.reduce((acc, student) => ({ ...acc, [student.id]: "present" }), {})
      );
    } catch (error) {
      console.error("Error fetching students:", error);
    }
    setLoading(false);
  };

  // Handle Attendance Selection
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // Submit Attendance
  const submitAttendance = async () => {
    if (!selectedClass) return;

    setLoading(true);
    try {
      const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
        class_id: selectedClass,
        student_id: studentId,
        status,
        signed_by: "Educator Name", 
      }));

      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(attendanceData),
      });

      if (response.ok) {
        setMessage("✅ Attendance successfully recorded!");
      } else {
        setMessage("❌ Failed to submit attendance.");
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setMessage("❌ Failed to submit attendance.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">📋 Mark Attendance</h1>

        {/* Select Class */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Select a Class:</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleClassSelect(e.target.value)}
            value={selectedClass || ""}
          >
            <option value="" disabled>
              -- Choose Class --
            </option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>

        {/* Student List */}
        {selectedClass && students.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Students in this Class</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                  <span className="text-lg font-medium text-gray-800">{student.name}</span>
                  <div className="flex space-x-3">
                    <button
                      className={`p-3 rounded-full ${attendance[student.id] === "present" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
                      onClick={() => handleAttendanceChange(student.id, "present")}
                    >
                      <FaCheckCircle />
                    </button>
                    <button
                      className={`p-3 rounded-full ${attendance[student.id] === "absent" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"}`}
                      onClick={() => handleAttendanceChange(student.id, "absent")}
                    >
                      <FaTimesCircle />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={submitAttendance}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Attendance"}
            </button>

            {/* Success/Error Message */}
            {message && <p className="mt-3 text-center text-lg font-semibold text-green-600">{message}</p>}
          </div>
        )}

        {/* Loading */}
        {loading && <p className="text-center text-lg font-semibold text-gray-600 mt-4">Loading...</p>}
      </div>
    </div>
  );
};

export default Attendance;

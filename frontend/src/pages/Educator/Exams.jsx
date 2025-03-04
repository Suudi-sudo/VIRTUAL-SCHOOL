import React, { useState, useEffect, useCallback } from "react";

const BASE_URL = "http://127.0.0.1:5000"; // backend URL

function ExamManagementPage() {
  const [exams, setExams] = useState({
    exams: [],
    total: 0,
    pages: 0,
    currentPage: 1,
  });
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingExamId, setEditingExamId] = useState(null);

  // Exam Form Data
  const defaultFormData = {
    class_id: "",
    exam_title: "",
    start_time: "",
    duration_minutes: "",
    status: "scheduled", // Default status
    external_url: "", // Add external_url field
  };
  const [formData, setFormData] = useState(defaultFormData);

  // Quiz Form Data
  const [quizFormData, setQuizFormData] = useState({
    quiz_title: "",
    questions: [],
  });

  // Fetch exams and quizzes
  const fetchExamsAndQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const [examsResponse, quizzesResponse] = await Promise.all([
        fetch(`${BASE_URL}/exams?page=${currentPage}`),
        fetch(`http://127.0.0.1:5000/quizzes`),
      ]);

      if (!examsResponse.ok || !quizzesResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const examsData = await examsResponse.json();
      const quizzesData = await quizzesResponse.json();

      setExams({
        exams: examsData.exams,
        total: examsData.total,
        pages: examsData.pages,
        currentPage: examsData.current_page,
      });
      setQuizzes(quizzesData);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Fetch quiz submissions
  const fetchSubmissions = async (quizId) => {
    try {
      const response = await fetch(`${BASE_URL}/quizzes/${quizId}/submissions`);
      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }
      const data = await response.json();
      console.log("Submissions data:", data); // Debugging: Log the response
      setSubmissions(data.submissions); // Ensure the response contains a "submissions" field
    } catch (err) {
      setError("Failed to load submissions");
      console.error(err);
    }
  };
  useEffect(() => {
    fetchExamsAndQuizzes();
  }, [fetchExamsAndQuizzes]);

  // Handle exam creation
  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const payload = JSON.stringify(formData);
      console.log("Sending Data", payload);

      const response = await fetch(`${BASE_URL}/exams`, {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to create exam");
      }

      setSuccess("Exam created successfully");
      setFormData(defaultFormData);
      fetchExamsAndQuizzes(); // Refresh the exams list
    } catch (err) {
      setError("Failed to create exam");
      console.error(err);
    }
  };

  // Handle exam update
  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/exams/${editingExamId}`, {
        method: "PUT",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to update exam");
      }

      setSuccess("Exam updated successfully");
      setFormData(defaultFormData);
      setEditingExamId(null);
      fetchExamsAndQuizzes(); // Refresh the exams list
    } catch (err) {
      setError("Failed to update exam");
      console.error(err);
    }
  };

  // Combined handler for exam form submission
  const handleSubmit = (e) => {
    if (editingExamId) {
      handleUpdateExam(e); // Update exam if editingExamId is set
    } else {
      handleCreateExam(e); // Create exam if editingExamId is not set
    }
  };

  // Handle exam deletion
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/exams/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete exam");
      }

      setSuccess("Exam deleted successfully");
      fetchExamsAndQuizzes(); // Refresh the exams list
    } catch (err) {
      setError("Failed to delete exam");
      console.error(err);
    }
  };

  // Handle editing an exam
  const handleEdit = (exam) => {
    setFormData({
      class_id: exam.class_id,
      exam_title: exam.exam_title,
      start_time: exam.start_time,
      duration_minutes: exam.duration_minutes,
      status: exam.status,
      external_url: exam.external_url,
    });
    setEditingExamId(exam.id);
  };

  // Quiz Creation Logic
  const handleAddQuestion = () => {
    setQuizFormData({
      ...quizFormData,
      questions: [
        ...quizFormData.questions,
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
      ],
    });
  };

  const handleQuizInputChange = (e, questionIndex, optionIndex = null) => {
    const { name, value } = e.target;
    const updatedQuestions = [...quizFormData.questions];

    if (name === "question") {
      // Update the question text
      updatedQuestions[questionIndex].question = value;
    } else if (name === "option") {
      // Update the specific option
      updatedQuestions[questionIndex].options[optionIndex] = value;
    } else if (name === "correctAnswer") {
      // Update the correct answer
      updatedQuestions[questionIndex].correctAnswer = parseInt(value, 10);
    }

    setQuizFormData({ ...quizFormData, questions: updatedQuestions });
  };

  const handleCreateQuiz = async () => {
    // Prepare the payload
    const payload = {
      quiz_title: quizFormData.quiz_title,
      class_id: 1, // Replace with the actual class ID or fetch it dynamically
      questions: quizFormData.questions.map((q) => ({
        question: q.question,
        options: q.options, // Ensure this is an array of 4 options
        correctAnswer: q.correctAnswer, // Ensure this is a number (index of the correct option)
      })),
    };
  
    console.log("Sending payload:", payload); // Debugging: Log the payload
  
    try {
      const response = await fetch(`${BASE_URL}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response from the server
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error}`);
      }
  
      const data = await response.json();
      console.log("Quiz created:", data);
      setSuccess("Quiz created successfully");
      setQuizFormData({ quiz_title: "", questions: [] }); // Reset form
      fetchExamsAndQuizzes(); // Refresh the quizzes list
    } catch (error) {
      setError(`Failed to create quiz: ${error.message}`);
      console.error("Error:", error);
    }
  };

  // Render loading state
  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  // Render error state
  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  return (

    <div
    className="position-relative min-vh-100"
    style={{
      background:
        'url("https://via.placeholder.com/1500") center center / cover no-repeat',
    }}
        >
    <div className="container mt-5">
      <h1 className="text-center mb-4">Exam  Management</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Exam Creation/Update Form */}
      <form onSubmit={handleSubmit} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <h3 className="text-white">Random External Exams</h3>
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Class ID"
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3 text-white">
            <input
              type="text"
              className="form-control"
              placeholder="Exam Title"
              value={formData.exam_title}
              onChange={(e) => setFormData({ ...formData, exam_title: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="datetime-local"
              className="form-control"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Duration (minutes)"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="External URL (optional)"
              value={formData.external_url}
              onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          {editingExamId ? "Update Exam" : "Create Exam"}
        </button>
        {editingExamId && (
          <button
            type="button"
            className="btn btn-secondary mt-3 ms-2"
            onClick={() => {
              setFormData(defaultFormData);
              setEditingExamId(null);
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* Quiz Creation Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleCreateQuiz(); }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <h3 className="text-white">Create Exam</h3>
        <div className="mb-3 text-white">
          <input
            type="text"
            className="form-control"
            placeholder="Quiz Title"
            value={quizFormData.quiz_title}
            onChange={(e) => setQuizFormData({ ...quizFormData, quiz_title: e.target.value })}
            required
          />
        </div>
        {quizFormData.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="mb-3">
            {/* Question Input */}
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Question"
              name="question"
              value={question.question}
              onChange={(e) => handleQuizInputChange(e, questionIndex)}
              required
            />

            {/* Options Input */}
            {question.options.map((option, optionIndex) => (
              <input
                key={optionIndex}
                type="text"
                className="form-control mb-2"
                placeholder={`Option ${optionIndex + 1}`}
                name="option"
                value={option}
                onChange={(e) => handleQuizInputChange(e, questionIndex, optionIndex)}
                required
              />
            ))}

            {/* Correct Answer Dropdown */}
            <select
              className="form-select"
              name="correctAnswer"
              value={question.correctAnswer}
              onChange={(e) => handleQuizInputChange(e, questionIndex)}
              required
            >
              <option value="">Select Correct Answer</option>
              {question.options.map((_, index) => (
                <option key={index} value={index}>
                  Option {index + 1}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button type="button" className="btn btn-secondary mb-3" onClick={handleAddQuestion}>
          Add Question
        </button>
        <button type="submit" className="btn btn-primary">
          Create Exam
        </button>
      </form>

      {/* Quizzes List for Students */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <h3 className="text-white">Available Exams</h3>
        <ul className="list-group">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="list-group-item d-flex justify-content-between align-items-center">
              {quiz.quiz_title}
              <button className="btn btn-primary" onClick={() => fetchSubmissions(quiz.id)}>
                View Submissions
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Submissions Section */}
      {submissions.length > 0 && (
        <div className="card p-4 mb-4">
          <h3>Submissions for {submissions[0].quiz_title}</h3>
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Answers</th>
                <th>Score</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.student_id}>
                  <td>{submission.student_id}</td>
                  <td>{JSON.stringify(submission.answers)}</td>
                  <td>{submission.score}</td>
                  <td>{new Date(submission.submitted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Exams Table */}
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Class ID</th>
            <th>Exam Title</th>
            <th>Start Time</th>
            <th>Duration (minutes)</th>
            <th>Status</th>
            <th>External URL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.exams.map((exam) => (
            <tr key={exam.id}>
              <td>{exam.id}</td>
              <td>{exam.class_id}</td>
              <td>{exam.exam_title}</td>
              <td>{new Date(exam.start_time).toLocaleString()}</td>
              <td>{exam.duration_minutes}</td>
              <td>{exam.status}</td>
              <td>
                {exam.external_url ? (
                  <a href={exam.external_url} target="_blank" rel="noopener noreferrer">
                    Open Exam
                  </a>
                ) : (
                  "No link provided"
                )}
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleEdit(exam)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(exam.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <nav>
        <ul className="pagination">
          {Array.from({ length: exams.pages }, (_, i) => (
            <li
              key={i + 1}
              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
    </div>
  );
}

export default ExamManagementPage;
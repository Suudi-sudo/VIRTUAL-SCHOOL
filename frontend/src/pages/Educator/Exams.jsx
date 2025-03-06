import React, { useState, useEffect, useCallback } from "react";

const BASE_URL = "http://127.0.0.1:5000"; // Backend URL

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
      const token = localStorage.getItem("token"); // Get the JWT token from local storage
      const [examsResponse, quizzesResponse] = await Promise.all([
        fetch(`${BASE_URL}/exams?page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        }),
        fetch(`${BASE_URL}/quizzes`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        }),
      ]);

      if (!examsResponse.ok || !quizzesResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const examsData = await examsResponse.json();
      const quizzesData = await quizzesResponse.json();

      // Ensure exams are filtered by the user's school_id
      const user = JSON.parse(localStorage.getItem("user")); // Get user details from local storage
      const filteredExams = examsData.exams.filter((exam) => exam.school_id === user.school_id);

      setExams({
        exams: filteredExams,
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
      const token = localStorage.getItem("token"); // Get the JWT token from local storage
      const response = await fetch(`${BASE_URL}/quizzes/${quizId}/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      });
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
      const token = localStorage.getItem("token"); // Get the JWT token from local storage
      const user = JSON.parse(localStorage.getItem("user")); // Get user details from local storage

      // Ensure the exam is created for the user's school
      const payload = {
        ...formData,
        school_id: user.school_id, // Add school_id to the payload
      };

      console.log("Sending Data", payload);

      const response = await fetch(`${BASE_URL}/exams`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
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
      const token = localStorage.getItem("token"); // Get the JWT token from local storage
      const user = JSON.parse(localStorage.getItem("user")); // Get user details from local storage

      // Ensure the exam belongs to the user's school before updating
      const exam = exams.exams.find((exam) => exam.id === editingExamId);
      if (!exam || exam.school_id !== user.school_id) {
        throw new Error("Unauthorized to update this exam");
      }

      const response = await fetch(`${BASE_URL}/exams/${editingExamId}`, {
        method: "PUT",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
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
      const token = localStorage.getItem("token"); // Get the JWT token from local storage
      const user = JSON.parse(localStorage.getItem("user")); // Get user details from local storage

      // Ensure the exam belongs to the user's school before deleting
      const exam = exams.exams.find((exam) => exam.id === id);
      if (!exam || exam.school_id !== user.school_id) {
        throw new Error("Unauthorized to delete this exam");
      }

      const response = await fetch(`${BASE_URL}/exams/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
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
      updatedQuestions[questionIndex].question = value;
    } else if (name === "option") {
      updatedQuestions[questionIndex].options[optionIndex] = value;
    } else if (name === "correctAnswer") {
      updatedQuestions[questionIndex].correctAnswer = parseInt(value, 10);
    }

    setQuizFormData({ ...quizFormData, questions: updatedQuestions });
  };

  const handleCreateQuiz = async () => {
    // Validate quiz title
    if (!quizFormData.quiz_title.trim()) {
      setError("Quiz title is required");
      return;
    }

    // Validate questions
    if (quizFormData.questions.length === 0) {
      setError("At least one question is required");
      return;
    }

    // Validate each question
    for (let i = 0; i < quizFormData.questions.length; i++) {
      const question = quizFormData.questions[i];
      if (!question.question.trim()) {
        setError(`Question ${i + 1} text is required`);
        return;
      }
      if (question.options.some(option => !option.trim())) {
        setError(`All options for question ${i + 1} are required`);
        return;
      }
      if (question.correctAnswer === "") {
        setError(`Correct answer for question ${i + 1} is required`);
        return;
      }
    }

    const payload = {
      quiz_title: quizFormData.quiz_title,
      class_id: 1, // Replace with the actual class ID or fetch it dynamically
      questions: quizFormData.questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    };

    console.log("Sending payload:", payload); // Debugging: Log the payload

    try {
      const token = localStorage.getItem("token"); // Get the JWT token from local storage
      const response = await fetch(`${BASE_URL}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
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
        background: 'url("https://via.placeholder.com/1500") center center / cover no-repeat',
      }}
    >
      <div className="container mt-5">
        <h1 className="text-center mb-4">Exam Management</h1>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Exam Creation/Update Form */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card-header">
            <h3 className="text-white">Random External Exams</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
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
                <div className="col-md-3">
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
          </div>
        </div>

        {/* Quiz Creation Form */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card-header">
            <h3 className="text-white">Create Exam</h3>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => { e.preventDefault(); handleCreateQuiz(); }}>
              <div className="mb-3">
                <input
                  type="text-white"
                  className="form-control"
                  placeholder="Quiz Title"
                  value={quizFormData.quiz_title}
                  onChange={(e) => setQuizFormData({ ...quizFormData, quiz_title: e.target.value })}
                  required
                />
              </div>
              {quizFormData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="mb-3">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Question"
                    name="question"
                    value={question.question}
                    onChange={(e) => handleQuizInputChange(e, questionIndex)}
                    required
                  />
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
          </div>
        </div>

        {/* Quizzes List for Students */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card-header">
            <h3>Available Exams</h3>
          </div>
          <div className="card-body">
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
        </div>

        {/* Submissions Section */}
        {submissions.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="card-header">
              <h3>Submissions for {submissions[0].quiz_title}</h3>
            </div>
            <div className="card-body">
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
          </div>
        )}

        {/* Exams Table */}
        <div className="card mb-4">
          <div className="card-header">
            <h3>Exams</h3>
          </div>
          <div className="card-body">
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
          </div>
        </div>

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
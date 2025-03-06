import React, { useState, useEffect, useCallback } from "react";

function StudentActions() {
  const [exams, setExams] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [studentId, setStudentId] = useState(1); // Hardcoded student ID for testing
  const [quizSubmissions, setQuizSubmissions] = useState([]); // Store quiz submissions

  // Fetch exams and quizzes
  const fetchExamsAndQuizzes = useCallback(async () => {
    try {
      setLoading(true);

      // 1) Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        // If there's no token, you can't call protected endpoints
        setError("No token found. Please login first.");
        return;
      }

      // 2) Make the requests with the Authorization header
      const [examsResponse, quizzesResponse] = await Promise.all([
        fetch("https://virtual-school-2.onrender.com/exams", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("https://virtual-school-2.onrender.com/quizzes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!examsResponse.ok || !quizzesResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      // 3) Parse JSON
      const examsData = await examsResponse.json();
      // Note: Your /exams route returns { exams, total, pages, current_page }
      // so we'll assume the array is at examsData.exams
      setExams(examsData.exams);

      const quizzesData = await quizzesResponse.json();
      // /quizzes returns a list ( array ) of quizzes directly
      setQuizzes(quizzesData);
    } catch (err) {
      console.error(err);
      setError("Failed to load data: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch quiz submissions for the student
  const fetchQuizSubmissions = useCallback(async (quizId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login first.");
        return;
      }

      // Provide the Authorization header here, too
      const response = await fetch(`https://virtual-school-2.onrender.com/quizzes/${quizId}/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch quiz submissions");
      }
      const data = await response.json();
      setQuizSubmissions(data.submissions);
    } catch (err) {
      console.error(err);
      setError("Failed to load quiz submissions: " + err.message);
    }
  }, []);

  useEffect(() => {
    fetchExamsAndQuizzes();
  }, [fetchExamsAndQuizzes]);

  // Handle taking a quiz
  const handleTakeQuiz = async (quiz) => {
    // First, fetch the existing submissions for this quiz
    await fetchQuizSubmissions(quiz.id);

    // Check if the student has already submitted this quiz
    const hasSubmitted = quizSubmissions.some(
      (submission) => submission.quiz_id === quiz.id && submission.student_id === studentId
    );

    if (hasSubmitted) {
      alert("You have already submitted this quiz.");
      return;
    }

    setSelectedQuiz(quiz);
    setStudentAnswers(new Array(quiz.questions.length).fill(""));

    // Add tab switching and page leave detection
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  };

  // Handle answer change
  const handleAnswerChange = (questionIndex, value) => {
    const updatedAnswers = [...studentAnswers];
    updatedAnswers[questionIndex] = parseInt(value, 10); // Ensure answers are integers
    setStudentAnswers(updatedAnswers);
  };

  // Handle quiz submission
  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return;
    try {
      // Check if the student has already submitted
      const hasSubmitted = quizSubmissions.some(
        (submission) =>
          submission.quiz_id === selectedQuiz.id && submission.student_id === studentId
      );
      if (hasSubmitted) {
        throw new Error("You have already submitted this quiz.");
      }

      // Transform studentAnswers into { question_id: optionIndex }
      const formattedAnswers = selectedQuiz.questions.reduce((acc, question, index) => {
        acc[question.id] = studentAnswers[index]; // Key: question.id, Value: selected option index
        return acc;
      }, {});

      const payload = {
        student_id: studentId,
        answers: formattedAnswers,
      };

      // Include the Authorization header on POST as well
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login first.");
        return;
      }

      const response = await fetch(
        `https://virtual-school-2.onrender.com/quizzes/${selectedQuiz.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit quiz");
      }

      const result = await response.json();
      alert(`Quiz submitted! Your score: ${result.score}/${selectedQuiz.questions.length}`);
      setSelectedQuiz(null);

      // Refresh quiz submissions for this quiz
      fetchQuizSubmissions(selectedQuiz.id);

      // Remove event listeners
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit quiz");
    }
  };

  // Handle beforeunload event (page refresh or close)
  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = "Are you sure you want to leave? Your progress may be lost.";
  };

  // Handle visibilitychange event (tab switching)
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      alert("You have switched tabs. Please return to the quiz.");
    }
  };

  // Cleanup event listeners on component unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // ExamLink Component
  const ExamLink = ({ externalUrl }) => {
    const [isOpened, setIsOpened] = useState(false);

    const handleClick = () => {
      setIsOpened(true); // Once clicked, change color and text permanently
    };

    return externalUrl ? (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        style={{
          color: isOpened ? "green" : "red", // Red before click, green after
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        {isOpened ? "Opened" : "Open Exam"}
      </a>
    ) : (
      "No link provided"
    );
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
    <div className="container mt-5">
      <h1 className="text-center mb-4">Student Dashboard</h1>

      {/* Exams Section */}
      <section className="mb-5">
        <h2>Exams</h2>
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
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.id}</td>
                <td>{exam.class_id}</td>
                <td>{exam.exam_title}</td>
                <td>{new Date(exam.start_time).toLocaleString()}</td>
                <td>{exam.duration_minutes}</td>
                <td>{exam.status}</td>
                <td>
                  {/* 
                    If your backend actually provides exam.external_url,
                    show <ExamLink>, otherwise you can omit or adapt this 
                  */}
                  <ExamLink externalUrl={exam.external_url} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Quizzes Section */}
      <section className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <h2 className="text-white">EXAM</h2>
        <ul className="list-group">
          {quizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {quiz.quiz_title}
              <button
                className="btn btn-primary"
                onClick={() => handleTakeQuiz(quiz)}
              >
                Take exam
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Quiz Taking Section (Modal) */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <h3 className="text-white">Taking Quiz: {selectedQuiz.quiz_title}</h3>
            {selectedQuiz.questions.map((question, qIndex) => (
              <div key={question.id} className="mb-3">
                <p>{question.question}</p>
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="form-check text-white">
                    <input
                      type="radio"
                      className="form-check-input"
                      name={`question-${qIndex}`}
                      value={optIndex}
                      onChange={(e) =>
                        handleAnswerChange(qIndex, e.target.value)
                      }
                    />
                    <label className="form-check-label">{option}</label>
                  </div>
                ))}
              </div>
            ))}
            <button className="btn btn-success" onClick={handleSubmitQuiz}>
              Submit Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz Submissions Section */}
      <section className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <h2>Your Quiz Submissions</h2>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Quiz Title</th>
              <th>Score</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {quizSubmissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.quiz_title}</td>
                <td>{submission.score}</td>
                <td>{new Date(submission.submitted_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default StudentActions;

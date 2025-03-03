from flask import request, jsonify, Blueprint
from datetime import datetime
import json
from models import db, Quiz, QuizQuestion, QuizSubmission

quiz_bp = Blueprint("quiz_bp", __name__)

@quiz_bp.route("/quizzes", methods=["POST"])
def create_quiz():
    """Create a new quiz."""
    data = request.get_json()
    quiz_title = data.get("quiz_title")
    class_id = data.get("class_id")
    questions = data.get("questions")  # List of questions with options and correct answers

    if not quiz_title or not class_id or not questions:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Create the quiz
        quiz = Quiz(quiz_title=quiz_title, class_id=class_id)
        db.session.add(quiz)
        db.session.commit()

        # Add questions to the quiz
        for question_data in questions:
            question = QuizQuestion(
                quiz_id=quiz.id,
                question=question_data["question"],
                option_1=question_data["options"][0],
                option_2=question_data["options"][1],
                option_3=question_data["options"][2],
                option_4=question_data["options"][3],
                correct_answer=question_data["correctAnswer"],
            )
            db.session.add(question)

        db.session.commit()
        return jsonify({"message": "Quiz created successfully", "quiz_id": quiz.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@quiz_bp.route("/quizzes", methods=["GET"])
def get_all_quizzes():
    """Get all quizzes."""
    try:
        quizzes = Quiz.query.all()
        quiz_list = []
        for quiz in quizzes:
            quiz_data = {
                "id": quiz.id,
                "quiz_title": quiz.quiz_title,
                "class_id": quiz.class_id,
                "created_at": quiz.created_at.isoformat(),
                "questions": [
                    {
                        "id": question.id,
                        "question": question.question,
                        "options": [
                            question.option_1,
                            question.option_2,
                            question.option_3,
                            question.option_4,
                        ],
                        "correct_answer": question.correct_answer,
                    }
                    for question in quiz.questions
                ],
            }
            quiz_list.append(quiz_data)
        return jsonify(quiz_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@quiz_bp.route("/quizzes/<int:quiz_id>", methods=["GET"])
def get_quiz(quiz_id):
    """Get a specific quiz with its questions."""
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    questions = []
    for question in quiz.questions:
        question_data = {
            "id": question.id,
            "question": question.question,
            "options": [question.option_1, question.option_2, question.option_3, question.option_4],
            "correct_answer": question.correct_answer,
        }
        questions.append(question_data)

    quiz_data = {
        "id": quiz.id,
        "quiz_title": quiz.quiz_title,
        "created_at": quiz.created_at.isoformat(),
        "questions": questions,
    }
    return jsonify(quiz_data), 200

@quiz_bp.route("/quizzes/<int:quiz_id>/submissions", methods=["GET"])
def get_quiz_submissions(quiz_id):
    """Get all submissions for a specific quiz."""
    try:
        submissions = QuizSubmission.query.filter_by(quiz_id=quiz_id).all()
        submission_list = []
        for submission in submissions:
            submission_list.append({
                "id": submission.id,
                "student_id": submission.student_id,
                "quiz_id": submission.quiz_id,
                "score": submission.score,
                "submitted_at": submission.submitted_at.isoformat(),
                "answers": json.loads(submission.answers_json),
            })
        return jsonify({"submissions": submission_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@quiz_bp.route("/quizzes/submitted", methods=["GET"])
def get_all_submitted_quizzes():
    """Get all submitted quizzes for educators."""
    try:
        submissions = QuizSubmission.query.all()
        submission_list = []
        for submission in submissions:
            quiz = Quiz.query.get(submission.quiz_id)
            submission_list.append({
                "id": submission.id,
                "quiz_id": submission.quiz_id,
                "quiz_title": quiz.quiz_title,
                "student_id": submission.student_id,
                "score": submission.score,
                "submitted_at": submission.submitted_at.isoformat(),
                "answers": json.loads(submission.answers_json),
            })
        return jsonify({"submissions": submission_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@quiz_bp.route("/quizzes/<int:quiz_id>/submit", methods=["POST"])
def submit_quiz(quiz_id):
    """Submit a quiz and calculate the score."""
    try:
        data = request.get_json()
        print("Received data:", data)  # Log the incoming data

        student_id = data.get("student_id")
        answers = data.get("answers")  # This should be a dictionary of {question_id: selected_option}

        if not student_id or not answers:
            return jsonify({"error": "Missing student_id or answers"}), 400

        print("Answers received:", answers)  # Log the answers dictionary

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404

        questions = QuizQuestion.query.filter_by(quiz_id=quiz_id).all()
        
        score = 0
        total_questions = len(questions)

        for question in questions:
            correct_answer = question.correct_answer
            selected_answer = answers.get(str(question.id))  # Get the selected answer for this question

            if selected_answer and selected_answer == correct_answer:
                score += 1  

        submission = QuizSubmission(
            student_id=student_id,
            quiz_id=quiz_id,
            score=score,
            submitted_at=datetime.utcnow(),
            answers_json=json.dumps(answers),  # Store the answers as JSON
        )
        db.session.add(submission)
        db.session.commit()

        return jsonify({"message": "Quiz submitted successfully", "score": score, "total": total_questions}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in submit_quiz: {str(e)}")  # Log the error
        return jsonify({"error": str(e)}), 500
from difflib import SequenceMatcher
from models import ExamSubmission

def check_plagiarism(exam_id, new_code):
    """Checks how similar the submitted code is to past submissions for the same exam."""
    
    past_submissions = ExamSubmission.query.filter_by(exam_id=exam_id).all()
    
    if not past_submissions:
        return 0  # No past submissions, so no plagiarism detected

    highest_score = 0

    for submission in past_submissions:
        similarity = SequenceMatcher(None, new_code, submission.code).ratio()
        plagiarism_score = round(similarity * 100)  # Convert to percentage

        if plagiarism_score > highest_score:
            highest_score = plagiarism_score

    return highest_score  # Return the highest plagiarism score found

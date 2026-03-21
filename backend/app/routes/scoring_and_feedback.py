from flask import Blueprint, request, jsonify
from app.services.scoring_and_feedback import grade_complete_solution

scoring_and_feedback_bp = Blueprint('scoring_and_feedback', __name__)

@scoring_and_feedback_bp.route('/score-and-feedback', methods=['POST'])
def score_and_feedback():
    data = request.get_json()
    data = data["Data"]
    question_data = data["question"]
    print(question_data)
    marks = data["marks"]
    print(marks)
    difficulty = data["difficulty"]
    print(difficulty)
    solution_steps = data["solution"]
    print(solution_steps)
    final = grade_complete_solution(question_data, solution_steps, marks, difficulty)
    print(final)
    response_data = {
        "question_data": question_data,
        "difficulty_level": difficulty,
        "step_evaluations": final["step_evaluations"],
        "total_marks_awarded": final["total_marks_awarded"],
        "final_verdict": final["final_verdict"],
        "total_marks": final["total_marks"]
    }
    print(response_data)
    return jsonify(response_data)

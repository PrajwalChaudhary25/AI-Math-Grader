from flask import Blueprint, request, jsonify
from app.utils.latex_preprocessing_utils import latex_to_steps 
from app.services.symbolic_reasoning_module import check_steps
from app.utils.latex_preprocessing_utils import extract_question
from app.utils.latex_preprocessing_utils import extract_marks
preprocessing_bp = Blueprint('preprocessing', __name__)

@preprocessing_bp.route('/preprocess', methods=['POST'])
def preprocess_data():
    data = request.get_json()
    latex = data.get("latex", "") if data else ""
    # Add preprocessing logic here
    steps = latex_to_steps(latex)
    question = extract_question(latex)
    other_details = extract_marks(question)
    marks = other_details["marks"]
    difficulty_level = other_details["level"]
    print(steps)
    result = check_steps(steps)
    print("solution",result)
    return jsonify({'success': True, 'steps': result, 'question': question, 'marks': marks, 'difficulty': difficulty_level})

    
    
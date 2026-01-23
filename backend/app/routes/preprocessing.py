from flask import Blueprint, request, jsonify
from app.utils.latex_preprocessing_utils import latex_to_steps 
from app.services.symbolic_reasoning_module import check_steps
preprocessing_bp = Blueprint('preprocessing', __name__)

@preprocessing_bp.route('/preprocess', methods=['POST'])
def preprocess_data():
    data = request.get_json()
    latex = data.get("latex", "") if data else ""
    # Add preprocessing logic here
    steps = latex_to_steps(latex)
    # print(steps)
    result = check_steps(steps)
    print("solution",result)
    return jsonify({'success': True, 'steps': result})

    
    
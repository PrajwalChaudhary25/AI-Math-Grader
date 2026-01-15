from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os

from app.services.mathpix_service import convert_image_to_latex
from app.utils.file_utils import clear_uploads
from app.extensions import get_mathpix_client

latex_bp = Blueprint('latex', __name__)

@latex_bp.route('/convert_to_latex', methods=['POST'])
def convert_to_latex():
    client = get_mathpix_client()
    if client is None:
        return jsonify({'success': False, 'error': 'Mathpix not configured'}), 500

    clear_uploads(current_app.config['UPLOAD_FOLDER'])
    results = {}

    if 'file' in request.files:
        file = request.files['file']
        filename = secure_filename(file.filename)
        path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(path)

        results['file'] = convert_image_to_latex(
            client, path, filename, current_app.config['CACHE_FOLDER']
        )

    elif 'question' in request.files and 'answer' in request.files:
        for key in ['question', 'answer']:
            file = request.files[key]
            filename = secure_filename(file.filename)
            path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(path)

            results[key] = convert_image_to_latex(
                client, path, filename, current_app.config['CACHE_FOLDER']
            )
    else:
        return jsonify({'success': False, 'error': 'No files received'}), 400

    return jsonify({'success': True, 'results': results})

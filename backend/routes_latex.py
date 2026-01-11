from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os

from config import UPLOAD_FOLDER
from utils import clear_uploads
from mathpix import convert_image_to_latex

latex_routes = Blueprint("latex_routes", __name__)

@latex_routes.route("/convert_to_latex", methods=["POST"])
def convert_file():
    clear_uploads()
    results = {}

    if not request.files:
        return jsonify({"success": False, "error": "No files received"}), 400

    for key, file in request.files.items():
        filename = secure_filename(file.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(path)
        results[key] = convert_image_to_latex(path, filename)

    return jsonify({"success": True, "results": results})

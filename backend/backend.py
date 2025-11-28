from flask import Flask, request, render_template, send_from_directory, redirect, url_for
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Clear uploads folder
def clear_uploads():
    for filename in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# Upload route (POST only)
@app.route('/upload', methods=['POST'])
def upload_file():
    # Clear old uploaded files
    clear_uploads()
    
    uploaded_files = []

    # Single file
    if 'file' in request.files:
        file = request.files['file']
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        uploaded_files.append(filename)

    # Multiple files
    elif 'question' in request.files and 'answer' in request.files:
        for key in ['question', 'answer']:
            file = request.files[key]
            filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            uploaded_files.append(filename)

    else:
        return "No files received", 400

    # Redirect to display route after upload
    return redirect(url_for('display_uploaded'))


@app.route('/display')
def display_uploaded():
    # List all files in uploads folder
    uploaded_files = os.listdir(UPLOAD_FOLDER)
    return render_template('display.html', files=uploaded_files)

if __name__ == '__main__':
    app.run(debug=True)


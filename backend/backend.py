from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
from dotenv import load_dotenv
from mpxpy.mathpix_client import MathpixClient
import os
import json
from pathlib import Path


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
CACHE_FOLDER = 'mathpix_responses'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CACHE_FOLDER, exist_ok=True)


load_dotenv()
# Loading environment variables
Mathpix_App_ID = os.getenv('Mathpix_App_ID')
Mathpix_App_Key = os.getenv('Mathpix_App_Key')

# Initialize Mathpix Client
try:
    mathpix_client = MathpixClient(
        app_id=Mathpix_App_ID, 
        app_key=Mathpix_App_Key)
except Exception as e:
    print("Error initializing MathpixClient:", e)
    mathpix_client = None
    
    
    
# convert to LaTeX
@app.route('/convert_to_latex', methods=['POST'])
def convert_file():
    if mathpix_client is None:
        return jsonify({'success': False, 'error': 'Mathpix client not configured.'}), 500

    clear_uploads()
    
    results = {}

    # Single file
    if 'file' in request.files:
        file = request.files['file']
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Convert single file
        latex_result = convert_image_to_latex(filepath, filename)
        results['file'] = latex_result
        
    # Multiple files (question + answer)
    elif 'question' in request.files and 'answer' in request.files:
        for key in ['question', 'answer']:
            file = request.files[key]
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Convert each file
            latex_result = convert_image_to_latex(filepath, filename)
            results[key] = latex_result
    else:
        return jsonify({'success': False, 'error': 'No files received'}), 400
    
    # Return all results
    return jsonify({
        'success': True,
        'results': results
    })


# Helper function to convert a single image to LaTeX
def convert_image_to_latex(filepath, filename):
    """Convert an image file to LaTeX using Mathpix API with caching."""
    
    cache_path = Path(CACHE_FOLDER) / (filename + '.json')
    
    def extract_latex(obj):
        """Recursively search the API response for a LaTeX string.
        Prefer 'latex_styled', then 'latex', then 'text'."""
        if obj is None:
            return None
        if isinstance(obj, dict):
            if 'latex_styled' in obj and obj['latex_styled']:
                return obj['latex_styled']
            if 'latex' in obj and obj['latex']:
                return obj['latex']
            if 'text' in obj and obj['text']:
                return obj['text']
            for v in obj.values():
                res = extract_latex(v)
                if res:
                    return res
            return None
        if isinstance(obj, list):
            for item in obj:
                res = extract_latex(item)
                if res:
                    return res
            return None
        # primitives
        return None
    
    # --- 1. Check Cache ---
    if cache_path.exists():
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                cached_response = json.load(f)
            
            print(f"Returning cached response for: {filename}")
            latex_from_cache = extract_latex(cached_response) or 'Conversion Error'
            return {
                'success': True, 
                'source': 'cache',
                'latex': latex_from_cache
            }
            
        except Exception as e:
            print(f"Error reading cache file {filename}.json: {e}. Proceeding with API call.")

    # --- 2. API Call (If cache miss or error) ---
    print(f"Cache MISS. Calling Mathpix API for: {filename}")
    
    try:
        with open(filepath, 'rb') as f:
            image_data = f.read()
        
        # Call the Mathpix API to convert the image to LaTeX
        api_result = mathpix_client.image_new(
            file_path=filepath,
            formats=['latex_styled', 'text']
        )
        
        # --- 3. Store Response in Cache ---
        # The Mathpix client may return objects that are not JSON serializable
        # (e.g. Image objects). Sanitize the response recursively into only
        # JSON-serializable types before caching.
        def sanitize(obj):
            if isinstance(obj, dict):
                return {k: sanitize(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [sanitize(v) for v in obj]
            if isinstance(obj, (str, int, float, bool)) or obj is None:
                return obj
            # Prefer explicit to_dict if available
            if hasattr(obj, 'to_dict') and callable(getattr(obj, 'to_dict')):
                try:
                    return sanitize(obj.to_dict())
                except Exception:
                    return str(obj)
            # Fallback to __dict__ for objects
            if hasattr(obj, '__dict__'):
                try:
                    return sanitize(vars(obj))
                except Exception:
                    return str(obj)
            # Last resort: convert to string
            try:
                return str(obj)
            except Exception:
                return None

        serializable_result = sanitize(api_result)
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(serializable_result, f, indent=4)
            
        # Extract LaTeX from the sanitized response safely
        latex_output = extract_latex(serializable_result) or 'Conversion Error'
        
        return {
            'success': True, 
            'source': 'api',
            'latex': latex_output
        }
        
    except Exception as e:
        return {
            'success': False, 
            'error': f'Mathpix API Error: {str(e)}'
        } 
    
    
# Clear uploads folder
def clear_uploads():
    for filename in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.isfile(file_path):
            try:
                os.remove(file_path)
            except PermissionError:
                # File is in use by another process (Windows); skip it and log a warning
                print(f"Warning: Could not delete {file_path} because it is in use. Skipping.")
            except OSError as e:
                # Generic OS error while deleting; skip and log
                print(f"Warning: Error deleting {file_path}: {e}. Skipping.")

if __name__ == '__main__':
    app.run(debug=True)


import json
from pathlib import Path
from mpxpy.mathpix_client import MathpixClient
from config import CACHE_FOLDER, Mathpix_App_ID, Mathpix_App_Key

# Initialize Mathpix Client
try:
    mathpix_client = MathpixClient(
        app_id=Mathpix_App_ID, 
        app_key=Mathpix_App_Key)
except Exception as e:
    print("Error initializing MathpixClient:", e)
    mathpix_client = None
    
    
def extract_latex(obj):
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
    if isinstance(obj, list):
        for i in obj:
            res = extract_latex(i)
            if res:
                return res
    return None

def sanitize(obj):
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize(v) for v in obj]
    if isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
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


def convert_image_to_latex(filepath, filename):
    cache_path = Path(CACHE_FOLDER) / f"{filename}.json"

    # Cache hit
    if cache_path.exists():
        with open(cache_path, "r", encoding="utf-8") as f:
            cached = json.load(f)
        return {
            "success": True,
            "source": "cache",
            "latex": extract_latex(cached)
        }

    if not mathpix_client:
        return {"success": False, "error": "Mathpix not configured"}

    # API call
    api_result = mathpix_client.image_new(
        file_path=filepath,
        formats=["latex_styled", "text"],
        options_json={
        "math_inline_delimiters": ["\\(", "\\)"],
        "math_display_delimiters": ["\\[", "\\]"]
        },
        idiomatic_eqn_arrays=True
    )

    clean = sanitize(api_result)
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(clean, f, indent=4)

    return {
        "success": True,
        "source": "api",
        "latex": extract_latex(clean)
    }
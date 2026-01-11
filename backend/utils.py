import os
from config import UPLOAD_FOLDER

def clear_uploads():
    for f in os.listdir(UPLOAD_FOLDER):
        path = os.path.join(UPLOAD_FOLDER, f)
        if os.path.isfile(path):
            try:
                os.remove(path)
            except Exception as e:
                print(f"Could not delete {path}: {e}")
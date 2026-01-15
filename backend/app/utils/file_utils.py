import os

def clear_uploads(folder):
    for f in os.listdir(folder):
        path = os.path.join(folder, f)
        if os.path.isfile(path):
            try:
                os.remove(path)
            except Exception as e:
                print(f"Warning: {e}")

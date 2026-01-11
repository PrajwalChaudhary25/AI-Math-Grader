import os
from dotenv import load_dotenv


UPLOAD_FOLDER = 'uploads'
CACHE_FOLDER = 'mathpix_responses'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CACHE_FOLDER, exist_ok=True)


load_dotenv()
# Loading environment variables
Mathpix_App_ID = os.getenv('Mathpix_App_ID')
Mathpix_App_Key = os.getenv('Mathpix_App_Key')
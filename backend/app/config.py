'''
configuration settings for the application
includes paths for uploads and cache
as well as Mathpix API credentials
'''
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    UPLOAD_FOLDER = 'uploads'
    CACHE_FOLDER = 'mathpix_responses'

    MATHPIX_APP_ID = os.getenv('Mathpix_App_ID')
    MATHPIX_APP_KEY = os.getenv('Mathpix_App_Key')
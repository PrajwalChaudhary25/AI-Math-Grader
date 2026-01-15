'''
This code is for intializing client for using mathpix services
It is an service outside of our system provided by mathpix.com
hence included in extensions for modularity
'''
from flask_cors import CORS
from mpxpy.mathpix_client import MathpixClient
from flask import current_app

cors = CORS()

def get_mathpix_client():
    try:
        return MathpixClient(
            app_id=current_app.config['MATHPIX_APP_ID'],
            app_key=current_app.config['MATHPIX_APP_KEY']
        )
    except Exception as e:
        print("Mathpix init error:", e)
        return None
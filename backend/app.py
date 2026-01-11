from flask import Flask
from flask_cors import CORS
from routes_latex import latex_routes

app = Flask(__name__)
CORS(app)

app.register_blueprint(latex_routes)


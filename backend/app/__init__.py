from flask import Flask
from app.config import Config
from app.extensions import cors
from app.routes.latex import latex_bp
from app.routes.preprocessing import preprocessing_bp
from app.routes.scoring_and_feedback import scoring_and_feedback_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    cors.init_app(app)

    app.register_blueprint(latex_bp)
    app.register_blueprint(preprocessing_bp)
    app.register_blueprint(scoring_and_feedback_bp)

    return app
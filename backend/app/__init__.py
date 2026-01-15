from flask import Flask
from app.config import Config
from app.extensions import cors
from app.routes.latex import latex_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    cors.init_app(app)

    app.register_blueprint(latex_bp)

    return app
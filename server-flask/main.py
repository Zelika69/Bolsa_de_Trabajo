from flask import Flask, jsonify, g
from flask_cors import CORS
from routes.main_routes import main_bp
from conexion.conexion import get_db_connection

app = Flask(__name__)
CORS(app) # Habilitar CORS para toda la aplicación

app.register_blueprint(main_bp)

@app.before_request
def before_request():
    g.db = get_db_connection()

@app.teardown_request
def teardown_request(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()

if __name__ == '__main__':
    app.run(debug=True)

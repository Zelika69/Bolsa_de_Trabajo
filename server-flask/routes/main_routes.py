from flask import Blueprint, jsonify, g

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    # Ahora puedes acceder a la conexión a través de g.db
    # Ejemplo de cómo usarla (asegúrate de manejar errores y cerrar cursores)
    if g.db:
        cursor = g.db.cursor()
        cursor.execute("SELECT GETDATE() AS CurrentDateTime") # Ejemplo de consulta
        result = cursor.fetchone()
        cursor.close()
        return jsonify({"mensaje": f"Hola desde Flask! Hora actual: {result[0]}"})
    else:
        return jsonify({"mensaje": "Hola desde Flask! (Sin conexión a DB)"})

@main_bp.route('/index')
def index():
    return jsonify({"mensaje": "Bienvenido a la página de índice!"})

@main_bp.route('/about')
def about():
    return jsonify({"mensaje": "Esta es la página de Acerca de."})
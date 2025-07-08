from flask import Flask, request, jsonify
from flask_cors import CORS
from src.conexion import obtener_conexion
from sqlalchemy import text

app = Flask(__name__)
CORS(app)

@app.route('/insertar_vacante', methods=['POST'])
def insertar_vacante():
    data = request.json
    try:
        conn = obtener_conexion()
        query = text("""
    INSERT INTO Vacantes (
        ID_Empresa, Titulo_puesto, Descripcion, Requisitos, Salario,
        Tipo_Contrato, Ubicacion, Fecha_Publicacion, Fecha_Cierre
    ) VALUES (
        :ID_Empresa, :Titulo_puesto, :Descripcion, :Requisitos, :Salario,
        :Tipo_Contrato, :Ubicacion, :Fecha_Publicacion, :Fecha_Cierre
    )
""")
        conn.execute(query, {
            "ID_Empresa": data['ID_Empresa'],
            "Titulo_puesto": data['Titulo_puesto'],
            "Descripcion": data['Descripcion'],
            "Requisitos": data['Requisitos'],
            "Salario": data['Salario'],
            "Tipo_Contrato": data['Tipo_Contrato'],
            "Ubicacion": data['Ubicacion'],
            "Fecha_Publicacion": data['Fecha_Publicacion'],
            "Fecha_Cierre": data['Fecha_Cierre']
        })
        conn.commit()
        conn.close()
        return jsonify({"message": "Vacante insertada correctamente"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/empresas', methods=['POST'])
def insertar_empresa():
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        query = text("""
            INSERT INTO Empresa (
                ID_Usuario, Nombre, RFC, Direccion, Telefono, Descripcion
            ) VALUES (
                :ID_Usuario, :Nombre, :RFC, :Direccion, :Telefono, :Descripcion
            )
        """)
        conn.execute(query, {
            "ID_Usuario": data['idUsuario'],
            "Nombre": data['nombre'],
            "RFC": data['rfc'],
            "Direccion": data['direccion'],
            "Telefono": data['telefono'],
            "Descripcion": data['descripcion']
        })
        conn.commit()
        return jsonify({"message": "Empresa insertada correctamente"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True)

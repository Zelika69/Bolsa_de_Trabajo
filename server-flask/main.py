from flask import Flask, request, jsonify
from flask_cors import CORS
from src.conexion import obtener_conexion
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

app = Flask(__name__)
CORS(app)

@app.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    conn = None
    try:
        conn = obtener_conexion()
        query = text("SELECT ID, NombreUsuario FROM Usuario")
        result = conn.execute(query)
        usuarios = [{"ID": row.ID, "NombreUsuario": row.NombreUsuario} for row in result]
        return jsonify(usuarios), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/empresas', methods=['GET'])
def obtener_empresas():
    conn = None
    try:
        conn = obtener_conexion()
        query = text("SELECT ID, Nombre FROM Empresa ORDER BY ID ASC")
        result = conn.execute(query)
        empresas = [{"ID": row.ID, "Nombre": row.Nombre} for row in result]
        return jsonify(empresas), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/insertar_vacante', methods=['POST'])
def insertar_vacante():
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        query = text("""
            INSERT INTO Vacantes (
                ID_Empresa, Titulo_puesto, Descripcion, Requisitos, Salario,
                Tipo_Contrato, Ubicacion, Fecha_Publicacion, Fecha_Cierre, Estado, CantidadPostulaciones
            ) VALUES (
                :ID_Empresa, :Titulo_puesto, :Descripcion, :Requisitos, :Salario,
                :Tipo_Contrato, :Ubicacion, :Fecha_Publicacion, :Fecha_Cierre, :Estado, :CantidadPostulaciones
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
            "Fecha_Cierre": data['Fecha_Cierre'],
            "Estado": data.get('Estado', 'Abierta'),
            "CantidadPostulaciones": data.get('CantidadPostulaciones', 0)
        })
        conn.commit()
        return jsonify({"message": "Vacante insertada correctamente"}), 201
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/empresas', methods=['POST'])
def insertar_empresa():
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        
        # Verificar si el usuario ya tiene una empresa
        check_query = text("SELECT 1 FROM Empresa WHERE ID_Usuario = :ID_Usuario")
        result = conn.execute(check_query, {"ID_Usuario": data['idUsuario']}).fetchone()
        
        if result:
            return jsonify({"error": "El usuario ya tiene una empresa registrada"}), 400
        
        # Si no existe, proceder con la inserción
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
        return jsonify({"message": "Empresa registrada correctamente"}), 201
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
            
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
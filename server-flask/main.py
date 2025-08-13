from flask import Flask, request, jsonify
from flask_cors import CORS
from src.conexion import obtener_conexion
from flask_bcrypt import Bcrypt
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.utils import secure_filename
import secrets
import time
import os
import uuid

app = Flask(__name__, static_folder='src/static')
bcrypt = Bcrypt(app)

# Configurar la carpeta de uploads
UPLOAD_FOLDER = os.path.join('src', 'static', 'files')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configuración de CORS mejorada para permitir conexiones desde múltiples dispositivos
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # En desarrollo, permitir todos los orígenes
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    },
    r"/static/*": {
        "origins": ["*"]
    }
})

# ========== RUTAS DE ARCHIVOS ESTÁTICOS ==========
@app.route('/static/<path:filename>')
def serve_static_file(filename):
    """Servir archivos estáticos como CVs"""
    try:
        return app.send_static_file(filename)
    except Exception as e:
        return jsonify({"error": "Archivo no encontrado"}), 404

@app.route('/files/<path:filename>')
def serve_files(filename):
    """Servir archivos desde /files/ redirigiendo a /static/files/"""
    try:
        return app.send_static_file(f'files/{filename}')
    except Exception as e:
        return jsonify({"error": "Archivo no encontrado"}), 404

# ========== RUTAS DE USUARIOS ==========
@app.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    conn = None
    try:
        conn = obtener_conexion()
        query = text("SELECT ID, NombreUsuario FROM Usuario WHERE eliminado = 0")
        result = conn.execute(query)
        usuarios = [{"ID": row.ID, "NombreUsuario": row.NombreUsuario} for row in result]
        return jsonify(usuarios), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/usuarios/<int:usuario_id>', methods=['GET'])
def obtener_usuario_por_id(usuario_id):
    conn = None
    try:
        conn = obtener_conexion()
        query = text("SELECT ID, NombreUsuario, Correo, ROL, RutaImagen FROM Usuario WHERE ID = :usuario_id AND eliminado = 0")
        result = conn.execute(query, {"usuario_id": usuario_id}).fetchone()
        
        if not result:
            return jsonify({"error": "Usuario no encontrado"}), 404
            
        usuario = {
            "id": result.ID,
            "nombreUsuario": result.NombreUsuario,
            "correo": result.Correo,
            "rol": result.ROL,
            "rutaImagen": result.RutaImagen
        }
        return jsonify(usuario), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== RUTAS DE EMPRESAS ==========
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

# ========== RUTAS DE VACANTES ==========
# Obtener todas las vacantes (público)
@app.route('/api/vacantes', methods=['GET'])
def obtener_todas_vacantes():
    conn = None
    try:
        conn = obtener_conexion()
        query = text("""
            SELECT 
                V.ID,
                V.Titulo_puesto,
                V.Descripcion,
                V.Requisitos,
                V.Salario,
                V.Tipo_Contrato,
                V.Ubicacion,
                V.Fecha_Publicacion,
                V.Fecha_Cierre,
                V.Estado,
                V.CantidadPostulaciones,
                V.Destacada,
                E.Nombre AS NombreEmpresa
            FROM Vacantes V
            JOIN Empresa E ON V.ID_Empresa = E.ID
            WHERE V.Estado = 'Abierta' AND V.eliminado = 0
            ORDER BY V.Fecha_Publicacion DESC
        """)
        result = conn.execute(query)
        vacantes = [{
            "id": row.ID,
            "titulo": row.Titulo_puesto,
            "descripcion": row.Descripcion,
            "requisitos": row.Requisitos,
            "salario": row.Salario,
            "tipoContrato": row.Tipo_Contrato,
            "ubicacion": row.Ubicacion,
            "fechaPublicacion": row.Fecha_Publicacion.isoformat() if row.Fecha_Publicacion else None,
            "fechaCierre": row.Fecha_Cierre.isoformat() if row.Fecha_Cierre else None,
            "estado": row.Estado,
            "cantidadPostulaciones": row.CantidadPostulaciones,
            "destacada": bool(row.Destacada),
            "nombreEmpresa": row.NombreEmpresa
        } for row in result]
        return jsonify(vacantes), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Obtener vacantes de una empresa específica
@app.route('/api/empresa/<int:user_id>/vacantes', methods=['GET'])
def obtener_vacantes_empresa(user_id):
    conn = None
    try:
        conn = obtener_conexion()
        # Primero obtener el ID de la empresa
        empresa_query = text("SELECT ID FROM Empresa WHERE ID_Usuario = :user_id")
        empresa_result = conn.execute(empresa_query, {"user_id": user_id}).fetchone()
        
        if not empresa_result:
            return jsonify({"error": "Empresa no encontrada"}), 404
        
        empresa_id = empresa_result.ID
        
        # Obtener vacantes de la empresa (solo las no eliminadas)
        query = text("""
            SELECT 
                ID,
                Titulo_puesto,
                Descripcion,
                Requisitos,
                Salario,
                Tipo_Contrato,
                Ubicacion,
                Fecha_Publicacion,
                Fecha_Cierre,
                Estado,
                CantidadPostulaciones
            FROM Vacantes
            WHERE ID_Empresa = :empresa_id AND eliminado = 0
            ORDER BY Fecha_Publicacion DESC
        """)
        result = conn.execute(query, {"empresa_id": empresa_id})
        vacantes = [{
            "id": row.ID,
            "titulo": row.Titulo_puesto,
            "descripcion": row.Descripcion,
            "requisitos": row.Requisitos,
            "salario": row.Salario,
            "tipoContrato": row.Tipo_Contrato,
            "ubicacion": row.Ubicacion,
            "fechaPublicacion": row.Fecha_Publicacion.isoformat() if row.Fecha_Publicacion else None,
            "fechaCierre": row.Fecha_Cierre.isoformat() if row.Fecha_Cierre else None,
            "estado": row.Estado,
            "cantidadPostulaciones": row.CantidadPostulaciones
        } for row in result]
        return jsonify(vacantes), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Crear nueva vacante
@app.route('/api/empresa/<int:user_id>/vacantes', methods=['POST'])
def crear_vacante(user_id):
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        # Verificar que la empresa existe
        empresa_query = text("SELECT ID FROM Empresa WHERE ID_Usuario = :user_id")
        empresa_result = conn.execute(empresa_query, {"user_id": user_id}).fetchone()
        
        if not empresa_result:
            return jsonify({"error": "Empresa no encontrada"}), 404
        
        empresa_id = empresa_result.ID
        
        # Insertar nueva vacante
        query = text("""
            INSERT INTO Vacantes (
                ID_Empresa, Titulo_puesto, Descripcion, Requisitos, Salario,
                Tipo_Contrato, Ubicacion, Fecha_Publicacion, Fecha_Cierre, Estado, CantidadPostulaciones
            ) VALUES (
                :ID_Empresa, :Titulo_puesto, :Descripcion, :Requisitos, :Salario,
                :Tipo_Contrato, :Ubicacion, GETDATE(), :Fecha_Cierre, :Estado, 0
            )
        """)
        conn.execute(query, {
            "ID_Empresa": empresa_id,
            "Titulo_puesto": data['titulo'],
            "Descripcion": data['descripcion'],
            "Requisitos": data['requisitos'],
            "Salario": data['salario'],
            "Tipo_Contrato": data['tipoContrato'],
            "Ubicacion": data['ubicacion'],
            "Fecha_Cierre": data.get('fechaCierre'),
            "Estado": data.get('estado', 'Abierta')
        })
        conn.commit()
        return jsonify({"message": "Vacante creada correctamente"}), 201
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Obtener una vacante específica de la empresa
@app.route('/api/empresa/<int:user_id>/vacantes/<int:vacante_id>', methods=['GET'])
def obtener_vacante_empresa(user_id, vacante_id):
    conn = None
    try:
        conn = obtener_conexion()
        # Verificar que la vacante pertenece a la empresa del usuario y no está eliminada
        query = text("""
            SELECT 
                V.ID,
                V.Titulo_puesto,
                V.Descripcion,
                V.Requisitos,
                V.Salario,
                V.Tipo_Contrato,
                V.Ubicacion,
                V.Fecha_Publicacion,
                V.Fecha_Cierre,
                V.Estado,
                V.CantidadPostulaciones
            FROM Vacantes V
            JOIN Empresa E ON V.ID_Empresa = E.ID
            WHERE V.ID = :vacante_id AND E.ID_Usuario = :user_id AND V.eliminado = 0
        """)
        result = conn.execute(query, {"vacante_id": vacante_id, "user_id": user_id}).fetchone()
        
        if not result:
            return jsonify({"error": "Vacante no encontrada o no autorizada"}), 404
        
        vacante = {
            "id": result.ID,
            "titulo": result.Titulo_puesto,
            "descripcion": result.Descripcion,
            "requisitos": result.Requisitos,
            "salario": result.Salario,
            "tipoContrato": result.Tipo_Contrato,
            "ubicacion": result.Ubicacion,
            "fechaPublicacion": result.Fecha_Publicacion.isoformat() if result.Fecha_Publicacion else None,
            "fechaCierre": result.Fecha_Cierre.isoformat() if result.Fecha_Cierre else None,
            "estado": result.Estado,
            "cantidadPostulaciones": result.CantidadPostulaciones
        }
        return jsonify(vacante), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Actualizar vacante
@app.route('/api/empresa/<int:user_id>/vacantes/<int:vacante_id>', methods=['PUT'])
def actualizar_vacante(user_id, vacante_id):
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        # Verificar que la vacante pertenece a la empresa del usuario y no está eliminada
        verificar_query = text("""
            SELECT V.ID FROM Vacantes V
            JOIN Empresa E ON V.ID_Empresa = E.ID
            WHERE V.ID = :vacante_id AND E.ID_Usuario = :user_id AND V.eliminado = 0
        """)
        verificar_result = conn.execute(verificar_query, {"vacante_id": vacante_id, "user_id": user_id}).fetchone()
        
        if not verificar_result:
            return jsonify({"error": "Vacante no encontrada o no autorizada"}), 404
        
        # Actualizar vacante
        query = text("""
            UPDATE Vacantes SET
                Titulo_puesto = :titulo,
                Descripcion = :descripcion,
                Requisitos = :requisitos,
                Salario = :salario,
                Tipo_Contrato = :tipoContrato,
                Ubicacion = :ubicacion,
                Fecha_Cierre = :fechaCierre,
                Estado = :estado
            WHERE ID = :vacante_id
        """)
        conn.execute(query, {
            "titulo": data['titulo'],
            "descripcion": data['descripcion'],
            "requisitos": data['requisitos'],
            "salario": data['salario'],
            "tipoContrato": data['tipoContrato'],
            "ubicacion": data['ubicacion'],
            "fechaCierre": data.get('fechaCierre'),
            "estado": data.get('estado', 'Abierta'),
            "vacante_id": vacante_id
        })
        conn.commit()
        return jsonify({"message": "Vacante actualizada correctamente"}), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Eliminar vacante
@app.route('/api/empresa/<int:user_id>/vacantes/<int:vacante_id>', methods=['DELETE'])
def eliminar_vacante(user_id, vacante_id):
    conn = None
    try:
        conn = obtener_conexion()
        # Verificar que la vacante pertenece a la empresa del usuario y no está eliminada
        verificar_query = text("""
            SELECT V.ID FROM Vacantes V
            JOIN Empresa E ON V.ID_Empresa = E.ID
            WHERE V.ID = :vacante_id AND E.ID_Usuario = :user_id AND V.eliminado = 0
        """)
        verificar_result = conn.execute(verificar_query, {"vacante_id": vacante_id, "user_id": user_id}).fetchone()
        
        if not verificar_result:
            return jsonify({"error": "Vacante no encontrada, no autorizada o ya está eliminada"}), 404
        
        # Realizar soft delete - marcar como eliminada
        query = text("UPDATE Vacantes SET eliminado = 1 WHERE ID = :vacante_id")
        conn.execute(query, {"vacante_id": vacante_id})
        conn.commit()
        return jsonify({"message": "Vacante eliminada correctamente"}), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Endpoint legacy para compatibilidad
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

# ========== AUTENTICACIÓN ==========
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        
        # Buscar usuario por nombre de usuario o correo (solo usuarios activos)
        query = text("""
            SELECT ID, NombreUsuario, Correo, Contrasena, ROL, RutaImagen 
            FROM Usuario 
            WHERE (NombreUsuario = :usuario OR Correo = :usuario) AND eliminado = 0
        """)
        result = conn.execute(query, {"usuario": data['usuario']}).fetchone()
        
        if not result:
            return jsonify({"error": "Usuario no encontrado"}), 401
        
        # Verificar contraseña (texto plano)
        if not bcrypt.check_password_hash(result.Contrasena, data['contrasena']):
            return jsonify({"error": "Contraseña incorrecta"}), 401
        
        # Mapear roles de la base de datos a roles del frontend
        role_mapping = {
            'ADMINISTRADOR': 'admin',
            'CANDIDATO': 'user',
            'EMPRESA': 'recruiter'
        }
        
        frontend_role = role_mapping.get(result.ROL, 'user')
        
        # Generar código 2FA (simulado)
        codigo_2fa = str(secrets.randbelow(900000) + 100000)  # Código de 6 dígitos
        
        # En un entorno real, aquí enviarías el código por SMS/email
        # Para desarrollo, devolvemos el código
        return jsonify({
            "message": "Código 2FA enviado",
            "requiere2FA": True,
            "codigo_desarrollo": codigo_2fa,  # Solo para desarrollo
            "usuario_id": result.ID,
            "usuario": result.NombreUsuario,
            "rol": frontend_role
        }), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/verify-2fa', methods=['POST'])
def verify_2fa():
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        
        # Obtener información del usuario
        query = text("""
            SELECT ID, NombreUsuario, Correo, ROL, RutaImagen 
            FROM Usuario 
            WHERE ID = :usuario_id
        """)
        result = conn.execute(query, {"usuario_id": data['usuario_id']}).fetchone()
        
        if not result:
            return jsonify({"error": "Usuario no encontrado"}), 401
        
        # En un entorno real, verificarías el código 2FA aquí
        # Para desarrollo, aceptamos cualquier código de 6 dígitos
        codigo = data.get('codigo', '')
        if len(codigo) != 6 or not codigo.isdigit():
            return jsonify({"error": "Código 2FA inválido"}), 401
        
        # Mapear roles de la base de datos a roles del frontend
        role_mapping = {
            'ADMINISTRADOR': 'admin',
            'CANDIDATO': 'user',
            'EMPRESA': 'recruiter'
        }
        
        frontend_role = role_mapping.get(result.ROL, 'user')
        
        # Login exitoso
        return jsonify({
            "message": "Login exitoso",
            "usuario": {
                "id": result.ID,
                "nombre": result.NombreUsuario,
                "correo": result.Correo,
                "role": frontend_role,
                "rutaImagen": result.RutaImagen
            }
        }), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== REGISTRO ==========
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    conn = None
    trans = None
    try:
        # Validar datos requeridos básicos
        required_fields = ['nombreUsuario', 'correo', 'contrasena']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo requerido: {field}"}), 400
        
        conn = obtener_conexion()
        trans = conn.begin()
        
        # Verificar si el usuario ya existe
        check_query = text("""
            SELECT 1 FROM Usuario 
            WHERE NombreUsuario = :nombre_usuario OR Correo = :correo
        """)
        result = conn.execute(check_query, {
            "nombre_usuario": data['nombreUsuario'],
            "correo": data['correo']
        }).fetchone()
        
        if result:
            trans.rollback()
            return jsonify({"error": "El nombre de usuario o correo ya está registrado"}), 400
        
        # Mapear roles del frontend a la base de datos (opcional)
        role_mapping = {
            'user': 'CANDIDATO',
            'recruiter': 'EMPRESA'
        }
        
        db_role = role_mapping.get(data.get('userType', 'user'), 'CANDIDATO')
        
        # Llamar al procedimiento almacenado sp_RegisterUser
        sp_call = text("""
            EXEC sp_RegisterUser
                @NombreUsuario = :nombre_usuario,
                @Correo = :correo,
                @Contrasena = :contrasena,
                @ROL = :rol,
                @RutaImagen = :ruta_imagen,
                @NombreEmpresa = :nombre_empresa,
                @RFC = :rfc,
                @DireccionEmpresa = :direccion_empresa,
                @TelefonoEmpresa = :telefono_empresa,
                @DescripcionEmpresa = :descripcion_empresa,

                @TelefonoCandidato = :telefono_candidato,
                @DireccionCandidato = :direccion_candidato,
                @CVPath = :cv_path;
        """)

        # Preparar parámetros para el procedimiento almacenado
        params = {
            "nombre_usuario": data['nombreUsuario'],
            "correo": data['correo'],
            "contrasena": bcrypt.generate_password_hash(data['contrasena']).decode('utf-8'),
            "rol": db_role,
            "ruta_imagen": data.get('rutaImagen', None),
            "nombre_empresa": None,
            "rfc": None,
            "direccion_empresa": None,
            "telefono_empresa": None,
            "descripcion_empresa": None,

            "telefono_candidato": None,
            "direccion_candidato": None,
            "cv_path": None
        }

        if db_role == 'EMPRESA':
            # Validar campos requeridos para EMPRESA
            required_company_fields = ['nombreEmpresa', 'telefonoEmpresa']
            for field in required_company_fields:
                if not data.get(field):
                    trans.rollback()
                    return jsonify({"error": f"Campo requerido para EMPRESA: {field}"}), 400

            params['nombre_empresa'] = data.get('nombreEmpresa')
            params['rfc'] = data.get('rfc')
            params['direccion_empresa'] = data.get('direccionEmpresa')
            params['telefono_empresa'] = data.get('telefonoEmpresa')
            params['descripcion_empresa'] = data.get('descripcionEmpresa')
        elif db_role == 'CANDIDATO':
            # Validar campos requeridos para CANDIDATO (ejemplo, ajustar según necesidad)
            required_candidate_fields = ['nombreCandidato', 'apellidoCandidato', 'telefonoCandidato']
            for field in required_candidate_fields:
                if not data.get(field):
                    trans.rollback()
                    return jsonify({"error": f"Campo requerido para CANDIDATO: {field}"}), 400

            params['telefono_candidato'] = data.get('telefonoCandidato')
            params['direccion_candidato'] = data.get('direccionCandidato')
            params['cv_path'] = data.get('cvPath')

        result = conn.execute(sp_call, params)
        new_user_id = result.scalar() # Obtener el ID del nuevo usuario devuelto por el SP

        trans.commit()
        return jsonify({"message": "Usuario registrado correctamente", "userId": new_user_id}), 201

    except SQLAlchemyError as e:
        if trans:
            trans.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== PERFIL DE CANDIDATO ==========
@app.route('/api/candidato/profile/<int:user_id>', methods=['GET'])
def get_candidate_profile(user_id):
    conn = None
    try:
        conn = obtener_conexion()
        query = text("""
            SELECT
                U.ID AS UsuarioID,
                U.NombreUsuario,
                U.Correo,
                U.ROL,
                U.RutaImagen,
                C.ID AS CandidatoID,
                C.Telefono AS TelefonoCandidato,
                C.Dirreccion AS DireccionCandidato,
                C.Educacion,
                C.Experiencia_Laboral,
                C.CV
            FROM Usuario U
            JOIN Candidatos C ON U.ID = C.ID_Usuario
            WHERE U.ID = :user_id AND U.eliminado = 0
        """)
        result = conn.execute(query, {"user_id": user_id}).fetchone()

        if not result:
            return jsonify({"error": "Perfil de candidato no encontrado"}), 404

        profile = {
            "usuarioId": result.UsuarioID,
            "nombreUsuario": result.NombreUsuario,
            "correo": result.Correo,
            "rol": result.ROL,
            "rutaImagen": result.RutaImagen,
            "candidatoId": result.CandidatoID,
            # Campos que espera el frontend ProfileCandidate.jsx
            "telefono": result.TelefonoCandidato,
            "direccion": result.DireccionCandidato,
            "educacion": result.Educacion,
            "experiencia": result.Experiencia_Laboral,
            "cv": result.CV,
            "cv_nombre": os.path.basename(result.CV) if result.CV else None
        }
        return jsonify(profile), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/candidato/profile/<int:user_id>', methods=['PUT'])
def update_candidate_profile(user_id):
    data = request.json
    conn = None
    trans = None
    try:
        conn = obtener_conexion()
        trans = conn.begin()

        # Solo actualizar tabla Candidatos con los datos que envía el frontend
        # Los datos del frontend son: direccion, educacion, experiencia
        update_candidate_query = text("""
            UPDATE Candidatos
            SET Dirreccion = :direccion,
                Educacion = :educacion,
                Experiencia_Laboral = :experiencia
            WHERE ID_Usuario = :user_id
        """)
        conn.execute(update_candidate_query, {
            "direccion": data.get('direccion'),
            "educacion": data.get('educacion'),
            "experiencia": data.get('experiencia'),
            "user_id": user_id
        })

        trans.commit()
        return jsonify({"message": "Perfil de candidato actualizado correctamente"}), 200

    except SQLAlchemyError as e:
        if trans:
            trans.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== SUBIR IMAGEN DE PERFIL ==========
@app.route('/api/usuario/upload-image/<int:user_id>', methods=['POST'])
def upload_profile_image(user_id):
    conn = None
    try:
        # Verificar que el usuario existe
        conn = obtener_conexion()
        usuario_query = text("SELECT ROL FROM Usuario WHERE ID = :user_id AND eliminado = 0")
        usuario_result = conn.execute(usuario_query, {"user_id": user_id}).fetchone()
        
        if not usuario_result:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        # Verificar que se envió un archivo
        if 'image' not in request.files:
            return jsonify({"error": "No se encontró archivo de imagen"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No se seleccionó archivo"}), 400
        
        # Validar tipo de archivo
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({"error": "Tipo de archivo no permitido. Solo se permiten JPG, JPEG, PNG y GIF"}), 400
        
        # Crear nombre único para el archivo
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"user_{user_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
        
        # Determinar directorio según el rol del usuario
        user_role = usuario_result.ROL
        if user_role == 'CANDIDATO':
            folder_name = 'candidato'
        elif user_role == 'EMPRESA':
            folder_name = 'empresa'
        elif user_role == 'ADMINISTRADOR':
            folder_name = 'administrador'
        else:
            folder_name = 'candidato'  # Por defecto
        
        # Crear directorio si no existe
        upload_folder = os.path.join('src', 'static', 'images', folder_name)
        os.makedirs(upload_folder, exist_ok=True)
        
        # Guardar archivo
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        # Actualizar la base de datos con el nombre del archivo (solo el nombre, no la ruta completa)
        update_query = text("""
            UPDATE Usuario 
            SET RutaImagen = :image_name 
            WHERE ID = :user_id
        """)
        
        conn.execute(update_query, {"image_name": unique_filename, "user_id": user_id})
        conn.commit()
        
        return jsonify({
            "message": "Imagen de perfil subida correctamente",
            "filename": unique_filename,
            "path": f"static/images/{folder_name}/{unique_filename}"
        }), 200
        
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": f"Error al subir imagen: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/candidato/upload-cv/<int:user_id>', methods=['POST'])
def upload_cv(user_id):
    conn = None
    try:
        # Verificar que el usuario existe y es un candidato
        conn = obtener_conexion()
        usuario_query = text("SELECT ROL FROM Usuario WHERE ID = :user_id AND eliminado = 0")
        usuario_result = conn.execute(usuario_query, {"user_id": user_id}).fetchone()
        
        if not usuario_result:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        if usuario_result.ROL != 'CANDIDATO':
            return jsonify({"error": "Solo los candidatos pueden subir CV"}), 403
        
        # Verificar que se envió un archivo
        if 'cv' not in request.files:
            return jsonify({"error": "No se encontró archivo CV"}), 400
        
        file = request.files['cv']
        if file.filename == '':
            return jsonify({"error": "No se seleccionó archivo"}), 400
        
        # Validar tipo de archivo
        allowed_extensions = {'pdf', 'doc', 'docx'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({"error": "Tipo de archivo no permitido. Solo se permiten PDF, DOC y DOCX"}), 400
        
        # Crear nombre único para el archivo
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"cv_{user_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
        
        # Crear directorio si no existe
        upload_folder = os.path.join('src', 'static', 'files', 'cv')
        os.makedirs(upload_folder, exist_ok=True)
        
        # Guardar archivo
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        # Actualizar la base de datos con la ruta del CV
        cv_path = f"/static/files/cv/{unique_filename}"
        update_query = text("""
            UPDATE Candidatos 
            SET CV = :cv_path 
            WHERE ID_Usuario = :user_id
        """)
        
        conn.execute(update_query, {"cv_path": cv_path, "user_id": user_id})
        conn.commit()
        
        return jsonify({
            "message": "CV subido correctamente",
            "filename": unique_filename,
            "path": cv_path
        }), 200
        
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": f"Error al subir CV: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

# ========== POSTULACIONES DEL CANDIDATO ==========
@app.route('/api/candidato/<int:user_id>/postulaciones', methods=['GET'])
def get_candidate_applications(user_id):
    conn = None
    try:
        conn = obtener_conexion()
        
        # Verificar que el usuario existe y es un candidato
        usuario_query = text("SELECT ROL FROM Usuario WHERE ID = :user_id AND eliminado = 0")
        usuario_result = conn.execute(usuario_query, {"user_id": user_id}).fetchone()
        
        if not usuario_result:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        if usuario_result.ROL != 'CANDIDATO':
            return jsonify({"error": "Solo los candidatos pueden ver sus postulaciones"}), 403
        
        # Obtener el ID del candidato
        candidato_query = text("SELECT ID FROM Candidatos WHERE ID_Usuario = :user_id")
        candidato_result = conn.execute(candidato_query, {"user_id": user_id}).fetchone()
        
        if not candidato_result:
            return jsonify({"error": "Perfil de candidato no encontrado"}), 404
        
        candidato_id = candidato_result.ID
        
        # Obtener todas las postulaciones del candidato
        query = text("""
            SELECT 
                P.ID as PostulacionID,
                P.Fecha_Publicacion as FechaPostulacion,
                P.Estado as EstadoPostulacion,
                V.ID as VacanteID,
                V.Titulo_puesto as TituloVacante,
                V.Descripcion as DescripcionVacante,
                V.Salario,
                V.Ubicacion,
                V.Tipo_Contrato as TipoEmpleo,
                V.Fecha_publicacion as FechaPublicacionVacante,
                V.Fecha_cierre as FechaCierreVacante,
                E.ID as EmpresaID,
                E.Nombre as NombreEmpresa,
                E.Descripcion as DescripcionEmpresa
            FROM Postulaciones P
            JOIN Vacantes V ON P.ID_Vacante = V.ID
            JOIN Empresa E ON V.ID_Empresa = E.ID
            WHERE P.ID_Candidato = :candidato_id AND V.eliminado = 0
            ORDER BY P.Fecha_Publicacion DESC
        """)
        
        result = conn.execute(query, {"candidato_id": candidato_id})
        postulaciones = [{
            "id": row.PostulacionID,
            "fechaPostulacion": row.FechaPostulacion.isoformat() if row.FechaPostulacion else None,
            "estado": row.EstadoPostulacion,
            "vacante": {
                "id": row.VacanteID,
                "titulo": row.TituloVacante,
                "descripcion": row.DescripcionVacante,
                "salario": float(row.Salario) if row.Salario else 0,
                "ubicacion": row.Ubicacion,
                "tipoEmpleo": row.TipoEmpleo,
                "fechaPublicacion": row.FechaPublicacionVacante.isoformat() if row.FechaPublicacionVacante else None,
                "fechaCierre": row.FechaCierreVacante.isoformat() if row.FechaCierreVacante else None
            },
            "empresa": {
                "id": row.EmpresaID,
                "nombre": row.NombreEmpresa,
                "descripcion": row.DescripcionEmpresa
            }
        } for row in result]
        
        return jsonify(postulaciones), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== PERFIL DE EMPRESA ==========
@app.route('/api/empresa/profile/<int:user_id>', methods=['GET'])
def get_company_profile(user_id):
    conn = None
    try:
        conn = obtener_conexion()
        query = text("""
            SELECT
                U.ID AS UsuarioID,
                U.NombreUsuario,
                U.Correo,
                U.ROL,
                U.RutaImagen,
                E.ID AS EmpresaID,
                E.Nombre AS NombreEmpresa,
                E.RFC,
                E.Direccion AS DireccionEmpresa,
                E.Telefono AS TelefonoEmpresa,
                E.Descripcion AS DescripcionEmpresa
            FROM Usuario U
            JOIN Empresa E ON U.ID = E.ID_Usuario
            WHERE U.ID = :user_id AND U.eliminado = 0
        """)
        result = conn.execute(query, {"user_id": user_id}).fetchone()

        if not result:
            return jsonify({"error": "Perfil de empresa no encontrado"}), 404

        profile = {
            "usuarioId": result.UsuarioID,
            "nombreUsuario": result.NombreUsuario,
            "correo": result.Correo,
            "rol": result.ROL,
            "rutaImagen": result.RutaImagen,
            "empresaId": result.EmpresaID,
            # Campos que espera el frontend ProfileCompany.jsx
            "nombre": result.NombreEmpresa,
            "rfc": result.RFC,
            "direccion": result.DireccionEmpresa,
            "telefono": result.TelefonoEmpresa,
            "descripcion": result.DescripcionEmpresa
        }
        return jsonify(profile), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/empresa/profile/<int:user_id>', methods=['PUT'])
def update_company_profile(user_id):
    data = request.json
    conn = None
    trans = None
    try:
        conn = obtener_conexion()
        trans = conn.begin()

        # Solo actualizar tabla Empresa (no Usuario)
        # Los datos del frontend son: nombre, telefono, rfc, direccion, descripcion
        update_company_query = text("""
            UPDATE Empresa
            SET Nombre = :nombre,
                RFC = :rfc,
                Direccion = :direccion,
                Telefono = :telefono,
                Descripcion = :descripcion
            WHERE ID_Usuario = :user_id
        """)
        conn.execute(update_company_query, {
            "nombre": data.get('nombre'),
            "rfc": data.get('rfc'),
            "direccion": data.get('direccion'),
            "telefono": data.get('telefono'),
            "descripcion": data.get('descripcion'),
            "user_id": user_id
        })

        trans.commit()
        return jsonify({"message": "Perfil de empresa actualizado correctamente"}), 200

    except SQLAlchemyError as e:
        if trans:
            trans.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== VACANTES DESTACADAS AUTOMÁTICAS ==========
@app.route('/api/actualizar-destacadas', methods=['POST'])
def actualizar_vacantes_destacadas():
    conn = None
    try:
        conn = obtener_conexion()
        
        # Primero, quitar todas las destacadas actuales
        conn.execute(text("UPDATE Vacantes SET Destacada = 0"))
        
        # Criterio 1: Las 3 vacantes más recientes
        query_recientes = text("""
            WITH VacantesRecientes AS (
                SELECT TOP 3 ID
                FROM Vacantes
                WHERE Estado = 'Abierta'
                ORDER BY Fecha_Publicacion DESC
            )
            UPDATE Vacantes
            SET Destacada = 1
            WHERE ID IN (SELECT ID FROM VacantesRecientes)
        """)
        conn.execute(query_recientes)
        
        # Criterio 2: Si hay menos de 3, completar con las de mayor salario
        query_salario = text("""
            WITH VacantesAltoSalario AS (
                SELECT TOP 3 ID
                FROM Vacantes
                WHERE Estado = 'Abierta' AND Destacada = 0
                ORDER BY Salario DESC
            )
            UPDATE Vacantes
            SET Destacada = 1
            WHERE ID IN (SELECT ID FROM VacantesAltoSalario)
            AND (SELECT COUNT(*) FROM Vacantes WHERE Destacada = 1) < 3
        """)
        conn.execute(query_salario)
        
        conn.commit()
        return jsonify({"message": "Vacantes destacadas actualizadas exitosamente"}), 200
        
    except SQLAlchemyError as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== POSTULACIONES ==========
# Obtener postulaciones de una empresa
@app.route('/api/empresa/<int:user_id>/postulaciones', methods=['GET'])
def obtener_postulaciones_empresa(user_id):
    conn = None
    try:
        conn = obtener_conexion()
        print(f"Buscando empresa para usuario ID: {user_id}")
        
        # Primero obtener el ID de la empresa
        empresa_query = text("SELECT ID FROM Empresa WHERE ID_Usuario = :user_id")
        empresa_result = conn.execute(empresa_query, {"user_id": user_id}).fetchone()
        
        if not empresa_result:
            print(f"No se encontró empresa para usuario {user_id}")
            # Crear empresa automáticamente si no existe
            crear_empresa_query = text("""
                INSERT INTO Empresa (ID_Usuario, Nombre, Descripcion) 
                VALUES (:user_id, 'Empresa por defecto', 'Empresa creada automáticamente')
            """)
            conn.execute(crear_empresa_query, {"user_id": user_id})
            conn.commit()
            
            # Obtener el ID de la empresa recién creada
            empresa_result = conn.execute(empresa_query, {"user_id": user_id}).fetchone()
            if not empresa_result:
                return jsonify({"error": "Error al crear empresa"}), 500
        
        empresa_id = empresa_result.ID
        
        # Obtener postulaciones con información del candidato y vacante
        query = text("""
            SELECT 
                P.ID as PostulacionID,
                P.Fecha_Publicacion as FechaPostulacion,
                P.Estado as EstadoPostulacion,
                V.ID as VacanteID,
                V.Titulo_puesto as TituloVacante,
                V.Salario,
                V.Ubicacion,
                C.ID as CandidatoID,
                U.NombreUsuario,
                U.Correo,
                U.RutaImagen,
                C.Telefono,
                C.Dirreccion,
                C.CV,
                C.Educacion,
                C.Experiencia_Laboral
            FROM Postulaciones P
            JOIN Vacantes V ON P.ID_Vacante = V.ID
            JOIN Candidatos C ON P.ID_Candidato = C.ID
            JOIN Usuario U ON C.ID_Usuario = U.ID
            WHERE V.ID_Empresa = :empresa_id AND U.eliminado = 0 AND V.eliminado = 0
            ORDER BY P.Fecha_Publicacion DESC
        """)
        result = conn.execute(query, {"empresa_id": empresa_id})
        
        postulaciones = [{
            "id": row.PostulacionID,
            "fechaPostulacion": row.FechaPostulacion.isoformat() if row.FechaPostulacion else None,
            "estado": row.EstadoPostulacion,
            "vacante": {
                "id": row.VacanteID,
                "titulo": row.TituloVacante,
                "salario": row.Salario,
                "ubicacion": row.Ubicacion
            },
            "candidato": {
                "id": row.CandidatoID,
                "nombreUsuario": row.NombreUsuario,
                "correo": row.Correo,
                "telefono": row.Telefono,
                "direccion": row.Dirreccion,
                "cv": row.CV,
                "educacion": row.Educacion,
                "experienciaLaboral": row.Experiencia_Laboral,
                "rutaImagen": row.RutaImagen
            }
        } for row in result]
        
        return jsonify(postulaciones), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Actualizar estado de postulación
@app.route('/api/postulaciones/<int:postulacion_id>', methods=['PUT'])
def actualizar_estado_postulacion(postulacion_id):
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        
        # Verificar que la postulación existe
        verificar_query = text("SELECT ID FROM Postulaciones WHERE ID = :postulacion_id")
        verificar_result = conn.execute(verificar_query, {"postulacion_id": postulacion_id}).fetchone()
        
        if not verificar_result:
            return jsonify({"error": "Postulación no encontrada"}), 404
        
        # Actualizar estado
        query = text("""
            UPDATE Postulaciones 
            SET Estado = :estado 
            WHERE ID = :postulacion_id
        """)
        conn.execute(query, {
            "estado": data['estado'],
            "postulacion_id": postulacion_id
        })
        
        # Si se acepta la postulación, cerrar la vacante
        if data['estado'] == 'Aceptado':
            cerrar_vacante_query = text("""
                UPDATE Vacantes 
                SET Fecha_Cierre = GETDATE(), Estado = 'Cerrada'
                WHERE ID = (SELECT ID_Vacante FROM Postulaciones WHERE ID = :postulacion_id)
            """)
            conn.execute(cerrar_vacante_query, {"postulacion_id": postulacion_id})
        
        conn.commit()
        return jsonify({"message": "Estado de postulación actualizado correctamente"}), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== CREAR POSTULACIÓN ==========
@app.route('/api/postulaciones', methods=['POST'])
def crear_postulacion():
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        
        # Verificar que el usuario existe y es un candidato
        usuario_query = text("SELECT ROL FROM Usuario WHERE ID = :user_id")
        usuario_result = conn.execute(usuario_query, {"user_id": data['userId']}).fetchone()
        
        if not usuario_result:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        if usuario_result.ROL != 'CANDIDATO':
            return jsonify({"error": "Solo los candidatos registrados pueden aplicar a vacantes"}), 403
        
        # Obtener el ID del candidato y verificar que el perfil esté completo
        candidato_query = text("""
            SELECT ID, Telefono, Dirreccion, CV, Educacion, Experiencia_Laboral 
            FROM Candidatos WHERE ID_Usuario = :user_id
        """)
        candidato_result = conn.execute(candidato_query, {"user_id": data['userId']}).fetchone()
        
        if not candidato_result:
            return jsonify({"error": "Perfil de candidato no encontrado. Complete su perfil primero."}), 404
        

        
        candidato_id = candidato_result.ID
        
        # Verificar si ya existe una postulación
        check_query = text("""
            SELECT 1 FROM Postulaciones 
            WHERE ID_Candidato = :candidato_id AND ID_Vacante = :vacante_id
        """)
        existing = conn.execute(check_query, {
            "candidato_id": candidato_id,
            "vacante_id": data['vacanteId']
        }).fetchone()
        
        if existing:
            return jsonify({"error": "Ya te has postulado a esta vacante"}), 400
        
        # Verificar si la vacante existe y está activa
        vacante_query = text("""
            SELECT ID, Fecha_Cierre, Estado FROM Vacantes 
            WHERE ID = :vacante_id AND eliminado = 0
        """)
        vacante_result = conn.execute(vacante_query, {
            "vacante_id": data['vacanteId']
        }).fetchone()
        
        # print(f"DEBUG - Vacante ID: {data['vacanteId']}, Fecha_Cierre: {vacante_result.Fecha_Cierre if vacante_result else 'No encontrada'}, Estado: {vacante_result.Estado if vacante_result else 'No encontrada'}")
        
        if not vacante_result:
            return jsonify({"error": "La vacante no existe"}), 404
            
        # Verificar si la vacante está cerrada por estado o por fecha
        if vacante_result.Estado == 'Cerrada':
            return jsonify({"error": "Esta vacante ya está cerrada"}), 400
            
        # Verificar si la fecha de cierre ya pasó
        if vacante_result.Fecha_Cierre is not None:
            from datetime import datetime
            fecha_actual = datetime.now()
            # print(f"DEBUG - Fecha actual: {fecha_actual}")
            # print(f"DEBUG - Fecha cierre: {vacante_result.Fecha_Cierre}")
            # print(f"DEBUG - Tipo fecha cierre: {type(vacante_result.Fecha_Cierre)}")
            
            # Convertir fecha de cierre a datetime si es necesario
            fecha_cierre = vacante_result.Fecha_Cierre
            if hasattr(fecha_cierre, 'date'):
                # Si es datetime, comparar solo las fechas
                if fecha_cierre.date() < fecha_actual.date():
                    return jsonify({"error": "Esta vacante ya está cerrada por fecha"}), 400
            else:
                # Si es date, convertir fecha actual a date
                if fecha_cierre < fecha_actual.date():
                    return jsonify({"error": "Esta vacante ya está cerrada por fecha"}), 400
        
        # Insertar la postulación
        insert_query = text("""
            INSERT INTO Postulaciones (ID_Candidato, ID_Vacante, Fecha_Publicacion, Estado)
            VALUES (:candidato_id, :vacante_id, GETDATE(), 'Pendiente')
        """)
        conn.execute(insert_query, {
            "candidato_id": candidato_id,
            "vacante_id": data['vacanteId']
        })
        conn.commit()
        
        return jsonify({"message": "Postulación creada correctamente"}), 201
        
    except SQLAlchemyError as e:
        error_msg = str(e)
        # print(f"ERROR SQLAlchemy en crear_postulacion: {error_msg}")
        if "El candidato ya se ha postulado a esta vacante" in error_msg:
            return jsonify({"error": "Ya te has postulado a esta vacante"}), 400
        elif "La vacante está cerrada" in error_msg:
            return jsonify({"error": "Esta vacante ya está cerrada"}), 400
        elif "La vacante no existe" in error_msg:
            return jsonify({"error": "La vacante no existe"}), 404
        else:
            return jsonify({"error": "Error al crear la postulación"}), 500
    except Exception as e:
        # print(f"ERROR Exception en crear_postulacion: {str(e)}")
        # print(f"Tipo de error: {type(e).__name__}")
        # import traceback
        # print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "Error inesperado al crear la postulación"}), 500
    finally:
        if conn:
            conn.close()

# ========== ENDPOINTS DE ADMINISTRACIÓN ==========

# ========== GESTIÓN DE USUARIOS ==========
@app.route('/api/admin/usuarios', methods=['GET'])
def admin_obtener_usuarios():
    conn = None
    try:
        conn = obtener_conexion()
        query = text("""
            SELECT 
                U.ID, 
                U.NombreUsuario, 
                U.Correo, 
                U.ROL, 
                U.RutaImagen,
                U.eliminado,
                CASE 
                    WHEN U.ROL = 'CANDIDATO' THEN C.Telefono
                    WHEN U.ROL = 'EMPRESA' THEN E.Telefono
                    ELSE NULL
                END as Telefono,
                CASE 
                    WHEN U.ROL = 'CANDIDATO' THEN C.Dirreccion
                    WHEN U.ROL = 'EMPRESA' THEN E.Direccion
                    ELSE NULL
                END as Direccion
            FROM Usuario U
            LEFT JOIN Candidatos C ON U.ID = C.ID_Usuario AND U.ROL = 'CANDIDATO'
            LEFT JOIN Empresa E ON U.ID = E.ID_Usuario AND U.ROL = 'EMPRESA'
            ORDER BY U.ID DESC
        """)
        result = conn.execute(query)
        usuarios = [{
            "id": row.ID,
            "nombreUsuario": row.NombreUsuario,
            "correo": row.Correo,
            "rol": row.ROL,
            "rutaImagen": row.RutaImagen,
            "telefono": row.Telefono,
            "direccion": row.Direccion,
            "activo": row.eliminado == 0
        } for row in result]
        return jsonify(usuarios), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/usuarios/<int:usuario_id>', methods=['PUT'])
def admin_actualizar_usuario(usuario_id):
    data = request.json
    conn = None
    trans = None
    try:
        conn = obtener_conexion()
        trans = conn.begin()
        
        # Validar campos requeridos
        required_fields = ['nombreUsuario', 'correo', 'rol']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Campo requerido: {field}"}), 400
        
        # Verificar que el usuario existe
        check_query = text("SELECT ROL FROM Usuario WHERE ID = :usuario_id")
        user_result = conn.execute(check_query, {"usuario_id": usuario_id}).fetchone()
        
        if not user_result:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        old_role = user_result.ROL
        new_role = data['rol']
        
        # Actualizar tabla Usuario
        update_user_query = text("""
            UPDATE Usuario SET
                NombreUsuario = :nombreUsuario,
                Correo = :correo,
                ROL = :rol,
                RutaImagen = :rutaImagen
            WHERE ID = :usuario_id
        """)
        
        conn.execute(update_user_query, {
            "nombreUsuario": data['nombreUsuario'],
            "correo": data['correo'],
            "rol": new_role,
            "rutaImagen": data.get('rutaImagen'),
            "usuario_id": usuario_id
        })
        
        # Si cambió el rol, manejar las tablas relacionadas
        if old_role != new_role:
            # Eliminar registros del rol anterior
            if old_role == 'CANDIDATO':
                conn.execute(text("DELETE FROM Candidatos WHERE ID_Usuario = :usuario_id"), {"usuario_id": usuario_id})
            elif old_role == 'EMPRESA':
                conn.execute(text("DELETE FROM Empresa WHERE ID_Usuario = :usuario_id"), {"usuario_id": usuario_id})
            
            # Crear registro para el nuevo rol
            if new_role == 'CANDIDATO':
                conn.execute(text("""
                    INSERT INTO Candidatos (ID_Usuario, Telefono, Dirreccion, CV, Educacion, Experiencia_Laboral)
                    VALUES (:usuario_id, :telefono, :direccion, NULL, NULL, NULL)
                """), {
                    "usuario_id": usuario_id,
                    "telefono": data.get('telefono', ''),
                    "direccion": data.get('direccion', '')
                })
            elif new_role == 'EMPRESA':
                conn.execute(text("""
                    INSERT INTO Empresa (ID_Usuario, Nombre, RFC, Direccion, Telefono, Descripcion)
                    VALUES (:usuario_id, :nombre, NULL, :direccion, :telefono, NULL)
                """), {
                    "usuario_id": usuario_id,
                    "nombre": data.get('nombreEmpresa', data['nombreUsuario']),
                    "direccion": data.get('direccion', ''),
                    "telefono": data.get('telefono', '')
                })
        else:
            # Actualizar datos específicos del rol actual
            if new_role == 'CANDIDATO':
                conn.execute(text("""
                    UPDATE Candidatos SET
                        Telefono = :telefono,
                        Dirreccion = :direccion
                    WHERE ID_Usuario = :usuario_id
                """), {
                    "telefono": data.get('telefono', ''),
                    "direccion": data.get('direccion', ''),
                    "usuario_id": usuario_id
                })
            elif new_role == 'EMPRESA':
                conn.execute(text("""
                    UPDATE Empresa SET
                        Nombre = :nombre,
                        Direccion = :direccion,
                        Telefono = :telefono
                    WHERE ID_Usuario = :usuario_id
                """), {
                    "nombre": data.get('nombreEmpresa', data['nombreUsuario']),
                    "direccion": data.get('direccion', ''),
                    "telefono": data.get('telefono', ''),
                    "usuario_id": usuario_id
                })
        
        trans.commit()
        return jsonify({"message": "Usuario actualizado correctamente"}), 200
        
    except SQLAlchemyError as e:
        if trans:
            trans.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/usuarios/<int:usuario_id>', methods=['DELETE'])
def admin_eliminar_usuario(usuario_id):
    conn = None
    try:
        conn = obtener_conexion()
        
        # Verificar que el usuario existe y no está ya eliminado
        check_query = text("SELECT ROL FROM Usuario WHERE ID = :usuario_id AND eliminado = 0")
        user_result = conn.execute(check_query, {"usuario_id": usuario_id}).fetchone()
        
        if not user_result:
            return jsonify({"error": "Usuario no encontrado o ya está eliminado"}), 404
        
        # Realizar soft delete - marcar como eliminado
        soft_delete_query = text("UPDATE Usuario SET eliminado = 1 WHERE ID = :usuario_id")
        conn.execute(soft_delete_query, {"usuario_id": usuario_id})
        conn.commit()
        
        return jsonify({"message": "Usuario eliminado correctamente"}), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== GESTIÓN DE VACANTES (ADMIN) ==========
@app.route('/api/admin/vacantes', methods=['GET'])
def admin_obtener_vacantes():
    conn = None
    try:
        conn = obtener_conexion()
        
        # Obtener parámetro para incluir vacantes eliminadas
        incluir_eliminadas = request.args.get('incluir_eliminadas', 'false').lower() == 'true'
        
        # Construir la consulta con o sin filtro de eliminadas
        if incluir_eliminadas:
            where_clause = ""
        else:
            where_clause = "WHERE V.eliminado = 0"
        
        query = text(f"""
            SELECT 
                V.ID,
                V.Titulo_puesto,
                V.Descripcion,
                V.Requisitos,
                V.Salario,
                V.Tipo_Contrato,
                V.Ubicacion,
                V.Fecha_Publicacion,
                V.Fecha_Cierre,
                V.Estado,
                V.CantidadPostulaciones,
                V.eliminado,
                E.Nombre as NombreEmpresa,
                E.ID as EmpresaID
            FROM Vacantes V
            JOIN Empresa E ON V.ID_Empresa = E.ID
            {where_clause}
            ORDER BY V.Fecha_Publicacion DESC
        """)
        result = conn.execute(query)
        vacantes = [{
            "id": row.ID,
            "titulo": row.Titulo_puesto,
            "descripcion": row.Descripcion,
            "requisitos": row.Requisitos,
            "salario": float(row.Salario) if row.Salario else 0,
            "tipoContrato": row.Tipo_Contrato,
            "ubicacion": row.Ubicacion,
            "fechaPublicacion": row.Fecha_Publicacion.isoformat() if row.Fecha_Publicacion else None,
            "fechaCierre": row.Fecha_Cierre.isoformat() if row.Fecha_Cierre else None,
            "estado": row.Estado,
            "cantidadPostulaciones": row.CantidadPostulaciones,
            "eliminado": bool(row.eliminado),
            "nombreEmpresa": row.NombreEmpresa,
            "empresaId": row.EmpresaID
        } for row in result]
        return jsonify(vacantes), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/vacantes', methods=['POST'])
def admin_crear_vacante():
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        
        # Validar campos requeridos
        required_fields = ['titulo', 'descripcion', 'requisitos', 'salario', 'tipoContrato', 'ubicacion', 'empresaId']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Campo requerido: {field}"}), 400
        
        # Verificar que la empresa existe
        empresa_query = text("SELECT ID FROM Empresa WHERE ID = :empresa_id")
        empresa_result = conn.execute(empresa_query, {"empresa_id": data['empresaId']}).fetchone()
        
        if not empresa_result:
            return jsonify({"error": "Empresa no encontrada"}), 404
        
        # Insertar nueva vacante
        query = text("""
            INSERT INTO Vacantes (
                ID_Empresa, Titulo_puesto, Descripcion, Requisitos, Salario,
                Tipo_Contrato, Ubicacion, Fecha_Publicacion, Fecha_Cierre, Estado, CantidadPostulaciones
            ) VALUES (
                :ID_Empresa, :Titulo_puesto, :Descripcion, :Requisitos, :Salario,
                :Tipo_Contrato, :Ubicacion, GETDATE(), :Fecha_Cierre, :Estado, 0
            )
        """)
        
        conn.execute(query, {
            "ID_Empresa": data['empresaId'],
            "Titulo_puesto": data['titulo'],
            "Descripcion": data['descripcion'],
            "Requisitos": data['requisitos'],
            "Salario": data['salario'],
            "Tipo_Contrato": data['tipoContrato'],
            "Ubicacion": data['ubicacion'],
            "Fecha_Cierre": data.get('fechaCierre'),
            "Estado": data.get('estado', 'Abierta')
        })
        
        conn.commit()
        return jsonify({"message": "Vacante creada correctamente"}), 201
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/vacantes/<int:vacante_id>', methods=['PUT'])
def admin_actualizar_vacante(vacante_id):
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        
        # Validar campos requeridos
        required_fields = ['titulo', 'descripcion', 'requisitos', 'salario', 'tipoContrato', 'ubicacion']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Campo requerido: {field}"}), 400
        
        # Verificar que la vacante existe
        check_query = text("SELECT ID FROM Vacantes WHERE ID = :vacante_id")
        vacante_result = conn.execute(check_query, {"vacante_id": vacante_id}).fetchone()
        
        if not vacante_result:
            return jsonify({"error": "Vacante no encontrada"}), 404
        
        # Actualizar vacante
        query = text("""
            UPDATE Vacantes SET
                Titulo_puesto = :titulo,
                Descripcion = :descripcion,
                Requisitos = :requisitos,
                Salario = :salario,
                Tipo_Contrato = :tipoContrato,
                Ubicacion = :ubicacion,
                Fecha_Cierre = :fechaCierre,
                Estado = :estado,
                eliminado = :eliminado
            WHERE ID = :vacante_id
        """)
        
        conn.execute(query, {
            "titulo": data['titulo'],
            "descripcion": data['descripcion'],
            "requisitos": data['requisitos'],
            "salario": data['salario'],
            "tipoContrato": data['tipoContrato'],
            "ubicacion": data['ubicacion'],
            "fechaCierre": data.get('fechaCierre'),
            "estado": data.get('estado', 'Abierta'),
            "eliminado": 1 if data.get('eliminado', False) else 0,
            "vacante_id": vacante_id
        })
        
        conn.commit()
        return jsonify({"message": "Vacante actualizada correctamente"}), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/vacantes/<int:vacante_id>', methods=['DELETE'])
def admin_eliminar_vacante(vacante_id):
    conn = None
    try:
        conn = obtener_conexion()
        
        # Verificar que la vacante existe y no está ya eliminada
        check_query = text("SELECT ID FROM Vacantes WHERE ID = :vacante_id AND eliminado = 0")
        vacante_result = conn.execute(check_query, {"vacante_id": vacante_id}).fetchone()
        
        if not vacante_result:
            return jsonify({"error": "Vacante no encontrada o ya está eliminada"}), 404
        
        # Realizar soft delete - marcar como eliminada
        soft_delete_query = text("UPDATE Vacantes SET eliminado = 1 WHERE ID = :vacante_id")
        conn.execute(soft_delete_query, {"vacante_id": vacante_id})
        conn.commit()
        
        return jsonify({"message": "Vacante eliminada correctamente"}), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== GESTIÓN DE CANDIDATOS (ADMIN) ==========
@app.route('/api/admin/candidatos', methods=['GET'])
def admin_obtener_candidatos():
    conn = None
    try:
        conn = obtener_conexion()
        query = text("""
            SELECT 
                C.ID,
                C.Telefono,
                C.Dirreccion,
                C.CV,
                C.Educacion,
                C.Experiencia_Laboral,
                U.NombreUsuario,
                U.Correo,
                U.ID as UsuarioID,
                U.RutaImagen,
                U.eliminado
            FROM Candidatos C
            JOIN Usuario U ON C.ID_Usuario = U.ID
            ORDER BY C.ID DESC
        """)
        result = conn.execute(query)
        candidatos = [{
            "id": row.ID,
            "telefono": row.Telefono,
            "dirreccion": row.Dirreccion,  # Corregido para coincidir con frontend
            "cv": row.CV,
            "educacion": row.Educacion,
            "experiencia_laboral": row.Experiencia_Laboral,  # Corregido para coincidir con frontend
            "nombreUsuario": row.NombreUsuario,
            "correo": row.Correo,
            "usuarioId": row.UsuarioID,
            "rutaImagen": row.RutaImagen,
            "eliminado": row.eliminado  # Cambiado de 'activo' a 'eliminado' para coincidir con frontend
        } for row in result]
        return jsonify(candidatos), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/candidatos/<int:candidato_id>', methods=['PUT'])
def admin_actualizar_candidato(candidato_id):
    data = request.json
    conn = None
    trans = None
    try:
        conn = obtener_conexion()
        trans = conn.begin()
        
        # Obtener el ID del usuario asociado al candidato
        candidato_query = text("SELECT ID_Usuario FROM Candidatos WHERE ID = :candidato_id")
        candidato_result = conn.execute(candidato_query, {"candidato_id": candidato_id}).fetchone()
        
        if not candidato_result:
            return jsonify({"error": "Candidato no encontrado"}), 404
        
        usuario_id = candidato_result.ID_Usuario
        
        # Actualizar datos del usuario (solo campos editables)
        update_usuario_query = text("""
            UPDATE Usuario 
            SET NombreUsuario = :nombre_usuario,
                eliminado = :eliminado
            WHERE ID = :usuario_id
        """)
        conn.execute(update_usuario_query, {
            "nombre_usuario": data.get('nombreUsuario', ''),
            "eliminado": 1 if data.get('eliminado', False) else 0,  # Convertir boolean a int
            "usuario_id": usuario_id
        })
        
        # Actualizar datos del candidato (campos editables)
        update_candidato_query = text("""
            UPDATE Candidatos 
            SET Telefono = :telefono,
                Dirreccion = :direccion,
                Educacion = :educacion,
                Experiencia_Laboral = :experiencia
            WHERE ID = :candidato_id
        """)
        conn.execute(update_candidato_query, {
            "telefono": data.get('telefono'),
            "direccion": data.get('dirreccion'),  # Corregido: frontend envía 'dirreccion'
            "educacion": data.get('educacion'),
            "experiencia": data.get('experiencia_laboral'),  # Corregido: frontend envía 'experiencia_laboral'
            "candidato_id": candidato_id
        })
        
        trans.commit()
        return jsonify({"message": "Candidato actualizado correctamente"}), 200
        
    except SQLAlchemyError as e:
        if trans:
            trans.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/candidatos/<int:candidato_id>', methods=['DELETE'])
def admin_eliminar_candidato(candidato_id):
    conn = None
    trans = None
    try:
        conn = obtener_conexion()
        trans = conn.begin()
        
        # Obtener el ID del usuario asociado al candidato
        candidato_query = text("SELECT ID_Usuario FROM Candidatos WHERE ID = :candidato_id")
        candidato_result = conn.execute(candidato_query, {"candidato_id": candidato_id}).fetchone()
        
        if not candidato_result:
            return jsonify({"error": "Candidato no encontrado"}), 404
        
        usuario_id = candidato_result.ID_Usuario
        
        # Soft delete del usuario (esto afecta al candidato también)
        soft_delete_query = text("""
            UPDATE Usuario 
            SET eliminado = 1
            WHERE ID = :usuario_id
        """)
        conn.execute(soft_delete_query, {"usuario_id": usuario_id})
        
        trans.commit()
        return jsonify({"message": "Candidato eliminado correctamente"}), 200
        
    except SQLAlchemyError as e:
        if trans:
            trans.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== GESTIÓN DE EMPRESAS (ADMIN) ==========
@app.route('/api/admin/empresas', methods=['GET'])
def admin_obtener_empresas_completas():
    conn = None
    try:
        conn = obtener_conexion()
        # Obtener parámetro de filtro para incluir empresas eliminadas
        incluir_eliminadas = request.args.get('incluir_eliminadas', 'false').lower() == 'true'
        
        if incluir_eliminadas:
            # Mostrar todas las empresas (activas e inactivas)
            query = text("""
                SELECT 
                    E.ID,
                    E.Nombre,
                    E.RFC,
                    E.Direccion,
                    E.Telefono,
                    E.Descripcion,
                    U.NombreUsuario,
                    U.Correo,
                    U.ID as UsuarioID,
                    U.RutaImagen,
                    U.eliminado
                FROM Empresa E
                JOIN Usuario U ON E.ID_Usuario = U.ID
                ORDER BY E.ID DESC
            """)
        else:
            # Solo mostrar empresas activas (comportamiento por defecto)
            query = text("""
                SELECT 
                    E.ID,
                    E.Nombre,
                    E.RFC,
                    E.Direccion,
                    E.Telefono,
                    E.Descripcion,
                    U.NombreUsuario,
                    U.Correo,
                    U.ID as UsuarioID,
                    U.RutaImagen,
                    U.eliminado
                FROM Empresa E
                JOIN Usuario U ON E.ID_Usuario = U.ID
                WHERE U.eliminado = 0
                ORDER BY E.ID DESC
            """)
        
        result = conn.execute(query)
        empresas = [{
            "id": row.ID,
            "nombre": row.Nombre,
            "rfc": row.RFC,
            "direccion": row.Direccion,
            "telefono": row.Telefono,
            "descripcion": row.Descripcion,
            "nombreUsuario": row.NombreUsuario,
            "correo": row.Correo,
            "usuarioId": row.UsuarioID,
            "rutaImagen": row.RutaImagen,
            "eliminado": row.eliminado == 1
        } for row in result]
        return jsonify(empresas), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/empresas/<int:empresa_id>', methods=['PUT'])
def admin_actualizar_empresa(empresa_id):
    data = request.json
    conn = None
    trans = None
    try:
        conn = obtener_conexion()
        trans = conn.begin()
        
        # Obtener el ID del usuario asociado a la empresa
        empresa_query = text("SELECT ID_Usuario FROM Empresa WHERE ID = :empresa_id")
        empresa_result = conn.execute(empresa_query, {"empresa_id": empresa_id}).fetchone()
        
        if not empresa_result:
            return jsonify({"error": "Empresa no encontrada"}), 404
        
        usuario_id = empresa_result.ID_Usuario
        
        # Actualizar datos del usuario (solo campos editables)
        if 'nombreUsuario' in data:
            update_usuario_query = text("""
                UPDATE Usuario 
                SET NombreUsuario = :nombre_usuario
                WHERE ID = :usuario_id
            """)
            conn.execute(update_usuario_query, {
                "nombre_usuario": data['nombreUsuario'],
                "usuario_id": usuario_id
            })
        
        # Actualizar estado eliminado si se proporciona
        if 'eliminado' in data:
            update_eliminado_query = text("""
                UPDATE Usuario 
                SET eliminado = :eliminado
                WHERE ID = :usuario_id
            """)
            conn.execute(update_eliminado_query, {
                "eliminado": 1 if data['eliminado'] else 0,
                "usuario_id": usuario_id
            })
        
        # Actualizar datos de la empresa (campos editables)
        update_empresa_query = text("""
            UPDATE Empresa 
            SET Nombre = :nombre,
                Direccion = :direccion,
                Telefono = :telefono,
                Descripcion = :descripcion
            WHERE ID = :empresa_id
        """)
        conn.execute(update_empresa_query, {
            "nombre": data.get('nombre'),
            "direccion": data.get('direccion'),
            "telefono": data.get('telefono'),
            "descripcion": data.get('descripcion'),
            "empresa_id": empresa_id
        })
        
        trans.commit()
        return jsonify({"message": "Empresa actualizada correctamente"}), 200
        
    except SQLAlchemyError as e:
        if trans:
            trans.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/empresas/<int:empresa_id>', methods=['DELETE'])
def admin_eliminar_empresa(empresa_id):
    conn = None
    trans = None
    try:
        conn = obtener_conexion()
        trans = conn.begin()
        
        # Obtener el ID del usuario asociado a la empresa
        empresa_query = text("SELECT ID_Usuario FROM Empresa WHERE ID = :empresa_id")
        empresa_result = conn.execute(empresa_query, {"empresa_id": empresa_id}).fetchone()
        
        if not empresa_result:
            return jsonify({"error": "Empresa no encontrada"}), 404
        
        usuario_id = empresa_result.ID_Usuario
        
        # Soft delete del usuario (esto afecta a la empresa también)
        soft_delete_query = text("""
            UPDATE Usuario 
            SET eliminado = 1
            WHERE ID = :usuario_id
        """)
        conn.execute(soft_delete_query, {"usuario_id": usuario_id})
        
        trans.commit()
        return jsonify({"message": "Empresa eliminada correctamente"}), 200
        
    except SQLAlchemyError as e:
        if trans:
            trans.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== GESTIÓN DE POSTULACIONES (ADMIN) ==========
@app.route('/api/admin/postulaciones', methods=['GET'])
def admin_obtener_postulaciones():
    conn = None
    try:
        conn = obtener_conexion()
        query = text("""
            SELECT 
                P.ID as PostulacionID,
                P.Fecha_Publicacion as FechaPostulacion,
                P.Estado as EstadoPostulacion,
                V.ID as VacanteID,
                V.Titulo_puesto as TituloVacante,
                V.Salario,
                V.Ubicacion,
                C.ID as CandidatoID,
                U.NombreUsuario,
                U.Correo,
                C.Telefono,
                C.Dirreccion,
                E.Nombre as NombreEmpresa
            FROM Postulaciones P
            JOIN Vacantes V ON P.ID_Vacante = V.ID
            JOIN Candidatos C ON P.ID_Candidato = C.ID
            JOIN Usuario U ON C.ID_Usuario = U.ID
            JOIN Empresa E ON V.ID_Empresa = E.ID
            WHERE U.eliminado = 0 AND V.eliminado = 0
            ORDER BY P.Fecha_Publicacion DESC
        """)
        result = conn.execute(query)
        postulaciones = [{
            "id": row.PostulacionID,
            "fechaPostulacion": row.FechaPostulacion.isoformat() if row.FechaPostulacion else None,
            "estado": row.EstadoPostulacion,
            "vacanteId": row.VacanteID,
            "tituloVacante": row.TituloVacante,
            "salario": float(row.Salario) if row.Salario else 0,
            "ubicacion": row.Ubicacion,
            "candidatoId": row.CandidatoID,
            "nombreCandidato": row.NombreUsuario,
            "correoCandidato": row.Correo,
            "telefonoCandidato": row.Telefono,
            "direccionCandidato": row.Dirreccion,
            "nombreEmpresa": row.NombreEmpresa
        } for row in result]
        return jsonify(postulaciones), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/postulaciones/<int:postulacion_id>', methods=['PUT'])
def admin_actualizar_postulacion(postulacion_id):
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        
        # Validar que el estado es válido
        estados_validos = ['Pendiente', 'Aceptado', 'Rechazado', 'En Revisión']
        if data.get('estado') not in estados_validos:
            return jsonify({"error": f"Estado inválido. Estados válidos: {', '.join(estados_validos)}"}), 400
        
        # Verificar que la postulación existe
        check_query = text("SELECT ID FROM Postulaciones WHERE ID = :postulacion_id")
        postulacion_result = conn.execute(check_query, {"postulacion_id": postulacion_id}).fetchone()
        
        if not postulacion_result:
            return jsonify({"error": "Postulación no encontrada"}), 404
        
        # Actualizar estado de la postulación
        query = text("""
            UPDATE Postulaciones SET
                Estado = :estado
            WHERE ID = :postulacion_id
        """)
        
        conn.execute(query, {
            "estado": data['estado'],
            "postulacion_id": postulacion_id
        })
        
        conn.commit()
        return jsonify({"message": "Postulación actualizada correctamente"}), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/postulaciones/<int:postulacion_id>', methods=['DELETE'])
def admin_eliminar_postulacion(postulacion_id):
    conn = None
    try:
        conn = obtener_conexion()
        
        # Verificar que la postulación existe
        check_query = text("SELECT ID FROM Postulaciones WHERE ID = :postulacion_id")
        postulacion_result = conn.execute(check_query, {"postulacion_id": postulacion_id}).fetchone()
        
        if not postulacion_result:
            return jsonify({"error": "Postulación no encontrada"}), 404
        
        # Eliminar postulación
        conn.execute(text("DELETE FROM Postulaciones WHERE ID = :postulacion_id"), {"postulacion_id": postulacion_id})
        
        conn.commit()
        return jsonify({"message": "Postulación eliminada correctamente"}), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== ESTADÍSTICAS PARA DASHBOARD ADMIN ==========
@app.route('/api/admin/estadisticas', methods=['GET'])
def admin_obtener_estadisticas():
    conn = None
    try:
        conn = obtener_conexion()
        
        # Obtener estadísticas
        stats_query = text("""
            SELECT 
                (SELECT COUNT(*) FROM Vacantes WHERE Estado = 'Abierta') as VacantesActivas,
                (SELECT COUNT(*) FROM Candidatos) as CandidatosRegistrados,
                (SELECT COUNT(*) FROM Empresa) as EmpresasActivas,
                (SELECT COUNT(*) FROM Postulaciones WHERE MONTH(Fecha_Publicacion) = MONTH(GETDATE()) AND YEAR(Fecha_Publicacion) = YEAR(GETDATE())) as PostulacionesMes
        """)
        
        result = conn.execute(stats_query).fetchone()
        
        estadisticas = {
            "vacantesActivas": result.VacantesActivas,
            "candidatosRegistrados": result.CandidatosRegistrados,
            "empresasActivas": result.EmpresasActivas,
            "postulacionesMes": result.PostulacionesMes
        }
        
        return jsonify(estadisticas), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ========== ARCHIVOS ESTÁTICOS ==========
@app.route('/static/<path:filename>')
def static_files(filename):
    return app.send_static_file(filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
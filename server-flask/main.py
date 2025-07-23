from flask import Flask, request, jsonify
from flask_cors import CORS
from src.conexion import obtener_conexion
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
import secrets
import time

app = Flask(__name__, static_folder='src/static')
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

@app.route('/api/usuarios/<int:usuario_id>', methods=['GET'])
def obtener_usuario_por_id(usuario_id):
    conn = None
    try:
        conn = obtener_conexion()
        query = text("SELECT ID, NombreUsuario, Correo, ROL, RutaImagen FROM Usuario WHERE ID = :usuario_id")
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
                :ID_Usuario, :Nombre, : RFC, :Direccion, :Telefono, :Descripcion
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
            
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = None
    try:
        conn = obtener_conexion()
        
        # Buscar usuario por nombre de usuario o correo
        query = text("""
            SELECT ID, NombreUsuario, Correo, Contrasena, ROL, RutaImagen 
            FROM Usuario 
            WHERE NombreUsuario = :usuario OR Correo = :usuario
        """)
        result = conn.execute(query, {"usuario": data['usuario']}).fetchone()
        
        if not result:
            return jsonify({"error": "Usuario no encontrado"}), 401
        
        # Verificar contraseña (texto plano)
        if data['contrasena'] != result.Contrasena:
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
        
        # Insertar usuario básico
        insert_query = text("""
            INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
            VALUES (:nombre_usuario, :correo, :contrasena, :rol, NULL)
        """)
        
        conn.execute(insert_query, {
            "nombre_usuario": data['nombreUsuario'],
            "correo": data['correo'],
            "contrasena": data['contrasena'],
            "rol": db_role
        })
        
        # Obtener el ID del usuario recién insertado
        id_query = text("""
            SELECT ID FROM Usuario 
            WHERE NombreUsuario = :nombre_usuario AND Correo = :correo
        """)
        
        result = conn.execute(id_query, {
            "nombre_usuario": data['nombreUsuario'],
            "correo": data['correo']
        })
        
        row = result.fetchone()
        if not row:
            trans.rollback()
            return jsonify({"error": "Error al obtener ID del usuario"}), 500
            
        usuario_id = row[0]
        if not usuario_id:
            trans.rollback()
            return jsonify({"error": "Error: ID de usuario es nulo"}), 500
        
        trans.commit()
        return jsonify({
            "message": "Usuario registrado correctamente", 
            "usuario_id": usuario_id,
            "userType": data.get('userType', 'user')
        }), 201
        
    except SQLAlchemyError as e:
        if trans:
            trans.rollback()
        print(f"SQLAlchemyError: {str(e)}")
        return jsonify({"error": str(e)}), 500
    except KeyError as e:
        if trans:
            trans.rollback()
        print(f"KeyError: {str(e)}")
        return jsonify({"error": f"Campo faltante: {str(e)}"}), 400
    except Exception as e:
        if trans:
            trans.rollback()
        print(f"Exception: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/candidato/profile/<int:usuario_id>', methods=['GET', 'PUT'])
def candidato_profile(usuario_id):
    conn = None
    try:
        conn = obtener_conexion()
        
        if request.method == 'GET':
            # Obtener perfil actual
            query = text("""
                SELECT c.Telefono, c.Dirreccion, c.CV, c.Educacion, c.Experiencia_Laboral,
                       u.NombreUsuario, u.Correo, u.RutaImagen
                FROM Candidatos c
                JOIN Usuario u ON c.ID_Usuario = u.ID
                WHERE c.ID_Usuario = :id_usuario
            """)
            
            result = conn.execute(query, {"id_usuario": usuario_id}).fetchone()
            
            if not result:
                return jsonify({"error": "Candidato no encontrado"}), 404
                
            # Extraer nombre del archivo CV si existe
            cv_nombre = None
            if result.CV:
                cv_nombre = result.CV.split('/')[-1] if '/' in result.CV else result.CV
                
            return jsonify({
                "nombreUsuario": result.NombreUsuario,
                "correo": result.Correo,
                "telefono": result.Telefono,
                "direccion": result.Dirreccion,
                "cv": result.CV,
                "cv_nombre": cv_nombre,
                "educacion": result.Educacion,
                "experiencia": result.Experiencia_Laboral,
                "rutaImagen": result.RutaImagen
            })
        else:  # PUT
            # Actualizar perfil
            data = request.json
            query = text("""
                UPDATE Candidatos 
                SET Dirreccion = :direccion, 
                    Educacion = :educacion, 
                    Experiencia_Laboral = :experiencia 
                WHERE ID_Usuario = :id_usuario
            """)
            
            conn.execute(query, {
                "direccion": data.get('direccion'),
                "educacion": data.get('educacion'),
                "experiencia": data.get('experiencia'),
                "id_usuario": usuario_id
            })
            
            conn.commit()
            return jsonify({"message": "Perfil actualizado correctamente"})
            
    except SQLAlchemyError as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/candidato/upload-cv/<int:usuario_id>', methods=['POST'])
def upload_cv(usuario_id):
    if 'cv' not in request.files:
        return jsonify({"error": "No se envió ningún archivo"}), 400
        
    file = request.files['cv']
    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400
        
    if file and file.filename.endswith('.pdf'):
        # Crear directorio si no existe
        cv_dir = os.path.join(app.root_path, 'src', 'static', 'cv')
        os.makedirs(cv_dir, exist_ok=True)
        
        # Generar nombre único para el archivo
        filename = f"cv_{usuario_id}_{int(time.time())}.pdf"
        filepath = os.path.join(cv_dir, filename)
        
        # Guardar archivo
        file.save(filepath)
        
        # Actualizar ruta en la base de datos
        conn = None
        try:
            conn = obtener_conexion()
            query = text("""
                UPDATE Candidatos 
                SET CV = :cv_path 
                WHERE ID_Usuario = :id_usuario
            """)
            
            # Guardar ruta relativa para acceso web
            relative_path = f"/static/cv/{filename}"
            
            conn.execute(query, {
                "cv_path": relative_path,
                "id_usuario": usuario_id
            })
            
            conn.commit()
            return jsonify({
                "message": "CV subido correctamente",
                "cv_path": relative_path
            })
            
        except SQLAlchemyError as e:
            if conn:
                conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            if conn:
                conn.close()
    else:
        return jsonify({"error": "El archivo debe ser un PDF"}), 400

@app.route('/api/empresa/profile/<int:usuario_id>', methods=['GET', 'PUT'])
def empresa_profile(usuario_id):
    conn = None
    try:
        conn = obtener_conexion()
        
        if request.method == 'GET':
            # Obtener perfil actual
            query = text("""
                SELECT e.Nombre, e.RFC, e.Direccion, e.Telefono, e.Descripcion,
                       u.NombreUsuario, u.Correo, u.RutaImagen
                FROM Empresa e
                JOIN Usuario u ON e.ID_Usuario = u.ID
                WHERE e.ID_Usuario = :id_usuario
            """)
            
            result = conn.execute(query, {"id_usuario": usuario_id}).fetchone()
            
            if not result:
                return jsonify({"error": "Empresa no encontrada"}), 404
                
            return jsonify({
                "nombreUsuario": result.NombreUsuario,
                "correo": result.Correo,
                "nombre": result.Nombre,
                "rfc": result.RFC,
                "direccion": result.Direccion,
                "telefono": result.Telefono,
                "descripcion": result.Descripcion,
                "rutaImagen": result.RutaImagen
            })
        else:  # PUT
            # Actualizar perfil
            data = request.json
            query = text("""
                UPDATE Empresa 
                SET RFC = :rfc, 
                    Direccion = :direccion, 
                    Descripcion = :descripcion 
                WHERE ID_Usuario = :id_usuario
            """)
            
            conn.execute(query, {
                "rfc": data.get('rfc'),
                "direccion": data.get('direccion'),
                "descripcion": data.get('descripcion'),
                "id_usuario": usuario_id
            })
            
            conn.commit()
            return jsonify({"message": "Perfil actualizado correctamente"})
            
    except SQLAlchemyError as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
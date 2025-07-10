from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

# Configuración de la conexión con pool
engine = create_engine(
    "mssql+pyodbc://localhost/Bolsa_de_Trabajo?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes",
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    echo=False
)

def obtener_conexion():
    try:
        conn = engine.connect()
        return conn
    except SQLAlchemyError as e:
        print(f"Error al conectar a la base de datos: {e}")
        raise e
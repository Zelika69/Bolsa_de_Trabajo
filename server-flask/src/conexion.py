from sqlalchemy import create_engine

# Conexión con pool (ajustable)
engine = create_engine(
    "mssql+pyodbc://localhost/Bolsa_de_Trabajo?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes",
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    echo=False
)

def obtener_conexion():
    return engine.connect()

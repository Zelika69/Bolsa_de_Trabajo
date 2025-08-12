from src.conexion import obtener_conexion
from sqlalchemy import text

def add_destacada_field():
    try:
        conn = obtener_conexion()
        
        # Leer el script SQL
        with open('SQL/add_destacada_field.sql', 'r', encoding='utf-8') as file:
            script = file.read()
        
        # Dividir en statements individuales
        statements = [s.strip() for s in script.split(';') if s.strip()]
        
        # Ejecutar cada statement
        for stmt in statements:
            if stmt:
                conn.execute(text(stmt))
        
        conn.commit()
        print("Campo Destacada añadido y vacantes destacadas actualizadas exitosamente")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    add_destacada_field()
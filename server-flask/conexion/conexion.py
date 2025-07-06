import pyodbc

def get_db_connection():
    try:

        # Para entornos de producción, considera usar variables de entorno para las credenciales.
        conexion = pyodbc.connect(
            'DRIVER={SQL SERVER}; SERVER=BENJ;DATEBASE=Bolsa_de_Trabajo; Trusted_Connection=yes'
        )
        print('Conexión exitosa a la base de datos!')
        return conexion
    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        print(f'Error al conectar a la base de datos: {sqlstate}')
        print(f'Detalles del error: {ex}')
        return None

# Ejemplo de cómo usar la función (puedes eliminar esto si no lo necesitas aquí)
if __name__ == '__main__':
    conn = get_db_connection()

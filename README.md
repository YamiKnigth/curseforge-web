# 🎮 CurseForge Modpack Manager

Una aplicación web completa para la gestión de modpacks de CurseForge, enfocada en la creación, gestión, importación y exportación de configuraciones de Minecraft.

## 📋 Características

- ✅ **Autenticación de Usuarios**: Sistema de registro e inicio de sesión seguro
- ✅ **Búsqueda de Mods**: Búsqueda integrada con la API de CurseForge
- ✅ **Gestión de Modpacks**: CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ **Detalles Enriquecidos**: Visualización de información detallada de mods (autor, descargas, versión, imágenes)
- ✅ **Importación**: Importar modpacks desde archivos ZIP con manifest.json
- ✅ **Exportación**: Exportar modpacks a formato ZIP compatible con CurseForge
- ✅ **Interfaz Intuitiva**: Diseño moderno y responsivo con tema oscuro

## 🛠️ Requisitos Técnicos

### Backend
- PHP 8.0 o superior
- Extensiones PHP requeridas:
  - `curl`
  - `mysqli`
  - `zip`
  - `json`

### Base de Datos
- MySQL 5.7+ o MariaDB 10.3+

### Servidor Web
- Apache 2.4+ (con mod_rewrite) o
- Nginx 1.18+

### Frontend
- Navegador web moderno con soporte para ES6+

## 📦 Estructura de Archivos

```
curseforge-web/
├── index.html           # Interfaz principal de la aplicación
├── style.css            # Estilos visuales
├── script.js            # Lógica del frontend
├── api_handler.php      # Controlador del backend
├── config.php           # Configuración (credenciales)
├── database.sql         # Script de creación de BD
├── .htaccess           # Configuración para Apache
├── nginx.conf          # Configuración para Nginx
├── LICENSE             # Licencia del proyecto
└── README.md           # Este archivo
```

## 🚀 Instalación

### 1. Clonar o Descargar el Proyecto

```bash
git clone https://github.com/YamiKnigth/curseforge-web.git
cd curseforge-web
```

### 2. Configurar la Base de Datos

Ejecuta el script SQL para crear la base de datos y las tablas:

```bash
mysql -u root -p < database.sql
```

O importa manualmente el archivo `database.sql` desde phpMyAdmin.

### 3. Configurar Credenciales

Edita el archivo `config.php` y actualiza las siguientes constantes:

```php
// Configuración de la Base de Datos
define('DB_HOST', 'localhost');           // Host de tu BD
define('DB_USER', 'tu_usuario');          // Usuario de MySQL
define('DB_PASS', 'tu_contraseña');       // Contraseña de MySQL
define('DB_NAME', 'curseforge_manager');  // Nombre de la BD

// API Key de CurseForge
define('CURSEFORGE_API_KEY', 'tu_api_key_aqui');
```

**Nota**: Obtén tu API Key desde [CurseForge Console](https://console.curseforge.com/)

### 4. Configurar el Servidor Web

#### Para Apache:

El archivo `.htaccess` ya está incluido. Solo asegúrate de que `mod_rewrite` esté habilitado:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### Para Nginx:

Copia la configuración de `nginx.conf` a tu archivo de sitio:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/curseforge
sudo ln -s /etc/nginx/sites-available/curseforge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Permisos

Asegúrate de que el servidor web tenga permisos de escritura en el directorio temporal:

```bash
sudo chown -R www-data:www-data /workspaces/curseforge-web
sudo chmod -R 755 /workspaces/curseforge-web
```

## 📖 Uso

### Registro e Inicio de Sesión

1. Abre la aplicación en tu navegador: `http://localhost` o `http://tu-dominio.com`
2. Registra una nueva cuenta con un usuario y contraseña
3. Inicia sesión con tus credenciales

### Crear un Modpack

1. Haz clic en **"➕ Nuevo Modpack"**
2. Completa el nombre, descripción y selecciona la versión de Minecraft
3. Busca mods usando el campo de búsqueda
4. Añade mods al modpack haciendo clic en **"Añadir"**
5. Guarda el modpack con el botón **"💾 Guardar Modpack"**

### Gestionar Modpacks

- **Cargar**: Haz clic en un modpack de la lista lateral
- **Editar**: Modifica los campos y guarda los cambios
- **Eliminar**: Usa el botón **"🗑️ Eliminar"**

### Importar un Modpack

1. Haz clic en **"📥 Importar ZIP"**
2. Selecciona un archivo ZIP con un `manifest.json` válido
3. El modpack se cargará automáticamente

### Exportar un Modpack

1. Abre el modpack que deseas exportar
2. Haz clic en **"📤 Exportar ZIP"**
3. Se descargará un archivo ZIP compatible con CurseForge

## 🗄️ Esquema de Base de Datos

### Tabla `users`
- `id` (INT, PK, AI): ID único del usuario
- `username` (VARCHAR(50), UNIQUE): Nombre de usuario
- `password_hash` (VARCHAR(255)): Hash bcrypt de la contraseña
- `created_at` (DATETIME): Fecha de registro

### Tabla `modpacks`
- `id` (INT, PK, AI): ID único del modpack
- `user_id` (INT, FK → users.id): Propietario del modpack
- `name` (VARCHAR(100)): Nombre del modpack
- `description` (TEXT): Descripción
- `minecraft_version` (VARCHAR(20)): Versión de Minecraft
- `created_at` (DATETIME): Fecha de creación

### Tabla `modpack_mods`
- `id` (INT, PK, AI): ID único de la relación
- `modpack_id` (INT, FK → modpacks.id): ID del modpack
- `curseforge_project_id` (INT): ID del proyecto en CurseForge
- `curseforge_file_id` (INT): ID del archivo en CurseForge
- `required` (BOOLEAN): Indica si es requerido u opcional

## 🔌 API Endpoints

### Autenticación
- `POST /api/?action=register` - Registrar usuario
- `POST /api/?action=login` - Iniciar sesión
- `POST /api/?action=logout` - Cerrar sesión
- `GET /api/?action=check_session` - Verificar sesión

### Modpacks
- `POST /api/?action=create_modpack` - Crear modpack
- `GET /api/?action=get_modpacks` - Listar modpacks del usuario
- `GET /api/?action=get_modpack` - Obtener modpack específico
- `POST /api/?action=update_modpack` - Actualizar modpack
- `POST /api/?action=delete_modpack` - Eliminar modpack

### CurseForge API
- `GET /api/?action=search_mods` - Buscar mods
- `GET /api/?action=get_mod_details` - Detalles de un mod
- `GET /api/?action=get_mod_files` - Archivos de un mod
- `GET /api/?action=get_minecraft_versions` - Versiones de Minecraft

### Importación/Exportación
- `GET /api/?action=export_modpack` - Exportar modpack a ZIP
- `POST /api/?action=import_modpack` - Importar modpack desde ZIP

## 🐛 Solución de Problemas

### Error: "No se puede conectar a la base de datos"
- Verifica las credenciales en `config.php`
- Asegúrate de que MySQL esté ejecutándose
- Confirma que la base de datos `curseforge_manager` existe

### Error: "API Error 403"
- Verifica que tu `CURSEFORGE_API_KEY` sea válida
- Genera una nueva clave en [CurseForge Console](https://console.curseforge.com/)

### Error: "No se pueden cargar los mods"
- Verifica la extensión PHP `curl` esté instalada
- Comprueba la conectividad a internet

### Las rutas /api/ no funcionan
- **Apache**: Habilita `mod_rewrite` y verifica `.htaccess`
- **Nginx**: Revisa la configuración de `rewrite` en tu archivo de sitio

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado por [YamiKnigth](https://github.com/YamiKnigth)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

- Abre un [Issue](https://github.com/YamiKnigth/curseforge-web/issues) en GitHub
- Contacta al desarrollador

## 🙏 Agradecimientos

- [CurseForge](https://www.curseforge.com/) por proporcionar la API
- La comunidad de Minecraft por su apoyo continuo

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub

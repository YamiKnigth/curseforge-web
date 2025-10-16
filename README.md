Gestor de Modpacks de CurseForge - Guía de Instalación
Esta es una aplicación web para crear y gestionar modpacks de CurseForge usando PHP, MySQL y JavaScript.

Requisitos
Servidor Web: Nginx (o Apache) con soporte para PHP 8.0 o superior.

PHP: Versión 8.0+ con la extensión curl y mysqli habilitadas.

Base de Datos: Un servidor MySQL o MariaDB.

API Key de CurseForge: Necesitas una clave de API válida. Puedes solicitarla en la documentación oficial de CurseForge.

Pasos de Instalación
1. Configurar la Base de Datos
Accede a tu gestor de base de datos (como phpMyAdmin) o a la línea de comandos de MySQL.

Copia el contenido del archivo database.sql y ejecútalo. Esto creará la base de datos curseforge_manager y las tablas necesarias (users, modpacks, modpack_mods).

2. Configurar la Aplicación
Sube todos los archivos (index.html, style.css, script.js, api_handler.php, config.php) a tu servidor web.

Abre el archivo config.php y edita las siguientes constantes:

DB_HOST: El host de tu base de datos (normalmente localhost).

DB_USER: El nombre de usuario para acceder a la base de datos.

DB_PASS: La contraseña del usuario.

DB_NAME: El nombre de la base de datos (debería ser curseforge_manager si seguiste el paso 1).

CURSEFORGE_API_KEY: Importante: Pega aquí tu clave de API de CurseForge.

3. Configurar Nginx (Opcional, pero recomendado)
Para una mejor estructura de URLs y seguridad, puedes configurar Nginx para que redirija las peticiones a la API de forma limpia. Aquí tienes un ejemplo de bloque location para tu configuración de servidor de Nginx:

server {
    listen 80;
    server_name tu-dominio.com;
    root /ruta/a/tus/archivos;
    index index.html;

    # Sirve archivos estáticos directamente
    location ~* \.(css|js|jpg|jpeg|gif|png|ico)$ {
        expires 1M;
        access_log off;
        add_header Cache-Control "public";
    }

    # Pasa todas las peticiones a la API a api_handler.php
    location /api/ {
        try_files $uri $uri/ /api_handler.php?$query_string;
    }
    
    # Configuración para procesar archivos PHP
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.x-fpm.sock; # Ajusta la versión de PHP
    }
}

Si usas esta configuración, deberás cambiar la URL de la API en script.js de api_handler.php a /api/.

4. ¡Listo!
Abre tu navegador y visita la URL donde has subido los archivos. Deberías ver la interfaz del gestor de modpacks.

Próximos Pasos y Funcionalidades Faltantes
Esta es una base sólida. Las siguientes funcionalidades necesitarán ser implementadas:

Autenticación de Usuarios: Crear un sistema de registro e inicio de sesión en PHP para gestionar los perfiles.

Guardar y Cargar Modpacks: Implementar la lógica en api_handler.php y script.js para guardar la configuración del modpack en la base de datos y cargarla.

Importación/Exportación ZIP:

Exportar: Crear una función en PHP que genere un manifest.json a partir de los mods seleccionados y lo empaquete en un archivo ZIP para su descarga.

Importar: Crear la lógica para leer un archivo ZIP subido, parsear el manifest.json y poblar la interfaz con los datos del modpack.
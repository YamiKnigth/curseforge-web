<?php
// config.php

// -- Configuración de la Base de Datos --
define('DB_HOST', '167.114.208.48');      // Tu host de base de datos (usualmente 'localhost')
define('DB_USER', 'u7_gnag6FQR1J');   // Tu nombre de usuario de la base de datos
define('DB_PASS', 'tm@pe!Sk@sPunaUPWsb=UctiB'); // Tu contraseña de la base de datos
define('DB_NAME', 's7_curseforge_web'); // El nombre de tu base de datos

// -- Configuración de la API de CurseForge --
// IMPORTANTE: ¡No expongas esta clave en el lado del cliente!
// Consigue tu clave desde https://docs.curseforge.com/
define('CURSEFORGE_API_KEY', '$2a$10$YRV1YaaZ1X9bIP4n42Lp/OgHnu949A.RJGtMnOxINx9UGX4ImUjbS');

// -- URL Base de la API de CurseForge --
define('CURSEFORGE_API_BASE', 'https://api.curseforge.com');

// -- Headers para las peticiones a la API --
// Se usarán en api_handler.php para autenticar las solicitudes
function get_curseforge_api_headers() {
    return [
        'Content-Type: application/json',
        'Accept: application/json',
        'x-api-key: ' . CURSEFORGE_API_KEY
    ];
}

?>

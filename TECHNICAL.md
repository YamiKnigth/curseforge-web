# 📚 Documentación Técnica - CurseForge Modpack Manager

## Tabla de Contenidos
1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Flujo de Datos](#flujo-de-datos)
3. [Seguridad](#seguridad)
4. [API Reference](#api-reference)
5. [Base de Datos](#base-de-datos)
6. [Frontend](#frontend)
7. [Backend](#backend)

---

## Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                              │
│  ┌───────────────────────────────────────────────────┐     │
│  │  index.html (Estructura)                          │     │
│  │  style.css (Estilos)                              │     │
│  │  script.js (Lógica de Frontend)                   │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ AJAX (Fetch API)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR WEB                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Apache/Nginx (URL Rewriting)                     │     │
│  │  /api/ → api_handler.php                          │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (PHP)                            │
│  ┌───────────────────────────────────────────────────┐     │
│  │  api_handler.php (Controlador)                    │     │
│  │  ├─ Autenticación                                 │     │
│  │  ├─ CRUD Modpacks                                 │     │
│  │  ├─ Integración API CurseForge                    │     │
│  │  └─ Importación/Exportación                       │     │
│  └───────────────────────────────────────────────────┘     │
│                           │                                 │
│                           ▼                                 │
│  ┌───────────────────────────────────────────────────┐     │
│  │  config.php (Configuración)                       │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                │                          │
                │                          │
                ▼                          ▼
┌────────────────────────┐   ┌──────────────────────────────┐
│   BASE DE DATOS        │   │   API EXTERNA                │
│   MySQL/MariaDB        │   │   CurseForge API             │
│   - users              │   │   https://api.curseforge.com │
│   - modpacks           │   └──────────────────────────────┘
│   - modpack_mods       │
└────────────────────────┘
```

---

## Flujo de Datos

### 1. Autenticación de Usuario

```
Usuario → [Login Form] → script.js
                           ├─ Validación Cliente
                           └─ POST /api/?action=login
                              └─ api_handler.php
                                 ├─ Validación Servidor
                                 ├─ Consulta BD (users)
                                 ├─ Verificación Password
                                 └─ Crear Sesión PHP
                                    └─ Respuesta JSON
                                       └─ script.js
                                          └─ Mostrar App
```

### 2. Búsqueda de Mods

```
Usuario → [Search Input] → script.js
                            ├─ GET /api/?action=search_mods
                            └─ api_handler.php
                               └─ call_curseforge_api()
                                  └─ GET https://api.curseforge.com/v1/mods/search
                                     └─ Respuesta JSON
                                        └─ script.js
                                           └─ Renderizar Tarjetas de Mods
```

### 3. Crear Modpack

```
Usuario → [Save Button] → script.js
                           ├─ Preparar datos (name, version, mods)
                           └─ POST /api/?action=create_modpack
                              └─ api_handler.php
                                 ├─ require_auth()
                                 ├─ BEGIN TRANSACTION
                                 ├─ INSERT INTO modpacks
                                 ├─ INSERT INTO modpack_mods (foreach)
                                 ├─ COMMIT
                                 └─ Respuesta JSON
                                    └─ script.js
                                       └─ Actualizar Lista
```

### 4. Exportar Modpack

```
Usuario → [Export Button] → script.js
                             └─ GET /api/?action=export_modpack&modpack_id=X
                                └─ api_handler.php
                                   ├─ Obtener datos BD
                                   ├─ Crear manifest.json
                                   ├─ Crear archivo ZIP
                                   └─ Enviar archivo
                                      └─ Descarga en navegador
```

---

## Seguridad

### Medidas Implementadas

1. **Autenticación**
   - Contraseñas hasheadas con `password_hash()` (bcrypt)
   - Sesiones PHP con `httponly` y `strict_mode`
   - Verificación de sesión en operaciones sensibles

2. **Prevención de SQL Injection**
   - Uso de Prepared Statements con MySQLi
   - Bind de parámetros en todas las consultas
   ```php
   $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
   $stmt->bind_param("s", $username);
   ```

3. **Validación de Datos**
   - Validación en cliente (JavaScript)
   - Validación en servidor (PHP)
   - Sanitización de entradas

4. **Protección de Archivos Sensibles**
   - `.htaccess` niega acceso a `config.php` y `database.sql`
   - API Key nunca expuesta en frontend

5. **CSRF Protection**
   - Sesiones con cookies seguras
   - Verificación de origen de peticiones

### Recomendaciones Adicionales

- [ ] Implementar rate limiting en login
- [ ] Agregar CAPTCHA en registro
- [ ] Usar HTTPS en producción
- [ ] Implementar tokens CSRF explícitos
- [ ] Agregar logging de actividades

---

## API Reference

### Formato de Respuestas

Todas las respuestas son JSON:

**Éxito:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

**Error:**
```json
{
  "error": "Mensaje de error descriptivo"
}
```

### Endpoints Detallados

#### POST `/api/?action=register`

Registra un nuevo usuario.

**Parámetros:**
- `username` (string, 3-50 chars): Nombre de usuario
- `password` (string, min 6 chars): Contraseña

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "username": "usuario"
  }
}
```

#### POST `/api/?action=login`

Inicia sesión de usuario.

**Parámetros:**
- `username` (string): Nombre de usuario
- `password` (string): Contraseña

**Respuesta:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 1,
    "username": "usuario"
  }
}
```

#### GET `/api/?action=search_mods`

Busca mods en CurseForge.

**Parámetros:**
- `searchTerm` (string): Término de búsqueda
- `minecraftVersion` (string): Versión de Minecraft
- `pageSize` (int, default: 20): Resultados por página
- `index` (int, default: 0): Índice de paginación

**Respuesta:**
```json
{
  "data": [
    {
      "id": 123456,
      "name": "Mod Name",
      "summary": "Description",
      "downloadCount": 1000000,
      "logo": {
        "url": "https://...",
        "thumbnailUrl": "https://..."
      },
      "authors": [
        {
          "name": "Author Name"
        }
      ]
    }
  ]
}
```

#### POST `/api/?action=create_modpack`

Crea un nuevo modpack (requiere autenticación).

**Parámetros:**
- `name` (string): Nombre del modpack
- `description` (string): Descripción
- `minecraft_version` (string): Versión de Minecraft
- `mods` (JSON string): Array de mods
  ```json
  [
    {
      "projectId": 123456,
      "fileId": 789012,
      "required": true
    }
  ]
  ```

**Respuesta:**
```json
{
  "success": true,
  "message": "Modpack creado exitosamente",
  "modpack_id": 1
}
```

---

## Base de Datos

### Diagrama ER

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │◄─────┐
│ username        │      │
│ password_hash   │      │
│ created_at      │      │
└─────────────────┘      │
                         │
                         │ FK
┌─────────────────┐      │
│   modpacks      │      │
├─────────────────┤      │
│ id (PK)         │◄─────┤
│ user_id (FK)    │──────┘
│ name            │
│ description     │
│ minecraft_vers  │
│ created_at      │
└─────────────────┘
         │
         │ FK
         ▼
┌─────────────────┐
│  modpack_mods   │
├─────────────────┤
│ id (PK)         │
│ modpack_id (FK) │
│ cf_project_id   │
│ cf_file_id      │
│ required        │
└─────────────────┘
```

### Índices

- `users.username` - UNIQUE
- `modpacks.user_id` - INDEX
- `modpack_mods.modpack_id` - INDEX
- `modpack_mods.(modpack_id, cf_project_id, cf_file_id)` - UNIQUE

---

## Frontend

### Tecnologías
- HTML5
- CSS3 (Variables CSS, Grid, Flexbox)
- JavaScript ES6+ (Fetch API, Async/Await)

### Estructura del Estado

```javascript
const state = {
    currentUser: {
        id: 1,
        username: "usuario"
    },
    currentModpack: {
        id: 1,
        name: "Mi Modpack",
        minecraft_version: "1.20.1"
    },
    modpackMods: [
        {
            curseforge_project_id: 123456,
            curseforge_file_id: 789012,
            required: true
        }
    ],
    minecraftVersions: [...],
    isEditing: true
};
```

### Componentes Principales

1. **Auth Screen**: Login y Registro
2. **App Screen**: Aplicación principal
3. **Sidebar**: Lista de modpacks
4. **Editor View**: Edición de modpack
5. **Mod Cards**: Tarjetas de mods
6. **Modal**: Detalles de mod
7. **Toast Notifications**: Notificaciones

---

## Backend

### Funciones Principales

#### `call_curseforge_api($endpoint, $method, $data)`
Realiza peticiones a la API de CurseForge.

#### `send_json_response($data, $statusCode)`
Envía respuesta JSON y termina ejecución.

#### `require_auth()`
Verifica autenticación y retorna error 401 si falla.

#### `get_db_connection()`
Crea conexión a MySQL con manejo de errores.

### Transacciones de Base de Datos

Operaciones críticas usan transacciones:

```php
$conn->begin_transaction();
try {
    // Operaciones
    $conn->commit();
} catch (Exception $e) {
    $conn->rollback();
    throw $e;
}
```

---

## Testing

### Pruebas Manuales Recomendadas

1. **Autenticación**
   - [ ] Registro con usuario válido
   - [ ] Registro con usuario duplicado
   - [ ] Login con credenciales correctas
   - [ ] Login con credenciales incorrectas
   - [ ] Persistencia de sesión

2. **Modpacks**
   - [ ] Crear modpack nuevo
   - [ ] Editar modpack existente
   - [ ] Eliminar modpack
   - [ ] Listar modpacks del usuario

3. **Búsqueda de Mods**
   - [ ] Búsqueda con término válido
   - [ ] Filtro por versión de Minecraft
   - [ ] Añadir mod al modpack
   - [ ] Eliminar mod del modpack

4. **Importación/Exportación**
   - [ ] Exportar modpack a ZIP
   - [ ] Importar modpack desde ZIP
   - [ ] Validación de manifest.json

---

## Despliegue en Producción

### Checklist

- [ ] Cambiar credenciales de BD en `config.php`
- [ ] Obtener API Key real de CurseForge
- [ ] Habilitar HTTPS
- [ ] Configurar `session.cookie_secure = 1`
- [ ] Revisar permisos de archivos
- [ ] Configurar backups de BD
- [ ] Implementar logging
- [ ] Configurar firewall
- [ ] Optimizar PHP (OPcache)
- [ ] Monitorear recursos

### Variables de Entorno Recomendadas

```bash
DB_HOST=localhost
DB_USER=appuser
DB_PASS=secure_password
DB_NAME=curseforge_manager
CURSEFORGE_API_KEY=your_api_key
```

---

## Troubleshooting

### Error: "Headers already sent"
**Causa:** Salida antes de `header()`  
**Solución:** Verifica que no haya espacios antes de `<?php` en `api_handler.php`

### Error: "Call to undefined function mysqli_connect()"
**Causa:** Extensión mysqli no instalada  
**Solución:** `sudo apt install php-mysqli`

### Error: "Access denied for user"
**Causa:** Credenciales incorrectas en `config.php`  
**Solución:** Verifica usuario/contraseña de MySQL

### Error: "CORS policy"
**Causa:** Peticiones desde dominio diferente  
**Solución:** Configura headers CORS en `api_handler.php`

---

## Contribuir

Ver `README.md` para instrucciones de contribución.

## Licencia

MIT License - Ver archivo `LICENSE`

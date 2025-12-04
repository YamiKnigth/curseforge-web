# 🔌 Ejemplos de Uso de la API

Este documento contiene ejemplos prácticos de cómo usar la API del CurseForge Modpack Manager.

## Tabla de Contenidos
- [Autenticación](#autenticación)
- [Búsqueda de Mods](#búsqueda-de-mods)
- [Gestión de Modpacks](#gestión-de-modpacks)
- [Importación y Exportación](#importación-y-exportación)
- [Ejemplos con cURL](#ejemplos-con-curl)
- [Ejemplos con JavaScript](#ejemplos-con-javascript)

---

## Autenticación

### Registrar un Usuario

```javascript
// JavaScript (Fetch API)
const formData = new FormData();
formData.append('username', 'mi_usuario');
formData.append('password', 'mi_contraseña_segura');

const response = await fetch('/api/?action=register', {
    method: 'POST',
    body: formData
});

const result = await response.json();
console.log(result);
// {
//   "success": true,
//   "message": "Usuario registrado exitosamente",
//   "user": {
//     "id": 1,
//     "username": "mi_usuario"
//   }
// }
```

### Iniciar Sesión

```javascript
const formData = new FormData();
formData.append('username', 'mi_usuario');
formData.append('password', 'mi_contraseña_segura');

const response = await fetch('/api/?action=login', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
});

const result = await response.json();
console.log(result);
// {
//   "success": true,
//   "message": "Inicio de sesión exitoso",
//   "user": {
//     "id": 1,
//     "username": "mi_usuario"
//   }
// }
```

### Verificar Sesión

```javascript
const response = await fetch('/api/?action=check_session', {
    credentials: 'same-origin'
});

const result = await response.json();
console.log(result);
// {
//   "authenticated": true,
//   "user": {
//     "id": 1,
//     "username": "mi_usuario"
//   }
// }
```

### Cerrar Sesión

```javascript
const response = await fetch('/api/?action=logout', {
    method: 'POST',
    credentials: 'same-origin'
});

const result = await response.json();
console.log(result);
// {
//   "success": true,
//   "message": "Sesión cerrada"
// }
```

---

## Búsqueda de Mods

### Buscar Mods por Término

```javascript
const searchTerm = 'JEI';
const minecraftVersion = '1.20.1';

const response = await fetch(
    `/api/?action=search_mods&searchTerm=${encodeURIComponent(searchTerm)}&minecraftVersion=${minecraftVersion}`,
    { credentials: 'same-origin' }
);

const result = await response.json();
console.log(result);
// {
//   "data": [
//     {
//       "id": 238222,
//       "name": "Just Enough Items (JEI)",
//       "summary": "View Items and Recipes",
//       "downloadCount": 500000000,
//       "logo": {
//         "url": "https://...",
//         "thumbnailUrl": "https://..."
//       },
//       "authors": [
//         {
//           "name": "mezz"
//         }
//       ],
//       "dateModified": "2023-12-01T10:00:00Z"
//     }
//   ],
//   "pagination": {
//     "index": 0,
//     "pageSize": 20,
//     "totalCount": 100
//   }
// }
```

### Obtener Detalles de un Mod

```javascript
const modId = 238222;

const response = await fetch(
    `/api/?action=get_mod_details&modId=${modId}`,
    { credentials: 'same-origin' }
);

const result = await response.json();
console.log(result.data);
// {
//   "id": 238222,
//   "name": "Just Enough Items (JEI)",
//   "summary": "View Items and Recipes",
//   "description": "Full description...",
//   "links": {
//     "websiteUrl": "https://www.curseforge.com/minecraft/mc-mods/jei",
//     "wikiUrl": "https://...",
//     "sourceUrl": "https://github.com/..."
//   },
//   ...
// }
```

### Obtener Archivos de un Mod

```javascript
const modId = 238222;
const minecraftVersion = '1.20.1';

const response = await fetch(
    `/api/?action=get_mod_files&modId=${modId}&minecraftVersion=${minecraftVersion}`,
    { credentials: 'same-origin' }
);

const result = await response.json();
console.log(result.data);
// [
//   {
//     "id": 4567890,
//     "displayName": "jei-1.20.1-15.2.0.27.jar",
//     "fileName": "jei-1.20.1-15.2.0.27.jar",
//     "fileDate": "2023-12-01T10:00:00Z",
//     "fileLength": 1234567,
//     "downloadCount": 1000000,
//     "gameVersions": ["1.20.1"]
//   }
// ]
```

### Obtener Versiones de Minecraft

```javascript
const response = await fetch('/api/?action=get_minecraft_versions', {
    credentials: 'same-origin'
});

const result = await response.json();
console.log(result.data);
// [
//   {
//     "id": 9990,
//     "versionString": "1.20.1",
//     "gameVersionStatus": 1
//   },
//   {
//     "id": 9991,
//     "versionString": "1.20.2",
//     "gameVersionStatus": 1
//   }
// ]
```

---

## Gestión de Modpacks

### Crear un Modpack

```javascript
const modpackData = {
    name: 'Mi Modpack Épico',
    description: 'Un modpack increíble con los mejores mods',
    minecraft_version: '1.20.1',
    mods: [
        {
            projectId: 238222,  // JEI
            fileId: 4567890,
            required: true
        },
        {
            projectId: 32274,   // Tinkers Construct
            fileId: 4567891,
            required: true
        },
        {
            projectId: 223794,  // Biomes O' Plenty
            fileId: 4567892,
            required: false
        }
    ]
};

const formData = new FormData();
formData.append('name', modpackData.name);
formData.append('description', modpackData.description);
formData.append('minecraft_version', modpackData.minecraft_version);
formData.append('mods', JSON.stringify(modpackData.mods));

const response = await fetch('/api/?action=create_modpack', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
});

const result = await response.json();
console.log(result);
// {
//   "success": true,
//   "message": "Modpack creado exitosamente",
//   "modpack_id": 1
// }
```

### Listar Modpacks del Usuario

```javascript
const response = await fetch('/api/?action=get_modpacks', {
    credentials: 'same-origin'
});

const result = await response.json();
console.log(result);
// {
//   "success": true,
//   "modpacks": [
//     {
//       "id": 1,
//       "name": "Mi Modpack Épico",
//       "description": "Un modpack increíble...",
//       "minecraft_version": "1.20.1",
//       "created_at": "2023-12-04 10:30:00"
//     }
//   ]
// }
```

### Obtener un Modpack Específico

```javascript
const modpackId = 1;

const response = await fetch(
    `/api/?action=get_modpack&modpack_id=${modpackId}`,
    { credentials: 'same-origin' }
);

const result = await response.json();
console.log(result);
// {
//   "success": true,
//   "modpack": {
//     "id": 1,
//     "name": "Mi Modpack Épico",
//     "description": "Un modpack increíble...",
//     "minecraft_version": "1.20.1",
//     "created_at": "2023-12-04 10:30:00",
//     "mods": [
//       {
//         "curseforge_project_id": 238222,
//         "curseforge_file_id": 4567890,
//         "required": 1
//       }
//     ]
//   }
// }
```

### Actualizar un Modpack

```javascript
const modpackId = 1;
const updatedData = {
    name: 'Mi Modpack Épico v2.0',
    description: 'Actualizado con más mods',
    minecraft_version: '1.20.1',
    mods: [
        {
            projectId: 238222,
            fileId: 4567890,
            required: true
        },
        {
            projectId: 250398,  // Nuevo mod añadido
            fileId: 4567893,
            required: true
        }
    ]
};

const formData = new FormData();
formData.append('modpack_id', modpackId);
formData.append('name', updatedData.name);
formData.append('description', updatedData.description);
formData.append('minecraft_version', updatedData.minecraft_version);
formData.append('mods', JSON.stringify(updatedData.mods));

const response = await fetch('/api/?action=update_modpack', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
});

const result = await response.json();
console.log(result);
// {
//   "success": true,
//   "message": "Modpack actualizado exitosamente"
// }
```

### Eliminar un Modpack

```javascript
const modpackId = 1;

const formData = new FormData();
formData.append('modpack_id', modpackId);

const response = await fetch('/api/?action=delete_modpack', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
});

const result = await response.json();
console.log(result);
// {
//   "success": true,
//   "message": "Modpack eliminado exitosamente"
// }
```

---

## Importación y Exportación

### Exportar un Modpack

```javascript
const modpackId = 1;

// Método simple: redirigir el navegador
window.location.href = `/api/?action=export_modpack&modpack_id=${modpackId}`;

// El navegador descargará un archivo ZIP con el siguiente contenido:
// modpack_name.zip
//   └── manifest.json
```

**Ejemplo de manifest.json generado:**

```json
{
  "minecraft": {
    "version": "1.20.1",
    "modLoaders": [
      {
        "id": "forge-latest",
        "primary": true
      }
    ]
  },
  "manifestType": "minecraftModpack",
  "manifestVersion": 1,
  "name": "Mi Modpack Épico",
  "version": "1.0.0",
  "author": "mi_usuario",
  "description": "Un modpack increíble con los mejores mods",
  "files": [
    {
      "projectID": 238222,
      "fileID": 4567890,
      "required": true
    },
    {
      "projectID": 32274,
      "fileID": 4567891,
      "required": true
    }
  ]
}
```

### Importar un Modpack

```javascript
// Obtener archivo del input
const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/?action=import_modpack', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
});

const result = await response.json();
console.log(result);
// {
//   "success": true,
//   "message": "Modpack importado exitosamente",
//   "modpack_id": 2
// }
```

---

## Ejemplos con cURL

### Registrar Usuario

```bash
curl -X POST http://localhost/api/?action=register \
  -d "username=testuser" \
  -d "password=test123"
```

### Iniciar Sesión

```bash
curl -X POST http://localhost/api/?action=login \
  -c cookies.txt \
  -d "username=testuser" \
  -d "password=test123"
```

### Buscar Mods (con sesión)

```bash
curl -X GET "http://localhost/api/?action=search_mods&searchTerm=JEI&minecraftVersion=1.20.1" \
  -b cookies.txt
```

### Crear Modpack (con sesión)

```bash
curl -X POST http://localhost/api/?action=create_modpack \
  -b cookies.txt \
  -d "name=Mi Modpack" \
  -d "description=Descripción" \
  -d "minecraft_version=1.20.1" \
  -d 'mods=[{"projectId":238222,"fileId":4567890,"required":true}]'
```

### Exportar Modpack

```bash
curl -X GET "http://localhost/api/?action=export_modpack&modpack_id=1" \
  -b cookies.txt \
  -o modpack.zip
```

### Importar Modpack

```bash
curl -X POST http://localhost/api/?action=import_modpack \
  -b cookies.txt \
  -F "file=@modpack.zip"
```

---

## Ejemplos con JavaScript

### Función Helper para API Requests

```javascript
class ModpackAPI {
    constructor(baseURL = '/api/') {
        this.baseURL = baseURL;
    }

    async request(action, data = {}, method = 'POST') {
        const url = `${this.baseURL}?action=${action}`;
        const options = {
            method: method,
            credentials: 'same-origin'
        };

        if (method === 'POST' && data) {
            options.body = data instanceof FormData ? data : new URLSearchParams(data);
        }

        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error en la petición');
        }

        return result;
    }

    // Autenticación
    async login(username, password) {
        return this.request('login', { username, password });
    }

    async register(username, password) {
        return this.request('register', { username, password });
    }

    async logout() {
        return this.request('logout');
    }

    async checkSession() {
        return this.request('check_session', {}, 'GET');
    }

    // Modpacks
    async createModpack(name, description, minecraftVersion, mods) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('minecraft_version', minecraftVersion);
        formData.append('mods', JSON.stringify(mods));
        return this.request('create_modpack', formData);
    }

    async getModpacks() {
        return this.request('get_modpacks', {}, 'GET');
    }

    async getModpack(modpackId) {
        return this.request('get_modpack', { modpack_id: modpackId }, 'GET');
    }

    async updateModpack(modpackId, name, description, minecraftVersion, mods) {
        const formData = new FormData();
        formData.append('modpack_id', modpackId);
        formData.append('name', name);
        formData.append('description', description);
        formData.append('minecraft_version', minecraftVersion);
        formData.append('mods', JSON.stringify(mods));
        return this.request('update_modpack', formData);
    }

    async deleteModpack(modpackId) {
        return this.request('delete_modpack', { modpack_id: modpackId });
    }

    // Búsqueda
    async searchMods(searchTerm, minecraftVersion) {
        return this.request('search_mods', { 
            searchTerm, 
            minecraftVersion 
        }, 'GET');
    }

    async getModDetails(modId) {
        return this.request('get_mod_details', { modId }, 'GET');
    }

    async getModFiles(modId, minecraftVersion) {
        return this.request('get_mod_files', { 
            modId, 
            minecraftVersion 
        }, 'GET');
    }
}

// Uso
const api = new ModpackAPI();

// Login
try {
    const result = await api.login('testuser', 'test123');
    console.log('Logged in:', result.user);
} catch (error) {
    console.error('Login failed:', error.message);
}

// Crear modpack
try {
    const result = await api.createModpack(
        'Mi Modpack',
        'Descripción',
        '1.20.1',
        [
            { projectId: 238222, fileId: 4567890, required: true }
        ]
    );
    console.log('Modpack created:', result.modpack_id);
} catch (error) {
    console.error('Create failed:', error.message);
}
```

---

## Manejo de Errores

### Ejemplo Completo con Manejo de Errores

```javascript
async function safeAPIRequest(action, data = {}, method = 'POST') {
    try {
        const url = `/api/?action=${action}`;
        const options = {
            method: method,
            credentials: 'same-origin'
        };

        if (method === 'POST' && data) {
            options.body = data instanceof FormData ? data : new URLSearchParams(data);
        }

        const response = await fetch(url, options);
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('La respuesta del servidor no es JSON');
        }

        const result = await response.json();

        // Manejar errores HTTP
        if (!response.ok) {
            throw new Error(result.error || `Error HTTP ${response.status}`);
        }

        return result;
    } catch (error) {
        // Manejar diferentes tipos de errores
        if (error.name === 'TypeError') {
            console.error('Error de red:', error);
            throw new Error('No se pudo conectar con el servidor');
        }
        
        if (error.name === 'SyntaxError') {
            console.error('Error de JSON:', error);
            throw new Error('Respuesta inválida del servidor');
        }

        console.error('Error en la API:', error);
        throw error;
    }
}
```

---

## Testing

### Ejemplo de Test Unitario (Jest)

```javascript
describe('ModpackAPI', () => {
    let api;

    beforeEach(() => {
        api = new ModpackAPI();
    });

    test('should login successfully', async () => {
        const result = await api.login('testuser', 'test123');
        expect(result.success).toBe(true);
        expect(result.user).toHaveProperty('id');
        expect(result.user).toHaveProperty('username');
    });

    test('should fail login with wrong credentials', async () => {
        await expect(api.login('wronguser', 'wrongpass'))
            .rejects.toThrow('Usuario o contraseña incorrectos');
    });

    test('should create modpack', async () => {
        await api.login('testuser', 'test123');
        
        const result = await api.createModpack(
            'Test Modpack',
            'Test Description',
            '1.20.1',
            []
        );
        
        expect(result.success).toBe(true);
        expect(result).toHaveProperty('modpack_id');
    });
});
```

---

¿Necesitas más ejemplos o alguna funcionalidad específica? ¡Abre un issue en GitHub!

# 📝 Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0] - 2023-12-04

### 🎉 Lanzamiento Inicial

#### ✨ Características Añadidas

**Autenticación**
- Sistema de registro de usuarios
- Sistema de inicio de sesión
- Sesiones PHP seguras con bcrypt
- Verificación de sesión persistente
- Cierre de sesión

**Gestión de Modpacks**
- Crear modpacks nuevos
- Editar modpacks existentes
- Eliminar modpacks
- Listar todos los modpacks del usuario
- Visualizar detalles completos de modpacks

**Integración con CurseForge API**
- Búsqueda de mods por término
- Filtrado por versión de Minecraft
- Visualización de detalles de mods (nombre, autor, descripción, descargas)
- Obtención de archivos/versiones de mods
- Imágenes de mods (logo/thumbnails)
- Listado de versiones de Minecraft disponibles

**Importación y Exportación**
- Exportar modpacks a formato ZIP con manifest.json
- Importar modpacks desde archivos ZIP
- Compatibilidad con formato estándar de CurseForge

**Interfaz de Usuario**
- Diseño responsivo con tema oscuro
- Vista de login/registro
- Dashboard principal con sidebar
- Editor de modpacks intuitivo
- Tarjetas de mods con información detallada
- Modal para detalles adicionales de mods
- Notificaciones toast
- Loaders y feedback visual

#### 🛠️ Tecnologías Implementadas

**Backend**
- PHP 8.0+
- MySQL/MariaDB
- API REST
- Sesiones PHP
- Prepared Statements (seguridad SQL)
- Manejo de archivos ZIP

**Frontend**
- HTML5
- CSS3 (Variables CSS, Grid, Flexbox)
- JavaScript ES6+ (Fetch API, Async/Await)
- Diseño responsivo

**Servidor**
- Soporte Apache (.htaccess)
- Soporte Nginx (configuración incluida)
- URL Rewriting para /api/

#### 📦 Archivos Incluidos

- `index.html` - Interfaz principal
- `style.css` - Estilos completos (673 líneas)
- `script.js` - Lógica frontend (737 líneas)
- `api_handler.php` - Backend API (543 líneas)
- `config.php` - Configuración
- `database.sql` - Schema de BD (82 líneas)
- `.htaccess` - Configuración Apache
- `nginx.conf` - Configuración Nginx
- `install.sh` - Script de instalación
- `README.md` - Documentación principal
- `TECHNICAL.md` - Documentación técnica
- `API_EXAMPLES.md` - Ejemplos de uso
- `CHANGELOG.md` - Este archivo

#### 🔒 Seguridad

- Hashing de contraseñas con bcrypt
- Prepared Statements para prevenir SQL Injection
- Sesiones seguras (httponly, strict mode)
- Validación de entrada en cliente y servidor
- Protección de archivos sensibles
- API Key no expuesta en frontend

#### 📚 Documentación

- README completo con instrucciones de instalación
- Documentación técnica detallada
- Ejemplos de uso de API
- Comentarios en código
- Script de instalación automatizado

---

## [Unreleased]

### 🚧 Pendiente

- [ ] Sistema de perfiles de usuario
- [ ] Búsqueda avanzada con más filtros
- [ ] Soporte para más modloaders (Fabric, Quilt, NeoForge)
- [ ] Sistema de etiquetas/tags para modpacks
- [ ] Compartir modpacks públicamente
- [ ] Comentarios y valoraciones
- [ ] Sistema de notificaciones
- [ ] Modo claro/oscuro configurable
- [ ] Exportación a otros formatos (MultiMC, ATLauncher)
- [ ] Actualización automática de mods
- [ ] Historial de cambios en modpacks
- [ ] Panel de administración

---

## Guía de Versionado

### Versión Mayor (X.0.0)
- Cambios incompatibles con versiones anteriores
- Rediseño completo
- Cambios en el esquema de base de datos que requieren migración

### Versión Menor (1.X.0)
- Nuevas características compatibles con versiones anteriores
- Mejoras significativas
- Nuevas funcionalidades

### Versión Parche (1.0.X)
- Correcciones de bugs
- Mejoras de rendimiento
- Actualizaciones de documentación
- Cambios menores en UI

---

## Cómo Contribuir

Si deseas contribuir a este proyecto:

1. Crea un fork del repositorio
2. Crea una rama para tu cambio (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

---

## Reportar Bugs

Para reportar bugs, por favor abre un [Issue](https://github.com/YamiKnigth/curseforge-web/issues) con:

- Descripción del bug
- Pasos para reproducirlo
- Comportamiento esperado
- Capturas de pantalla (si aplica)
- Versión del navegador/sistema operativo

---

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

[1.0.0]: https://github.com/YamiKnigth/curseforge-web/releases/tag/v1.0.0
[Unreleased]: https://github.com/YamiKnigth/curseforge-web/compare/v1.0.0...HEAD

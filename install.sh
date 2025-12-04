#!/bin/bash
# =============================================================================
# install.sh - Script de instalación automatizada
# =============================================================================

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║     CurseForge Modpack Manager - Script de Instalación            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mensajes
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar si se está ejecutando como root
if [[ $EUID -eq 0 ]]; then
   print_warning "Este script no debería ejecutarse como root"
fi

# 1. Verificar requisitos del sistema
echo "1. Verificando requisitos del sistema..."

# Verificar PHP
if ! command -v php &> /dev/null; then
    print_error "PHP no está instalado. Por favor instala PHP 8.0 o superior."
    exit 1
else
    PHP_VERSION=$(php -v | grep -oP 'PHP \K[0-9.]+' | head -1)
    print_success "PHP $PHP_VERSION detectado"
fi

# Verificar extensiones de PHP
check_php_extension() {
    if php -m | grep -q "$1"; then
        print_success "Extensión PHP '$1' encontrada"
    else
        print_error "Extensión PHP '$1' no encontrada. Instálala con: sudo apt install php-$1"
        return 1
    fi
}

check_php_extension "mysqli"
check_php_extension "curl"
check_php_extension "zip"
check_php_extension "json"

# Verificar MySQL
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL no detectado. Asegúrate de tener MySQL o MariaDB instalado."
else
    print_success "MySQL detectado"
fi

# 2. Crear archivo de configuración
echo ""
echo "2. Configurando la aplicación..."

if [ -f "config.php" ]; then
    print_warning "config.php ya existe. Omitiendo..."
else
    if [ -f "config.php.example" ]; then
        cp config.php.example config.php
        print_success "config.php creado desde config.php.example"
        print_warning "¡IMPORTANTE! Edita config.php con tus credenciales reales"
    else
        print_error "config.php.example no encontrado"
    fi
fi

# 3. Configurar permisos
echo ""
echo "3. Configurando permisos..."

chmod 644 *.php *.html *.css *.js
chmod 755 .
print_success "Permisos configurados"

# 4. Crear base de datos
echo ""
echo "4. ¿Deseas crear la base de datos ahora? (s/n)"
read -r response

if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
    echo "Introduce el usuario de MySQL (root):"
    read -r DB_USER
    
    echo "Introduce la contraseña de MySQL:"
    read -rs DB_PASS
    
    echo ""
    mysql -u "$DB_USER" -p"$DB_PASS" < database.sql
    
    if [ $? -eq 0 ]; then
        print_success "Base de datos creada exitosamente"
    else
        print_error "Error al crear la base de datos"
    fi
else
    print_warning "Recuerda ejecutar el script database.sql manualmente"
fi

# 5. Detectar servidor web
echo ""
echo "5. Detectando servidor web..."

if command -v apache2 &> /dev/null; then
    print_success "Apache detectado"
    
    # Verificar mod_rewrite
    if apache2ctl -M 2>/dev/null | grep -q rewrite; then
        print_success "mod_rewrite está habilitado"
    else
        print_warning "mod_rewrite no está habilitado. Habilítalo con:"
        echo "  sudo a2enmod rewrite"
        echo "  sudo systemctl restart apache2"
    fi
    
    print_warning "Asegúrate de que .htaccess esté permitido en tu configuración de Apache"
    
elif command -v nginx &> /dev/null; then
    print_success "Nginx detectado"
    print_warning "Copia la configuración de nginx.conf a tu sitio de Nginx"
    print_warning "Ubicación típica: /etc/nginx/sites-available/"
else
    print_warning "No se detectó Apache ni Nginx"
fi

# 6. Resumen final
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    Instalación Completada                          ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Edita config.php con tus credenciales:"
echo "   - Credenciales de MySQL"
echo "   - API Key de CurseForge (https://console.curseforge.com/)"
echo ""
echo "2. Si no has creado la base de datos, ejecuta:"
echo "   mysql -u root -p < database.sql"
echo ""
echo "3. Configura tu servidor web:"
echo "   - Apache: .htaccess ya está configurado"
echo "   - Nginx: Copia nginx.conf a tu configuración"
echo ""
echo "4. Accede a la aplicación en tu navegador:"
echo "   http://localhost o http://tu-dominio.com"
echo ""
echo "5. Registra una cuenta y comienza a crear modpacks"
echo ""
print_success "¡Disfruta creando modpacks!"

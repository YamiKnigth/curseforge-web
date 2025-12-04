-- =============================================================================
-- database.sql
-- Script SQL para crear la base de datos y las tablas del gestor de modpacks
-- de CurseForge
-- 
-- Instrucciones:
-- 1. Asegúrate de tener MySQL o MariaDB instalado
-- 2. Ejecuta este script: mysql -u root -p < database.sql
-- 3. Configura las credenciales en config.php
-- =============================================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `curseforge_manager`;

-- Usar la base de datos
USE `curseforge_manager`;

-- =============================================================================
-- TABLA: users
-- Almacena los usuarios registrados en la aplicación
-- =============================================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del usuario',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre de usuario único',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Hash de la contraseña (bcrypt)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del usuario',
  INDEX `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabla de usuarios registrados';

-- =============================================================================
-- TABLA: modpacks
-- Almacena la información de los modpacks creados por los usuarios
-- =============================================================================

CREATE TABLE IF NOT EXISTS `modpacks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del modpack',
  `user_id` INT NOT NULL COMMENT 'ID del usuario propietario',
  `name` VARCHAR(100) NOT NULL COMMENT 'Nombre del modpack',
  `description` TEXT COMMENT 'Descripción del modpack',
  `minecraft_version` VARCHAR(20) NOT NULL COMMENT 'Versión de Minecraft',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_name` (`name`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabla de modpacks';

-- =============================================================================
-- TABLA: modpack_mods
-- Relaciona los mods con cada modpack (tabla de relación N:M)
-- =============================================================================

CREATE TABLE IF NOT EXISTS `modpack_mods` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la relación',
  `modpack_id` INT NOT NULL COMMENT 'ID del modpack',
  `curseforge_project_id` INT NOT NULL COMMENT 'ID del proyecto en CurseForge',
  `curseforge_file_id` INT NOT NULL COMMENT 'ID del archivo específico en CurseForge',
  `required` BOOLEAN DEFAULT TRUE COMMENT 'Indica si el mod es requerido u opcional',
  INDEX `idx_modpack_id` (`modpack_id`),
  INDEX `idx_project_id` (`curseforge_project_id`),
  UNIQUE KEY `unique_modpack_mod` (`modpack_id`, `curseforge_project_id`, `curseforge_file_id`),
  FOREIGN KEY (`modpack_id`) REFERENCES `modpacks`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabla de relación entre modpacks y mods';

-- =============================================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- Puedes descomentar estas líneas para insertar datos de prueba
-- =============================================================================

-- Usuario de prueba (contraseña: test123)
-- INSERT INTO `users` (`username`, `password_hash`) 
-- VALUES ('testuser', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================

-- Mostrar las tablas creadas
SHOW TABLES;

-- Mostrar la estructura de cada tabla
DESCRIBE `users`;
DESCRIBE `modpacks`;
DESCRIBE `modpack_mods`;

-- database.sql
-- Script para crear las tablas necesarias en tu base de datos MySQL.

CREATE DATABASE IF NOT EXISTS `s7_curseforge_web`;

USE `s7_curseforge_web`;

-- Tabla para almacenar los perfiles de usuario
-- Por ahora, es una estructura simple. Se puede expandir para incluir sesiones, etc.
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla para almacenar la configuración de los modpacks
CREATE TABLE `modpacks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `game_id` INT DEFAULT 432, -- 432 es el ID de Minecraft
  `minecraft_version` VARCHAR(50) NOT NULL,
  `modloader_type` VARCHAR(50) NOT NULL, -- "Forge", "Fabric", "Quilt", etc.
  `modloader_version` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla para relacionar los mods con un modpack específico
CREATE TABLE `modpack_mods` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `modpack_id` INT NOT NULL,
  `mod_id` INT NOT NULL, -- El ID del mod en CurseForge
  `is_required` BOOLEAN DEFAULT TRUE,
  UNIQUE KEY `modpack_mod_unique` (`modpack_id`, `mod_id`), -- Evita duplicados
  FOREIGN KEY (`modpack_id`) REFERENCES `modpacks`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

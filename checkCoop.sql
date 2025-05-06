-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-05-2025 a las 12:29:11
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `checkcoop`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `razon_social` varchar(255) DEFAULT NULL,
  `nif_cif` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `email_contacto` varchar(255) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id`, `nombre`, `razon_social`, `nif_cif`, `direccion`, `email_contacto`, `telefono`, `created_at`, `updated_at`) VALUES
(1, 'CheckCoop', 'CheckCoop.SL', 'B1234567J', 'C/ Señorío de La Sal, nº 69', 'checkCoop@info.com', '91027570', '2025-05-01 11:02:00', '2025-05-01 11:02:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('superadmin','admin','usuario') NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `empresa_id`, `nombre`, `apellidos`, `email`, `password_hash`, `rol`, `activo`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 1, 'Gabriel', 'Callejón Sánchez', 'gabriel@checkcoop.com', '$2b$12$KIXu1nYWM5k9VhFZFDxG5eH1mAqz2J1n9WUsqGgBu.yGh7OzT8G0m', 'superadmin', 0, NULL, '2025-05-01 11:25:43', '2025-05-01 11:26:13'),
(2, 1, 'Francisco Javier', 'Usero Sánchez', 'fran@checkcoop.com', '$2b$12$6l.bFDgcm8bmKa8lJFc71e.M5LDrFNHrsBYXcYho49539NlgLeMNu', 'superadmin', 0, NULL, '2025-05-01 11:25:43', '2025-05-01 11:26:17');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_empresas_nombre` (`nombre`),
  ADD UNIQUE KEY `uk_empresas_nif_cif` (`nif_cif`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_usuario_empresa_email` (`empresa_id`,`email`),
  ADD UNIQUE KEY `uk_usuarios_email` (`email`),
  ADD KEY `idx_usuarios_empresa_id` (`empresa_id`),
  ADD KEY `idx_usuarios_rol` (`rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_empresas` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

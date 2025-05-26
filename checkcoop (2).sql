-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 26-05-2025 a las 19:51:37
-- Versión del servidor: 8.0.42-0ubuntu0.22.04.1
-- Versión de PHP: 8.1.2-1ubuntu2.21

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
  `id` bigint UNSIGNED NOT NULL,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `razon_social` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nif_cif` varchar(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `email_contacto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id`, `nombre`, `razon_social`, `nif_cif`, `direccion`, `email_contacto`, `telefono`, `created_at`, `updated_at`) VALUES
(1, 'CheckCoop', 'CheckCoop.SL', 'B1234567J', 'C/ Señorío de La Sal, nº 69', 'checkCoop@info.com', 91027570, '2025-05-01 11:02:00', '2025-05-01 11:02:00'),
(3, 'elPepe', 'elPepe COAN', '12345678P', 'Calle Leonardo de Figueroa 80', 'elPepe@company.org', 640967800, '2025-05-17 13:42:04', '2025-05-17 13:42:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes_perfil`
--

CREATE TABLE `imagenes_perfil` (
  `id` bigint UNSIGNED NOT NULL,
  `usuario_id` bigint UNSIGNED NOT NULL,
  `ruta_imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jornadas`
--

CREATE TABLE `jornadas` (
  `id` bigint UNSIGNED NOT NULL,
  `usuario_id` bigint UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `hora_entrada` datetime DEFAULT NULL,
  `hora_salida` datetime DEFAULT NULL,
  `duracion` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `llego_tarde` tinyint(1) DEFAULT '0',
  `cumplio_jornada` tinyint(1) DEFAULT '0',
  `total_minutos` int DEFAULT '0',
  `tipo_id` tinyint DEFAULT NULL,
  `partida` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `jornadas`
--

INSERT INTO `jornadas` (`id`, `usuario_id`, `fecha`, `hora_entrada`, `hora_salida`, `duracion`, `created_at`, `updated_at`, `llego_tarde`, `cumplio_jornada`, `total_minutos`, `tipo_id`, `partida`) VALUES
(1, 8, '2025-05-19', NULL, NULL, NULL, '2025-05-19 00:30:17', '2025-05-19 00:30:17', 0, 0, 0, NULL, 0),
(3, 8, '2025-05-24', NULL, NULL, NULL, '2025-05-24 13:01:39', '2025-05-24 13:01:39', 0, 0, 0, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jornada_tramos`
--

CREATE TABLE `jornada_tramos` (
  `id` bigint UNSIGNED NOT NULL,
  `jornada_id` bigint UNSIGNED NOT NULL,
  `hora_inicio` datetime NOT NULL,
  `hora_fin` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `jornada_tramos`
--

INSERT INTO `jornada_tramos` (`id`, `jornada_id`, `hora_inicio`, `hora_fin`) VALUES
(57, 1, '2025-05-19 00:40:00', '2025-05-31 06:39:00'),
(58, 1, '2025-05-19 21:02:00', '2025-05-19 21:37:00'),
(59, 1, '2025-05-19 21:02:00', '2025-05-19 21:37:00'),
(60, 1, '2025-05-19 21:37:00', '2025-05-19 21:37:00'),
(62, 3, '2025-05-24 13:01:39', '2025-05-24 13:01:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int NOT NULL,
  `numEmpresa` int NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `cantidad` int NOT NULL DEFAULT '0',
  `unidad` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'unidad',
  `categoria` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `precio` decimal(10,2) NOT NULL DEFAULT '0.00',
  `imagen` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `numEmpresa`, `nombre`, `descripcion`, `cantidad`, `unidad`, `categoria`, `created_at`, `updated_at`, `precio`, `imagen`) VALUES
(5, 1, 'aaa', 'buenasg\r\n', 5, 'kg', 'a', '2025-05-20 16:02:14', '2025-05-26 17:21:52', '3.00', '/uploads/Untitled Project(3).jpg'),
(10, 1, 'a', 'a', 26, 'unidad', 'a', '2025-05-20 17:07:20', '2025-05-26 17:31:05', '2.00', '/uploads/23.jpg'),
(16, 1, 'a', 'aaa', 0, 'unidad', 'aaaa', '2025-05-26 17:48:13', '2025-05-26 17:48:13', '3.00', '/uploads/1748281693126-Copia_de_Copia_de_plantilla2__6_.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas`
--

CREATE TABLE `tareas` (
  `id` bigint UNSIGNED NOT NULL,
  `usuario_id` bigint UNSIGNED NOT NULL,
  `empresa_id` bigint UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text,
  `estado` enum('pendiente','en progreso','completada','cancelada') DEFAULT 'pendiente',
  `prioridad` enum('baja','media','alta') DEFAULT 'media',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `tareas`
--

INSERT INTO `tareas` (`id`, `usuario_id`, `empresa_id`, `fecha`, `titulo`, `descripcion`, `estado`, `prioridad`, `created_at`, `updated_at`) VALUES
(3, 8, 1, '2025-05-21', 'ada', 'a', 'pendiente', 'media', '2025-05-21 20:11:09', '2025-05-21 20:40:51'),
(13, 8, 1, '2025-05-20', 'aa', 'a', 'en progreso', 'media', '2025-05-21 21:02:04', '2025-05-21 21:31:17'),
(17, 6, 1, '2025-05-24', 'ada', 'aa', 'pendiente', 'media', '2025-05-24 13:32:24', '2025-05-24 13:32:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_jornada`
--

CREATE TABLE `tipo_jornada` (
  `id` tinyint NOT NULL,
  `descripcion` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_jornada`
--

INSERT INTO `tipo_jornada` (`id`, `descripcion`) VALUES
(1, 'Completa'),
(2, 'Incompleta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint UNSIGNED NOT NULL,
  `empresa_id` bigint UNSIGNED NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `apellidos` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` int NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `rol` enum('superadmin','admin','usuario') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `hora_inicio_1` time DEFAULT '09:00:00',
  `hora_fin_1` time DEFAULT '13:00:00',
  `hora_inicio_2` time DEFAULT '09:00:00',
  `hora_fin_2` time DEFAULT '13:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `empresa_id`, `nombre`, `apellidos`, `email`, `telefono`, `password_hash`, `rol`, `activo`, `last_login`, `created_at`, `updated_at`, `hora_inicio_1`, `hora_fin_1`, `hora_inicio_2`, `hora_fin_2`) VALUES
(1, 1, 'Gabriel', 'Callejón Sánchez', 'gabriel@checkcoop.com', 640967800, '$2b$12$IQdepNoSxKApBT7w3YChn.8gq/7nPpCr8ypDGcKyhK4efAmySVxZC', 'superadmin', 1, NULL, '2025-05-01 11:25:43', '2025-05-17 13:14:08', '09:00:00', '13:00:00', '09:00:00', '13:00:00'),
(6, 1, 'Francisco', 'Usero', 'fran@checkcoop.com', 123456789, '$2b$10$8xck3i1.IHGkV9oJMPUI4eN6UZUb7dzJMBrxIyk8UcYylPRU52TwO', 'superadmin', 1, NULL, '2025-05-08 19:48:57', '2025-05-17 11:57:01', '09:00:00', '13:00:00', '09:00:00', '13:00:00'),
(7, 1, 'el Pepe', 'Ete Sech', 'elpepe@checkcoop.com', 123456789, '$2b$10$XNe70TnpbkCANrKeFXvKJ.KxlsIfGcOrUYkIwwIQzjuugrEF694he', 'admin', 1, NULL, '2025-05-17 12:41:16', '2025-05-17 12:41:16', '09:00:00', '13:00:00', '09:00:00', '13:00:00'),
(8, 1, 'franE', 'Usero', 'franE@checkcoop.com', 640295526, '$2b$10$yrEOZHLzPWY3i71jhLEwd.Oc78unY.QMn/M.PG0Vu3AaGHZOyksFa', 'usuario', 1, NULL, '2025-05-18 21:00:23', '2025-05-18 21:00:23', '09:00:00', '13:00:00', '09:00:00', '13:00:00');

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
-- Indices de la tabla `imagenes_perfil`
--
ALTER TABLE `imagenes_perfil`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_usuario_id` (`usuario_id`);

--
-- Indices de la tabla `jornadas`
--
ALTER TABLE `jornadas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_fecha` (`usuario_id`,`fecha`),
  ADD KEY `tipo_id` (`tipo_id`);

--
-- Indices de la tabla `jornada_tramos`
--
ALTER TABLE `jornada_tramos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jornada_id` (`jornada_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `empresa_id` (`empresa_id`);

--
-- Indices de la tabla `tipo_jornada`
--
ALTER TABLE `tipo_jornada`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `imagenes_perfil`
--
ALTER TABLE `imagenes_perfil`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jornadas`
--
ALTER TABLE `jornadas`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `jornada_tramos`
--
ALTER TABLE `jornada_tramos`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `imagenes_perfil`
--
ALTER TABLE `imagenes_perfil`
  ADD CONSTRAINT `fk_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD CONSTRAINT `tareas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tareas_ibfk_2` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_empresas` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

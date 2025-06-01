-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-06-2025 a las 14:48:25
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

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
  `nif_cif` varchar(9) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `email_contacto` varchar(255) DEFAULT NULL,
  `telefono` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id`, `nombre`, `razon_social`, `nif_cif`, `direccion`, `email_contacto`, `telefono`, `created_at`, `updated_at`) VALUES
(1, 'CheckCoop', 'CheckCoop.SL', 'B1234567J', 'C/ Señorío de La Sal, nº 69', 'checkCoop@info.com', 91027570, '2025-05-01 11:02:00', '2025-05-01 11:02:00'),
(3, 'elPepe', 'elPepe COAN', '12345678P', 'Calle Leonardo de Figueroa 80', 'elPepe@company.org', 640967800, '2025-05-17 13:42:04', '2025-05-17 13:42:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jornadas`
--

CREATE TABLE `jornadas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `hora_entrada` datetime DEFAULT NULL,
  `hora_salida` datetime DEFAULT NULL,
  `duracion` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `llego_tarde` tinyint(1) DEFAULT 0,
  `cumplio_jornada` tinyint(1) DEFAULT 0,
  `total_minutos` int(11) DEFAULT 0,
  `tipo_id` tinyint(4) DEFAULT NULL,
  `partida` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `jornadas`
--

INSERT INTO `jornadas` (`id`, `usuario_id`, `fecha`, `hora_entrada`, `hora_salida`, `duracion`, `created_at`, `updated_at`, `llego_tarde`, `cumplio_jornada`, `total_minutos`, `tipo_id`, `partida`) VALUES
(1, 8, '2025-05-19', NULL, NULL, NULL, '2025-05-19 00:30:17', '2025-05-19 00:30:17', 0, 0, 0, NULL, 0),
(3, 8, '2025-05-24', NULL, NULL, NULL, '2025-05-24 13:01:39', '2025-05-24 13:01:39', 0, 0, 0, NULL, 0),
(4, 19, '2025-06-01', NULL, NULL, NULL, '2025-06-01 13:22:29', '2025-06-01 13:22:29', 0, 0, 0, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jornada_tramos`
--

CREATE TABLE `jornada_tramos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `jornada_id` bigint(20) UNSIGNED NOT NULL,
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
(62, 3, '2025-05-24 13:01:39', '2025-05-24 13:01:41'),
(63, 4, '2025-06-01 13:22:29', '2025-06-01 13:23:14'),
(64, 4, '2025-06-01 13:26:50', '2025-06-01 13:26:54'),
(65, 4, '2025-06-01 13:26:57', '2025-06-01 13:26:59'),
(66, 4, '2025-06-01 14:41:19', '2025-06-01 14:41:22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `numEmpresa` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 0,
  `unidad` varchar(20) DEFAULT 'unidad',
  `categoria` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `imagen` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `numEmpresa`, `nombre`, `descripcion`, `cantidad`, `unidad`, `categoria`, `created_at`, `updated_at`, `precio`, `imagen`) VALUES
(24, 1, 'Cucumius Sativus', 'Pepino común', 25, 'kg', 'Hortaliza', '2025-06-01 09:36:00', '2025-06-01 10:03:49', 1.20, '/uploads/1748770560486-pepino_ktTD_U22060900288AKB_1200x840_La_Verdad.webp'),
(25, 1, 'El Arrebato', 'Artista musical', 1, 'Unidad', 'Músicos', '2025-06-01 10:30:38', '2025-06-01 10:30:38', 31000.50, '/uploads/1748773838603-images.jpg'),
(26, 1, 'Ficus Carica', 'Higo', 580, 'kg', 'Frutas', '2025-06-01 10:32:48', '2025-06-01 10:32:48', 2.20, '/uploads/1748773968784-higos_frescos_2022.jpg'),
(27, 1, 'Solanum lycopersicum \'Raf\'', 'Tomate Raf', 223, 'kg', 'Hortaliza', '2025-06-01 10:34:04', '2025-06-01 10:34:04', 2.80, '/uploads/1748774044929-images__1_.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas`
--

CREATE TABLE `tareas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('pendiente','en progreso','completada','cancelada') DEFAULT 'pendiente',
  `prioridad` enum('baja','media','alta') DEFAULT 'media',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tareas`
--

INSERT INTO `tareas` (`id`, `usuario_id`, `empresa_id`, `fecha`, `titulo`, `descripcion`, `estado`, `prioridad`, `created_at`, `updated_at`) VALUES
(21, 22, 1, '2025-06-03', 'Traspalear palés', 'Llevar los palés de  género tomate Raf a la cámara frigorífica', 'en progreso', 'media', '2025-06-01 13:01:20', '2025-06-01 13:01:20'),
(22, 19, 1, '2025-06-01', 'Comprobar fichaje usuarios', 'Comprobar el fichaje de usuarios en la cooperativa', 'en progreso', 'alta', '2025-06-01 13:08:28', '2025-06-01 13:08:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_jornada`
--

CREATE TABLE `tipo_jornada` (
  `id` tinyint(4) NOT NULL,
  `descripcion` varchar(20) DEFAULT NULL
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
  `id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` int(11) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('superadmin','admin','usuario') NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hora_inicio_1` time DEFAULT '09:00:00',
  `hora_fin_1` time DEFAULT '13:00:00',
  `hora_inicio_2` time DEFAULT '09:00:00',
  `hora_fin_2` time DEFAULT '13:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `empresa_id`, `nombre`, `apellidos`, `email`, `telefono`, `password_hash`, `rol`, `activo`, `last_login`, `created_at`, `updated_at`, `hora_inicio_1`, `hora_fin_1`, `hora_inicio_2`, `hora_fin_2`) VALUES
(1, 1, 'Gabriel', 'Callejón Sánchez', 'gabriel@checkcoop.com', 640967800, '$2b$12$IQdepNoSxKApBT7w3YChn.8gq/7nPpCr8ypDGcKyhK4efAmySVxZC', 'superadmin', 1, '2025-06-01 14:43:04', '2025-05-01 11:25:43', '2025-06-01 14:43:04', '09:00:00', '13:00:00', '09:00:00', '13:00:00'),
(6, 1, 'Francisco', 'Usero', 'fran@checkcoop.com', 123456789, '$2b$10$8xck3i1.IHGkV9oJMPUI4eN6UZUb7dzJMBrxIyk8UcYylPRU52TwO', 'superadmin', 1, NULL, '2025-05-08 19:48:57', '2025-05-17 11:57:01', '09:00:00', '13:00:00', '09:00:00', '13:00:00'),
(17, 1, 'Johan Alejandro', 'Madero Perez', 'johan@checkcoop.com', 696969696, '$2b$10$A0jAfbBG3vPEEROKQqcnLespF5FGv3oUrILS5l14GwtpnZRVL1Gme', 'usuario', 1, '2025-06-01 13:46:19', '2025-06-01 12:09:25', '2025-06-01 13:46:19', '17:15:00', '18:15:00', NULL, NULL),
(18, 1, 'Gabriel Admin', 'Callejón Sánchez', 'gabriel0@checkcoop.com', 640967800, '$2b$10$UprleI5zNAY526cuuSJ/6OMQ5JaaGDa/NFhfaivvMUCA88Afb/2Oy', 'admin', 1, '2025-06-01 13:09:07', '2025-06-01 12:19:17', '2025-06-01 13:09:07', '15:23:00', '17:25:00', NULL, NULL),
(19, 1, 'Gabriel Useer', 'Callejón Sánchez', 'gabriel00@checkcoop.com', 640967800, '$2b$10$4p/XBrFYmWLjstyyfgNIJ.wR10dlKS.GqqNLnzPNRNMKt7ceAjHTC', 'usuario', 1, '2025-06-01 14:41:15', '2025-06-01 12:19:49', '2025-06-01 14:41:15', '17:25:00', '18:25:00', NULL, NULL),
(20, 3, 'Gabriel', 'Callejón Sánchez', 'gabriel12@checkcoop.com', 640967800, '$2b$10$j176wtXS.7507pCnF0Eh1ubZOAVb73M0adsrO0rVOxDbV6MytClee', 'admin', 1, NULL, '2025-06-01 12:21:02', '2025-06-01 12:21:02', '16:25:00', '18:27:00', NULL, NULL),
(22, 1, 'José Luis ', 'Cantero Rada \"Fary\"', 'elfary@checkcoop.com', 111111111, '$2b$10$nkbRPCPZMmC916mxSVAxBObY.4GFP5s1nQkJZH3UAs7CR5ntS/5Pm', 'admin', 1, '2025-06-01 13:45:48', '2025-06-01 12:36:02', '2025-06-01 13:45:48', '18:41:00', '18:41:00', NULL, NULL);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `jornadas`
--
ALTER TABLE `jornadas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `jornada_tramos`
--
ALTER TABLE `jornada_tramos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Restricciones para tablas volcadas
--

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

<?php
if (!isset($_SESSION)) session_start();
$usuario = $_SESSION['usuario'] ?? null;
$is_admin = $usuario && $usuario['tipo'] === 'admin';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Checkcoop</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="/assets/css/styles.css" rel="stylesheet">
  <style>
    body { padding-top: 0; }
    .sidebar {
      height: 100vh;
      position: fixed;
      width: 220px;
      background-color: #343a40;
      padding-top: 1rem;
    }
    .sidebar a {
      color: #ffffff;
      display: block;
      padding: 10px 15px;
      text-decoration: none;
    }
    .sidebar a:hover {
      background-color: #495057;
    }
    .content {
      margin-left: 220px;
      padding: 20px;
    }
    @media (max-width: 768px) {
      .sidebar { position: relative; width: 100%; height: auto; }
      .content { margin-left: 0; }
    }
  </style>
</head>
<body>

<div class="sidebar">
  <div class="text-center text-white fw-bold mb-3">Checkcoop</div>
  <a href="/dashboard.php">📊 Dashboard</a>

  <?php if ($is_admin): ?>
    <a href="/historial.php">🕓 Historial</a>
    <a href="/puestos.php">🧑‍💼 Asignar puestos</a>
    <a href="/inventario.php">📦 Inventario</a>
  <?php else: ?>
    <a href="/fichar.php">🕔 Fichar</a>
    <a href="/historial.php">🕓 Mi historial</a>
  <?php endif; ?>

  <a href="/logout.php">🚪 Cerrar sesión</a>
</div>

<div class="content">

<?php
session_start();
require_once __DIR__ . '/../src/db.php';

if (!isset($_SESSION['usuario'])) {
    header("Location: index.php");
    exit;
}

$usuario = $_SESSION['usuario'];
$is_admin = $usuario['tipo'] === 'admin';

// Si es admin, puede filtrar por usuario
$usuarios = [];
$filtro_usuario = '';
$filtro_fecha = '';

// Si es admin, obtener lista de usuarios
if ($is_admin) {
    $usuarios = $pdo->query("SELECT id, nombre FROM usuarios WHERE tipo = 'empleado'")->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($_GET['usuario_id'])) {
        $filtro_usuario = $_GET['usuario_id'];
    }
}

// Filtro por fecha
if (!empty($_GET['fecha'])) {
    $filtro_fecha = $_GET['fecha'];
}

// Construir consulta
$query = "SELECT f.*, u.nombre FROM fichajes f JOIN usuarios u ON f.usuario_id = u.id WHERE 1";

$params = [];

if (!$is_admin) {
    $query .= " AND f.usuario_id = ?";
    $params[] = $usuario['id'];
} elseif ($filtro_usuario) {
    $query .= " AND f.usuario_id = ?";
    $params[] = $filtro_usuario;
}

if ($filtro_fecha) {
    $query .= " AND DATE(f.fecha) = ?";
    $params[] = $filtro_fecha;
}

$query .= " ORDER BY f.fecha DESC";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$fichajes = $stmt->fetchAll(PDO::FETCH_ASSOC);

include('includes/header.php');
?>

<h2>Historial de Fichajes</h2>

<form class="row mb-4" method="GET">
    <?php if ($is_admin): ?>
    <div class="col-md-4">
        <label>Empleado</label>
        <select name="usuario_id" class="form-select">
            <option value="">-- Todos --</option>
            <?php foreach ($usuarios as $u): ?>
                <option value="<?= $u['id'] ?>" <?= $filtro_usuario == $u['id'] ? 'selected' : '' ?>>
                    <?= htmlspecialchars($u['nombre']) ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>
    <?php endif; ?>
    <div class="col-md-3">
        <label>Fecha</label>
        <input type="date" name="fecha" class="form-control" value="<?= htmlspecialchars($filtro_fecha) ?>">
    </div>
    <div class="col-md-2 align-self-end">
        <button class="btn btn-primary w-100">Filtrar</button>
    </div>
</form>

<table class="table table-bordered table-hover">
    <thead>
        <tr>
            <?php if ($is_admin): ?><th>Empleado</th><?php endif; ?>
            <th>Tipo</th>
            <th>Fecha y hora</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($fichajes as $f): ?>
        <tr>
            <?php if ($is_admin): ?><td><?= htmlspecialchars($f['nombre']) ?></td><?php endif; ?>
            <td><?= ucfirst($f['tipo']) ?></td>
            <td><?= date('d/m/Y H:i', strtotime($f['fecha'])) ?></td>
        </tr>
        <?php endforeach; ?>
    </tbody>
</table>

<?php include('includes/footer.php'); ?>

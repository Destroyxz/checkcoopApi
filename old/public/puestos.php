<?php
session_start();
require_once __DIR__ . '/../src/db.php';

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'admin') {
    header("Location: index.php");
    exit;
}

// Actualizar puesto de empleado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['empleado_id'], $_POST['puesto_id'])) {
    $stmt = $pdo->prepare("UPDATE usuarios SET puesto_id = ? WHERE id = ?");
    $stmt->execute([$_POST['puesto_id'], $_POST['empleado_id']]);
    $mensaje = "Puesto asignado correctamente.";
}

// Obtener empleados
$empleados = $pdo->query("SELECT u.id, u.nombre, p.nombre AS puesto 
                          FROM usuarios u 
                          LEFT JOIN puestos p ON u.puesto_id = p.id 
                          WHERE u.tipo = 'empleado'
                          ORDER BY u.nombre")->fetchAll(PDO::FETCH_ASSOC);

// Obtener todos los puestos
$puestos = $pdo->query("SELECT * FROM puestos")->fetchAll(PDO::FETCH_ASSOC);

include('includes/header.php');
?>

<h2>Asignar Puestos</h2>

<?php if (isset($mensaje)): ?>
    <div class="alert alert-success"><?= $mensaje ?></div>
<?php endif; ?>

<table class="table table-bordered">
    <thead>
        <tr>
            <th>Empleado</th>
            <th>Puesto actual</th>
            <th>Nuevo puesto</th>
            <th>Acción</th>
        </tr>
    </thead>
    <tbody>
    <?php foreach ($empleados as $empleado): ?>
        <tr>
            <form method="POST">
                <td><?= htmlspecialchars($empleado['nombre']) ?></td>
                <td><?= htmlspecialchars($empleado['puesto'] ?? 'Sin asignar') ?></td>
                <td>
                    <select name="puesto_id" class="form-select">
                        <?php foreach ($puestos as $puesto): ?>
                            <option value="<?= $puesto['id'] ?>"><?= $puesto['nombre'] ?></option>
                        <?php endforeach; ?>
                    </select>
                </td>
                <td>
                    <input type="hidden" name="empleado_id" value="<?= $empleado['id'] ?>">
                    <button class="btn btn-primary btn-sm">Asignar</button>
                </td>
            </form>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>

<?php include('includes/footer.php'); ?>

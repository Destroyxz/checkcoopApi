<?php
require_once __DIR__ . '/../src/db.php';
session_start();
include('includes/header.php');
//Vemos si esta iniciada
if (!isset($_SESSION['usuario'])) {
    header("Location: index.php");
    exit;
}

$usuario = $_SESSION['usuario'];
$es_admin = $usuario['tipo'] === 'admin';

// Fichar (si empleado)
if (!$es_admin && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $tipo = $_POST['tipo'];

    $stmt = $pdo->prepare("INSERT INTO fichajes (usuario_id, tipo) VALUES (?, ?)");
    $stmt->execute([$usuario['id'], $tipo]);

    echo "<div class='alert alert-success'>Fichaje de $tipo registrado con éxito.</div>";
}
?>

<h2 class="mb-4"><?= $es_admin ? 'Historial de fichajes' : 'Fichar entrada/salida' ?></h2>

<?php if (!$es_admin): ?>
    <form method="POST" class="mb-4">
        <div class="btn-group w-100">
            <button type="submit" name="tipo" value="entrada" class="btn btn-success">Fichar Entrada</button>
            <button type="submit" name="tipo" value="salida" class="btn btn-danger">Fichar Salida</button>
        </div>
    </form>
<?php endif; ?>

<table class="table table-striped table-hover">
    <thead class="table-dark">
        <tr>
            <?php if ($es_admin): ?><th>Empleado</th><?php endif; ?>
            <th>Tipo</th>
            <th>Fecha y hora</th>
        </tr>
    </thead>
    <tbody>
        <?php
        if ($es_admin) {
            $stmt = $pdo->query("SELECT f.*, u.nombre FROM fichajes f JOIN usuarios u ON f.usuario_id = u.id ORDER BY f.fecha DESC LIMIT 50");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM fichajes WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 20");
            $stmt->execute([$usuario['id']]);
        }

        foreach ($stmt as $fichaje):
        ?>
        <tr>
            <?php if ($es_admin): ?><td><?= htmlspecialchars($fichaje['nombre']) ?></td><?php endif; ?>
            <td><?= ucfirst($fichaje['tipo']) ?></td>
            <td><?= date("d/m/Y H:i", strtotime($fichaje['fecha'])) ?></td>
        </tr>
        <?php endforeach; ?>
    </tbody>
</table>

<?php include('includes/footer.php'); ?>

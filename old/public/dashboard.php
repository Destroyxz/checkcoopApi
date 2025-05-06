<?php
session_start();
require_once __DIR__ . '/../src/db.php';

$usuario = $_SESSION['usuario'] ?? null;
if (!$usuario) {
    header('Location: index.php');
    exit;
}

include('includes/header.php');

$is_admin = $usuario['tipo'] === 'admin';
?>

<h2>Bienvenido, <?= htmlspecialchars($usuario['nombre']) ?> 👋</h2>

<?php if ($is_admin): ?>
    <div class="row my-4">
        <!-- Totales -->
        <div class="col-md-3">
            <div class="card text-white bg-primary mb-3">
                <div class="card-body">
                    <h5 class="card-title">Empleados</h5>
                    <p class="card-text display-6">
                        <?= $pdo->query("SELECT COUNT(*) FROM usuarios WHERE tipo='empleado'")->fetchColumn(); ?>
                    </p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-success mb-3">
                <div class="card-body">
                    <h5 class="card-title">Fichajes hoy</h5>
                    <p class="card-text display-6">
                        <?= $pdo->query("SELECT COUNT(*) FROM fichajes WHERE DATE(fecha) = CURDATE()")->fetchColumn(); ?>
                    </p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-warning mb-3">
                <div class="card-body">
                    <h5 class="card-title">Productos</h5>
                    <p class="card-text display-6">
                        <?= $pdo->query("SELECT COUNT(*) FROM inventario")->fetchColumn(); ?>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Gráfico -->
    <div class="card mt-4">
        <div class="card-body">
            <h5>Fichajes últimos 7 días</h5>
            <canvas id="fichajesChart"></canvas>
        </div>
    </div>

    <?php
    $dias = [];
    $conteos = [];

    for ($i = 6; $i >= 0; $i--) {
        $fecha = date('Y-m-d', strtotime("-$i days"));
        $dias[] = date('d/m', strtotime($fecha));
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM fichajes WHERE DATE(fecha) = ?");
        $stmt->execute([$fecha]);
        $conteos[] = $stmt->fetchColumn();
    }
    ?>
    <script>
        const ctx = document.getElementById('fichajesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: <?= json_encode($dias) ?>,
                datasets: [{
                    label: 'Fichajes por día',
                    data: <?= json_encode($conteos) ?>,
                    borderWidth: 1
                }]
            },
        });
    </script>

<?php else: ?>

    <?php
    $stmt = $pdo->prepare("SELECT * FROM fichajes WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 1");
    $stmt->execute([$usuario['id']]);
    $ultimo = $stmt->fetch(PDO::FETCH_ASSOC);

    $total = $pdo->prepare("SELECT COUNT(*) FROM fichajes WHERE usuario_id = ?");
    $total->execute([$usuario['id']]);
    $total_fichajes = $total->fetchColumn();

    $semana = $pdo->prepare("SELECT COUNT(*) FROM fichajes WHERE usuario_id = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
    $semana->execute([$usuario['id']]);
    $fichajes_semana = $semana->fetchColumn();
    ?>

    <div class="row my-4">
        <div class="col-md-4">
            <div class="card bg-info text-white mb-3">
                <div class="card-body">
                    <h5 class="card-title">Total Fichajes</h5>
                    <p class="card-text display-6"><?= $total_fichajes ?></p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card bg-secondary text-white mb-3">
                <div class="card-body">
                    <h5 class="card-title">Esta Semana</h5>
                    <p class="card-text display-6"><?= $fichajes_semana ?></p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card bg-dark text-white mb-3">
                <div class="card-body">
                    <h5 class="card-title">Último fichaje</h5>
                    <p class="card-text">
                        <?php if ($ultimo): ?>
                            <?= ucfirst($ultimo['tipo']) ?> – <?= date('d/m/Y H:i', strtotime($ultimo['fecha'])) ?>
                        <?php else: ?>
                            Aún no has fichado
                        <?php endif; ?>
                    </p>
                </div>
            </div>
        </div>
    </div>

<?php endif; ?>

<?php include('includes/footer.php'); ?>

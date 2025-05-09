<?php
session_start();
require_once __DIR__ . '/../src/db.php';

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'admin') {
    header("Location: index.php");
    exit;
}

// CREAR producto
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['accion']) && $_POST['accion'] === 'crear') {
    $stmt = $pdo->prepare("INSERT INTO inventario (nombre, descripcion, cantidad) VALUES (?, ?, ?)");
    $stmt->execute([$_POST['nombre'], $_POST['descripcion'], $_POST['cantidad']]);
    $mensaje = "Producto agregado correctamente.";
}

// ACTUALIZAR producto
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['accion'] === 'editar') {
    $stmt = $pdo->prepare("UPDATE inventario SET nombre = ?, descripcion = ?, cantidad = ? WHERE id = ?");
    $stmt->execute([$_POST['nombre'], $_POST['descripcion'], $_POST['cantidad'], $_POST['id']]);
    $mensaje = "Producto actualizado.";
}

// ELIMINAR producto
if (isset($_GET['eliminar'])) {
    $stmt = $pdo->prepare("DELETE FROM inventario WHERE id = ?");
    $stmt->execute([$_GET['eliminar']]);
    $mensaje = "Producto eliminado.";
}

// Obtener productos
$productos = $pdo->query("SELECT * FROM inventario ORDER BY actualizado_en DESC")->fetchAll(PDO::FETCH_ASSOC);

include('includes/header.php');
?>

<h2>Inventario</h2>

<?php if (isset($mensaje)): ?>
    <div class="alert alert-success"><?= $mensaje ?></div>
<?php endif; ?>

<!-- Formulario de nuevo producto -->
<div class="card mb-4">
  <div class="card-body">
    <h5>Agregar producto</h5>
    <form method="POST">
      <input type="hidden" name="accion" value="crear">
      <div class="row">
        <div class="col-md-4 mb-2">
          <input type="text" name="nombre" class="form-control" placeholder="Nombre" required>
        </div>
        <div class="col-md-4 mb-2">
          <input type="text" name="descripcion" class="form-control" placeholder="Descripción">
        </div>
        <div class="col-md-2 mb-2">
          <input type="number" name="cantidad" class="form-control" placeholder="Cantidad" required>
        </div>
        <div class="col-md-2 mb-2">
          <button class="btn btn-success w-100">Agregar</button>
        </div>
      </div>
    </form>
  </div>
</div>

<!-- Tabla de productos -->
<table class="table table-bordered table-hover">
  <thead>
    <tr>
      <th>Nombre</th>
      <th>Descripción</th>
      <th>Cantidad</th>
      <th>Última actualización</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($productos as $producto): ?>
    <tr>
      <form method="POST">
        <input type="hidden" name="accion" value="editar">
        <input type="hidden" name="id" value="<?= $producto['id'] ?>">
        <td><input type="text" name="nombre" class="form-control" value="<?= htmlspecialchars($producto['nombre']) ?>"></td>
        <td><input type="text" name="descripcion" class="form-control" value="<?= htmlspecialchars($producto['descripcion']) ?>"></td>
        <td><input type="number" name="cantidad" class="form-control" value="<?= $producto['cantidad'] ?>"></td>
        <td><?= date('d/m/Y H:i', strtotime($producto['actualizado_en'])) ?></td>
        <td>
          <button class="btn btn-sm btn-primary">Actualizar</button>
          <a href="?eliminar=<?= $producto['id'] ?>" class="btn btn-sm btn-danger" onclick="return confirm('¿Eliminar este producto?')">Eliminar</a>
        </td>
      </form>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>

<?php include('includes/footer.php'); ?>

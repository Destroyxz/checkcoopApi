<?php include('includes/header.php'); ?>

<div class="row justify-content-center">
  <div class="col-md-6">
    <h2 class="text-center">Registro</h2>
    <form method="POST" action="auth.php?action=register">
      <div class="mb-3">
        <label>Nombre</label>
        <input type="text" name="nombre" class="form-control" required>
      </div>
      <div class="mb-3">
        <label>Email</label>
        <input type="email" name="email" class="form-control" required>
      </div>
      <div class="mb-3">
        <label>Contraseña</label>
        <input type="password" name="password" class="form-control" required>
      </div>
      <div class="mb-3">
        <label>Tipo de usuario</label>
        <select name="tipo" class="form-select">
          <option value="empleado">Empleado</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <button type="submit" class="btn btn-success w-100">Registrarme</button>
    </form>
  </div>
</div>

<?php include('includes/footer.php'); ?>

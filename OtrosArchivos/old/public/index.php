<?php include('includes/header.php'); ?>

<div class="row justify-content-center">
  <div class="col-md-5">
    <h2 class="text-center">Iniciar sesión</h2>
    <form method="POST" action="auth.php">
      <div class="mb-3">
        <label>Email</label>
        <input type="email" name="email" class="form-control" required>
      </div>
      <div class="mb-3">
        <label>Contraseña</label>
        <input type="password" name="password" class="form-control" required>
      </div>
      <button type="submit" class="btn btn-primary w-100">Entrar</button>
      <a href="registro.php" class="btn btn-link w-100">¿No tienes cuenta? Regístrate</a>
    </form>
  </div>
</div>

<?php include('includes/footer.php'); ?>

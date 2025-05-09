<?php
require_once __DIR__ . '/../vendor/autoload.php';
use RobThree\Auth\TwoFactorAuth;

session_start();

$tfa = new TwoFactorAuth('Checkcoop');

// Usuario temporal del login
$usuario = $_SESSION['usuario_temp'] ?? null;

if (!$usuario) {
    header("Location: index.php");
    exit;
}

// Si ya se envió el código
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $codigo = $_POST['codigo'];

    if ($tfa->verifyCode($usuario['tfa_secret'], $codigo)) {
        $_SESSION['usuario'] = $usuario;
        unset($_SESSION['usuario_temp']);
        header("Location: dashboard.php");
        exit;
    } else {
        $error = "Código incorrecto";
    }
}
?>

<?php include('includes/header.php'); ?>

<div class="row justify-content-center">
  <div class="col-md-5">
    <h2 class="text-center">Verificación en dos pasos</h2>
    <?php if (isset($error)) echo "<div class='alert alert-danger'>$error</div>"; ?>
    <form method="POST">
      <div class="mb-3">
        <label>Código 2FA</label>
        <input type="text" name="codigo" class="form-control" required>
      </div>
      <button type="submit" class="btn btn-primary w-100">Verificar</button>
    </form>
  </div>
</div>

<?php include('includes/footer.php'); ?>

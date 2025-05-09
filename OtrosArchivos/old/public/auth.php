<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/db.php';

use RobThree\Auth\TwoFactorAuth;

session_start();

$tfa = new TwoFactorAuth('Checkcoop');

// REGISTRO
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['action'] === 'register') {
    $nombre = $_POST['nombre'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $tipo = $_POST['tipo'];

    // Crear secreto 2FA
    $secret = $tfa->createSecret();

    // Guardar usuario
    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, tipo, tfa_secret) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$nombre, $email, $password, $tipo, $secret]);

    // Mostrar QR
    $qrCodeUrl = $tfa->getQRCodeImageAsDataUri($nombre, $secret);
    echo "<h2>Escanea este QR en Google Authenticator</h2><img src='$qrCodeUrl'><br><a href='index.php'>Volver a iniciar sesión</a>";
    exit;
}

// LOGIN
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Buscar usuario
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario && password_verify($password, $usuario['password'])) {
        $_SESSION['usuario_temp'] = $usuario;
        // Pedimos 2FA si está activo
        header('Location: verificacion_2fa.php');
        exit;
    } else {
        echo "Credenciales incorrectas. <a href='index.php'>Volver</a>";
    }
}
?>

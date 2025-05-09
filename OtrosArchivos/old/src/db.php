<?php
$host = 'db5017684907.hosting-data.io';
$db   = 'dbs14141935';
$user = 'dbu319932';
$pass = 'penedestroyxz';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;port=3306;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     throw new \PDOException("Error de conexión: " . $e->getMessage(), (int)$e->getCode());
}
?>

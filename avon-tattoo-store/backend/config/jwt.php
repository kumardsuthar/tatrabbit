<?php
// backend/config/jwt.php
require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function getJwtSecret() {
    return $_ENV['JWT_SECRET'] ?? 'c8f8e12a45b78d910e1f23456789a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7';
}

function generateJwt($user) {
    $issuedAt = time();
    $expirationTime = $issuedAt + (3600 * 24 * 7); // Valid for 7 days
    $payload = [
        'iat' => $issuedAt,
        'exp' => $expirationTime,
        'sub' => $user['id'],
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role']
        ]
    ];
    return JWT::encode($payload, getJwtSecret(), 'HS256');
}

function verifyJwt($jwtToken) {
    try {
        $decoded = JWT::decode($jwtToken, new Key(getJwtSecret(), 'HS256'));
        return (array) $decoded->user;
    } catch (Exception $e) {
        return null;
    }
}

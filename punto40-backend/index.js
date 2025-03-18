// Importar las librerías necesarias
const express = require('express');
const { Pool } = require('pg');

// Configurar Express
const app = express();
const port = process.env.PORT || 3000; // Puerto en el que correrá el servidor

// Middleware para manejar JSON
app.use(express.json());

// Configurar la conexión a Neon (PostgreSQL)
const pool = new Pool({
  user: process.env.DB_USER, // Usuario de Neon
  host: process.env.DB_HOST, // Host de Neon
  database: process.env.DB_NAME, // Nombre de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña de Neon
  port: 5432, // Puerto de PostgreSQL
  ssl: {
    rejectUnauthorized: false, // Necesario para conectarse a Neon
  },
});

// Ruta para registrar un jugador
app.post('/api/jugadores', async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO jugadores (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar el jugador');
  }
});

// Ruta para obtener todos los jugadores
app.get('/api/jugadores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jugadores');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los jugadores');
  }
});

// Ruta para registrar una deuda
app.post('/api/deudas', async (req, res) => {
  const { deudor_id, ganador_id, monto } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO deudas (deudor_id, ganador_id, monto) VALUES ($1, $2, $3) RETURNING *',
      [deudor_id, ganador_id, monto]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar la deuda');
  }
});

// Ruta para obtener todas las deudas
app.get('/api/deudas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM deudas');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener las deudas');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Importar las librerías necesarias
const express = require('express');
const { Pool } = require('pg');

// Configurar Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware para manejar JSON
app.use(express.json());

// Configurar la conexión a Neon (PostgreSQL)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
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

// Ruta para borrar todas las deudas
app.delete('/api/deudas', async (req, res) => {
  try {
    await pool.query('DELETE FROM deudas');
    res.status(200).send('Todas las deudas han sido borradas');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al borrar las deudas');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

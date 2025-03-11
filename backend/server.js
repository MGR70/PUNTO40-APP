const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configuración de la base de datos (reemplaza con tus credenciales de Neon.tech)
const pool = new Pool({
    user: 'neondb_owner', // Usuario de Neon.tech
    host: 'ep-broad-bush-a85uxie7-pooler.eastus2.azure.neon.tech', // Host de Neon.tech
    database: 'neondb', // Nombre de la base de datos
    password: 'npg_RHNaKQD7z4wB', // Contraseña de Neon.tech
    port: 5432, // Puerto de PostgreSQL
});

// Endpoint para registrar un jugador
app.post('/registerPlayer', async (req, res) => {
    const { nombre } = req.body;
    const query = 'INSERT INTO Jugadores (nombre) VALUES ($1) RETURNING *';
    try {
        const result = await pool.query(query, [nombre]);
        res.send(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al registrar el jugador');
    }
});

// Endpoint para registrar una deuda
app.post('/registerDebt', async (req, res) => {
    const { deudor_id, ganador_id, monto } = req.body;
    const query = 'INSERT INTO Deudas (deudor_id, ganador_id, monto) VALUES ($1, $2, $3) RETURNING *';
    try {
        const result = await pool.query(query, [deudor_id, ganador_id, monto]);
        res.send(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al registrar la deuda');
    }
});

// Endpoint para obtener la lista de jugadores
app.get('/players', async (req, res) => {
    const query = 'SELECT * FROM Jugadores';
    try {
        const result = await pool.query(query);
        res.send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los jugadores');
    }
});

// Endpoint para obtener la lista de deudas
app.get('/debts', async (req, res) => {
    const query = `
        SELECT d.id, j1.nombre AS deudor, j2.nombre AS ganador, d.monto
        FROM Deudas d
        JOIN Jugadores j1 ON d.deudor_id = j1.id
        JOIN Jugadores j2 ON d.ganador_id = j2.id
    `;
    try {
        const result = await pool.query(query);
        res.send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener las deudas');
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

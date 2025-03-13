import { Pool } from 'pg';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { nombre } = req.body;

        // Configuración de la base de datos (reemplaza con tus credenciales de Neon.tech)
        const pool = new Pool({
            user: 'neondb_owner',
            host: 'ep-broad-bush-a85uxie7-pooler.eastus2.azure.neon.tech',
            database: 'neondb',
            password: 'npg_RHNaKQD7z4wB',
            port: 5432,
            ssl: {
                rejectUnauthorized: false,
            },
        });

        try {
            const query = 'INSERT INTO Jugadores (nombre) VALUES ($1) RETURNING *';
            const result = await pool.query(query, [nombre]);
            res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error al registrar el jugador' });
        } finally {
            await pool.end();
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}

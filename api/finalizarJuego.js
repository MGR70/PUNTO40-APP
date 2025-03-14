const { Pool } = require('pg');

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

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            // Borrar todas las deudas
            await pool.query('DELETE FROM Deudas');

            // Borrar todos los jugadores
            await pool.query('DELETE FROM Jugadores');

            res.status(200).json({ message: 'Juego finalizado correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error al finalizar el juego' });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
};

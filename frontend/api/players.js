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
    if (req.method === 'GET') {
        const query = 'SELECT * FROM Jugadores';
        try {
            const result = await pool.query(query);
            res.status(200).json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error al obtener los jugadores' });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
};

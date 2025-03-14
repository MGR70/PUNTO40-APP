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
        try {
            // Obtener todas las deudas
            const query = `
                SELECT j1.nombre AS deudor, j2.nombre AS ganador, SUM(d.monto) AS monto
                FROM Deudas d
                JOIN Jugadores j1 ON d.deudor_id = j1.id
                JOIN Jugadores j2 ON d.ganador_id = j2.id
                GROUP BY j1.nombre, j2.nombre
            `;
            const result = await pool.query(query);

            // Calcular el saldo neto entre jugadores
            const saldos = {};
            result.rows.forEach(deuda => {
                const clave = `${deuda.deudor}-${deuda.ganador}`;
                const claveInversa = `${deuda.ganador}-${deuda.deudor}`;

                if (saldos[clave]) {
                    saldos[clave] += deuda.monto;
                } else if (saldos[claveInversa]) {
                    saldos[claveInversa] -= deuda.monto;
                } else {
                    saldos[clave] = deuda.monto;
                }
            });

            // Filtrar saldos netos mayores a 0
            const resumen = Object.keys(saldos).map(clave => {
                const [deudor, ganador] = clave.split('-');
                const monto = saldos[clave];
                return { deudor, ganador, monto };
            }).filter(deuda => deuda.monto > 0);

            res.status(200).json(resumen);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error al obtener las deudas' });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
};

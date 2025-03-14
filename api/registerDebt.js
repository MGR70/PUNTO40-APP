import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { deudor_id, ganador_id, monto } = req.body;

    try {
      const result = await sql`
        INSERT INTO Deudas (deudor_id, ganador_id, monto)
        VALUES (${deudor_id}, ${ganador_id}, ${monto})
        RETURNING *;
      `;
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar la deuda' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}

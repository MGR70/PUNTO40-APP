import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('Conectando a la base de datos...');
      console.log('Obteniendo deudas...');
      const { rows } = await sql`SELECT * FROM debts;`;
      const saldos = {};

      // Calcular saldos netos
      rows.forEach((deuda) => {
        const { debtor, creditor, amount } = deuda;
        const clave = `${debtor}-${creditor}`;
        if (!saldos[clave]) saldos[clave] = 0;
        saldos[clave] += amount;
      });

      // Formatear el resumen
      const resumen = Object.keys(saldos).map((clave) => {
        const [debtor, creditor] = clave.split('-');
        return { debtor, creditor, amount: saldos[clave] };
      });

      console.log('Resumen de deudas:', resumen);
      res.status(200).json(resumen);
    } catch (error) {
      console.error('Error al calcular el resumen de deudas:', error);
      res.status(500).json({ error: 'Error al calcular el resumen de deudas' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}

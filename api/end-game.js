// api/end-game.js (v3 - SELECT antes de DELETE)
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async (request) => {
    console.log("API end-game v3: Función ejecutada.");

    if (request.method !== 'POST') { /* ... manejo método ... */ }

    try {
        let requestBody;
        try {
             requestBody = await request.json();
             console.log("API end-game v3: Body JSON:", requestBody);
        } catch (e) { /* ... manejo error JSON body ... */ throw new Error("Cuerpo inválido."); }

        const { gameId } = requestBody;
        if (!gameId) { /* ... manejo falta gameId ... */ }
        console.log(`API end-game v3: gameId recibido para operar: ${gameId}`);

        console.log("API end-game v3: Conectando a Neon...");
        const sql = neon(process.env.DATABASE_URL);
         if (!process.env.DATABASE_URL) { throw new Error("DATABASE_URL falta."); }

        // *** PASO EXTRA: VERIFICAR SI EXISTE CON SELECT ***
        console.log(`API end-game v3: Verificando existencia con SELECT id FROM games WHERE id = '${gameId}' ...`);
        try {
            const selectResult = await sql`SELECT id FROM games WHERE id = ${gameId}`;
            console.log("API end-game v3: Resultado del SELECT:", selectResult);
            if (!selectResult || selectResult.length === 0) {
                console.warn(`API end-game v3: *** SELECT no encontró el ID ${gameId} justo antes de borrar ***`);
                // A pesar de que SELECT falló, intentaremos el DELETE igualmente
                // para ver si el resultado difiere, pero ya sabemos que probablemente fallará.
            } else {
                console.log(`API end-game v3: SELECT encontró el ID ${gameId} correctamente.`);
            }
        } catch (selectError) {
            console.error(`API end-game v3: ¡ERROR durante el SELECT de verificación!:`, selectError);
            // Continuar para intentar el DELETE de todos modos? O lanzar error aquí?
            // Por ahora, continuaremos para ver qué pasa con el DELETE.
        }
        // *** FIN PASO EXTRA ***

        // Ejecutar DELETE
        console.log(`API end-game v3: Ejecutando DELETE FROM games WHERE id = '${gameId}' ...`);
        const deleteResult = await sql`DELETE FROM games WHERE id = ${gameId}`;
        console.log("API end-game v3: DELETE completado. Resultado:", deleteResult);

        // Verificar resultado del DELETE
        if (deleteResult && deleteResult.rowCount > 0) {
            console.log(`API end-game v3: Borrado exitoso (rowCount: ${deleteResult.rowCount}).`);
            return new Response(JSON.stringify({ success: true, message: 'Game deleted.' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } else {
            console.warn(`API end-game v3: DELETE no afectó filas (ID: ${gameId}). rowCount: ${deleteResult?.rowCount ?? 'N/A'}. Devolviendo 404.`);
            return new Response(JSON.stringify({ success: false, message: 'Game not found (delete failed).' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

    } catch (error) {
        console.error('API end-game v3: ****** ERROR CAPTURADO ******:', error);
        return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
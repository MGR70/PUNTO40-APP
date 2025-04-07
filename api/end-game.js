// api/end-game.js (v2 - Con Logs Detallados)
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async (request) => {
    console.log("API end-game v2: Función ejecutada."); // Log inicial

    if (request.method !== 'POST') {
        console.log("API end-game v2: Método no POST.");
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        // Leer el cuerpo JSON
        let requestBody;
        try {
             requestBody = await request.json();
             console.log("API end-game v2: Cuerpo JSON recibido:", requestBody);
        } catch (e) {
             console.error("API end-game v2: ¡ERROR al parsear JSON del request body!", e);
             // Intentar leer como texto para depurar
             try {
                 const reqText = await request.text(); // Necesita clonar request si quieres leer de nuevo
                 console.error("API end-game v2: Request body como texto:", reqText);
             } catch(e2){}
             throw new Error("Cuerpo de solicitud inválido (no JSON).");
        }


        // Extraer gameId
        const { gameId } = requestBody; // Obtener de requestBody, no directamente de request.json()

        if (!gameId) {
            console.error("API end-game v2: ¡ERROR! No se recibió 'gameId' en el cuerpo JSON.");
            return new Response(JSON.stringify({ message: 'Game ID is required in request body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        console.log(`API end-game v2: gameId recibido para borrar: ${gameId} (Tipo: ${typeof gameId})`); // Log del ID y su tipo

        // Conectar a Neon
        console.log("API end-game v2: Conectando a Neon...");
        const sql = neon(process.env.DATABASE_URL);
         if (!process.env.DATABASE_URL) { throw new Error("Configuración servidor incompleta: DATABASE_URL falta."); }

        // Ejecutar DELETE
        console.log(`API end-game v2: Ejecutando DELETE FROM games WHERE id = '${gameId}' ...`);
        // Usar sql literal aquí para asegurar que la consulta sea exactamente como esperamos
        const result = await sql`DELETE FROM games WHERE id = ${gameId}`;
        console.log("API end-game v2: DELETE completado. Resultado:", result); // Ver qué devuelve (rowCount)

        // Verificar el resultado
        // 'rowCount' indica cuántas filas fueron afectadas (borradas)
        if (result && result.rowCount > 0) {
            console.log(`API end-game v2: Borrado exitoso (rowCount: ${result.rowCount}).`);
            return new Response(JSON.stringify({ success: true, message: 'Game ended and data deleted.' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } else {
            // Si rowCount es 0, no se encontró el ID
            console.warn(`API end-game v2: No se encontró el juego para borrar (ID: ${gameId}). rowCount: ${result?.rowCount ?? 'N/A'}.`);
            return new Response(JSON.stringify({ success: false, message: 'Game not found.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

    } catch (error) {
        console.error('API end-game v2: ****** ERROR CAPTURADO ******:', error);
        return new Response(JSON.stringify({ message: 'Error interno al finalizar juego' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
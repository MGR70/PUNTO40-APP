// api/start-game.js (v2 - Inserción Explícita + Verificación)
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async (request) => {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }
    console.log("API start-game v2: Función ejecutada, método POST recibido.");

    try {
        console.log("API start-game v2: Conectando a Neon...");
        const sql = neon(process.env.DATABASE_URL);
        if (!process.env.DATABASE_URL) { throw new Error("Configuración servidor incompleta: DATABASE_URL falta."); }

        // *** CAMBIO: INSERT explícito con gen_random_uuid() ***
        // Asumiendo que tu tabla 'games' solo tiene 'id' (con default) y 'created_at' (con default)
        // Si tiene otras columnas NOT NULL sin default, este INSERT fallaría (lo cual sería bueno saber).
        console.log("API start-game v2: Ejecutando INSERT explícito en tabla 'games'...");
        const result = await sql`INSERT INTO games (id) VALUES (gen_random_uuid()) RETURNING id`;
        // *** FIN CAMBIO ***

        console.log("API start-game v2: INSERT completado. Resultado:", result);

        // *** CAMBIO: Verificación más robusta del resultado ***
        if (!result || !Array.isArray(result) || result.length === 0 || !result[0] || !result[0].id) {
             console.error("API start-game v2: ¡ERROR! La consulta INSERT no devolvió un array con un objeto con ID válido:", result);
             // Intentar loguear información adicional si está disponible
             if (result && result. शायद) console.error("Detalles adicionales del resultado:", result. शायद); // ' शायद' es un placeholder para propiedades de error específicas de la librería
             throw new Error("Error DB: No se pudo confirmar la creación del ID del juego.");
        }
        // *** FIN CAMBIO ***

        const newGameId = result[0].id;
        console.log("API start-game v2: Nuevo gameId obtenido:", newGameId);

        return new Response(JSON.stringify({ gameId: newGameId }), { status: 201, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('API start-game v2: ****** ERROR CAPTURADO ******:', error);
         // Intentar dar más detalles si es un error de la librería Neon
         if (error.name === 'NeonDbError') { // Ejemplo, el nombre real puede variar
             console.error('Error específico de Neon:', error.message, error.code);
         }
        return new Response(JSON.stringify({ message: 'Error interno al iniciar nuevo juego' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
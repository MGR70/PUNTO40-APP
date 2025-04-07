// api/start-game.js (PRUEBA NODE.JS SIMPLE)
// NO hay 'export const config...'

// Usamos 'req' y 'res'
export default function handler(req, res) {
    // Log para ver si se ejecuta (¡Ahora debería aparecer en Vercel!)
    console.log("API start-game (NODE TEST): Función ejecutada.");

    if (req.method !== 'POST') {
        console.log("API start-game (NODE TEST): Método no POST.");
        res.setHeader('Allow', ['POST']);
        // Usamos res.status().json()
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const fakeGameId = 'test-nodejs-67890';
    console.log(`API start-game (NODE TEST): Devolviendo ID falso: ${fakeGameId}`);

    // Usamos res.status().json()
    return res.status(201).json({ gameId: fakeGameId });
}
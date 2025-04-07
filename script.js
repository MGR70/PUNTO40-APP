// ----- INICIO CÓDIGO script.js COMPLETO (Checkpoint + showPage Reforzado + Logs RegisterPlayer) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM ---
    let criticalElementMissing = false;
    function checkElement(element, id, isCritical = true) { if (!element && isCritical) { console.error(`****** ERROR CRÍTICO: No se encontró elemento requerido con ID="${id}" ******`); criticalElementMissing = true; } else if (!element && !isCritical) { console.warn(`Advertencia: Elemento opcional con ID="${id}" no encontrado.`); } return element; }

    const welcomePage = checkElement(document.getElementById('welcome-page'), 'welcome-page');
    const registerPlayersPage = checkElement(document.getElementById('register-players-page'), 'register-players-page');
    const registerDebtsPage = checkElement(document.getElementById('register-debts-page'), 'register-debts-page');
    const startGameButton = checkElement(document.getElementById('start-game'), 'start-game');
    const continueGameButton = checkElement(document.getElementById('continue-game'), 'continue-game', false);
    const registerPlayerButton = checkElement(document.getElementById('register-player'), 'register-player'); // Asegurarse que este botón existe
    const finishRegistrationButton = checkElement(document.getElementById('finish-registration'), 'finish-registration');
    const addNewPlayerButton = checkElement(document.getElementById('add-new-player'), 'add-new-player');
    const registerDebtButton = checkElement(document.getElementById('register-debt'), 'register-debt');
    const endGameButton = checkElement(document.getElementById('end-game'), 'end-game');
    const playerNameInput = checkElement(document.getElementById('player-name'), 'player-name');
    const playerList = checkElement(document.getElementById('player-list'), 'player-list');
    const debtorSelect = checkElement(document.getElementById('debtor'), 'debtor');
    const winnerSelect = checkElement(document.getElementById('winner'), 'winner');
    const debtAmountInput = checkElement(document.getElementById('debt-amount'), 'debt-amount');
    const debtMatrixTable = checkElement(document.getElementById('debt-matrix'), 'debt-matrix');
    const modal = checkElement(document.getElementById('custom-confirm-modal'), 'custom-confirm-modal', false);

    let debtMatrixThead = null; let debtMatrixTbody = null;
    if (debtMatrixTable) { debtMatrixThead = debtMatrixTable.querySelector('thead'); debtMatrixTbody = debtMatrixTable.querySelector('tbody'); if (!debtMatrixThead || !debtMatrixTbody) criticalElementMissing = true; }
    else { criticalElementMissing = true; }

    if (criticalElementMissing) { console.error("Inicialización detenida..."); alert("Error crítico..."); return; }
    console.log("Selección de elementos completada.");

    // --- Estado de la Aplicación ---
    let currentGameId = null; let currentPlayers = []; let currentDebts = []; let summary = {};

    // --- Helper para llamadas a la API (Mantenemos v3 Robusta con Logs Extremos) ---
    async function apiRequest(endpoint, method = 'GET', body = null) { /* ... código igual v3 ... */ }
    // --- FIN Helper ---

    // --- Lógica de Inicio y Carga (Vuelve a usar confirm()) ---
    function loadExistingGame() { /* ... código sin cambios ... */ }
    async function fetchAndDisplayGameState() { /* ... código sin cambios ... */ }

    // --- Navegación entre Páginas ---
    startGameButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });
    finishRegistrationButton.addEventListener('click', () => { /* ... código sin cambios ... */ });
    addNewPlayerButton.addEventListener('click', () => { /* ... código sin cambios ... */ });

    // --- Lógica de Jugadores (con DEBUG Logs) ---
    registerPlayerButton.addEventListener('click', async () => {
        console.log("DEBUG RegisterPlayer: Botón presionado."); // Log inicio listener
        const playerName = playerNameInput.value.trim();
        console.log(`DEBUG RegisterPlayer: Nombre obtenido: "${playerName}"`);

        // Validaciones iniciales
        if (!playerName) {
            alert('Por favor, introduce un nombre de jugador.');
            console.log("DEBUG RegisterPlayer: Validación fallida - Nombre vacío.");
            return;
        }
        if (currentPlayers.includes(playerName)) {
            alert(`El jugador "${playerName}" ya ha sido registrado en este juego.`);
            console.log(`DEBUG RegisterPlayer: Validación fallida - Jugador "${playerName}" duplicado.`);
            if(playerNameInput) playerNameInput.select();
            return;
        }
        if (!currentGameId) {
            alert("Error: No hay un juego activo para añadir jugadores.");
            console.error("DEBUG RegisterPlayer: Error crítico - currentGameId es null.");
            return;
        }

        console.log(`DEBUG RegisterPlayer: Validaciones OK. Intentando API /api/add-player para juego ${currentGameId}...`);
        try {
            // Llamada a la API
            const responseData = await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName });
            // Podemos verificar la respuesta si la API la devuelve de forma consistente
             console.log("DEBUG RegisterPlayer: Llamada a API /api/add-player completada (respuesta recibida):", responseData);

            // Actualización local optimista (asumimos éxito si apiRequest no lanzó error)
            console.log(`DEBUG RegisterPlayer: Añadiendo "${playerName}" a currentPlayers local.`);
            currentPlayers.push(playerName);

            console.log("DEBUG RegisterPlayer: Actualizando UI (lista, selects, matriz)...");
            updatePlayerList(); // Actualiza <ul>
            updateSelectOptions(); // Actualiza <select> (importante para 'Ir a Deudas')
            calculateDebtSummary(); // Recalcula (aunque no haya deudas aún)
            updateDebtMatrix(); // Redibuja

            console.log("DEBUG RegisterPlayer: Limpiando input y poniendo foco...");
            if (playerNameInput) {
                 playerNameInput.value = '';
                 playerNameInput.focus();
            }
            console.log("DEBUG RegisterPlayer: Proceso completado.");

        } catch (error) {
            // El helper apiRequest ya debería haber mostrado un alert
            console.error("****** ERROR CAPTURADO en registerPlayerButton ******:", error);
            // Podríamos mostrar un alert más específico aquí si quisiéramos
            // alert(`Error al registrar jugador: ${error.message}`); // Opcional
            if(playerNameInput) playerNameInput.select(); // Seleccionar para corregir
        }
    });
    // --- FIN Lógica de Jugadores ---

    playerNameInput.addEventListener('keypress', (event) => { /* ... código sin cambios ... */ });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });

    // --- Lógica de Finalización (confirm() simple) ---
    endGameButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });

    // --- Funciones Auxiliares ---
    function showPage(pageIdToShow) { /* ... código sin cambios (reforzado) ... */ }
    function updatePlayerList() { /* ... código sin cambios ... */ }
    function updateSelectOptions() { /* ... código sin cambios con DEBUG logs ... */ }
    function initializeDebtSummary() { /* ... código sin cambios ... */ }
    function calculateDebtSummary() { /* ... código sin cambios ... */ }
    function updateDebtMatrix() { /* ... código sin cambios ... */ }
    function resetLocalState() { /* ... código sin cambios ... */ }

    // --- Inicialización Final ---
    console.log("Inicialización JS completada. Llamando a loadExistingGame...");
    loadExistingGame();

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (Checkpoint + showPage Reforzado + Logs RegisterPlayer) -----
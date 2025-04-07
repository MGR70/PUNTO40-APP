// ----- INICIO CÓDIGO script.js COMPLETO (v10 - Checkpoint + Logs SelectOptions) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM ---
    let criticalElementMissing = false;
    function checkElement(element, id, isCritical = true) { if (!element && isCritical) { console.error(`****** ERROR CRÍTICO: No se encontró ID="${id}" ******`); criticalElementMissing = true; } return element; }

    const welcomePage = checkElement(document.getElementById('welcome-page'), 'welcome-page');
    const registerPlayersPage = checkElement(document.getElementById('register-players-page'), 'register-players-page');
    const registerDebtsPage = checkElement(document.getElementById('register-debts-page'), 'register-debts-page');
    const startGameButton = checkElement(document.getElementById('start-game'), 'start-game');
    const continueGameButton = checkElement(document.getElementById('continue-game'), 'continue-game', false);
    const registerPlayerButton = checkElement(document.getElementById('register-player'), 'register-player');
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

    // --- Lógica de Inicio y Carga (confirm()) ---
    function loadExistingGame() { /* ... código sin cambios ... */ }
    async function fetchAndDisplayGameState() { /* ... código sin cambios ... */ }

    // --- Navegación entre Páginas ---
    startGameButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });
    finishRegistrationButton.addEventListener('click', () => {
         if (currentPlayers.length < 2) { alert('Debes registrar al menos dos jugadores.'); return; }
         console.log("finishRegistrationButton: currentPlayers:", JSON.stringify(currentPlayers));
         updateSelectOptions(); // <-- LLAMADA IMPORTANTE A REVISAR
         calculateDebtSummary();
         updateDebtMatrix();
         console.log("finishRegistrationButton: Mostrando página deudas...");
         showPage('register-debts-page');
    });
    addNewPlayerButton.addEventListener('click', () => { /* ... código sin cambios ... */ });

    // --- Lógica de Jugadores (con DEBUG Logs) ---
    registerPlayerButton.addEventListener('click', async () => { /* ... código sin cambios con logs ... */ });
    playerNameInput.addEventListener('keypress', (event) => { /* ... */ });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });

    // --- Lógica de Finalización (confirm() simple) ---
    endGameButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });

    // --- Funciones Auxiliares ---
    function showPage(pageIdToShow) { /* ... código sin cambios (reforzado) ... */ }
    function updatePlayerList() { /* ... código sin cambios ... */ }

    // --- updateSelectOptions CON LOGS REINCORPORADOS ---
    function updateSelectOptions() {
        // Asegurarse que los elementos select existen antes de usarlos
        if (!debtorSelect || !winnerSelect) {
             console.error("ERROR en updateSelectOptions: debtorSelect o winnerSelect no encontrados!");
             return;
        }

        const currentDebtor = debtorSelect.value;
        const currentWinner = winnerSelect.value;
        debtorSelect.innerHTML = ''; // Limpiar contenido existente
        winnerSelect.innerHTML = ''; // Limpiar contenido existente

        // Añadir opción placeholder
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Selecciona Jugador --";
        defaultOption.disabled = true;
        // defaultOption.selected = true; // No seleccionar por defecto si hay jugadores

        debtorSelect.appendChild(defaultOption.cloneNode(true));
        winnerSelect.appendChild(defaultOption.cloneNode(true));

        // Log ANTES del bucle
        console.log(`DEBUG updateSelectOptions: Iniciando. currentPlayers (${currentPlayers.length}):`, JSON.stringify(currentPlayers));

        // Iterar y añadir jugadores
        currentPlayers.forEach((player, index) => {
            // Log DENTRO del bucle
            console.log(`DEBUG updateSelectOptions: [${index}] Añadiendo opción para: ${player}`);
            try {
                const option = document.createElement('option');
                option.value = player; // Asegurarse que player es una cadena válida
                option.textContent = player;
                debtorSelect.appendChild(option.cloneNode(true));
                winnerSelect.appendChild(option.cloneNode(true));
                 console.log(`DEBUG updateSelectOptions: [${index}] Opción para ${player} añadida OK.`);
            } catch (error) {
                 console.error(`DEBUG updateSelectOptions: [${index}] ERROR al añadir opción para ${player}:`, error);
            }
        });

        // Log DESPUÉS del bucle
        console.log(`DEBUG updateSelectOptions: Bucle forEach completado. Intentando restaurar selección...`);

        // Restaurar selección
        try {
            if (currentPlayers.length > 0) {
                debtorSelect.value = currentPlayers.includes(currentDebtor) ? currentDebtor : "";
                winnerSelect.value = currentPlayers.includes(currentWinner) ? currentWinner : "";
            } else {
                debtorSelect.value = "";
                winnerSelect.value = "";
            }
            // Asegurar placeholder si no hay valor válido
            if (!debtorSelect.value) debtorSelect.value = "";
            if (!winnerSelect.value) winnerSelect.value = "";
             console.log(`DEBUG updateSelectOptions: Selección restaurada (debtor: '${debtorSelect.value}', winner: '${winnerSelect.value}').`);
        } catch (error) {
             console.error("DEBUG updateSelectOptions: Error al restaurar selección:", error);
        }

        console.log("DEBUG updateSelectOptions: Finalizado.");
    }
    // --- FIN updateSelectOptions ---

    function initializeDebtSummary() { /* ... código sin cambios ... */ }
    function calculateDebtSummary() { /* ... código sin cambios ... */ }
    function updateDebtMatrix() { /* ... código sin cambios ... */ }
    function resetLocalState() { /* ... código sin cambios ... */ }

    // --- Inicialización Final ---
    console.log("Inicialización JS completada. Llamando a loadExistingGame...");
    loadExistingGame();

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (v10 - Checkpoint + Logs SelectOptions) -----
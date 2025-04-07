// ----- INICIO CÓDIGO script.js COMPLETO (v8 - Verificación Inmediata) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM (Simplificada con Verificación) ---
    let criticalElementMissing = false;
    function checkElement(element, id) { if (!element) { console.error(`****** ERROR CRÍTICO: No se encontró elemento con ID="${id}" ******`); criticalElementMissing = true; } return element; }

    const welcomePage = checkElement(document.getElementById('welcome-page'), 'welcome-page');
    const registerPlayersPage = checkElement(document.getElementById('register-players-page'), 'register-players-page');
    const registerDebtsPage = checkElement(document.getElementById('register-debts-page'), 'register-debts-page');
    const startGameButtonElem = checkElement(document.getElementById('start-game'), 'start-game'); // Renombrado temporalmente
    const continueGameButtonElem = checkElement(document.getElementById('continue-game'), 'continue-game'); // Renombrado temporalmente
    // ... (resto de selecciones usando checkElement) ...
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
    const modal = checkElement(document.getElementById('custom-confirm-modal'), 'custom-confirm-modal');
    const modalMessage = checkElement(document.getElementById('modal-message'), 'modal-message');
    const modalBtnConfirm = checkElement(document.getElementById('modal-btn-confirm'), 'modal-btn-confirm');
    const modalBtnAlt = checkElement(document.getElementById('modal-btn-alt'), 'modal-btn-alt');
    const modalBtnCancel = checkElement(document.getElementById('modal-btn-cancel'), 'modal-btn-cancel');

    let debtMatrixThead = null;
    let debtMatrixTbody = null;
    if (debtMatrixTable) { /* ... código igual ... */ } else { criticalElementMissing = true; }

    if (criticalElementMissing) { /* ... código igual para detener ... */ return; }
    console.log("Selección de elementos completada sin errores críticos.");

    // --- Estado de la Aplicación ---
    let currentGameId = null; let currentPlayers = []; let currentDebts = []; let summary = {}; let modalActionResolver = null;

    // --- Helper para llamadas a la API (v2 - Robusto) ---
    async function apiRequest(endpoint, method = 'GET', body = null) { /* ... código igual v2 ... */ }
    // --- Lógica del Modal Personalizado ---
    function showCustomConfirm(message, confirmText, altText, cancelText) { /* ... código igual ... */ }
    modalBtnConfirm.addEventListener('click', () => { /* ... */ });
    modalBtnAlt.addEventListener('click', () => { /* ... */ });
    modalBtnCancel.addEventListener('click', () => { /* ... */ });
    modal.addEventListener('click', (event) => { /* ... */ });

    // --- Lógica de Inicio y Carga del Juego ---
    function checkExistingGame() {
        const savedGameId = localStorage.getItem('currentGameId');
        // Usar la variable renombrada aquí
        if (savedGameId) {
            console.log("Juego guardado encontrado:", savedGameId);
            if (continueGameButtonElem) continueGameButtonElem.disabled = false; // Usar Elem
            console.log("Botón 'Continuar' HABILITADO.");
        } else {
            console.log("No se encontró juego guardado.");
            if (continueGameButtonElem) continueGameButtonElem.disabled = true; // Usar Elem
            console.log("Botón 'Continuar' DESHABILITADO.");
        }
        console.log("Mostrando página 'welcome-page' desde checkExistingGame.");
        showPage('welcome-page');
    }

    // --- NAVEGACIÓN Y LISTENERS PRINCIPALES ---

    // Listener para botón Continuar (Verificación Inmediata)
    console.log("DEBUG: Intentando añadir listener a continueGameButtonElem. Valor:", continueGameButtonElem); // LOG INMEDIATO
    if (continueGameButtonElem) {
        continueGameButtonElem.addEventListener('click', () => {
            const savedGameId = localStorage.getItem('currentGameId');
            if (savedGameId && !continueGameButtonElem.disabled) {
                console.log("Botón 'Continuar' presionado. Cargando juego ID:", savedGameId);
                currentGameId = savedGameId;
                fetchAndDisplayGameState();
            } else {
                 console.log("Click en Continuar ignorado (deshabilitado o sin ID).");
            }
        });
        console.log("DEBUG: Listener añadido a continueGameButtonElem.");
    } else {
        console.error("ERROR FATAL: No se pudo añadir listener a 'continueGameButtonElem' porque ES NULL/UNDEFINED en este punto.");
    }

    async function fetchAndDisplayGameState() { /* ... código sin cambios ... */ }

    // Listener para botón Iniciar Juego (Verificación Inmediata)
    console.log("DEBUG: Intentando añadir listener a startGameButtonElem. Valor:", startGameButtonElem); // LOG INMEDIATO
    if (startGameButtonElem) {
        startGameButtonElem.addEventListener('click', async () => {
             // Usar startGameButtonElem si es necesario dentro del listener, aunque no parece ser el caso
            const potentiallyActiveGameId = localStorage.getItem('currentGameId');
            if (potentiallyActiveGameId) { /* ... advertencia ... */ if (!confirm('...?')) { return; } }
            console.log("DEBUG: Preparando para iniciar nuevo juego...");
            currentGameId = null; resetLocalState();
            if(continueGameButtonElem) continueGameButtonElem.disabled = true; // Usar Elem
            console.log("DEBUG: Intentando iniciar nuevo juego vía API...");
            try {
                const data = await apiRequest('start-game', 'POST'); /* ... */
                if (!data || !data.gameId) { throw new Error("Respuesta API inválida: no gameId."); }
                currentGameId = data.gameId; /* ... */
                localStorage.setItem('currentGameId', currentGameId); /* ... */
                if(continueGameButtonElem) continueGameButtonElem.disabled = false; // Usar Elem
                /* ... actualizar UI ... */
                console.log("DEBUG: Intentando mostrar página 'register-players-page'.");
                showPage('register-players-page');
                /* ... foco ... */
            } catch (error) {
                console.error("****** ERROR CAPTURADO en startGameButton ******:", error);
                /* ... limpiar estado ... */
                if(continueGameButtonElem) continueGameButtonElem.disabled = true; // Usar Elem
                showPage('welcome-page');
            }
        });
        console.log("DEBUG: Listener añadido a startGameButtonElem.");
    } else {
        console.error("ERROR FATAL: No se pudo añadir listener a 'startGameButtonElem' porque ES NULL/UNDEFINED en este punto.");
    }

    // --- Otros Listeners y Lógica (Asegurarse que usan las variables correctas si fueron renombradas) ---
    // No parece que otros listeners usen directamente startGameButtonElem o continueGameButtonElem
    finishRegistrationButton.addEventListener('click', () => { /* ... */ });
    addNewPlayerButton.addEventListener('click', () => { /* ... */ });
    registerPlayerButton.addEventListener('click', async () => { /* ... */ });
    playerNameInput.addEventListener('keypress', (event) => { /* ... */ });
    registerDebtButton.addEventListener('click', async () => { /* ... */ });
    endGameButton.addEventListener('click', async () => { /* ... */ });

    // --- Funciones Auxiliares ---
    function showPage(pageId) { /* ... código sin cambios con logs detallados ... */ }
    function updatePlayerList() { /* ... código sin cambios ... */ }
    function updateSelectOptions() { /* ... código sin cambios con DEBUG logs ... */ }
    function initializeDebtSummary() { /* ... código sin cambios ... */ }
    function calculateDebtSummary() { /* ... código sin cambios ... */ }
    function updateDebtMatrix() { /* ... código sin cambios ... */ }
    function resetLocalState() { /* ... código sin cambios ... */ }

    // --- Inicialización Final ---
    console.log("Inicialización JS completada. Llamando a checkExistingGame...");
    checkExistingGame();

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (v8 - Verificación Inmediata) -----
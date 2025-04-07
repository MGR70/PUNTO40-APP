// ----- INICIO CÓDIGO script.js COMPLETO (v5 - Inicialización Corregida) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos..."); // Log inicial

    // --- Selección de Elementos del DOM ---
    let initializationError = false; // Bandera para errores
    function getElement(id, required = true) {
        const element = document.getElementById(id);
        if (!element && required) {
            console.error(`****** ERROR CRÍTICO: No se encontró elemento requerido con ID="${id}" ******`);
            initializationError = true;
        } else if (!element && !required) {
            console.warn(`Advertencia: Elemento opcional con ID="${id}" no encontrado.`);
        }
        return element;
    }

    // Seleccionar TODOS los elementos PRIMERO
    const welcomePage = getElement('welcome-page');
    const registerPlayersPage = getElement('register-players-page');
    const registerDebtsPage = getElement('register-debts-page');
    const startGameButton = getElement('start-game');
    const continueGameButton = getElement('continue-game');
    const registerPlayerButton = getElement('register-player');
    const finishRegistrationButton = getElement('finish-registration');
    const addNewPlayerButton = getElement('add-new-player');
    const registerDebtButton = getElement('register-debt');
    const endGameButton = getElement('end-game');
    const playerNameInput = getElement('player-name');
    const playerList = getElement('player-list');
    const debtorSelect = getElement('debtor');
    const winnerSelect = getElement('winner');
    const debtAmountInput = getElement('debt-amount');
    const debtMatrixTable = getElement('debt-matrix');
    const modal = getElement('custom-confirm-modal');
    const modalMessage = getElement('modal-message');
    const modalBtnConfirm = getElement('modal-btn-confirm');
    const modalBtnAlt = getElement('modal-btn-alt');
    const modalBtnCancel = getElement('modal-btn-cancel');

    let debtMatrixThead = null;
    let debtMatrixTbody = null;
    if (debtMatrixTable) { // Solo buscar si la tabla existe
        debtMatrixThead = debtMatrixTable.querySelector('thead');
        debtMatrixTbody = debtMatrixTable.querySelector('tbody');
        if (!debtMatrixThead) { console.error("Error: No <thead> en #debt-matrix"); initializationError = true; }
        if (!debtMatrixTbody) { console.error("Error: No <tbody> en #debt-matrix"); initializationError = true; }
    }
    // La verificación de debtMatrixTable ya la hizo getElement

    // --- Si hubo error encontrando elementos esenciales, DETENER AQUÍ ---
    if (initializationError) {
        console.error("****** Inicialización detenida debido a elementos HTML faltantes. ******");
        alert("Error crítico al inicializar: faltan elementos HTML. Revisa la consola (F12).");
        // Opcional: Modificar la UI para mostrar el error
        if (welcomePage) welcomePage.innerHTML = "<h1>Error Crítico</h1><p>Faltan elementos HTML. Revisa la consola.</p>";
        // Asegurar que solo se vea la página de bienvenida (modificada)
        document.querySelectorAll('.page').forEach(p => { if(p !== welcomePage) p.style.display = 'none'; });
        return; // Detiene completamente la ejecución de más JS aquí
    }

    console.log("Selección de elementos completada sin errores críticos.");

    // --- Estado de la Aplicación (Solo se define si no hubo error) ---
    let currentGameId = null;
    let currentPlayers = [];
    let currentDebts = [];
    let summary = {};
    let modalActionResolver = null;

    // --- Helper para llamadas a la API (Solo se define si no hubo error) ---
    async function apiRequest(endpoint, method = 'GET', body = null) { /* ... código sin cambios ... */ }

    // --- Lógica del Modal Personalizado (Solo se define y añade listeners si no hubo error) ---
    function showCustomConfirm(message, confirmText, altText, cancelText) { /* ... código sin cambios ... */ }
    // Añadir listeners SOLO si los botones del modal existen
    if(modalBtnConfirm) modalBtnConfirm.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('confirm'); if(modal) modal.style.display = 'none'; });
    if(modalBtnAlt) modalBtnAlt.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('alt'); if(modal) modal.style.display = 'none'; });
    if(modalBtnCancel) modalBtnCancel.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('cancel'); if(modal) modal.style.display = 'none'; });
    if(modal) modal.addEventListener('click', (event) => { if (event.target === modal) { if (modalActionResolver) modalActionResolver('cancel'); modal.style.display = 'none'; } });

    // --- Lógica de Inicio y Carga del Juego ---
    function checkExistingGame() {
        // Ya sabemos que continueGameButton existe si llegamos aquí sin error
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId) {
            console.log("Juego guardado encontrado:", savedGameId);
            continueGameButton.disabled = false;
            console.log("Botón 'Continuar' HABILITADO.");
        } else {
            console.log("No se encontró juego guardado.");
            continueGameButton.disabled = true;
            console.log("Botón 'Continuar' DESHABILITADO.");
        }
        console.log("Mostrando página 'welcome-page' desde checkExistingGame.");
        showPage('welcome-page');
    }

    // Listener para botón Continuar (Ya sabemos que existe)
    continueGameButton.addEventListener('click', () => {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId && !continueGameButton.disabled) {
            console.log("Botón 'Continuar' presionado. Cargando juego ID:", savedGameId);
            currentGameId = savedGameId;
            fetchAndDisplayGameState();
        } else {
             console.log("Click en Continuar ignorado (deshabilitado o sin ID).");
        }
    });

    async function fetchAndDisplayGameState() { /* ... código sin cambios lógicos, llama a showPage ... */ }

    // --- Navegación entre Páginas ---

    // Listener para botón Iniciar Juego (Ya sabemos que existe)
    startGameButton.addEventListener('click', async () => {
        const potentiallyActiveGameId = localStorage.getItem('currentGameId');
        if (potentiallyActiveGameId) {
            console.log("DEBUG: Juego potencialmente activo detectado al iniciar uno nuevo.");
            if (!confirm('Parece que hay un juego guardado... ¿Continuar iniciando uno nuevo?')) {
                console.log("DEBUG: Usuario canceló iniciar nuevo juego..."); return;
            }
            console.log("DEBUG: Usuario confirmó iniciar nuevo juego...");
        }

        console.log("DEBUG: Preparando para iniciar nuevo juego...");
        currentGameId = null;
        resetLocalState();
        continueGameButton.disabled = true; // Deshabilitar mientras se crea

        console.log("DEBUG: Intentando iniciar nuevo juego vía API...");
        try {
            const data = await apiRequest('start-game', 'POST');
            console.log("DEBUG: Respuesta RECIBIDA de /api/start-game:", data);

            if (!data || !data.gameId) { throw new Error("Respuesta API inválida: no gameId."); }
            currentGameId = data.gameId;
            console.log("DEBUG: gameId extraído:", currentGameId);

            localStorage.setItem('currentGameId', currentGameId);
            console.log("DEBUG: gameId guardado en localStorage.");

            continueGameButton.disabled = false; // Habilitar de nuevo
            console.log("DEBUG: Botón 'Continuar' habilitado.");

            updatePlayerList(); updateSelectOptions(); updateDebtMatrix();
            console.log("DEBUG: UI actualizada/limpiada.");

            console.log("DEBUG: Intentando mostrar página 'register-players-page'.");
            showPage('register-players-page');
            console.log("DEBUG: showPage('register-players-page') ejecutado.");

            if (playerNameInput) { playerNameInput.focus(); console.log("DEBUG: Foco puesto."); }
            else { console.warn("DEBUG: No se encontró playerNameInput."); }

        } catch (error) {
            console.error("****** ERROR CAPTURADO en startGameButton ******:", error);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
            continueGameButton.disabled = true; // Asegurar deshabilitado en error
            console.log("DEBUG: Debido al error, mostrando 'welcome-page'.");
            showPage('welcome-page');
        }
    });

    // --- Otros Listeners y Lógica (Ya sabemos que los botones existen) ---
    finishRegistrationButton.addEventListener('click', () => { /* ... código sin cambios ... */ });
    addNewPlayerButton.addEventListener('click', () => { /* ... código sin cambios ... */ });
    registerPlayerButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });
    playerNameInput.addEventListener('keypress', (event) => { /* ... */ });
    registerDebtButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });
    endGameButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });

    // --- Funciones Auxiliares ---
    function showPage(pageId) { /* ... código sin cambios con logs detallados ... */ }
    function updatePlayerList() { /* ... código sin cambios ... */ }
    function updateSelectOptions() { /* ... código sin cambios con logs detallados ... */ }
    function initializeDebtSummary() { /* ... código sin cambios ... */ }
    function calculateDebtSummary() { /* ... código sin cambios ... */ }
    function updateDebtMatrix() { /* ... código sin cambios ... */ }
    function resetLocalState() { /* ... código sin cambios ... */ }

    // --- Inicialización Final (Solo se llama si no hubo error antes) ---
    console.log("Inicialización JS completada. Llamando a checkExistingGame...");
    checkExistingGame(); // <-- Llamada inicial para configurar el botón Continuar y mostrar Bienvenida

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (v5 - Inicialización Corregida) -----
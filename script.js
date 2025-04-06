// ----- INICIO CÓDIGO script.js REVISADO -----
document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos del DOM (sin cambios) ---
    const welcomePage = document.getElementById('welcome-page');
    const registerPlayersPage = document.getElementById('register-players-page');
    const registerDebtsPage = document.getElementById('register-debts-page');
    const startGameButton = document.getElementById('start-game');
    const continueGameButton = document.getElementById('continue-game');
    const registerPlayerButton = document.getElementById('register-player');
    const finishRegistrationButton = document.getElementById('finish-registration');
    const addNewPlayerButton = document.getElementById('add-new-player');
    const registerDebtButton = document.getElementById('register-debt');
    const endGameButton = document.getElementById('end-game');
    const playerNameInput = document.getElementById('player-name');
    const playerList = document.getElementById('player-list');
    const debtorSelect = document.getElementById('debtor');
    const winnerSelect = document.getElementById('winner');
    const debtAmountInput = document.getElementById('debt-amount');
    const debtMatrixTable = document.getElementById('debt-matrix');
    const debtMatrixThead = debtMatrixTable.querySelector('thead');
    const debtMatrixTbody = debtMatrixTable.querySelector('tbody');
    const modal = document.getElementById('custom-confirm-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalBtnConfirm = document.getElementById('modal-btn-confirm');
    const modalBtnAlt = document.getElementById('modal-btn-alt');
    const modalBtnCancel = document.getElementById('modal-btn-cancel');

    // --- Estado de la Aplicación (sin cambios) ---
    let currentGameId = null;
    let currentPlayers = [];
    let currentDebts = [];
    let summary = {};
    let modalActionResolver = null;

    // --- Helper para llamadas a la API (sin cambios) ---
    async function apiRequest(endpoint, method = 'GET', body = null) { /* ... código igual ... */ }

    // --- Lógica del Modal Personalizado (sin cambios) ---
    function showCustomConfirm(message, confirmText, altText, cancelText) { /* ... código igual ... */ }
    modalBtnConfirm.addEventListener('click', () => { /* ... código igual ... */ });
    modalBtnAlt.addEventListener('click', () => { /* ... código igual ... */ });
    modalBtnCancel.addEventListener('click', () => { /* ... código igual ... */ });
    modal.addEventListener('click', (event) => { /* ... código igual ... */ });

    // --- Lógica de Inicio y Carga del Juego ---
    function checkExistingGame() { /* ... código igual ... */ }
    continueGameButton.addEventListener('click', () => { /* ... código igual, llama a fetchAndDisplayGameState ... */ });

    // Obtiene jugadores y deudas del backend y actualiza la UI
    async function fetchAndDisplayGameState() {
        if (!currentGameId) return;
        console.log("fetchAndDisplayGameState: Intentando cargar estado para ID:", currentGameId);
        try {
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');
            console.log("Estado del juego recibido:", gameState);
            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();

            // *** PUNTO CLAVE: Decidir y llamar a showPage ***
            if (currentPlayers.length === 0) {
                console.log("FetchGameState: Juego cargado sin jugadores, yendo a registro.");
                showPage('register-players-page'); // <-- LLAMADA IMPORTANTE
                playerNameInput.focus();
            } else {
                console.log("FetchGameState: Juego cargado con jugadores, yendo a registro de deudas.");
                showPage('register-debts-page'); // <-- LLAMADA IMPORTANTE
            }
            // *** FIN PUNTO CLAVE ***

        } catch (error) {
            /* ... manejo de error igual ... */
            showPage('welcome-page'); // Asegurar que vuelve a bienvenida si hay error
        }
    }

    // --- Navegación entre Páginas ---
    startGameButton.addEventListener('click', async () => {
        /* ... código de advertencia y limpieza igual ... */

        console.log("Intentando iniciar nuevo juego vía API...");
        try {
            const data = await apiRequest('start-game', 'POST');
            currentGameId = data.gameId;
            localStorage.setItem('currentGameId', currentGameId);
            console.log("Nuevo juego iniciado con ID:", currentGameId);
            continueGameButton.disabled = false;
            updatePlayerList(); updateSelectOptions(); updateDebtMatrix();

            // *** PUNTO CLAVE: Llamar a showPage al final ***
            console.log("StartGame: Mostrando página de registro de jugadores.");
            showPage('register-players-page'); // <-- LLAMADA IMPORTANTE
            playerNameInput.focus();
            // *** FIN PUNTO CLAVE ***

        } catch (error) {
            /* ... manejo de error igual ... */
            showPage('welcome-page'); // Asegurar que vuelve a bienvenida si hay error
        }
    });

    // --- Otros Listeners y Lógica (finishRegistration, addNewPlayer, registerPlayer, registerDebt, endGameButton) ---
    // SIN CAMBIOS LÓGICOS respecto a la versión anterior que te di
    /* ... resto del código igual ... */
    finishRegistrationButton.addEventListener('click', () => { /* ... */ });
    addNewPlayerButton.addEventListener('click', () => { /* ... */ });
    registerPlayerButton.addEventListener('click', async () => { /* ... */ });
    playerNameInput.addEventListener('keypress', (event) => { /* ... */ });
    registerDebtButton.addEventListener('click', async () => { /* ... */ });
    endGameButton.addEventListener('click', async () => { /* ... Usa el modal ... */ });


    // --- Funciones Auxiliares ---
    /** Muestra la página con el ID dado y oculta las demás */
    function showPage(pageId) {
        // *** AÑADIDO LOG PARA VERIFICAR ***
        console.log(`Función showPage llamada para mostrar: ${pageId}`);
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = page.id === pageId ? 'block' : 'none';
        });
    }

    function updatePlayerList() { /* ... código igual ... */ }
    function updateSelectOptions() { /* ... código igual ... */ }
    function initializeDebtSummary() { /* ... código igual ... */ }
    function calculateDebtSummary() { /* ... código igual ... */ }
    function updateDebtMatrix() { /* ... código igual ... */ }
    function resetLocalState() { /* ... código igual ... */ }

    // --- Inicialización al cargar la página ---
    console.log("DOM Cargado. Verificando juego existente...");
    checkExistingGame();

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js REVISADO -----
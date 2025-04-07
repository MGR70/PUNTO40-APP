// ----- INICIO CÓDIGO script.js COMPLETO (con Debug Logs v3) -----
document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos del DOM ---
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

    // --- Estado de la Aplicación ---
    let currentGameId = null;
    let currentPlayers = [];
    let currentDebts = [];
    let summary = {};
    let modalActionResolver = null;

    // --- Helper para llamadas a la API ---
    async function apiRequest(endpoint, method = 'GET', body = null) { /* ... código igual ... */ }

    // --- Lógica del Modal Personalizado ---
    function showCustomConfirm(message, confirmText, altText, cancelText) { /* ... código igual ... */ }
    modalBtnConfirm.addEventListener('click', () => { /* ... */ });
    modalBtnAlt.addEventListener('click', () => { /* ... */ });
    modalBtnCancel.addEventListener('click', () => { /* ... */ });
    modal.addEventListener('click', (event) => { /* ... */ });

    // --- Lógica de Inicio y Carga del Juego ---
    function checkExistingGame() { /* ... código igual ... */ }
    continueGameButton.addEventListener('click', () => { /* ... código igual ... */ });
    async function fetchAndDisplayGameState() { /* ... código igual, llama a showPage ... */ }

    // --- Navegación entre Páginas ---
    startGameButton.addEventListener('click', async () => { /* ... código igual con DEBUG logs, llama a showPage ... */ });

    // --- Listener de finishRegistrationButton MODIFICADO ---
    finishRegistrationButton.addEventListener('click', () => {
        if (currentPlayers.length < 2) {
            alert('Debes registrar al menos dos jugadores.');
            return;
        }
        // *** LOG AÑADIDO ANTES DE LLAMAR A LAS ACTUALIZACIONES ***
        console.log("DEBUG finishRegistration: currentPlayers ANTES de actualizar UI de deudas:", JSON.stringify(currentPlayers)); // Muestra el array

        // Asegurarse que los selects y la matriz estén actualizados es bueno
        updateSelectOptions(); // <-- Llamada importante
        calculateDebtSummary();
        updateDebtMatrix();

        console.log("DEBUG finishRegistration: UI de deudas actualizada. Mostrando página...");
        showPage('register-debts-page');
    });
    // --- FIN Listener de finishRegistrationButton MODIFICADO ---


    addNewPlayerButton.addEventListener('click', () => { showPage('register-players-page'); if(playerNameInput) playerNameInput.focus(); });

    // --- Lógica de Jugadores ---
    registerPlayerButton.addEventListener('click', async () => { /* ... código igual ... */ });
    playerNameInput.addEventListener('keypress', (event) => { /* ... */ });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => { /* ... código igual ... */ });

    // --- Lógica de Finalización ---
    endGameButton.addEventListener('click', async () => { /* ... código igual ... */ });

    // --- Funciones Auxiliares ---
    function showPage(pageId) { /* ... código igual con DEBUG logs ... */ }
    function updatePlayerList() { /* ... código igual ... */ }

    // --- Función updateSelectOptions MODIFICADA ---
    function updateSelectOptions() {
        const currentDebtor = debtorSelect.value;
        const currentWinner = winnerSelect.value;
        debtorSelect.innerHTML = '';
        winnerSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Selecciona Jugador --";
        defaultOption.disabled = true;
        debtorSelect.appendChild(defaultOption.cloneNode(true));
        winnerSelect.appendChild(defaultOption.cloneNode(true));

        // *** LOG AÑADIDO DENTRO DE LA FUNCIÓN ***
        console.log(`DEBUG updateSelectOptions: Intentando añadir ${currentPlayers.length} jugadores:`, JSON.stringify(currentPlayers));

        currentPlayers.forEach(player => {
            // *** LOG DENTRO DEL BUCLE ***
            console.log(`DEBUG updateSelectOptions: Añadiendo opción para: ${player}`);
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            debtorSelect.appendChild(option.cloneNode(true));
            winnerSelect.appendChild(option.cloneNode(true));
        });

        // Restaurar selección (sin cambios aquí)
        if (currentPlayers.length > 0) {
            debtorSelect.value = currentPlayers.includes(currentDebtor) ? currentDebtor : "";
            winnerSelect.value = currentPlayers.includes(currentWinner) ? currentWinner : "";
        } else {
            debtorSelect.value = "";
            winnerSelect.value = "";
        }
        if (!debtorSelect.value) debtorSelect.value = "";
        if (!winnerSelect.value) winnerSelect.value = "";
        console.log("DEBUG updateSelectOptions: Finalizado."); // Log final
    }
    // --- FIN Función updateSelectOptions MODIFICADA ---


    function initializeDebtSummary() { /* ... código igual ... */ }
    function calculateDebtSummary() { /* ... código igual ... */ }
    function updateDebtMatrix() { /* ... código igual ... */ }
    function resetLocalState() { /* ... código igual ... */ }

    // --- Inicialización al cargar la página ---
    console.log("DOM Cargado. Verificando juego existente...");
    checkExistingGame();

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (con Debug Logs v3) -----
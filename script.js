// ----- INICIO CÓDIGO script.js COMPLETO (v6 - apiRequest v2 Robusto) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM ---
    let initializationError = false;
    function getElement(id, required = true) { /* ... código igual ... */ }

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
    if (debtMatrixTable) { /* ... código igual ... */ }

    if (initializationError) { /* ... código igual para detener ... */ return; }
    console.log("Selección de elementos completada sin errores críticos.");

    // --- Estado de la Aplicación ---
    let currentGameId = null;
    let currentPlayers = [];
    let currentDebts = [];
    let summary = {};
    let modalActionResolver = null;

    // --- Helper para llamadas a la API (v2 - Más robusto con JSON) ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const options = { method, headers: {} };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        console.log(`DEBUG apiRequest: Enviando ${method} a /api/${endpoint}`); // Log de inicio de llamada

        try {
            const response = await fetch(`/api/${endpoint}`, options);
            console.log(`DEBUG apiRequest: Respuesta recibida de /api/${endpoint}. Status: ${response.status}`); // Log de status

            // Manejo de errores HTTP primero
            if (!response.ok) {
                let errorData = { message: `Error HTTP ${response.status}` };
                try {
                    errorData = await response.json();
                    console.error(`API Error Body (${response.status}) en ${endpoint}:`, errorData);
                } catch (e) {
                    try {
                         const errorText = await response.text();
                         console.error(`API Error Text (${response.status}) en ${endpoint}: ${errorText}`);
                         errorData.message = errorText || errorData.message;
                    } catch (e2) {
                         console.error(`API Error (${response.status}) en ${endpoint}: No se pudo leer cuerpo del error.`);
                    }
                }
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            // Manejo de respuesta exitosa (response.ok es true)
            if (response.status === 204) { // No Content
                console.log(`DEBUG apiRequest: Respuesta 204 (No Content) de /api/${endpoint}. Devolviendo null.`);
                return null;
            }

            // Intentar leer el cuerpo como JSON
            try {
                const data = await response.json();
                console.log(`DEBUG apiRequest: JSON recibido de /api/${endpoint}:`, data); // Log del JSON exitoso
                return data;
            } catch (e) {
                 console.error(`Error al parsear JSON de respuesta exitosa (${response.status}) desde /api/${endpoint}:`, e);
                 throw new Error(`Respuesta inesperada del servidor: no se pudo interpretar el cuerpo como JSON.`);
            }

        } catch (error) {
            console.error(`****** ERROR CAPTURADO en apiRequest para ${endpoint} ******:`, error);
            alert(`Error de comunicación con el servidor: ${error.message}. Intenta de nuevo.`);
            throw error;
        }
    }
    // --- FIN Helper para llamadas a la API (v2) ---


    // --- Lógica del Modal Personalizado ---
    function showCustomConfirm(message, confirmText, altText, cancelText) { /* ... código sin cambios ... */ }
    if(modalBtnConfirm) modalBtnConfirm.addEventListener('click', () => { /* ... */ });
    if(modalBtnAlt) modalBtnAlt.addEventListener('click', () => { /* ... */ });
    if(modalBtnCancel) modalBtnCancel.addEventListener('click', () => { /* ... */ });
    if(modal) modal.addEventListener('click', (event) => { /* ... */ });


    // --- Lógica de Inicio y Carga del Juego ---
    function checkExistingGame() { /* ... código sin cambios ... */ }
    if (continueGameButton) { continueGameButton.addEventListener('click', () => { /* ... código sin cambios ... */ }); }
    else { console.error("No se pudo añadir listener a 'continueGameButton' porque no se encontró."); }

    async function fetchAndDisplayGameState() { /* ... código sin cambios ... */ }

    // --- Navegación entre Páginas ---
    if (startGameButton) {
        startGameButton.addEventListener('click', async () => { /* ... código sin cambios con DEBUG logs ... */ });
    } else { console.error("No se pudo añadir listener a 'startGameButton' porque no se encontró."); }

    // --- Otros Listeners y Lógica ---
    if(finishRegistrationButton) finishRegistrationButton.addEventListener('click', () => { /* ... código sin cambios con DEBUG logs ... */ });
    if(addNewPlayerButton) addNewPlayerButton.addEventListener('click', () => { /* ... código sin cambios ... */ });
    if(registerPlayerButton) registerPlayerButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });
    if(playerNameInput) playerNameInput.addEventListener('keypress', (event) => { /* ... */ });
    if(registerDebtButton) registerDebtButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });
    if(endGameButton) endGameButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });

    // --- Funciones Auxiliares ---
    function showPage(pageId) { /* ... código sin cambios con DEBUG logs ... */ }
    function updatePlayerList() { /* ... código sin cambios ... */ }
    function updateSelectOptions() { /* ... código sin cambios con DEBUG logs ... */ }
    function initializeDebtSummary() { /* ... código sin cambios ... */ }
    function calculateDebtSummary() { /* ... código sin cambios ... */ }
    function updateDebtMatrix() { /* ... código sin cambios ... */ }
    function resetLocalState() { /* ... código sin cambios ... */ }

    // --- Inicialización Final ---
    console.log("Inicialización JS estructura básica completada.");
    if (!initializationError) {
        console.log("Llamando a checkExistingGame...");
        checkExistingGame();
    } else {
        console.error("Inicialización detenida debido a errores encontrando elementos HTML.");
    }

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (v6 - apiRequest v2 Robusto) -----
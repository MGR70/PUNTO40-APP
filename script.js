// ----- INICIO CÓDIGO script.js COMPLETO (v17 - v14 Base + Modal Finalizar) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM ---
    let criticalElementMissing = false;
    function checkElement(element, id, isCritical = true) { if (!element && isCritical) { console.error(`****** ERROR CRÍTICO: No se encontró ID="${id}" ******`); criticalElementMissing = true; } return element; }

    const welcomePage = checkElement(document.getElementById('welcome-page'), 'welcome-page');
    const registerPlayersPage = checkElement(document.getElementById('register-players-page'), 'register-players-page');
    const registerDebtsPage = checkElement(document.getElementById('register-debts-page'), 'register-debts-page');
    const startGameButton = checkElement(document.getElementById('start-game'), 'start-game');
    const continueGameButton = checkElement(document.getElementById('continue-game'), 'continue-game'); // Esencial
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
    // --- MODIFICACIÓN: Elementos del Modal ahora son críticos ---
    const modal = checkElement(document.getElementById('custom-confirm-modal'), 'custom-confirm-modal');
    const modalMessage = checkElement(document.getElementById('modal-message'), 'modal-message');
    const modalBtnConfirm = checkElement(document.getElementById('modal-btn-confirm'), 'modal-btn-confirm');
    const modalBtnAlt = checkElement(document.getElementById('modal-btn-alt'), 'modal-btn-alt');
    const modalBtnCancel = checkElement(document.getElementById('modal-btn-cancel'), 'modal-btn-cancel');
    // --- FIN MODIFICACIÓN ---

    let debtMatrixThead = null; let debtMatrixTbody = null;
    if (debtMatrixTable) { debtMatrixThead = debtMatrixTable.querySelector('thead'); debtMatrixTbody = debtMatrixTable.querySelector('tbody'); if (!debtMatrixThead || !debtMatrixTbody) criticalElementMissing = true; }
    else { criticalElementMissing = true; }

    if (criticalElementMissing) { console.error("Inicialización detenida..."); alert("Error crítico..."); return; }
    console.log("Selección de elementos completada.");

    // --- Estado de la Aplicación ---
    let currentGameId = null; let currentPlayers = []; let currentDebts = []; let summary = {};
    let modalActionResolver = null; // <--- NECESARIO para el modal

    // --- Helper para llamadas a la API (v2 Robusta - Sin Logs Extremos) ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const options = { method, headers: {} };
        if (body) { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body); }
        try {
            const response = await fetch(`/api/${endpoint}`, options);
            if (!response.ok) {
                let errorData = { message: `Error HTTP ${response.status}` }; try { errorData = await response.json(); } catch (e) { try { errorData.message = await response.text() || errorData.message; } catch (e2) {} }
                console.error(`Error en API ${endpoint} (${response.status}):`, errorData.message || 'Sin detalles');
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }
            if (response.status === 204) return null;
            try {
                const data = await response.json(); return data;
            } catch (e) {
                 console.error(`Error al parsear JSON (${response.status}) desde /api/${endpoint}:`, e);
                 throw new Error(`Respuesta inesperada del servidor.`);
            }
        } catch (error) {
            console.error(`Error en apiRequest para ${endpoint}:`, error);
            alert(`Error de comunicación: ${error.message}.`);
            throw error;
        }
    }
    // --- FIN Helper ---

    // --- INICIO: Lógica del Modal Personalizado (AÑADIDA) ---
    function showCustomConfirm(message, confirmText, altText, cancelText) {
        console.log(`showCustomConfirm: Mostrando modal. Mensaje: "${message}"`);
        return new Promise((resolve) => {
            // La verificación de elementos ya se hizo al inicio
            modalMessage.textContent = message;

            modalBtnConfirm.textContent = confirmText;
            modalBtnConfirm.style.display = confirmText ? 'inline-block' : 'none';

            modalBtnAlt.textContent = altText;
            modalBtnAlt.style.display = altText ? 'inline-block' : 'none';

            modalBtnCancel.textContent = cancelText || 'Cancelar';
            modalBtnCancel.style.display = (cancelText !== null) ? 'inline-block' : 'none';

            modal.style.display = 'flex'; // Mostrar modal

            modalActionResolver = resolve; // Guardar la función para resolver la promesa
        });
    }

    // Listeners para botones del modal (AÑADIDOS)
    modalBtnConfirm.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('confirm'); if(modal) modal.style.display = 'none'; });
    modalBtnAlt.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('alt'); if(modal) modal.style.display = 'none'; });
    modalBtnCancel.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('cancel'); if(modal) modal.style.display = 'none'; });
    modal.addEventListener('click', (event) => { if (event.target === modal) { if (modalActionResolver) modalActionResolver('cancel'); modal.style.display = 'none'; } });
    // --- FIN: Lógica del Modal ---


    // --- Lógica de Inicio y Carga (Mejorada - Sin confirm()) ---
    function checkAndSetContinueButton() { /* ... código igual v14 ... */ }
    async function fetchAndDisplayGameState() { /* ... código igual v14 ... */ }

    // --- Navegación entre Páginas ---
    startGameButton.addEventListener('click', async () => { /* ... código igual v14 ... */ });
    if (continueGameButton) { continueGameButton.addEventListener('click', () => { /* ... código igual v14 ... */ }); }
    finishRegistrationButton.addEventListener('click', () => { /* ... código igual v14 ... */ });
    addNewPlayerButton.addEventListener('click', () => { /* ... código igual v14 ... */ });

    // --- Lógica de Jugadores ---
    registerPlayerButton.addEventListener('click', async () => { /* ... código igual v14 ... */ });
    playerNameInput.addEventListener('keypress', (event) => { /* ... código igual v14 ... */ });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => { /* ... código igual v14 ... */ });

    // --- INICIO: Lógica de Finalización (MODIFICADA para usar Modal) ---
    endGameButton.addEventListener('click', async () => {
         if (!currentGameId) { alert("No hay juego activo."); return; }
         console.log("endGameButton: Presionado. Mostrando modal 1.");

         // 1. Mostrar primer modal para elegir acción
        const choice1 = await showCustomConfirm(
            '¿Qué deseas hacer con este juego?',      // Mensaje
            'Descartar Juego (Borrar Datos)',   // Texto Botón Confirm (rojo)
            'Guardar y Salir',                  // Texto Botón Alt (verde)
            'Volver al Juego'                   // Texto Botón Cancel (gris)
        );

        console.log("endGameButton: Respuesta Modal 1:", choice1);

        // --- Acción basada en la elección del usuario ---

        if (choice1 === 'alt') { // Eligió "Guardar y Salir"
            console.log("endGameButton: Eligió Guardar y Salir. Navegando a bienvenida.");
            // Simplemente ir a bienvenida. El ID ya está en localStorage.
            // Llamar a checkAndSet... asegura que el botón Continuar esté habilitado y muestre bienvenida.
             checkAndSetContinueButton();

        } else if (choice1 === 'confirm') { // Eligió "Descartar Juego (Borrar Datos)"
            console.log("endGameButton: Eligió Descartar. Mostrando modal 2 (confirmación).");

            // 2. Mostrar segundo modal para confirmar borrado
            const choice2 = await showCustomConfirm(
                '¿Estás SEGURO de que quieres borrar permanentemente todos los datos de este juego? Esta acción no se puede deshacer.', // Mensaje de confirmación fuerte
                'Sí, Borrar Definitivamente',  // Texto Botón Confirm (rojo)
                null,                          // Sin botón Alt en esta confirmación
                'Cancelar'                     // Texto Botón Cancel (gris)
            );

            console.log("endGameButton: Respuesta Modal 2:", choice2);

            if (choice2 === 'confirm') { // Confirmó el borrado definitivo
                console.log(`endGameButton: Confirmó borrado. Intentando API /api/end-game para ${currentGameId}`);
                try {
                    // Llama a la API para borrar (usando la versión corregida de la API que asume éxito si no hay error)
                    await apiRequest('end-game', 'POST', { gameId: currentGameId });
                    console.log("endGameButton: API end-game ejecutada (asumiendo éxito).");
                } catch (error) {
                    console.error("endGameButton: Error en llamada API end-game:", error);
                } finally {
                     // Limpiar siempre localmente después de intentar borrar
                    console.log("endGameButton: Limpiando estado local tras intento de borrado...");
                    localStorage.removeItem('currentGameId');
                    currentGameId = null;
                    resetLocalState(); // Limpia variables y UI relacionada
                    if(continueGameButton) continueGameButton.disabled = true; // Deshabilitar botón Continuar
                    showPage('welcome-page'); // Mostrar bienvenida
                }
            } else { // Canceló el borrado definitivo (choice2 === 'cancel' o 'error')
                console.log("endGameButton: Canceló el borrado definitivo. Volviendo al juego.");
                // No hacer nada, el modal se cierra y permanece en la página de deudas
            }
        } else { // Eligió "Volver al Juego" o cerró el primer modal (choice1 === 'cancel' o 'error')
            console.log("endGameButton: Eligió Volver al Juego o cerró modal 1.");
            // No hacer nada, el modal se cierra y permanece en la página de deudas
        }
    });
    // --- FIN: Lógica de Finalización ---


    // --- Funciones Auxiliares ---
    function showPage(pageIdToShow) { /* ... código igual v14 ... */ }
    function updatePlayerList() { /* ... código igual v14 ... */ }
    function updateSelectOptions() { /* ... código igual v14 ... */ }
    function initializeDebtSummary() { /* ... código igual v14 ... */ }
    function calculateDebtSummary() { /* ... código igual v14 ... */ }
    function updateDebtMatrix() { /* ... código igual v14 ... */ }
    function resetLocalState() { /* ... código igual v14 ... */ }

    // --- Inicialización Final ---
    console.log("Inicialización JS v17 (Modal Finalizar) completada. Llamando a checkAndSetContinueButton...");
    checkAndSetContinueButton();

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (v17 - v14 Base + Modal Finalizar) -----
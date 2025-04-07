// ----- INICIO CÓDIGO script.js COMPLETO (v14 - Bienvenida Mejorada - RESTAURADA) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM ---
    let criticalElementMissing = false;
    function checkElement(element, id, isCritical = true) { if (!element && isCritical) { console.error(`****** ERROR CRÍTICO: No se encontró ID="${id}" ******`); criticalElementMissing = true; } else if (!element && !isCritical) { /* console.warn(`Advertencia: Opcional ID="${id}" no encontrado.`); */ } return element; }

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
    const modal = checkElement(document.getElementById('custom-confirm-modal'), 'custom-confirm-modal', false);

    let debtMatrixThead = null; let debtMatrixTbody = null;
    if (debtMatrixTable) { debtMatrixThead = debtMatrixTable.querySelector('thead'); debtMatrixTbody = debtMatrixTable.querySelector('tbody'); if (!debtMatrixThead || !debtMatrixTbody) criticalElementMissing = true; }
    else { criticalElementMissing = true; }

    if (criticalElementMissing) { console.error("Inicialización detenida..."); alert("Error crítico..."); return; }
    console.log("Selección de elementos completada.");

    // --- Estado de la Aplicación ---
    let currentGameId = null; let currentPlayers = []; let currentDebts = []; let summary = {};

    // --- Helper para llamadas a la API (v2 Robusta - Sin Logs Extremos) ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const options = { method, headers: {} };
        if (body) { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body); }
        // console.log(`apiRequest: ${method} /api/${endpoint}`); // Log Mínimo
        try {
            const response = await fetch(`/api/${endpoint}`, options);
            // console.log(`apiRequest: Status ${response.status}`); // Log Mínimo
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
// --- INICIO: Lógica del Modal Personalizado (AÑADIR ESTE BLOQUE) ---
let modalActionResolver = null; // Variable para manejar la promesa del modal

function showCustomConfirm(message, confirmText, altText, cancelText) {
    console.log(`showCustomConfirm: Mostrando modal. Mensaje: "${message}"`);
    // Referenciar elementos del modal (asumimos que ya están definidos globalmente o hacer getElementById aquí)
    const modal = document.getElementById('custom-confirm-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalBtnConfirm = document.getElementById('modal-btn-confirm');
    const modalBtnAlt = document.getElementById('modal-btn-alt');
    const modalBtnCancel = document.getElementById('modal-btn-cancel');

    return new Promise((resolve) => {
        if (!modal || !modalMessage || !modalBtnConfirm || !modalBtnAlt || !modalBtnCancel) {
            console.error("showCustomConfirm: Faltan elementos del modal!");
            resolve('error'); return;
        }

        modalMessage.textContent = message;

        modalBtnConfirm.textContent = confirmText;
        modalBtnConfirm.style.display = confirmText ? 'inline-block' : 'none';

        modalBtnAlt.textContent = altText;
        modalBtnAlt.style.display = altText ? 'inline-block' : 'none';

        modalBtnCancel.textContent = cancelText || 'Cancelar';
        modalBtnCancel.style.display = (cancelText !== null) ? 'inline-block' : 'none';

        modal.style.display = 'flex';

        modalActionResolver = resolve;
    });
}

// Listeners para botones del modal (AÑADIR ESTE BLOQUE)
// Asegurarse que los botones existen antes de añadir listeners
const modalElementForListener = document.getElementById('custom-confirm-modal');
const modalBtnConfirmForListener = document.getElementById('modal-btn-confirm');
const modalBtnAltForListener = document.getElementById('modal-btn-alt');
const modalBtnCancelForListener = document.getElementById('modal-btn-cancel');

if(modalBtnConfirmForListener) modalBtnConfirmForListener.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('confirm'); if(modalElementForListener) modalElementForListener.style.display = 'none'; });
if(modalBtnAltForListener) modalBtnAltForListener.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('alt'); if(modalElementForListener) modalElementForListener.style.display = 'none'; });
if(modalBtnCancelForListener) modalBtnCancelForListener.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('cancel'); if(modalElementForListener) modalElementForListener.style.display = 'none'; });
if(modalElementForListener) modalElementForListener.addEventListener('click', (event) => { if (event.target === modalElementForListener) { if (modalActionResolver) modalActionResolver('cancel'); modalElementForListener.style.display = 'none'; } });
// --- FIN: Lógica del Modal ---
    // --- Lógica de Inicio y Carga (MODIFICADA - Sin confirm()) ---
    function checkAndSetContinueButton() {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId) {
            // console.log("checkAndSetContinueButton: Juego guardado encontrado:", savedGameId); // Log reducido
            if (continueGameButton) continueGameButton.disabled = false; // Habilitar
        } else {
            // console.log("checkAndSetContinueButton: No se encontró juego guardado."); // Log reducido
            if (continueGameButton) continueGameButton.disabled = true; // Deshabilitar
        }
        showPage('welcome-page');
        // console.log("checkAndSetContinueButton: Página de bienvenida mostrada."); // Log reducido
    }

    // Función para cargar datos
    async function fetchAndDisplayGameState() {
        if (!currentGameId) { console.error("fetchAndDisplayGameState: llamado sin currentGameId!"); return; }
        console.log("fetchAndDisplayGameState: Cargando ID:", currentGameId);
        try {
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');
            // console.log("fetchAndDisplayGameState: Estado recibido:", gameState ? 'OK' : 'Vacío/Error'); // Log reducido
            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
            if (currentPlayers.length < 2 && gameState) {
                 // console.log("fetchAndDisplayGameState: Juego cargado tiene < 2 jugadores."); // Log reducido
                 showPage('register-players-page'); if(playerNameInput) playerNameInput.focus();
            } else if (gameState) {
                 // console.log("fetchAndDisplayGameState: Juego cargado OK."); // Log reducido
                 showPage('register-debts-page');
            } else { throw new Error("No se recibieron datos válidos."); }
        } catch (error) {
            console.error("fetchAndDisplayGameState: Error fetching state:", error);
            alert(`Error al cargar datos del juego.`);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
            if(continueGameButton) continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    }

    // --- Navegación entre Páginas ---

    // Listener para Iniciar Nuevo Juego (MODIFICADO - Sin confirm() de advertencia)
    startGameButton.addEventListener('click', async () => {
        // console.log("startGameButton: Botón presionado."); // Log reducido
        console.log("startGameButton: Preparando para iniciar nuevo juego...");
        currentGameId = null; resetLocalState();
        if (continueGameButton) continueGameButton.disabled = true;

        // console.log("startGameButton: Intentando API /api/start-game..."); // Log reducido
        try {
            const data = await apiRequest('start-game', 'POST');
            if (!data || !data.gameId) { throw new Error("Respuesta API inválida: no gameId."); }
            currentGameId = data.gameId;
            localStorage.setItem('currentGameId', currentGameId);
            console.log("startGameButton: Nuevo juego iniciado con ID:", currentGameId); // Log importante
            if (continueGameButton) continueGameButton.disabled = false;
            updatePlayerList(); updateSelectOptions(); updateDebtMatrix();
            // console.log("startGameButton: UI reseteada."); // Log reducido
            showPage('register-players-page');
            if(playerNameInput) playerNameInput.focus();
        } catch (error) {
            console.error("startGameButton: ****** ERROR CAPTURADO ******:", error);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
            if(continueGameButton) continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    });

    // --- NUEVO: Listener para Continuar Último Juego ---
    if (continueGameButton) { // Añadir solo si el botón existe
        continueGameButton.addEventListener('click', () => {
            if (!continueGameButton.disabled) {
                const savedGameId = localStorage.getItem('currentGameId');
                if (savedGameId) {
                    console.log("continueGameButton: Cargando juego ID:", savedGameId);
                    currentGameId = savedGameId;
                    fetchAndDisplayGameState();
                } else {
                     console.warn("continueGameButton: Clic pero no hay ID.");
                     continueGameButton.disabled = true;
                     alert("No se encontró juego para continuar.");
                }
            } else { /* console.log("continueGameButton: Clic ignorado (deshabilitado)."); */ } // Log reducido
        });
    }
    // --- FIN NUEVO Listener ---

    // Listener Ir a Deudas
    finishRegistrationButton.addEventListener('click', () => {
         if (currentPlayers.length < 2) { alert('Debes registrar al menos dos jugadores.'); return; }
         console.log("finishRegistrationButton: Pasando a deudas. Jugadores:", JSON.stringify(currentPlayers)); // Log importante
         updateSelectOptions(); // <-- Llamada Clave
         calculateDebtSummary();
         updateDebtMatrix();
         showPage('register-debts-page');
    });

    // Listener Agregar más jugadores
    addNewPlayerButton.addEventListener('click', () => {
         showPage('register-players-page');
         if(playerNameInput) playerNameInput.focus();
     });

    // --- Lógica de Jugadores ---
    registerPlayerButton.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) { alert('Introduce un nombre.'); return; }
        if (currentPlayers.includes(playerName)) { alert(`Jugador "${playerName}" ya existe.`); if(playerNameInput) playerNameInput.select(); return; }
        if (!currentGameId) { alert("Error: No hay juego activo."); return; }
        // console.log(`registerPlayerButton: Añadiendo "${playerName}"...`); // Log reducido
        try {
            await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName });
            currentPlayers.push(playerName);
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
            if(playerNameInput) { playerNameInput.value = ''; playerNameInput.focus(); }
        } catch (error) { console.error("registerPlayerButton: Error:", error); if(playerNameInput) playerNameInput.select(); }
    });

    playerNameInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); registerPlayerButton.click(); } });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => {
        const debtor = debtorSelect.value; const winner = winnerSelect.value; const amount = parseFloat(debtAmountInput.value);
        if (!debtor || !winner) { alert('Selecciona deudor y acreedor.'); return; }
        if (debtor === winner) { alert('Deudor y acreedor iguales.'); return; }
        if (isNaN(amount) || amount <= 0) { alert('Monto inválido.'); if(debtAmountInput) debtAmountInput.focus(); return; }
        if (!currentGameId) { alert("Error: No hay juego activo."); return; }
        // console.log(`registerDebtButton: Añadiendo deuda...`); // Log reducido
        try {
            await apiRequest('add-debt', 'POST', { gameId: currentGameId, debtor, winner, amount });
            currentDebts.push({ debtor, winner, amount });
            calculateDebtSummary(); updateDebtMatrix();
            if(debtAmountInput) { debtAmountInput.value = ''; debtAmountInput.focus(); }
        } catch (error) { console.error("registerDebtButton: Error:", error); }
    });

    // --- INICIO: Lógica de Finalización (MODIFICADA para usar Modal) ---
endGameButton.addEventListener('click', async () => {
    // Verificar si hay juego activo
    if (!currentGameId) {
        alert("No hay ningún juego activo para finalizar.");
        return;
    }
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
        checkAndSetContinueButton(); // Llama a la función que habilita/deshabilita y muestra bienvenida

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
       } else { // Canceló el borrado definitivo
           console.log("endGameButton: Canceló el borrado definitivo. Volviendo al juego.");
       }
   } else { // Eligió "Volver al Juego" o cerró el primer modal
       console.log("endGameButton: Eligió Volver al Juego o cerró modal 1.");
   }
});
// --- FIN: Lógica de Finalización ---
// ----- FIN CÓDIGO script.js COMPLETO (v14 - Restaurada) -----
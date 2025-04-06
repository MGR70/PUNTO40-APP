document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos del DOM ---
    const welcomePage = document.getElementById('welcome-page');
    const registerPlayersPage = document.getElementById('register-players-page');
    const registerDebtsPage = document.getElementById('register-debts-page');
    const startGameButton = document.getElementById('start-game');
    // --- NUEVO ELEMENTO ---
    const continueGameButton = document.getElementById('continue-game'); // Seleccionar el nuevo botón
    // --- FIN NUEVO ELEMENTO ---
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

    // --- Estado de la Aplicación ---
    let currentGameId = null;
    let currentPlayers = [];
    let currentDebts = [];
    let summary = {};

    // --- Helper para llamadas a la API ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {},
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`/api/${endpoint}`, options);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: `HTTP error! status: ${response.status}` };
                }
                console.error(`API Error (${response.status}) en ${endpoint}:`, errorData);
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            if (response.status === 204) {
                return null;
            }
            return await response.json();

        } catch (error) {
            console.error(`Network or fetch error for endpoint ${endpoint}:`, error);
            alert(`Error de red o del servidor: ${error.message}. Intenta de nuevo.`);
            throw error;
        }
    }

    // --- Lógica de Inicio y Carga del Juego ---

    // --- MODIFICADO: loadExistingGame ---
    // Solo verifica si hay un juego guardado para mostrar/ocultar el botón "Continuar"
    function loadExistingGame() {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId) {
            // Si hay un ID guardado, simplemente muestra el botón "Continuar"
            console.log("Juego guardado encontrado:", savedGameId); // Ayuda a depurar
            continueGameButton.style.display = 'inline-block'; // O 'block' según tu CSS
        } else {
            // Si no hay ID, oculta el botón
            console.log("No se encontró juego guardado."); // Ayuda a depurar
            continueGameButton.style.display = 'none';
        }
        // Siempre muestra la página de bienvenida al inicio ahora
        showPage('welcome-page');
    }
    // --- FIN MODIFICADO: loadExistingGame ---

    // --- NUEVO: Event Listener para el botón "Continuar Último Juego" ---
    continueGameButton.addEventListener('click', () => {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId) {
            console.log("Botón 'Continuar' presionado. Cargando juego ID:", savedGameId); // Ayuda a depurar
            currentGameId = savedGameId;
            // Llamamos a la función que realmente carga los datos y muestra la página
            fetchAndDisplayGameState();
        } else {
            // Esto no debería pasar si el botón está visible, pero por seguridad:
            alert("No se encontró ningún juego guardado para continuar.");
            continueGameButton.style.display = 'none'; // Ocultar si el ID desapareció
        }
    });
    // --- FIN NUEVO: Event Listener ---


    // Obtiene jugadores y deudas del backend y actualiza la UI
    async function fetchAndDisplayGameState() {
        if (!currentGameId) {
            console.log("fetchAndDisplayGameState llamado sin currentGameId"); // Ayuda a depurar
            return;
        }
        console.log("fetchAndDisplayGameState: Intentando cargar estado para ID:", currentGameId); // Ayuda a depurar

        try {
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');
            console.log("Estado del juego recibido:", gameState); // Ayuda a depurar

            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];

            updatePlayerList();
            updateSelectOptions();
            calculateDebtSummary();
            updateDebtMatrix();

            if (currentPlayers.length === 0) { // Si por alguna razón no hay jugadores
                console.log("Juego cargado sin jugadores, yendo a registro."); // Ayuda a depurar
                 showPage('register-players-page');
                 playerNameInput.focus();
            } else {
                 console.log("Juego cargado, yendo a registro de deudas."); // Ayuda a depurar
                 showPage('register-debts-page');
            }

        } catch (error) {
            alert(`No se pudo cargar el estado del juego (ID: ${currentGameId}).`); // Quitado "Iniciando uno nuevo."
            console.error("Error fetching game state:", error);
            localStorage.removeItem('currentGameId'); // Limpia el ID inválido
            currentGameId = null;
            resetLocalState();
            continueGameButton.style.display = 'none'; // Ocultar botón continuar
            showPage('welcome-page'); // Volver a bienvenida
        }
    }


    // --- Navegación entre Páginas ---

    // --- MODIFICADO: startGameButton Listener ---
    startGameButton.addEventListener('click', async () => {
        // Preguntar si se quiere finalizar el juego activo (si existe)
        if (currentGameId) {
             console.log("Juego activo detectado (ID:", currentGameId, "). Preguntando para finalizar."); // Ayuda a depurar
            if (!confirm('Ya hay un juego activo. ¿Deseas finalizarlo y empezar uno nuevo? (Los datos guardados se borrarán)')) {
                console.log("Usuario canceló iniciar nuevo juego."); // Ayuda a depurar
                 return; // No hacer nada si el usuario cancela
            }
            // Si confirma, finalizar el juego anterior SIN volver a preguntar
             console.log("Usuario confirmó finalizar juego anterior."); // Ayuda a depurar
            await handleEndGame(false);
            // handleEndGame ya limpia localStorage, currentGameId, estado local y oculta el botón continuar
        } else {
            // Si no había juego activo, igual limpiamos por si acaso
             console.log("No había juego activo. Limpiando estado antes de iniciar nuevo juego."); // Ayuda a depurar
            localStorage.removeItem('currentGameId');
            currentGameId = null;
            continueGameButton.style.display = 'none';
            resetLocalState();
        }


        // Ahora que estamos seguros que no hay juego activo (o se finalizó)
        console.log("Intentando iniciar nuevo juego vía API..."); // Ayuda a depurar
        try {
            // Llama a la API para crear un nuevo juego
            const data = await apiRequest('start-game', 'POST');
            currentGameId = data.gameId;
            localStorage.setItem('currentGameId', currentGameId);
            console.log("Nuevo juego iniciado con ID:", currentGameId);

            // Actualizar UI para el nuevo juego vacío
            updatePlayerList();
            updateSelectOptions();
            updateDebtMatrix();

            showPage('register-players-page');
            playerNameInput.focus();
        } catch (error) {
            // La función apiRequest ya muestra un alert()
            console.error("Falló la creación de un nuevo juego vía API:", error);
            // Asegurarnos de limpiar por si algo quedó a medias
             localStorage.removeItem('currentGameId');
             currentGameId = null;
             continueGameButton.style.display = 'none';
             resetLocalState();
             showPage('welcome-page'); // Volver a bienvenida si falla
        }
    });
    // --- FIN MODIFICADO: startGameButton Listener ---


    finishRegistrationButton.addEventListener('click', () => {
        if (currentPlayers.length < 2) {
            alert('Debes registrar al menos dos jugadores.');
            return;
        }
        showPage('register-debts-page');
        // Es buena idea refrescar por si acaso, aunque no debería ser necesario
        // si la UI se actualiza correctamente al añadir jugadores.
        updateSelectOptions();
        calculateDebtSummary();
        updateDebtMatrix();
    });

    addNewPlayerButton.addEventListener('click', () => {
        showPage('register-players-page');
        playerNameInput.focus();
    });

    // --- Lógica de Jugadores ---
    registerPlayerButton.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Por favor, introduce un nombre de jugador.');
            return;
        }
        if (currentPlayers.includes(playerName)) {
            alert(`El jugador "${playerName}" ya ha sido registrado en este juego.`);
            playerNameInput.select();
            return;
        }
        if (!currentGameId) {
            alert("Error: No hay un juego activo para añadir jugadores.");
             console.error("Intento de añadir jugador sin currentGameId"); // Ayuda a depurar
            return;
        }

        console.log("Intentando añadir jugador:", playerName, "al juego ID:", currentGameId); // Ayuda a depurar
        try {
            await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName });
            console.log("Jugador añadido con éxito vía API."); // Ayuda a depurar

            // Actualización local optimista
            currentPlayers.push(playerName);
            updatePlayerList();
            updateSelectOptions();
            // Recalcular matriz (aunque no habrá deudas nuevas aún)
             calculateDebtSummary();
             updateDebtMatrix();


            playerNameInput.value = '';
            playerNameInput.focus();

        } catch (error) {
             console.error("Falló añadir jugador:", error);
             // apiRequest ya mostró alert. No es necesario refrescar todo el estado necesariamente.
             playerNameInput.select();
        }
    });

    playerNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            registerPlayerButton.click();
        }
    });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => {
        const debtor = debtorSelect.value;
        const winner = winnerSelect.value;
        const amount = parseFloat(debtAmountInput.value);

        if (!debtor || !winner) {
            alert('Debes seleccionar un deudor y un acreedor.');
            return;
        }
        if (debtor === winner) {
            alert('El deudor y el acreedor no pueden ser el mismo jugador.');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert('Por favor, introduce un monto de deuda válido y mayor que cero.');
            debtAmountInput.focus();
            return;
        }
        if (!currentGameId) {
            alert("Error: No hay un juego activo para registrar deudas.");
             console.error("Intento de añadir deuda sin currentGameId"); // Ayuda a depurar
            return;
        }

         console.log(`Intentando añadir deuda: ${debtor} -> ${winner} (${amount}) en juego ID: ${currentGameId}`); // Ayuda a depurar
        try {
            await apiRequest('add-debt', 'POST', { gameId: currentGameId, debtor, winner, amount });
             console.log("Deuda añadida con éxito vía API."); // Ayuda a depurar

            // Actualización local optimista
            currentDebts.push({ debtor, winner, amount });
            calculateDebtSummary();
            updateDebtMatrix();

            debtAmountInput.value = '';
            debtAmountInput.focus();

        } catch (error) {
            console.error("Falló añadir deuda:", error);
            // apiRequest ya mostró alert.
        }
    });

    // --- Lógica de Finalización ---
    endGameButton.addEventListener('click', () => {
         console.log("Botón Finalizar Juego presionado."); // Ayuda a depurar
        // Llama a la función que maneja la finalización, preguntando primero
        handleEndGame(true);
    });

    // --- MODIFICADO: handleEndGame ---
    // Nueva función para manejar la finalización del juego
    async function handleEndGame(askConfirmation = true) {
        if (!currentGameId) {
            alert("No hay ningún juego activo para finalizar.");
            // Limpiar por si acaso algo quedó inconsistente
             resetLocalState();
             continueGameButton.style.display = 'none';
            showPage('welcome-page');
            return;
        }

         console.log("handleEndGame llamado para ID:", currentGameId, "Confirmar:", askConfirmation); // Ayuda a depurar
        if (askConfirmation && !confirm('¿Estás seguro de que deseas finalizar el juego? Se borrarán todos los datos guardados de este juego.')) {
             console.log("Usuario canceló finalizar juego."); // Ayuda a depurar
            return; // El usuario canceló
        }

        console.log("Intentando finalizar juego vía API..."); // Ayuda a depurar
        try {
            // Llama a la API para borrar el juego en el backend
            await apiRequest('end-game', 'POST', { gameId: currentGameId });
             console.log("Juego finalizado con éxito vía API."); // Ayuda a depurar

            // Si tiene éxito, limpia todo localmente
            localStorage.removeItem('currentGameId');
            currentGameId = null;
            resetLocalState();
            updatePlayerList(); // Limpia UI
            updateSelectOptions();
            updateDebtMatrix();
            continueGameButton.style.display = 'none'; // Ocultar botón al finalizar
            showPage('welcome-page'); // Vuelve a la bienvenida

        } catch (error) {
            console.error("Falló finalizar juego vía API:", error);
            // apiRequest ya mostró alert.
            // Aunque falle la API (ej: juego ya borrado), igual limpiamos localmente
            localStorage.removeItem('currentGameId');
            currentGameId = null;
            resetLocalState();
            updatePlayerList();
            updateSelectOptions();
            updateDebtMatrix();
            continueGameButton.style.display = 'none'; // Ocultar botón también si hay error
            showPage('welcome-page');
        }
    }
    // --- FIN MODIFICADO: handleEndGame ---


    // --- Funciones Auxiliares ---
    /** Muestra la página con el ID dado y oculta las demás */
    function showPage(pageId) {
         console.log("Mostrando página:", pageId); // Ayuda a depurar
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = page.id === pageId ? 'block' : 'none';
        });
    }

    /** Actualiza la lista visual (ul#player-list) basada en `currentPlayers` */
    function updatePlayerList() {
        playerList.innerHTML = '';
        currentPlayers.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player;
            playerList.appendChild(li);
        });
    }

    /** Actualiza las opciones en los <select> basada en `currentPlayers` */
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
        currentPlayers.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            debtorSelect.appendChild(option.cloneNode(true));
            winnerSelect.appendChild(option.cloneNode(true));
        });
        if (currentPlayers.length > 0) {
            debtorSelect.value = currentPlayers.includes(currentDebtor) ? currentDebtor : "";
            winnerSelect.value = currentPlayers.includes(currentWinner) ? currentWinner : "";
        } else {
            debtorSelect.value = "";
            winnerSelect.value = "";
        }
        // Asegurar que el placeholder esté seleccionado si no hay valor válido
        if (!debtorSelect.value) debtorSelect.value = "";
        if (!winnerSelect.value) winnerSelect.value = "";
    }

    /** Inicializa/Resetea la estructura del objeto `summary` con ceros para `currentPlayers` */
    function initializeDebtSummary() {
        summary = {};
        currentPlayers.forEach(p1 => {
            summary[p1] = {};
            currentPlayers.forEach(p2 => {
                if (p1 !== p2) {
                    summary[p1][p2] = 0;
                }
            });
        });
    }

    /** Calcula el resumen (`summary`) basado en `currentPlayers` y `currentDebts` */
    function calculateDebtSummary() {
        initializeDebtSummary();
        let grossDebts = {};
        currentPlayers.forEach(p1 => {
            grossDebts[p1] = {};
            currentPlayers.forEach(p2 => { if (p1 !== p2) grossDebts[p1][p2] = 0; });
        });
        currentDebts.forEach(debt => {
            if (grossDebts[debt.debtor] && grossDebts[debt.debtor].hasOwnProperty(debt.winner)) {
                // Asegurarse de que amount sea un número
                 grossDebts[debt.debtor][debt.winner] += Number(debt.amount) || 0;
            }
        });
        currentPlayers.forEach(p1 => {
            currentPlayers.forEach(p2 => {
                if (p1 === p2) return;
                const amountP1toP2 = grossDebts[p1]?.[p2] || 0;
                const amountP2toP1 = grossDebts[p2]?.[p1] || 0;
                const netDifference = amountP1toP2 - amountP2toP1;
                if (netDifference > 0) {
                    summary[p1][p2] = netDifference;
                    if (summary[p2]) summary[p2][p1] = 0;
                } else {
                    summary[p1][p2] = 0;
                }
            });
        });
         console.log("Resumen de deudas calculado:", summary); // Ayuda a depurar
    }

    /** Dibuja la tabla HTML (`debt-matrix`) basada en `currentPlayers` y `summary` */
    function updateDebtMatrix() {
        debtMatrixThead.innerHTML = '';
        debtMatrixTbody.innerHTML = '';
        if (currentPlayers.length === 0) return;
        const headerRow = debtMatrixThead.insertRow();
        const cornerTh = document.createElement('th');
        cornerTh.innerHTML = 'Deudor ↓ / Acreedor →';
        headerRow.appendChild(cornerTh);
        currentPlayers.forEach(player => {
            const th = document.createElement('th');
            th.textContent = player;
            headerRow.appendChild(th);
        });
        currentPlayers.forEach(debtor => {
            const row = debtMatrixTbody.insertRow();
            const debtorHeaderCell = document.createElement('th');
            debtorHeaderCell.textContent = debtor;
            row.appendChild(debtorHeaderCell);
            currentPlayers.forEach(winner => {
                const cell = row.insertCell();
                if (debtor === winner) {
                    cell.textContent = '-';
                    cell.className = 'diagonal';
                } else {
                    const netDebt = summary[debtor]?.[winner] || 0;
                    cell.textContent = netDebt > 0 ? netDebt.toFixed(2) : '';
                    cell.className = netDebt > 0 ? 'has-debt' : 'no-debt';
                }
            });
        });
    }

    /** Reinicia el estado local (variables JS), EXCEPTO currentGameId */
    function resetLocalState() {
        console.log("Reseteando estado local (jugadores, deudas, summary)"); // Ayuda a depurar
        currentPlayers = [];
        currentDebts = [];
        summary = {};
        playerNameInput.value = '';
        debtAmountInput.value = '';
        // Limpiar lista y selects aquí también puede ser buena idea
        playerList.innerHTML = '';
        updateSelectOptions(); // Para resetear selects
        updateDebtMatrix(); // Para limpiar la matriz visualmente
    }

    // --- Inicialización al cargar la página ---
     console.log("DOM Cargado. Iniciando aplicación..."); // Ayuda a depurar
    loadExistingGame(); // Llama a la función modificada

}); // Fin del DOMContentLoaded
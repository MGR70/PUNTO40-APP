document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos del DOM (sin cambios) ---
    const welcomePage = document.getElementById('welcome-page');
    const registerPlayersPage = document.getElementById('register-players-page');
    const registerDebtsPage = document.getElementById('register-debts-page');
    const startGameButton = document.getElementById('start-game');
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

    // --- Estado de la Aplicación (MODIFICADO) ---
    let currentGameId = null; // Guarda el ID del juego activo
    let currentPlayers = []; // Caché local de jugadores del juego actual
    let currentDebts = [];   // Caché local de deudas del juego actual
    let summary = {}; // Resumen de deudas (calculado localmente como antes)

    // --- Helper para llamadas a la API ---
    // Función genérica para hacer peticiones a nuestra API backend
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
            // La URL de la API será relativa (ej: '/api/start-game')
            // Vercel sabrá cómo dirigirla a la función correcta.
            const response = await fetch(`/api/${endpoint}`, options);

            // Si la respuesta no es OK (ej: 404, 500), lanzar un error
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json(); // Intenta obtener mensaje de error del backend
                } catch (e) {
                    errorData = { message: `HTTP error! status: ${response.status}` };
                }
                console.error(`API Error (${response.status}) en ${endpoint}:`, errorData);
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            // Si la respuesta es 204 No Content (ej: a veces en DELETE), no hay cuerpo JSON
             if (response.status === 204) {
                 return null;
             }

            // Si todo OK, devolver los datos JSON
            return await response.json();

        } catch (error) {
            console.error(`Network or fetch error for endpoint ${endpoint}:`, error);
            // Mostrar error al usuario de forma más amigable
            alert(`Error de red o del servidor: ${error.message}. Intenta de nuevo.`);
            throw error; // Relanzar para que el código que llamó sepa que falló
        }
    }


    // --- Lógica de Inicio y Carga del Juego ---

    // Intenta cargar un juego existente al iniciar la app
    function loadExistingGame() {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId) {
            if (confirm('¿Deseas continuar con el último juego guardado?')) {
                currentGameId = savedGameId;
                fetchAndDisplayGameState(); // Carga datos y muestra página de deudas
            } else {
                // El usuario no quiere continuar, limpiar el ID guardado
                localStorage.removeItem('currentGameId');
                currentGameId = null;
                showPage('welcome-page'); // Volver a bienvenida
            }
        } else {
            showPage('welcome-page'); // No hay juego guardado, mostrar bienvenida
        }
    }

    // Obtiene jugadores y deudas del backend y actualiza la UI
    async function fetchAndDisplayGameState() {
        if (!currentGameId) return;

        try {
            // Llama a la API para obtener el estado del juego
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');

            // Actualiza las variables locales (caché)
            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];

            // Actualiza la UI
            updatePlayerList(); // Actualiza lista en ambas páginas si es necesario
            updateSelectOptions(); // Actualiza los <select> en la pág de deudas
            calculateDebtSummary(); // Recalcula el resumen con los datos frescos
            updateDebtMatrix(); // Redibuja la tabla de deudas

            // Decide qué página mostrar
            if (currentPlayers.length < 2) {
                // Si por alguna razón el juego cargado tiene menos de 2 jugadores, ir a registro
                 showPage('register-players-page');
                 playerNameInput.focus();
            } else {
                 // Si hay suficientes jugadores, ir directo a la página de deudas
                 showPage('register-debts-page');
            }

        } catch (error) {
            // Si falla la carga, informar al usuario y limpiar el estado
            alert(`No se pudo cargar el estado del juego (ID: ${currentGameId}). Iniciando uno nuevo.`);
            console.error("Error fetching game state:", error);
            localStorage.removeItem('currentGameId');
            currentGameId = null;
            resetLocalState(); // Limpia variables locales
            showPage('welcome-page');
        }
    }


    // --- Navegación entre Páginas (MODIFICADO) ---

    startGameButton.addEventListener('click', async () => {
        if (currentGameId && !confirm('Ya hay un juego activo. ¿Deseas finalizarlo y empezar uno nuevo?')) {
             return; // No hacer nada si el usuario cancela
        }

        if (currentGameId) {
             await handleEndGame(false); // Finaliza el juego anterior sin preguntar de nuevo
        }

        try {
            // Llama a la API para crear un nuevo juego
            const data = await apiRequest('start-game', 'POST');
            currentGameId = data.gameId; // Guarda el ID del nuevo juego
            localStorage.setItem('currentGameId', currentGameId); // Guarda en localStorage para persistencia
            console.log("Nuevo juego iniciado con ID:", currentGameId);

            resetLocalState(); // Limpia jugadores y deudas locales
            updatePlayerList(); // Lista visual vacía
            updateSelectOptions(); // Selects vacíos (con placeholder)
            updateDebtMatrix(); // Matriz vacía

            showPage('register-players-page');
            playerNameInput.focus();
        } catch (error) {
            // Error al contactar la API para iniciar juego
            // La función apiRequest ya muestra un alert()
            console.error("Failed to start new game:", error);
        }
    });

    finishRegistrationButton.addEventListener('click', () => {
        if (currentPlayers.length < 2) {
            alert('Debes registrar al menos dos jugadores.');
            return;
        }
        // Ya no necesitamos cargar datos aquí porque se cargan/actualizan
        // después de cada acción (añadir jugador/deuda)
        showPage('register-debts-page');
        // Asegurarse que los selects y la matriz estén actualizados es bueno
        updateSelectOptions();
        calculateDebtSummary(); // Calcular con datos actuales
        updateDebtMatrix();
    });

    addNewPlayerButton.addEventListener('click', () => {
        showPage('register-players-page');
        playerNameInput.focus();
    });

    // --- Lógica de Jugadores (MODIFICADO) ---
    registerPlayerButton.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Por favor, introduce un nombre de jugador.');
            return;
        }
        // Validación local rápida (aunque el backend también valida)
        if (currentPlayers.includes(playerName)) {
             alert(`El jugador "${playerName}" ya ha sido registrado en este juego.`);
             playerNameInput.select();
             return;
        }

        if (!currentGameId) {
             alert("Error: No hay un juego activo para añadir jugadores.");
             return;
        }

        try {
            // Llama a la API para añadir el jugador
            await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName });

            // Si tuvo éxito, actualiza la lista de jugadores localmente y la UI
            // Es MÁS EFICIENTE simplemente añadirlo localmente si la API tuvo éxito,
            // que volver a pedir toda la lista al servidor.
            currentPlayers.push(playerName); // Añadir al caché local
            updatePlayerList(); // Actualizar la lista visual
            updateSelectOptions(); // Actualizar selects por si acaso

            playerNameInput.value = '';
            playerNameInput.focus();

        } catch (error) {
            // Si la API devuelve un error (ej: 409 Conflict - jugador ya existe),
            // apiRequest ya debería haber mostrado un alert.
             console.error("Failed to add player:", error);
             // Podríamos querer refrescar el estado por si acaso
             // fetchAndDisplayGameState();
             playerNameInput.select(); // Seleccionar para corregir
        }
    });

    playerNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            registerPlayerButton.click();
        }
    });

    // --- Lógica de Deudas (MODIFICADO) ---
    registerDebtButton.addEventListener('click', async () => {
        const debtor = debtorSelect.value;
        const winner = winnerSelect.value;
        const amount = parseFloat(debtAmountInput.value);

        // Validaciones (iguales que antes)
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
             return;
        }

        try {
            // Llama a la API para añadir la deuda
            await apiRequest('add-debt', 'POST', { gameId: currentGameId, debtor, winner, amount });

            // Si tuvo éxito, añadir la deuda localmente y actualizar UI
            // De nuevo, más eficiente que pedir todas las deudas de nuevo.
            currentDebts.push({ debtor, winner, amount }); // Añadir al caché local
            calculateDebtSummary(); // Recalcular resumen con la nueva deuda
            updateDebtMatrix(); // Actualizar la tabla

            debtAmountInput.value = '';
            debtAmountInput.focus();

        } catch (error) {
            console.error("Failed to add debt:", error);
            // El error ya se mostró en alert() por apiRequest
        }
    });

    // --- Lógica de Finalización (MODIFICADO) ---
    endGameButton.addEventListener('click', () => {
        handleEndGame(true); // Llama a la función que maneja la finalización, preguntando primero
    });

    // Nueva función para manejar la finalización del juego
    async function handleEndGame(askConfirmation = true) {
         if (!currentGameId) {
            alert("No hay ningún juego activo para finalizar.");
            resetLocalState();
            showPage('welcome-page');
            return;
        }

        if (askConfirmation && !confirm('¿Estás seguro de que deseas finalizar el juego? Se borrarán todos los datos de este juego de la base de datos.')) {
            return; // El usuario canceló
        }

        try {
             // Llama a la API para borrar el juego en el backend
            await apiRequest('end-game', 'POST', { gameId: currentGameId });

            // Si tiene éxito, limpia todo localmente
            console.log("Juego finalizado y borrado:", currentGameId);
            localStorage.removeItem('currentGameId'); // Limpia el ID guardado
            currentGameId = null;
            resetLocalState(); // Limpia variables locales
            updatePlayerList(); // Limpia UI
            updateSelectOptions();
            updateDebtMatrix();

            showPage('welcome-page'); // Vuelve a la bienvenida

        } catch (error) {
             console.error("Failed to end game:", error);
             // El error ya se mostró en alert()
             // Quizás el juego ya no existía en el backend, pero igual limpiamos localmente
             localStorage.removeItem('currentGameId');
             currentGameId = null;
             resetLocalState();
             updatePlayerList();
             updateSelectOptions();
             updateDebtMatrix();
             showPage('welcome-page');
        }
    }


    // --- Funciones Auxiliares (MODIFICADAS donde sea necesario) ---

    /** Muestra la página con el ID dado y oculta las demás */
    function showPage(pageId) {
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
        defaultOption.disabled = true; // Hacerla no seleccionable
        // No la seleccionamos por defecto si hay jugadores, para forzar selección
        // defaultOption.selected = true;

        debtorSelect.appendChild(defaultOption.cloneNode(true));
        winnerSelect.appendChild(defaultOption.cloneNode(true));

        currentPlayers.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            debtorSelect.appendChild(option.cloneNode(true));
            winnerSelect.appendChild(option.cloneNode(true));
        });

        // Restaurar selección si es posible y hay jugadores
        if (currentPlayers.length > 0) {
            if (currentPlayers.includes(currentDebtor)) {
                debtorSelect.value = currentDebtor;
            } else {
                 debtorSelect.value = ""; // Si el jugador ya no está, deseleccionar
            }
            if (currentPlayers.includes(currentWinner)) {
                winnerSelect.value = currentWinner;
            } else {
                 winnerSelect.value = "";
            }
            // Si no había nada seleccionado antes, seleccionar el placeholder
            if (!debtorSelect.value) debtorSelect.value = "";
            if (!winnerSelect.value) winnerSelect.value = "";

        } else {
            // Si no hay jugadores, asegurar que el placeholder esté seleccionado
             debtorSelect.value = "";
             winnerSelect.value = "";
        }


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
        initializeDebtSummary(); // Usa currentPlayers

        // Crear estructura temporal para deudas brutas
        let grossDebts = {};
        currentPlayers.forEach(p1 => {
            grossDebts[p1] = {};
            currentPlayers.forEach(p2 => { if (p1 !== p2) grossDebts[p1][p2] = 0; });
        });

        // Acumular deudas brutas desde el array `currentDebts` (caché local)
        currentDebts.forEach(debt => {
            if (grossDebts[debt.debtor] && grossDebts[debt.debtor].hasOwnProperty(debt.winner)) {
                grossDebts[debt.debtor][debt.winner] += debt.amount;
            }
        });

        // Calcular deudas netas y actualizar el `summary` final
        currentPlayers.forEach(p1 => {
            currentPlayers.forEach(p2 => {
                if (p1 === p2) return;

                const amountP1toP2 = grossDebts[p1]?.[p2] || 0;
                const amountP2toP1 = grossDebts[p2]?.[p1] || 0;
                const netDifference = amountP1toP2 - amountP2toP1;

                if (netDifference > 0) {
                    summary[p1][p2] = netDifference;
                    // Asegurar que la deuda inversa sea cero en el resumen
                    if(summary[p2]) summary[p2][p1] = 0;
                }
                // Si la diferencia es <= 0, la deuda neta p1 -> p2 es 0
                 else {
                     summary[p1][p2] = 0; // Asegurar explícitamente que sea 0
                 }
            });
        });
    }

    /** Dibuja la tabla HTML (`debt-matrix`) basada en `currentPlayers` y `summary` */
    function updateDebtMatrix() {
        debtMatrixThead.innerHTML = '';
        debtMatrixTbody.innerHTML = '';

        if (currentPlayers.length === 0) return;

        // Crear Cabecera (THEAD)
        const headerRow = debtMatrixThead.insertRow();
        const cornerTh = document.createElement('th');
        cornerTh.innerHTML = 'Deudor ↓ / Acreedor →'; // Espacios sin ruptura
        headerRow.appendChild(cornerTh);
        currentPlayers.forEach(player => {
            const th = document.createElement('th');
            th.textContent = player;
            headerRow.appendChild(th);
        });

        // Crear Cuerpo (TBODY)
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
                    // Obtener deuda neta DEBTOR -> WINNER del summary calculado
                    const netDebt = summary[debtor]?.[winner] || 0;
                    cell.textContent = netDebt > 0 ? netDebt.toFixed(2) : ''; // Mostrar solo si hay deuda > 0
                    cell.className = netDebt > 0 ? 'has-debt' : 'no-debt';
                }
            });
        });
    }

    /** Reinicia el estado local (variables JS) */
    function resetLocalState() {
        // No borramos currentGameId aquí, se maneja por separado
        currentPlayers = [];
        currentDebts = [];
        summary = {};
        playerNameInput.value = '';
        debtAmountInput.value = '';
        // No es necesario llamar a updatePlayerList, etc. aquí,
        // se llaman después según el flujo (ej. después de borrar juego o iniciar uno nuevo)
    }

    // --- Inicialización al cargar la página ---
    loadExistingGame(); // Intenta cargar juego existente o muestra bienvenida

}); // Fin del DOMContentLoaded
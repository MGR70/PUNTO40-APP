let players = [];
let debts = {};

// Función para registrar un jugador
async function registerPlayer() {
    const playerName = document.getElementById('username').value;

    if (!playerName) {
        alert('Por favor, ingrese un nombre de jugador válido.');
        return;
    }

    try {
        const response = await fetch('/api/registerPlayer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: playerName })
        });

        if (!response.ok) {
            throw new Error('Error al registrar el jugador');
        }

        const data = await response.json();
        players.push(data);
        populatePlayerDropdowns();
        displayRegisteredPlayers();
        document.getElementById('username').value = '';
    } catch (error) {
        console.error(error);
        alert('Error al registrar el jugador. Por favor, inténtalo de nuevo.');
    }
}

// Función para mostrar los jugadores registrados
function displayRegisteredPlayers() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';

    players.forEach(player => {
        const listItem = document.createElement('li');
        listItem.innerText = player.nombre;
        playersList.appendChild(listItem);
    });
}

// Función para llenar los dropdowns de deudor y ganador
function populatePlayerDropdowns() {
    const playerDropdowns = document.querySelectorAll('#deudor, #ganador');
    playerDropdowns.forEach(select => {
        select.innerHTML = '<option value="">Seleccionar jugador</option>';
        players.forEach(player => {
            select.innerHTML += `<option value="${player.id}">${player.nombre}</option>`;
        });
    });
}

// Función para registrar una deuda
async function registerDebt() {
    const deudor = document.getElementById('deudor').value;
    const ganador = document.getElementById('ganador').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!deudor || !ganador || isNaN(amount) || amount === 0) {
        alert('Por favor, complete todos los campos y asegúrese de ingresar un monto válido.');
        return;
    }

    try {
        const response = await fetch('/api/registerDebt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deudor_id: deudor, ganador_id: ganador, monto: amount })
        });

        if (!response.ok) {
            throw new Error('Error al registrar la deuda');
        }

        const data = await response.json();
        updateConsolidatedDebtList();
        mostrarResumen(); // Actualizar el resumen después de registrar una deuda
    } catch (error) {
        console.error(error);
        alert('Error al registrar la deuda. Por favor, inténtalo de nuevo.');
    }
}

// Función para actualizar la lista de deudas
async function updateConsolidatedDebtList() {
    const debtList = document.getElementById('debtList');
    debtList.innerHTML = '';

    try {
        const response = await fetch('/api/debts');
        if (!response.ok) {
            throw new Error('Error al obtener las deudas');
        }

        const debts = await response.json();
        debts.forEach(debt => {
            const listItem = document.createElement('li');
            listItem.innerText = `${debt.deudor} debe a ${debt.ganador}: $${debt.monto.toFixed(2)}`;
            debtList.appendChild(listItem);
        });
    } catch (error) {
        console.error(error);
        alert('Error al obtener las deudas. Por favor, inténtalo de nuevo.');
    }
}

// Función para obtener y mostrar el resumen de deudas
async function mostrarResumen() {
    try {
        const response = await fetch('/api/resumendeudas');
        if (!response.ok) {
            throw new Error('Error al obtener el resumen de deudas');
        }

        const resumen = await response.json();
        const resumenContainer = document.getElementById('Deudas entre Jugadores');
        resumenContainer.innerHTML = '<h2>Resumen de Deudas</h2>'; // Agregar un título

        resumen.forEach(item => {
            if (item.amount !== 0) {
                const p = document.createElement('p');
                p.textContent = `${item.debtor} debe a ${item.creditor}: $${item.amount.toFixed(2)}`;
                resumenContainer.appendChild(p);
            }
        });
    } catch (error) {
        console.error(error);
        alert('Error al obtener el resumen de deudas. Por favor, inténtalo de nuevo.');
    }
}

// Función para finalizar el juego
async function finalizarJuego() {
    const confirmacion = confirm("¿Estás seguro de que deseas finalizar el juego? Todos los datos se borrarán.");
    if (confirmacion) {
        try {
            // Borrar jugadores y deudas
            const response = await fetch('/api/finalizarjuego', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Error al finalizar el juego');
            }

            // Volver a la pantalla de inicio
            document.getElementById('gameScreen').style.display = 'none';
            document.getElementById('welcomeScreen').style.display = 'block';

            // Limpiar la lista de jugadores y deudas
            players = [];
            debts = {};
            populatePlayerDropdowns();
            displayRegisteredPlayers();
            updateConsolidatedDebtList();
            mostrarResumen(); // Limpiar el resumen
        } catch (error) {
            console.error(error);
            alert('Error al finalizar el juego. Por favor, inténtalo de nuevo.');
        }
    }
}

// Función para mostrar la política de privacidad
function showPrivacyPolicy() {
    document.getElementById('privacyPolicy').style.display = 'block';
    document.getElementById('privacyPolicyTitle').style.display = 'block';
    document.getElementById('backButton').style.display = 'block';
}

// Función para ocultar la política de privacidad
function hidePrivacyPolicy() {
    document.getElementById('privacyPolicy').style.display = 'none';
    document.getElementById('privacyPolicyTitle').style.display = 'none';
    document.getElementById('backButton').style.display = 'none';
}

// Función para iniciar el juego
function startGame() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
}

// Cargar jugadores y deudas al iniciar
async function loadPlayersAndDebts() {
    try {
        const playersResponse = await fetch('/api/players');
        if (!playersResponse.ok) {
            throw new Error('Error al cargar los jugadores');
        }
        const playersData = await playersResponse.json();
        players = playersData;

        const debtsResponse = await fetch('/api/debts');
        if (!debtsResponse.ok) {
            throw new Error('Error al cargar las deudas');
        }
        const debtsData = await debtsResponse.json();
        debts = debtsData;

        populatePlayerDropdowns();
        displayRegisteredPlayers();
        updateConsolidatedDebtList();
        mostrarResumen(); // Cargar el resumen al inicio
    } catch (error) {
        console.error(error);
        alert('Error al cargar los datos. Por favor, recarga la página.');
    }
}

// Cargar jugadores y deudas cuando la página se carga
window.onload = loadPlayersAndDebts;

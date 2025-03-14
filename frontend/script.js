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
            listItem.innerText = `${debt.deudor} debe a ${debt.ganador}: ${debt.monto}`;
            debtList.appendChild(listItem);
        });
    } catch (error) {
        console.error(error);
        alert('Error al obtener las deudas. Por favor, inténtalo de nuevo.');
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
    } catch (error) {
        console.error(error);
        alert('Error al cargar los datos. Por favor, recarga la página.');
    }
}

// Cargar jugadores y deudas cuando la página se carga
window.onload = loadPlayersAndDebts;

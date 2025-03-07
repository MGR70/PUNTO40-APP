let players = [];
let debts = {};

// Función para registrar un jugador
async function registerPlayer() {
    const playerName = document.getElementById('username').value;

    if (!playerName) {
        alert('Por favor, ingrese un nombre de jugador válido.');
        return;
    }

    const response = await fetch('/registerPlayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: playerName })
    });
    const data = await response.json();
    players.push(data);
    populatePlayerDropdowns();
    displayRegisteredPlayers();
    document.getElementById('username').value = '';
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

    const response = await fetch('/registerDebt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deudor_id: deudor, ganador_id: ganador, monto: amount })
    });
    const data = await response.json();
    updateConsolidatedDebtList();
}

// Función para actualizar la lista de deudas
async function updateConsolidatedDebtList() {
    const debtList = document.getElementById('debtList');
    debtList.innerHTML = '';

    const response = await fetch('/debts');
    const debts = await response.json();

    debts.forEach(debt => {
        const listItem = document.createElement('li');
        listItem.innerText = `${debt.deudor} debe a ${debt.ganador}: ${debt.monto}`;
        debtList.appendChild(listItem);
    });
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
    const playersResponse = await fetch('/players');
    const playersData = await playersResponse.json();
    players = playersData;

    const debtsResponse = await fetch('/debts');
    const debtsData = await debtsResponse.json();
    debts = debtsData;

    populatePlayerDropdowns();
    displayRegisteredPlayers();
    updateConsolidatedDebtList();
}

loadPlayersAndDebts();
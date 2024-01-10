document.getElementById('register-link').addEventListener('click', function() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'flex';
});

document.getElementById('login-link').addEventListener('click', function() {
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'flex';
});

document.getElementById('login-button').addEventListener('click', function() {
    //TODO none
    document.getElementById('content').style.display = 'flex';
    document.getElementById('login-section').style.display = 'flex';
    //TODO none
    document.getElementById('login-button').style.display = 'inline-block';
    //TODO: NONE
    document.getElementById('back-button').style.display = 'none';
});

document.getElementById('back-button').addEventListener('click', function() {
    document.getElementById('content').style.display = 'flex';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('login-button').style.display = 'inline-block';
    document.getElementById('back-button').style.display = 'none';
});

function calculateProjectileMotion() {
    const v = parseFloat(document.getElementById('velocity').value); 
    const theta = parseFloat(document.getElementById('angle').value) * Math.PI / 180; 
    const h0 = parseFloat(document.getElementById('height').value); 

    
    const g = 9.81; 

    
    const maxHeight = h0 + (v * v * Math.sin(theta) * Math.sin(theta)) / (2 * g); // Maksymalna wysokość
    const flightTime = (v * Math.sin(theta) + Math.sqrt((v * Math.sin(theta)) * (v * Math.sin(theta)) + 2 * g * h0)) / g; // Czas trwania lotu

    
    document.getElementById('max-height-value').textContent = maxHeight.toFixed(2);
    document.getElementById('flight-time-value').textContent = flightTime.toFixed(2);
}


let chart = null; 

function updateChart(v, theta, h0) {
    v = Number(v)
    theta = Number(theta)
    h0 = Number(h0)

    const g = 9.81; 
    const points = [];
    let maxHeightPoint = null;
    let maxHeight = 0;

    const flightTime = (v * Math.sin(theta) + Math.sqrt((v * Math.sin(theta)) * (v * Math.sin(theta)) + 2 * g * h0)) / g;
    const maxRange = v * Math.cos(theta) * flightTime;

    for(let x = 0; x <= maxRange; x += maxRange /100) {
        const y = x * Math.tan(theta) - (g * x * x) / (2 * v * v * Math.cos(theta) * Math.cos(theta)) + h0;
        if (y < 0) break;
        points.push({x: x, y: y});

        if (y > maxHeight) {
            maxHeight = y;
            maxHeightPoint = { x: x, y: y };
        }
    }


    if(chart) {
        chart.data.datasets[0].data = points;
        chart.data.datasets[1].data = [maxHeightPoint]; 
        chart.options.scales.x.max =  maxRange*(1.1);
        chart.options.scales.y.max = maxHeight*(1.1);
        chart.update();
    } else {
        const ctx = document.getElementById('trajectory-chart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Tor Lotu',
                        data: points,
                        fill: false,
                        borderColor: 'blue',
                        tension: 0.1
                    },
                    {
                        label: 'Maksymalna Wysokość',
                        data: [maxHeightPoint],
                        fill: false,
                        borderColor: 'red',
                        backgroundColor: 'red',
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    x: {title: {
                        display: true,
                        text: 'Zasięg (m)' 
                    }, type: 'linear', position: 'bottom', max: maxRange*(1.1) },
                    y: {title: {  
                        display: true,
                        text: 'Wysokość (m)' 
                    }, beginAtZero: true, max: maxHeight*(1.1) }
                }
            }
        });
    }
}

document.querySelectorAll('.input-field input').forEach(input => {
    input.addEventListener('input', function() {
        
        const angle = validateAndSetInput(document.getElementById('angle'), 89,0);
        const velocity = validateAndSetInput(document.getElementById('velocity'), Number.MAX_SAFE_INTEGER,1);
        const height = validateAndSetInput(document.getElementById('height'), Number.MAX_SAFE_INTEGER,1); 

        const theta = angle * Math.PI / 180;

        calculateProjectileMotion();
        updateChart(velocity, theta, height);
    });
});

//początkowe obliczenia i rysowanie wykresu
const v = parseFloat(document.getElementById('velocity').value);
const theta = parseFloat(document.getElementById('angle').value) * Math.PI / 180;
const h0 = parseFloat(document.getElementById('height').value);
calculateProjectileMotion();
updateChart(v, theta, h0);

function resizeChart() {
    if (chart) {
        chart.resize();
    }
}



document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username-register').value.trim();
    const password = document.getElementById('password-register').value.trim();

    // Sprawdzenie, czy pola są wypełnione
    if (!username || !password) {
        alert('Proszę wypełnić wszystkie pola.');
        return;
    }

    try {
        const response = await fetch('/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            console.log('Rejestracja zakończona sukcesem');
            // Przekierowanie do strony głównej lub logowania
            window.location.href = '/'; // Zmień na odpowiedni URL
        } else {
            const data = await response.json();
            alert(data.message || 'Błąd podczas rejestracji');
        }
    } catch (error) {
        console.error('Błąd', error);
    }
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username-login').value;
    const password = document.getElementById('password-login').value;

    try {
        const response = await fetch('/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            console.log('Zalogowano pomyślnie');
            // Przekierowanie na stronę główną lub panel użytkownika
            window.location.href = '/'; // Przekierowanie na stronę główną
        } else {
            const data = await response.json();
            alert(data.message || 'Błąd logowania');
        }
    } catch (error) {
        console.error('Błąd', error);
    }
});

async function logoutUser() {
    try {
        const response = await fetch('/user/logout', { method: 'POST' });

        if (response.ok) {
            console.log('Wylogowano pomyślnie');
            window.location.reload(); // Przeładowanie strony po wylogowaniu
        } else {
            console.log('Błąd podczas wylogowywania');
        }
    } catch (error) {
        console.error('Błąd', error);
    }
}

document.getElementById('logout-button').addEventListener('click', logoutUser);

async function saveParametersToDatabase() {
    const angle = document.getElementById('angle').value;
    const velocity = document.getElementById('velocity').value;
    const height = document.getElementById('height').value;

    try {
        const response = await fetch('/user/save-parameters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ angle, velocity, height })
        });

        if (response.ok) {
            console.log('Parametry zapisane.');
            loadThrowHistory(); // Odświeża historię rzutów po zapisie
        } else {
            console.log('Błąd podczas zapisu.');
        }
    } catch (error) {
        console.error('Wystąpił błąd', error);
    }
}

// Dodaj event listener do przycisku
document.getElementById('submit-button').addEventListener('click', saveParametersToDatabase);


async function checkLoginStatus() {
    try {
        const response = await fetch('/user/is-logged-in');
        const data = await response.json();

        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');

        if (data.isLoggedIn) {
            document.getElementById('submit-button').disabled = false;
            document.getElementById('submit-button').title = '';
            loginButton.style.display = 'none';
            logoutButton.style.display = 'inline-block';
            loadThrowHistory(); // Funkcja do ładowania historii rzutów
        } else {
            document.getElementById('submit-button').disabled = true;
            document.getElementById('submit-button').title = 'Aby zapisać, musisz być zalogowany';
            loginButton.style.display = 'inline-block';
            logoutButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Błąd podczas sprawdzania statusu logowania', error);
    }

    
}

checkLoginStatus();

async function loadThrowHistory() {
    try {
        const usernameResponse = await fetch('/user/username');
        const usernameData = await usernameResponse.json();
        const username = usernameData.username;


        const response = await fetch('/user/throw-history');
        const throws = await response.json();

        document.getElementById('username').innerHTML = username;

        const historyContainer = document.getElementById('history-list');
        historyContainer.innerHTML = ''; // Wyczyść bieżącą historię

        const header = document.createElement('p');
        header.textContent = `Rekordy użytkownika: ${username}`;
        historyContainer.appendChild(header);

        throws.forEach(throwData => {
            const listItem = document.createElement('li');

            // Tworzenie kontenera dla parametrów
            const paramContainer = document.createElement('div');
            paramContainer.classList.add('parameters');
            paramContainer.innerHTML = `
                <div>Kąt: ${throwData.angle}</div>
                <div>Prędkość: ${throwData.velocity}</div>
                <div>Wysokość: ${throwData.height}</div>
            `;
            listItem.appendChild(paramContainer);

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            // Tworzenie przycisku Symuluj
            const simulateButton = document.createElement('button');
            simulateButton.textContent = 'Symuluj';
            simulateButton.classList.add('simulate-button');
            simulateButton.onclick = () => simulateThrow(throwData);
            buttonContainer.appendChild(simulateButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Usuń';
            deleteButton.classList.add('simulate-button'); // Używamy tej samej klasy dla spójności stylu
            deleteButton.onclick = () => deleteThrow(throwData.id);
            buttonContainer.appendChild(deleteButton);

            listItem.appendChild(buttonContainer);
            historyContainer.appendChild(listItem);
        });
    } catch (error) {
        console.error('Błąd podczas ładowania historii rzutów', error);
    }
}

async function deleteThrow(throwId) {
    try {
        const response = await fetch(`/user/delete-throw/${throwId}`, { method: 'DELETE' });

        if (response.ok) {
            console.log('Rekord usunięty');
            loadThrowHistory(); // Ponowne załadowanie historii po usunięciu rekordu
        } else {
            console.log('Błąd podczas usuwania rekordu');
        }
    } catch (error) {
        console.error('Błąd', error);
    }
}

function simulateThrow(throwData) {
    document.getElementById('angle').value = throwData.angle;
    document.getElementById('velocity').value = throwData.velocity;
    document.getElementById('height').value = throwData.height;
    // Aktualizacja wykresu
    calculateProjectileMotion()
    updateChart(throwData.velocity, throwData.angle * Math.PI / 180, throwData.height);
}




function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
}

// Przypisanie funkcji do przycisków i linków
document.getElementById('login-button').addEventListener('click', () => showModal('login-section'));
document.getElementById('register-link').addEventListener('click', () => showModal('register-section'));
document.getElementById('modal-overlay').addEventListener('click', () => {
    hideModal('login-section');
    hideModal('register-section');
});

//walidacja inputu w granicach
function validateAndSetInput(inputElement, maxValue, minvalue) {
    let value = parseFloat(inputElement.value);
    if(isNaN(value)){
        inputElement.value = minvalue;
    }
    else if (value > maxValue) {
        inputElement.value = maxValue;
    }
    else if (value < minvalue) {
        inputElement.value = minvalue;
    }
    
    return inputElement.value; // Zwraca skorygowaną wartość
}

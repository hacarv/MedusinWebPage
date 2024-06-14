let countdownTime = 5 * 60; // 5 minutes
let retryTime = 5 * 60; // 5 minutes for retry
let countdownInterval, retryInterval;

function startTimer() {
    const timer = document.getElementById('timer');
    countdownInterval = setInterval(() => {
        const minutes = Math.floor(countdownTime / 60);
        const seconds = countdownTime % 60;
        timer.innerHTML = `Tiempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            showSessionExpired();
        }

        countdownTime--;
        localStorage.setItem('countdownTime', countdownTime);
    }, 1000);
}

function showSessionExpired() {
    const overlay = document.getElementById('session-expired');
    overlay.style.display = 'flex';
    startRetryTimer();
}

function startRetryTimer() {
    const retryTimer = document.getElementById('retry-timer');
    retryInterval = setInterval(() => {
        const minutes = Math.floor(retryTime / 60);
        const seconds = retryTime % 60;
        retryTimer.innerHTML = `Tiempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (retryTime <= 0) {
            clearInterval(retryInterval);
            location.reload();
        }

        retryTime--;
        localStorage.setItem('retryTime', retryTime);
    }, 1000);
}

function getLocalStorageItem(name) {
    const value = localStorage.getItem(name);
    if (value) {
        return parseInt(value);
    }
    return null;
}

window.onload = function() {
    const savedCountdownTime = getLocalStorageItem('countdownTime');
    if (savedCountdownTime !== null) {
        countdownTime = savedCountdownTime;
    } else {
        countdownTime = 5 * 60;
    }

    if (countdownTime <= 0) {
        showSessionExpired();
    } else {
        startTimer();
    }

    const savedRetryTime = getLocalStorageItem('retryTime');
    if (savedRetryTime !== null) {
        retryTime = savedRetryTime;
    }
};

function sendMQTTMessage(char) {
    const client = mqtt.connect('wss://b654b56175244212b2de14af672cfc2d.s1.eu.hivemq.cloud:8884/mqtt', {
        username: 'medusin',
        password: 'a1R5dd89'
    });

    client.on('connect', () => {
        console.log('Connected to MQTT');
        client.publish('medusa/button', char, () => {
            client.end();
        });
    });

    client.on('error', (err) => {
        console.error('Connection error: ', err);
    });
}


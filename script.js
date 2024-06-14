document.addEventListener('DOMContentLoaded', function() {
    const sessionDuration = 3 * 60 * 1000; // 3 minutos en milisegundos
    const cooldownDuration = 10 * 60 * 1000; // 10 minutos en milisegundos

    let sessionEndTime = localStorage.getItem('sessionEndTime');
    let cooldownEndTime = localStorage.getItem('cooldownEndTime');

    if (sessionEndTime && Date.now() > sessionEndTime) {
        localStorage.removeItem('sessionEndTime');
        sessionEndTime = null;
    }

    if (cooldownEndTime && Date.now() > cooldownEndTime) {
        localStorage.removeItem('cooldownEndTime');
        cooldownEndTime = null;
    }

    if (cooldownEndTime) {
        showSessionExpired();
        updateCooldownTimer();
    } else {
        startSession();
    }

    function startSession() {
        sessionEndTime = Date.now() + sessionDuration;
        localStorage.setItem('sessionEndTime', sessionEndTime);
        updateSessionTimer();

        const intervalId = setInterval(() => {
            if (Date.now() > sessionEndTime) {
                clearInterval(intervalId);
                endSession();
            } else {
                updateSessionTimer();
            }
        }, 1000);
    }

    function endSession() {
        document.getElementById('content').classList.add('d-none');
        showSessionExpired();
        cooldownEndTime = Date.now() + cooldownDuration;
        localStorage.setItem('cooldownEndTime', cooldownEndTime);
        updateCooldownTimer();

        const intervalId = setInterval(() => {
            if (Date.now() > cooldownEndTime) {
                clearInterval(intervalId);
                localStorage.removeItem('cooldownEndTime');
                location.reload();
            } else {
                updateCooldownTimer();
            }
        }, 1000);
    }

    function showSessionExpired() {
        document.getElementById('overlay').classList.remove('d-none');
    }

    function updateSessionTimer() {
        const remainingTime = Math.max(0, sessionEndTime - Date.now());
        document.getElementById('timer').textContent = `Tiempo restante de sesión: ${formatTime(remainingTime)}`;
    }

    function updateCooldownTimer() {
        const remainingTime = Math.max(0, cooldownEndTime - Date.now());
        document.getElementById('cooldown-timer').textContent = formatTime(remainingTime);
    }

    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    }
});

function sendMQTT(character) {
    const client = mqtt.connect('wss://broker.hivemq.com:8000/mqtt');

    client.on('connect', function() {
        client.publish('medusin/character', character);
        client.end();
    });
}

let sessionId, firstAccessDatetime;
let isPageBlocked = false;

function generateSessionId() {
    let id = localStorage.getItem('sessionId');
    if (!id) {
        id = Date.now().toString(); // Generate session ID based on timestamp if not already set
        localStorage.setItem('sessionId', id);
        localStorage.setItem('firstAccessDatetime', new Date().toISOString()); // Store first access datetime
    }
    return id;
}

window.onload = function() {
    // Get or generate session ID and first access datetime
    sessionId = generateSessionId();
    firstAccessDatetime = localStorage.getItem('firstAccessDatetime');

    connectToMQTT();
};

function connectToMQTT() {
    const client = mqtt.connect('wss://b654b56175244212b2de14af672cfc2d.s1.eu.hivemq.cloud:8884/mqtt', {
        username: 'your_username',
        password: 'your_password'
    });

    client.on('connect', () => {
        console.log('Connected to MQTT');
        client.subscribe('medusa/block/' + sessionId);
    });

    client.on('message', (topic, message) => {
        console.log('Received message:', message.toString());
        const msg = JSON.parse(message.toString());
        if (msg.sessionId === sessionId) {
            if (msg.status === 'disabled') {
                blockPage();
            } else if (msg.status === 'enabled') {
                unblockPage();
            }
        }
    });

    client.on('error', (err) => {
        console.error('Connection error: ', err);
    });
}

function blockPage() {
    if (!isPageBlocked) {
        const overlay = document.getElementById('block-overlay');
        overlay.style.display = 'flex';
        isPageBlocked = true;
    }
}

function unblockPage() {
    if (isPageBlocked) {
        const overlay = document.getElementById('block-overlay');
        overlay.style.display = 'none';
        isPageBlocked = false;
    }
}

function sendMQTTMessage(char) {
    const client = mqtt.connect('wss://b654b56175244212b2de14af672cfc2d.s1.eu.hivemq.cloud:8884/mqtt', {
        username: 'medusin',
        password: 'a1R5dd89'
    });

    client.on('connect', () => {
        console.log('Connected to MQTT');
        const message = {
            sessionId: sessionId,
            buttonId: char,
            firstAccessDatetime: firstAccessDatetime // Include first access datetime
        };
        client.publish('medusa/button', JSON.stringify(message), () => {
            client.end();
        });
    });

    client.on('error', (err) => {
        console.error('Connection error: ', err);
    });
}



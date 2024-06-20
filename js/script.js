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

function checkPageBlockStatus() {
    const blockStatus = localStorage.getItem('isPageBlocked');
    if (blockStatus === 'true') {
        blockPage();
    }
}

window.onload = function() {
     // Get or generate session ID and first access datetime
     sessionId = generateSessionId();
     firstAccessDatetime = localStorage.getItem('firstAccessDatetime');
 
     // Check if the page is blocked
     checkPageBlockStatus();
 
     // Connect to MQTT
     connectToMQTT();
};

function connectToMQTT() {
    const client = mqtt.connect('wss://b654b56175244212b2de14af672cfc2d.s1.eu.hivemq.cloud:8884/mqtt', {
        username: 'medusin',
        password: 'a1R5dd89'
    });

    client.on('connect', () => {
        console.log('Connected to MQTT - Subscribe');
        client.subscribe('medusa/block');
    });

    client.on('message', (topic, message) => {
        console.log('Received message:', message.toString());
        const msg = JSON.parse(message.toString());
        if (msg.sessionId === sessionId) {
            if (msg.status === 'd') {
                blockPage();
            } else if (msg.status === 'e') {
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
        localStorage.setItem('isPageBlocked', 'true');
    }
}

function unblockPage() {
    if (isPageBlocked) {
        const overlay = document.getElementById('block-overlay');
        overlay.style.display = 'none';
        isPageBlocked = false;
        localStorage.setItem('isPageBlocked', 'false');
    }
}

function sendMQTTMessage(e,char) {

// Create span element
let ripple = document.createElement("span");
    
// Add ripple class to span
ripple.classList.add("ripple");

// Add span to the button
this.appendChild(ripple);

// Get position of X
let x = e.clientX - e.currentTarget.offsetLeft;

// Get position of Y
let y = e.clientY - e.currentTarget.offsetTop;

// Position the span element
ripple.style.left = `${x}px`;
ripple.style.top = `${y}px`;

// Remove span after 0.3s
setTimeout(() => {
    ripple.remove();
}, 300);



    const client = mqtt.connect('wss://b654b56175244212b2de14af672cfc2d.s1.eu.hivemq.cloud:8884/mqtt', {
        username: 'medusin',
        password: 'a1R5dd89'
    });

    client.on('connect', () => {
        console.log('Connected to MQTT - Publish');
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




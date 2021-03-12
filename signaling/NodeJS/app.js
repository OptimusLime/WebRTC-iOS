const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 7070 }, () => {
    console.log("Signaling server is now listening on port 7070")
});

// Broadcast to all.
wss.broadcast = (ws, data) => {
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

wss.on('connection', (ws) => {
    console.log(`Client connected. Total connected clients: ${wss.clients.size}`)

    ws.onmessage = (message) => {
        if (message.data.indexOf("FaceDescription") == -1)
            console.log(message.data + "\n");
        wss.broadcast(ws, message.data);
    }

    ws.onclose = () => {
        console.log(`Client disconnected. Total connected clients: ${wss.clients.size}`)
    }
});

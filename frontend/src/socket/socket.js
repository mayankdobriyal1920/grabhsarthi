import { io } from 'socket.io-client';

const createSocketConnection = () => {
    return io('https://unikpayindia.com', {  // Removed trailing slash
        path: '/api-get-bet-socket',
        transports: ['websocket'],  // Ensures WebSocket transport
    });
};

export default createSocketConnection;
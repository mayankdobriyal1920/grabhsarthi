import { io } from 'socket.io-client';

const createSocketConnection = () => {
    return io('https://garbhsarthi.com', {  // Removed trailing slash
        path: '/api-socket',
        transports: ['websocket'],  // Ensures WebSocket transport
    });
};

export default createSocketConnection;
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import pool from './models/connection.js'; // MySQL connection
import dotenv from 'dotenv';
import commonRouter from './routers/commonRouter.js';
import cookieParser from 'cookie-parser';

dotenv.config(); // Load environment variables

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;
export let userSocketIdsObject = {};

// Define allowed origins from environment variables or default to localhost
const allowedOrigins = [
        'http://localhost',
        'http://localhost:3000',
        'https://localhost',
        'https://unikpayindia.com',
        'https://localhost:3000',
        'http://192.168.1.6:3000',
    ];

// Middleware to parse the request body
app.use(express.urlencoded({ extended: true, limit: '250mb' }));
app.use(express.json({ limit: '250mb' }));
app.use(cookieParser());

// MySQL Session Store Configuration
const MySQLSessionStore = MySQLStore(session);
const sessionStore = new MySQLSessionStore(
    {
        clearExpired: true,
        checkExpirationInterval: 900000, // Clear expired sessions every 15 mins
        expiration: 86400000, // Sessions expire after 1 day (24 hours)
    },
    pool
);

// Trust proxy for secure cookies
app.set('trust proxy', 1);

// Session Middleware
app.use(
    session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET || 'unikpayindia-mobile-app-session-store', // Use environment variable for secret
        resave: false,
        saveUninitialized: false,
        name: 'unikpayindia-mobile-app-session', // Use dynamic session name
        cookie: {
            expires: new Date(Date.now() + 31536000000),  // 1 year expiration
            httpOnly: true,
            sameSite: 'None',
            secure: true,  // Ensure HTTPS for secure cookies
            maxAge: 31536000000  // 1 year max age
        },
    })
);

// CORS Middleware
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            // Check if the origin is in the allowedOrigins array
            if (allowedOrigins.includes(origin)) {
                return callback(null, true); // Origin is allowed and can send credentials
            } else {
                return callback(new Error('Not allowed by CORS')); // Block other origins
            }
        },
        credentials: true, // Allow cookies to be sent for allowed origins only
        methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE', // Allowed methods
        allowedHeaders: 'X-Requested-With, content-type, Accept', // Allowed headers
    })
);


// Routes
app.use('/api-call-unikpay/common', commonRouter);

app.get('/api-call-unikpay/', (req, res) => {
    res.send(`Server is running!`);
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    path: '/api-get-bet-socket',
});

// Socket.IO connection
io.on('connection', (socket) => {
    userSocketIdsObject[socket.id] = socket;

    socket.on('message', (data) => {
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        if(userSocketIdsObject[socket.id]){
            delete userSocketIdsObject[socket.id];
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
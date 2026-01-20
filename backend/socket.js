const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const rideModel = require('./models/ride.model');
let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        }
    });
    io.on('connection', (socket) => {
        console.log('A user connected ', socket.id);

        socket.on('join', async ({ userId, userType }) => {
            try {
                if (userType === 'user') {
                    await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
                } else if (userType === 'captain') {
                    await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
                }
            } catch (error) {
                console.log('Error joining user or captain to socket room', error);
            }
        });

        socket.on('captain:availability', async ({ captainId, available }) => {
            try {
                await captainModel.findByIdAndUpdate(captainId, { status: available ? 'available' : 'busy' });
            } catch (error) {
                console.log('Error updating captain availability', error);
            }
        });

        socket.on('ride:accept', async ({ rideId, captainId }) => {
            try {
                const ride = await rideModel.findByIdAndUpdate(rideId, { captain: captainId, status: 'accepted' }, { new: true });
                if (!ride) return;
                const user = await userModel.findById(ride.user);
                const captain = await captainModel.findById(captainId);
                const userSocketId = user?.socketId;
                const captainSocketId = captain?.socketId;
                if (userSocketId) io.to(userSocketId).emit('ride:accepted', { rideId: String(ride._id), captain: { _id: String(captain._id), fullname: captain.fullname, vehicle: captain.vehicle } });
                if (captainSocketId) io.to(captainSocketId).emit('ride:accepted', { rideId: String(ride._id) });
                const room = `ride:${rideId}`;
                if (userSocketId) io.sockets.sockets.get(userSocketId)?.join(room);
                if (captainSocketId) io.sockets.sockets.get(captainSocketId)?.join(room);
            } catch (error) {
                console.log('Error handling ride acceptance', error);
            }
        });

        socket.on('chat:message', ({ rideId, from, text }) => {
            const room = `ride:${rideId}`;
            io.to(room).emit('chat:message', { rideId, from, text, ts: Date.now() });
        });

        socket.on('ride:rejoin', ({ rideId }) => {
            const room = `ride:${rideId}`;
            socket.join(room);
        });

        socket.on('ride:cancel', async ({ rideId, by }) => {
            try {
                const ride = await rideModel.findByIdAndUpdate(rideId, { status: 'cancelled' }, { new: true });
                if (!ride) return;
                const user = await userModel.findById(ride.user);
                const captain = ride.captain ? await captainModel.findById(ride.captain) : null;
                const userSocketId = user?.socketId;
                const captainSocketId = captain?.socketId;
                if (userSocketId) io.to(userSocketId).emit('ride:cancelled', { rideId: String(ride._id), by });
                if (captainSocketId) io.to(captainSocketId).emit('ride:cancelled', { rideId: String(ride._id), by });
                const allCaptains = await captainModel.find({ socketId: { $ne: null } }, { socketId: 1 });
                allCaptains.forEach((c) => {
                    const sid = c.socketId;
                    if (sid) io.to(sid).emit('ride:cancelled', { rideId: String(ride._id), by });
                });
                const room = `ride:${rideId}`;
                if (userSocketId) io.sockets.sockets.get(userSocketId)?.leave(room);
                if (captainSocketId) io.sockets.sockets.get(captainSocketId)?.leave(room);
            } catch (error) {
                console.log('Error handling ride cancellation', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected ', socket.id);
        });
    });
}

function sendMessageToUser(socketId, message) {
    if(io){
        io.to(socketId).emit('message', message);
    }else{
        console.log('Socket.io not initialized');
    }
}

function emitToSocketIds(event, data, socketIds) {
    if (!io || !Array.isArray(socketIds)) return;
    socketIds.forEach((id) => io.to(id).emit(event, data));
}

module.exports = {
    initializeSocket,
    sendMessageToUser,
    emitToSocketIds,
}
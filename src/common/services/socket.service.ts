import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {

    private io: Server | null = null;
    private connectedUsers = new Map<string, Set<string>>();



    setServer(io: Server) {
        this.io = io;
    }

    addUser(userId: string, socketId: string) {

        const userSockets = this.connectedUsers.get(userId);

        if (!userSockets) {
            this.connectedUsers.set(
                userId,
                new Set([socketId])
            );
            return;
        }
        userSockets.add(socketId);
    }

    removeUser(userId: string, socketId: string) {

        const userSockets = this.connectedUsers.get(userId);
        if (!userSockets) return;

        userSockets.delete(socketId);

        if (userSockets.size === 0) {
            this.connectedUsers.delete(userId);
        }
    }

    isUserOnline(
        userId: string
    ): boolean {
        return this.connectedUsers.has(userId);
    }

    getUserSockets(
        userId: string
    ): string[] {

        return Array.from(
            this.connectedUsers.get(userId) ?? []
        );
    }

    emitToUser(
        userId: string,
        event: string,
        data: any
    ) {
        if (!this.io) throw new Error('Socket server is not initialized');

        const socketIds = this.getUserSockets(userId);

        for (const socketId of socketIds) {
            this.io.to(socketId).emit(event, data);
        }
    }


    emitToUsers(
        userIds: string[],
        event: string,
        data: any
    ) {

        for (const userId of userIds) {
            this.emitToUser(
                userId,
                event,
                data
            );
        }
    }

    emitToAll(
        event: string,
        data: any
    ) {
        if (!this.io) throw new Error('Socket server is not initialized');
        this.io.emit(
            event,
            data
        );
    }
}

import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { SocketService } from '@/common';
import { TokenService } from '@/common';
import { UserRepository } from '@/db';


@WebSocketGateway({
    cors: {
        origin: '*'
    }
})
export class SocketGateway
    implements
    OnGatewayConnection,
    OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    constructor(
        private readonly socketService: SocketService,
        private readonly tokenService: TokenService,
        private readonly userRepository: UserRepository
    ) { }

    afterInit(server: Server) {
        this.socketService.setServer(server);
    }

    async handleConnection(
        @ConnectedSocket() socket: Socket
    ) {

        try {

            const token = socket.handshake.auth?.token;
            if (!token) {
                socket.disconnect();
                return;
            }

            const decoded = this.tokenService.verifyToken(token);
            if (!decoded?._id) {
                socket.disconnect();
                return;
            }

            const user = await this.userRepository.findById(decoded._id);
            if (!user) {
                socket.disconnect();
                return;
            }

            if (user.isDeleted) {
                socket.disconnect();
                return;
            }

            if (user.isBlocked) {
                socket.disconnect();
                return;
            }

            socket.data.userId = decoded._id.toString();

            this.socketService.addUser(
                decoded._id.toString(),
                socket.id
            );

        } catch (error) {

            socket.disconnect();
        }
    }

    handleDisconnect(
        @ConnectedSocket() socket: Socket
    ) {

        const userId = socket.data.userId;
        if (!userId) return;

        this.socketService.removeUser(
            userId,
            socket.id
        );
    }
}

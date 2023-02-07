import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { JoinMeetingDto } from './dto';
import { MeetingSubscribers } from './enums';

@WebSocketGateway(5001, { cors: '*' })
export class MeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log({
      message: `Client connected to socketIo server with : ${socket.id}.`,
    });
  }

  handleDisconnect(socket: Socket) {
    console.log({
      message: `Client disconnected to socketIo server with : ${socket.id}.`,
    });
  }

  @SubscribeMessage(MeetingSubscribers.JoinMeeting)
  handleJoinMeeting(
    @ConnectedSocket() socket: Socket,
    @MessageBody() joinMeetingDto: JoinMeetingDto,
  ) {
    const { meetingId, userId } = joinMeetingDto;

    socket.join(meetingId);

    socket.to(meetingId).emit(MeetingSubscribers.UserJoined, userId);

    socket.on(MeetingSubscribers.Disconnect, () => {
      socket
        .to(joinMeetingDto.meetingId)
        .emit(MeetingSubscribers.UserLeft, userId);
    });
  }
}

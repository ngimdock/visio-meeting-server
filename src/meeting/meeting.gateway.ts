import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JoinMeetingDto } from './dto';
import { MessagesToSubscrbes } from './enums';

@WebSocketGateway(5001, { cors: '*' })
export class MeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  handleConnection(socket: Socket) {
    console.log({ message: 'Client connected to socket io server.' });
    console.log(socket.id);
  }

  handleDisconnect(socket: Socket) {
    console.log({ message: 'Client disconnected to socket io server.' });
    console.log(socket.id);
  }

  @SubscribeMessage(MessagesToSubscrbes.JoinMeeting)
  handleJoinMeeting(
    @ConnectedSocket() socket: Socket,
    @MessageBody() joinMeetingDto: JoinMeetingDto,
  ) {
    const { meetingId, userId } = joinMeetingDto;

    console.log({ joinMeetingDto });

    socket.join(meetingId);

    socket.to(meetingId).emit(MessagesToSubscrbes.UserJoined, userId);

    socket.on(MessagesToSubscrbes.Disconnect, () => {
      socket.to(joinMeetingDto.meetingId).emit('user-left', userId);
    });
  }
}

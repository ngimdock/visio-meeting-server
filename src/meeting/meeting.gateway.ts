import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JoinMeetingDto } from './dto';

@WebSocketGateway(80)
export class MeetingGateway {
  @SubscribeMessage('join-meeting')
  handleJoinMeeting(
    @ConnectedSocket() socket: Socket,
    @MessageBody() joinMeetingDto: JoinMeetingDto,
  ) {
    const { meetingId, userId } = joinMeetingDto;

    socket.join(meetingId);

    socket.to(joinMeetingDto.meetingId).emit('user-joined', userId);

    socket.on('disconnect', () => {
      socket.to(joinMeetingDto.meetingId).emit('user-left', userId);
    });
  }
}

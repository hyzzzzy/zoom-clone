import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { Server } from "socket.io";
import { instrument } from '@socket.io/admin-ui';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// http 서버
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});

// socket.io admin ui
instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms }
    }
  } = wsServer;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}


wsServer.on('connection', socket => {
  socket['nickname'] = 'Anonymous';

  socket.onAny(event => {
    console.log(`Socket Event: ${event}`);
    // rooms map => socket id와 방제를 가지고 있음
    // sids map => socket id만 가지고 있음
    // console.log(wsServer.sockets.adapter);
  });
  // custom event
  socket.on('enter_room', (roomName, done) => {
    // 기본적으로 user id와 user가 있는 room id와 같음
    // User와 서버 사이에 private room이 존재
    // console.log(socket.rooms);
    // room에 들어감
    socket.join(roomName);
    // user id와 roomName 출력
    // console.log(socket.rooms);
    
    done();
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
    wsServer.sockets.emit('room_change', publicRooms());
  });

  // 페이지를 떠나기 직전
  socket.on('disconnecting', () => {
    socket.rooms.forEach(room => {
      // 아직 사용자가 나간건 아니라 -1
      socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1);
    });
  });

  // 페이지를 떠난 후
  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms());
  });

  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on('nickname', nickname => {
    socket['nickname'] = nickname;
  });
});

// websocket 서버
// http, webSocket 둘다 작동시키는 코드
// http 서버 위에 ws 서버를 만듦
// const wss = new WebSocketServer({ httpServer });


// socket: 연결된 어떤 사람, 서버와 브라우저 사이의 연결
// 여기서의 socket은 연결된 브라우저
const handleConnection = (socket) => {
  console.log(socket);
}

// const sockets = [];

// // 연결 리스너
// // callback으로 socket을 받음
// wss.on('connection', (socket) => {
//   // 연결된 socket을 배열에 담음
//   sockets.push(socket);

//   // 익명 유저
//   socket['nickname'] = 'Anonymous';

//   console.log('Connected to Browser');

//   socket.on('close', () => {
//     console.log('Disconnected from the Browser');
//   });

//   socket.on('message', (message) => {
//     const formattedMsg = Buffer.from(message, 'base64').toString('utf-8');
//     const parsedMsg = JSON.parse(formattedMsg);

//     switch(parsedMsg.type) {
//       case 'new_message': {
//         sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${parsedMsg.payload}`));
//         break;
//       }
//       case 'nickname': {
//         socket['nickname'] = parsedMsg.payload;
//         break;
//       }
//     }
//   });
// });

// http, ws 같은 포트번호 사용
httpServer.listen(3000, handleListen);
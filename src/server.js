import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// http 서버
const server = http.createServer(app);
// websocket 서버
// http, webSocket 둘다 작동시키는 코드
// http 서버 위에 ws 서버를 만듦
const wss = new WebSocketServer({ server });

// socket: 연결된 어떤 사람, 서버와 브라우저 사이의 연결
// 여기서의 socket은 연결된 브라우저
const handleConnection = (socket) => {
  console.log(socket);
}

// 연결 리스너
// callback으로 socket을 받음
wss.on('connection', handleConnection);

// http, ws 같은 포트번호 사용
server.listen(3000, handleListen);
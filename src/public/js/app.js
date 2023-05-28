const messageList = document.querySelector('ul');
const nickForm = document.querySelector('#nick');
const messageForm = document.querySelector('#message');

// 여기서의 socket은 서버로의 연결
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = {type, payload};
  return JSON.stringify(msg);
}

// connection open일 때
socket.addEventListener('open', () => {
  console.log('Connected to Server');
});

// message를 받았을 때
socket.addEventListener('message', (message) => {
  const li = document.createElement('li');
  li.innerText = message.data;
  messageList.append(li);
});

// 서버가 오프라인이 됐을 때
socket.addEventListener('close', () => {
  console.log('Unconnected to Server');
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector('input');
  socket.send(makeMessage('new_message', input.value));

  const li = document.createElement('li');
  li.innerText = `You: ${input.value}`;
  messageList.append(li);

  input.value = '';
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector('input');
  socket.send(makeMessage('nickname', input.value));
  input.value = '';
}

messageForm.addEventListener('submit', handleSubmit);
nickForm.addEventListener('submit', handleNickSubmit);
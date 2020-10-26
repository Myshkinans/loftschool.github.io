//const { doc } = require("prettier");
const ws = new WebSocket('ws://localhost:8580');
const btn = document.getElementById('sendForm');
const sendMessage = document.getElementById('but');
function show(div) {
  document.getElementById(div).classList.remove('hidden');
}
function hide(div) {
  document.getElementById(div).classList.add('hidden');
}
function message(text) {
  document.getElementsByClassName('mContainer');
  const t = document.createElement('div');
  t.innerText = text;
  document.querySelector('.mContainer').appendChild(t);
}
function userInfo(info) {
  document.createElement('div').innerText = info;
}
function user(name) {
  document.querySelector('.name').innerText = name;
}
function addUser(name) {
  document.getElementsByClassName('users');
  const u = document.createElement('div');
  u.innerText = name;
  document.querySelector('.users').appendChild(u);
}

sendMessage.addEventListener('click', function () {
  let text = document.getElementById('mes').value;
  const request = {
    type: 'text',
    message: text
  }
  ws.send(JSON.stringify(request));
  text = "";
});
btn.addEventListener('click', function () {
  const userName = document.getElementById('loginText').value;
  const request = {
    type: 'login',
    message: userName,
  };
  if (!userName) {
    alert('Введите Никнейм');
  } else {
    ws.send(JSON.stringify(request));
    hide('log');
    show('Chat');
    user(userName);
  }
});

ws.onmessage = function (event) {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'login':
     
      const t = document.createElement('div');
      t.innerText =  message.responseBody + ' вошел в чат';
      document.querySelector('.mContainer').appendChild(t);
      const d = document.getElementsByClassName('users');
      for (key of message.clients){
      const u = document.createElement('div');
      u.innerText = key;
      document.querySelector('.users').appendChild(u); }; 
      break;
    default:
      console.error('Unknown RequestType');
      break;
    case 'text':
      document.getElementsByClassName('mContainer');
      const m = document.createElement('div');
      m.innerText = message.responseBody;
      document.querySelector('.mContainer').appendChild(m);
      break;
    case 'close':
      document.getElementsByClassName('mContainer');
      const c = document.createElement('div');
      c.innerText = message.responseBody;
      document.querySelector('.mContainer').appendChild(c);
      break;
    }
  };

ws.onerror = function (err) {
  console.error(err);
};

ws.onopen = function () {
  console.log('Client Connect');
  show('log');
};

ws.onclose = function () {
  console.log('Server Die');
};

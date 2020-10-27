//const { doc } = require("prettier");
const ws = new WebSocket('ws://localhost:8580');
const btn = document.getElementById('sendForm');
const sendMessage = document.getElementById('but');
const changePhoto = document.getElementById('photoChange');
function show(div) {
  document.getElementById(div).classList.remove('hidden');
}
function hide(div) {
  document.getElementById(div).classList.add('hidden');
}

function user(name) {
  document.querySelector('#name').innerText = name;
}


sendMessage.addEventListener('click', function () {
  let text = document.getElementById('mes').value;
  const name = document.getElementById('name');
  const img = document.getElementById('photo').src;
  const request = {
    type: 'text',
    message: text,
    name: name.innerText, 
    image: img
  }
  ws.send(JSON.stringify(request));
  document.getElementById('mes').value = '';
});
btn.addEventListener('click', function () {
  const userName = document.getElementById('loginText').value;
  const img = document.getElementById('photo').src = "./no.gif"; 
  const request = {
    type: 'login',
    id: userName,
    image: img
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
const img = document.getElementById('photo')
img.addEventListener('dragover', (e) => {
  if (e.dataTransfer.items.length && e.dataTransfer.items[0].kind === 'file') {
    e.preventDefault();
  }
});
img.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  img.src = "./"+ file.name;
  e.preventDefault();
  const name = document.getElementById('name');
  const imge = document.getElementById('photo').src;
  const request = {
    type: 'change',
    name: name.innerText,
    imge: imge
  }
  ws.send(JSON.stringify(request));
});

ws.onmessage = function (event) {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'login':

      const t = document.createElement('div');
      t.innerText = message.responseBody + ' вошел в чат';
      document.querySelector('.mContainer').appendChild(t);
      const d = document.getElementById('us');
      d.innerHTML = '';
      for (var key of message.clients) {
        if (key.status === 'online') {
          const u = document.createElement('div');
          u.innerText = key.id;
          document.querySelector('#us').appendChild(u);
        }
      };
      break;
    default:
      console.error('Unknown RequestType');
      break;
    case 'text':
      document.getElementsByClassName('mContainer');
      const m = document.createElement('div');
      m.innerHTML = 
      `<div class="s">
          <img id="${message.name}" class="img" src='${message.image}'>
            <span>${message.name}</span>
        <div>${message.responseBody}</div>
      </div>`; 
      document.querySelector('.mContainer').appendChild(m);
      break;
    case 'close':
      document.getElementsByClassName('mContainer');
      const c = document.createElement('div');
      c.innerText = message.responseBody;
      document.querySelector('.mContainer').appendChild(c);
      break;
    case 'change':
      const mesCon = document.getElementsByClassName('mContainer');
      let b = message.name;
      document.getElementById(b).src = message.image;
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
  const n = document.getElementById('name');
  const request = {
    type: 'close',
    message: ' Вышел из чата',
    name: n.innerText,
  };
  ws.send(JSON.stringify(request));
};

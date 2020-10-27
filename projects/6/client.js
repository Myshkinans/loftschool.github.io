const ws = new WebSocket('ws://localhost:8580');
const btn = document.getElementById('sendForm');
const sendMessage = document.getElementById('but');
const online = [];
const basa = [];
const img = document.getElementById('photo');
function show(div) {
  document.getElementById(div).classList.remove('hidden');
}

function hide(div) {
  document.getElementById(div).classList.add('hidden');
}

function user(name) {
  document.querySelector('#name').innerText = name;
}
//кнопка - отправить сообщение
sendMessage.addEventListener('click', function () {
  const text = document.getElementById('mes').value;
  const name = document.getElementById('name');
  const img = document.getElementById('photo').src;
  const request = {
    type: 'text',
    message: text,
    name: name.innerText,
    image: img,
  };
  if (text.length !== 0){
  ws.send(JSON.stringify(request));
  document.getElementById('mes').value = '';}
});
//кнопка - ввойти в чат
btn.addEventListener('click', function () {
  const userName = document.getElementById('loginText').value;
  let img = (document.getElementById('photo').src = './no.gif');
  if (!userName) {
    alert('Введите Никнейм');
  } else {  
    //если аккаунт уже зарегестрирован   
    if (JSON.stringify(basa).includes(userName)) {
      const photo = [];
      for (const b of basa){
        if(b.userName === userName){
          photo.push(b.image);
        }
      }
     //если аккаунт уже был в этой сессии онлайн
      if (online.length !== 0 && JSON.stringify(online).includes(userName)) {
        for (const u of online) {
          if (u.status === 'online' && u.id === userName) {
            alert('Данный user уже онлайн!');
            document.getElementById('loginText').value = '';
          } else if (u.status === 'offline' && u.id === userName) {
            img = document.getElementById('photo').src = photo.toString();
            const request = {
              type: 'login',
              id: userName,
              image: img,
            };
            ws.send(JSON.stringify(request));
            hide('log');
            show('Chat');
            user(userName);
          } 
        }
      } else {  
        img = document.getElementById('photo').src = photo.toString();
        const request = {
          type: 'login',
          id: userName,
          image: img,
        };
        ws.send(JSON.stringify(request));
        hide('log');
        show('Chat');
        user(userName);
      }
    } else {
      const request = {
        type: 'login',
        id: userName,
        image: img,
      };
      ws.send(JSON.stringify(request));
      hide('log');
      show('Chat');
      user(userName);
    }
  }
});
//Изменить фото аккаунта с помощью drag and drop
img.addEventListener('dragover', (e) => {
  if (e.dataTransfer.items.length && e.dataTransfer.items[0].kind === 'file') {
    e.preventDefault();
  }
});
img.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  img.src = './' + file.name;
  e.preventDefault();
  const name = document.getElementById('name');
  const imge = document.getElementById('photo').src;
  const request = {
    type: 'change',
    name: name.innerText,
    imge: imge,
  };
  ws.send(JSON.stringify(request));
});
// когда юзер обновляет/close страницу - он выходит
window.onunload = function () {
  const n = document.getElementById('name');
  const request = {
    type: 'close',
    message: ' вышел из чата',
    name: n.innerText,
  };
  ws.send(JSON.stringify(request));
};
//принимаем с сервера
ws.onmessage = function (event) {
  const message = JSON.parse(event.data);
  switch (message.type) {
    case 'connection':
      for (const k of message.basa) {
        basa.push(k);
      }
      for (const o of message.clients) {
        online.push(o);
      }
      break;

    case 'login':
      const n = document.querySelector('#name');
      console.log(message.clients);
      if (message.clients.length !== 0 && n.innerText.length !== 0) {
        if (message.responseBody !== n.innerText) {
          const t = document.createElement('div');
          t.innerText = message.responseBody + ' вошел в чат';
          document.querySelector('.mContainer').appendChild(t);
        }
        const d = document.getElementById('us');
        d.innerHTML = '';
        for (const key of message.clients) {
          if (key.status === 'online') {
            const u = document.createElement('div');
            u.innerText = key.id;
            document.querySelector('#us').appendChild(u);
          }
        }
      }
      break;

    default:
      console.error('Unknown RequestType');
      break;

    case 'text':
      document.getElementsByClassName('mContainer');
      const m = document.createElement('div');
      m.innerHTML = `<div class="s">
          <img class="${message.name}" src='${message.image}'>
            <span>${message.name}</span>
        <div>${message.responseBody}</div>
      </div>`; 
      document.querySelector('.mContainer').appendChild(m);
      document.getElementById('cont').scrollTop = document.getElementById('cont').scrollHeight;
      break;

    case 'close':
      document.getElementsByClassName('mContainer');
      const c = document.createElement('div');
      c.innerText = message.responseBody;
      document.querySelector('.mContainer').appendChild(c);
      document.getElementById('us').innerHTML = '';
      for (const key of message.clients) {
        if (key.status === 'online') {
          const u = document.createElement('div');
          u.innerText = key.id;
          document.querySelector('#us').appendChild(u);
        }
      }
      break;
      
    case 'change':
      const mesCon = document.getElementsByClassName('mContainer');
      const b = message.name;
      if(document.getElementsByClassName(b) !== null){
        var el = document.getElementsByClassName(b);
        for (var i =0; i<el.length; i++){
      el[i].src = message.image;}}
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

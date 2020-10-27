const WebSocket = require('ws');
const webSocketConfig = new WebSocket.Server({ port: 8580 });
const clients = [];
webSocketConfig.connections = webSocketConfig.clients;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
//const uuidv1 = require('uuid/v1');

const adapter = new FileSync('dbb.json');
const dbb = low(adapter);

webSocketConfig.on('connection', function (wsParams) {
  //загрузка данных с базы данных
  const basa = dbb.get('users').value();
  const response = {
    type: 'connection',
    basa: basa,
    clients: clients,
  };
  wsParams.send(JSON.stringify(response));

  wsParams.on('message', function (data) {
    const message = JSON.parse(data);
    //список аккаунтов, что были/есть онлайн
    if (!JSON.stringify(clients).includes(message.id) && message.id) {
      clients.push({
        id: message.id,
        status: 'online',
        image: message.image,
      });
    };

    webSocketConfig.connections.forEach((wsParams) => {
      switch (message.type) {
        case 'login':
          const response = {
            type: 'login',
            responseBody: message.id,
            clients: clients,
            status: 'online',
            image: message.image,
          }
          // добавляет статус онлайн
          for (const key of clients) {
            if (key.id === message.id) {
              key.status = 'online';
            }
          }
          wsParams.send(JSON.stringify(response));
          //если юзер новый, добавляем его в базу данных
          if (dbb.get('users').find({ userName: message.id }).value() == null) {
            dbb.get('users').push({ userName: message.id, image: message.image }).write();
          }
          break;
//отправка сообщения
        case 'text':
          const mes = {
            type: 'text',
            responseBody: message.message,
            name: message.name,
            image: message.image,
          };
          wsParams.send(JSON.stringify(mes));
          break;
//выход юзера из сети
        case 'close':
          const close = {
            type: 'close',
            responseBody: message.name + message.message,
            clients: clients,
          };
          for (const key of clients) {
            if (key.id === message.name) {
              key.status = 'offline';
            }
          }
          wsParams.send(JSON.stringify(close));
          break;
//загрузка фотографии в профиль
        case 'change':
          const change = {
            type: 'change',
            name: message.name,
            image: message.imge,
            client: clients,
          };
          //обновляем фото в базе данных
          dbb
            .get('users')
            .find({ userName: message.name })
            .assign({ image: message.imge })
            .write();
          for (const key of clients) {
            if (key.id === message.name) {
              key.image = message.imge;
            }
          }
          wsParams.send(JSON.stringify(change));

          break;
      }
    });
  });
});

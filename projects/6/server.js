const WebSocket = require('ws');
const webSocketConfig = new WebSocket.Server({ port: 8580 });
const clients = [];
webSocketConfig.connections = webSocketConfig.clients;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const uuidv1 = require('uuid/v1');

const adapter = new FileSync('db.json');
const db = low(adapter);

webSocketConfig.on('connection', function (wsParams) {
  wsParams.on('message', function (data, all = false) {
    const message = JSON.parse(data);
    clients.push(message.message);
    console.log(clients);
    webSocketConfig.connections.forEach((wsParams) => {
      switch (message.type) {
        case 'login':
          const id = uuidv1();
          const response = {
            type: 'login',
            responseBody: message.message,
            id: id,
            clients: clients
          }
          wsParams.send(JSON.stringify(response));
          if (!db.hasIn(message.message)) {   
            db.get('users').push({userName: message.message }).write();
          }; 
        break;

        case 'text':
          const mes = {
            type: 'text',
            responseBody: message.message,
            name: wsParams.id
          };
          wsParams.send(JSON.stringify(mes));
          break;

        case 'close':
          const close = {
            type: 'close',
            responseBody: message.message
          };
          wsParams.send(JSON.stringify(close));
          break;
      }
    });
  });
});

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
    if (message.id) {clients.push({
      id: message.id,
      status: 'online',
      image: message.image
    })};

    webSocketConfig.connections.forEach((wsParams) => {
      switch (message.type) {
        case 'login':
          wsParams.id = message.id;
          const id = uuidv1();
          const response = {
            type: 'login',
            responseBody: message.id,
            id: id,
            clients: clients,
            status: 'online',
            image: message.image
          }
        
          wsParams.send(JSON.stringify(response));
          if (!db.hasIn(message.id)) {   
            db.get('users').push({id: id, userName: message.id }).write();
          }; 
        break;

        case 'text':
          const mes = {
            type: 'text',
            responseBody: message.message,
            name: message.name,
            image: message.image
          };
          wsParams.send(JSON.stringify(mes));
          break;

        case 'close':
          const close = {
            type: 'close',
            responseBody: message.name + message.message
          };
           
          wsParams.send(JSON.stringify(close));
          break;

        case 'change':
          const change = {
            type: 'change',
            name: message.name,
            image: message.imge,
            client: clients
          }
          for (var key of clients) {
            if (key.id === message.name){
              key.image = message.imge;
            }
          }
          wsParams.send(JSON.stringify(change));
          
          break;
      }
    });
  });
});

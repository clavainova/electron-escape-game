//-------------------------------GUIDE-------------------------------


/*
    IMPORTS
    NAVIGATION
    GENERATE MENU
    LOGIN
    LOCAL JSON HANDLING
    SERVER JSON HANDLING 
*/


//-------------------------------IMPORTS-------------------------------


//electron
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron')
const path = require('path');
const config = require('./src/config');
const storage = require('./src/main/storage');

//mongodb
const MongoClient = require('mongodb').MongoClient;
const uri = "";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


//-------------------------------NAVIGATION-------------------------------


function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: false, // turn off remote
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  if (!storage.getJwt()) {
    win.loadFile('src/renderer/pages/index.html');
  } else {
    win.loadFile('src/renderer/pages/team.html');
  }
  return win;
}
let win;
app.whenReady().then(() => {
  win = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      win = createWindow()
    }
  });
  win.webContents.openDevTools();
  setTimeout(() => {
    win.webContents.send('init', config);
  }, 1000)
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//-------------------------------GENERATE MENU-------------------------------


//this needs to be for exclusively after login
//also clicking the menu items should do something lol

const template = [
  {
    label: 'Create new...', submenu: [{
      label: "Team", click: async () => {
        let f = `file://${__dirname}/src/renderer/pages/team.html`;
        win.loadURL(f);
      }
    },
    {
      label: "Game", click: async () => {
        let f = `file://${__dirname}/src/renderer/pages/game.html`;
        win.loadURL(f);
      }
    },
    {
      label: "Player", click: async () => {
        let f = `file://${__dirname}/src/renderer/pages/player.html`;
        win.loadURL(f);
      }
    }]
  },
  {
    label: 'Edit or monitor existing...', submenu: [{
      label: "Team", click: async () => {
        let f = `file://${__dirname}/src/renderer/pages/monitorteam.html`;
        win.loadURL(f);
      }
    },
    {
      label: 'Game', click: async () => {
        let f = `file://${__dirname}/src/renderer/pages/monitorgame.html`;
        win.loadURL(f);
      }
    },
    {
      label: 'Player', click: async () => {
        let f = `file://${__dirname}/src/renderer/pages/monitorplayer.html`;
        win.loadURL(f);
      }
    }]
  },
  {
    label: 'Account',
    submenu: [{
      label: 'Log out',
      click: async () => {
        //log out
      }
    }]
  }
];

app.on('ready', () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});


//-------------------------------LOGIN-------------------------------


//user connection data
var user;
var pass;

//test login details - are they correct?
async function testLogin(cuser, cpass) {
  user = cuser;
  pass = cpass;
  try {  // connect to your cluster
    let url = 'mongodb+srv://' + user + ':' + pass + '@cluster0.llbg1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // specify the DB's name
    const db = client.db('Projet-Fil-Rouge');
    // close connection
    client.close();
    return true;
  }
  catch (e) {
    return e;
  }
}

//are you currently logged in?
async function isLoggedIn() {
  try {  // connect to your cluster
    let url = 'mongodb+srv://' + user + ':' + pass + '@cluster0.llbg1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // specify the DB's name
    const db = client.db('Projet-Fil-Rouge');
    // close connection
    client.close();
    return true;
  }
  catch (e) {
    console.log("connection error: " + e);
    return false;
  }
}



//------------------------------- LOCAL JSON HANDLING-------------------------------

var json; //the current json
//probably want to connect this to jwt

//!!untested
function add(type, values) {
  switch (type) {
    case "team":
      break;
    case "game":
      break;
    case "player":
      break;
  }
  try {
    writeJSONToServer();
  } catch (e) {
    console.log("server error: " + e);
  }
}


//------------------------------- SERVER JSON HANDLING-------------------------------



//gets the JSON, returns 1 JSON string
async function getJSON(user, pass) {
  // connect to your cluster
  let url = 'mongodb+srv://' + user + ':' + pass + '@cluster0.llbg1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // specify the DB's name
  const db = client.db('Projet-Fil-Rouge');
  // execute find query
  json = await db.collection('Teams').find({}).toArray();
  // close connection
  client.close();
  //return json
  //for testing -- console.log(JSON.stringify(items));
  return JSON.stringify(items);
}

//!!untested
async function deleteOldJSON() {
  // connect to your cluster
  const client = await MongoClient.connect('mongodb+srv://admin:simplonsimp@cluster0.llbg1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // specify the DB's name
  const db = client.db('Projet-Fil-Rouge');
  // execute find query
  await db.collection('Teams').deleteMany({}); //yeah no way this works but worth a shot
  // close connection
  client.close();
}

//!!untested
async function writeJSONToServer() {
  // connect to your cluster
  const client = await MongoClient.connect('mongodb+srv://admin:simplonsimp@cluster0.llbg1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // specify the DB's name
  const db = client.db('Projet-Fil-Rouge');
  // execute find query
  await db.collection('Teams').insertOne({ json }); //this won't work
  // close connection
  client.close();
}
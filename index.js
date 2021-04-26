const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron')
const path = require('path');
const config = require('./src/config');
const storage = require('./src/main/storage');


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

const fs = require('fs');

const windows = new Set();
const openFiles = new Map();

app.on('ready', () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  createWindow();
});


//see references here: https://www.electronjs.org/docs/tutorial/quick-start (ctrl-f 'module')

//-------------------------------JSON HANDLING-------------------------------



const MongoClient = require('mongodb').MongoClient;
const uri = "";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var user;
var pass;

//test login details
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
    // execute find query
    const items = await db.collection('Teams').find({}).toArray();
    // close connection
    client.close();
    return true;
  }
  catch (e) {
    return e;
  }
}

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
  const items = await db.collection('Teams').find({}).toArray();
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
async function writeJSONToServer(data) {
  // connect to your cluster
  const client = await MongoClient.connect('mongodb+srv://admin:simplonsimp@cluster0.llbg1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // specify the DB's name
  const db = client.db('Projet-Fil-Rouge');
  // execute find query
  await db.collection('Teams').insertOne({ data }); //this won't work
  // close connection
  client.close();
}


//-------------------------------ERROR CODES-------------------------------



function makeErrorMessage(err) {
  closeError();
  let div = document.createElement("div");
  div.className = "errorMessage";
  div.onclick = function () { closeError(); };
  div.id = "error";
  let text;
  switch (err) {
    case "012":
      text = document.createTextNode("ERROR: ID blank and team must contain at least 2 people");
      break;
    case "01":
      text = document.createTextNode("ERROR: ID Blank");
      break;
    case "02":
      text = document.createTextNode("ERROR: team must contain at least 2 people");
      break;
    case "12":
      text = document.createTextNode("ERROR: No username entered");
      break;
    case "13":
      text = document.createTextNode("ERROR: No password entered");
      break;
    case "123":
      text = document.createTextNode("ERROR: No username or password entered");
      break;
    case "00":
      text = document.createTextNode("ERROR: Username or password incorrect");
      break;
    default:
      text = document.createTextNode("Unknown error");
      break;
  }
  div.appendChild(text);
  document.getElementById("body").appendChild(div);
  clearData();
}

function closeError() {
  try {
    document.getElementById("body").removeChild(document.getElementById("error"));
  }
  catch (err) {
    return;
  }
}
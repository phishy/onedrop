var childProcess = require('child_process');
const localWebServer = require('local-web-server');

const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 680,
    'min-width': 400
  });

  // and load the index.html of the app.
  // mainWindow.loadURL(url.format({
  //   pathname: path.join(__dirname, 'index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }))

  mainWindow.setTitle('onedrop');
  mainWindow.loadURL('file://' + __dirname + '/ui/www/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  const app = localWebServer({
    static: {
      root: __dirname + '/ui/www/',
      options: {
        hidden: true
      }
    },
    serveIndex: {
      path: __dirname + '/ui/www/',
      options: {
        icons: true,
        hidden: true
      }
    },
    // log: {
    //   format: options.server['log-format']
    // },
    // compress: options.server.compress,
    // mime: options.server.mime,
    // forbid: options.server.forbid,
    // spa: options.server.spa,
    // 'no-cache': options.server['no-cache'],
    // rewrite: options.server.rewrite,
    // verbose: options.server.verbose,
    // mocks: options.server.mocks
  })

  app.listen(8000, function(){});

  var child = childProcess.exec('node ' + __dirname + '/api/app.js', {env: { FORK : 1 }});

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    child.kill();
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

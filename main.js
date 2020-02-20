const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set ENV
// process.env.NODE_ENV = 'production';

let mainWindow;
let addItemWindow;

// Listener for app to be ready
app.on('ready', function() {
    // Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Quit app when closed
    mainWindow.on('close', function() {
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddItemWindow() {
    // Create new window
    addItemWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 400,
        height: 200,
        title: 'Add Item ao Shopping List'
    });
    // Load html into window
    addItemWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/addItemWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage collection handle
    addItemWindow.on('close', function() {
        addItemWindow = null;
    });
    // Remove menu from add window
    addItemWindow.setMenu(null);
}

// Catch item:add
ipcMain.on('item:add', function(e, item) {
    mainWindow.webContents.send('item:add', item);
    addItemWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'Arquivo',
        submenu: [
            {
                label: 'Adicionar Item',
                click() {
                    createAddItemWindow();
                }
            },
            {
                label: 'Limpar Itens',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Sair',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object on menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'DevTools',
        submenu:[
            {
                label: 'Abrir/fechar DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}
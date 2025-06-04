const { app, BrowserWindow } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const http = require("http");
const log = require('electron-log'); // Importa electron-log

// Configura electron-log para escribir en un archivo (por defecto en el directorio de logs del usuario)
log.transports.file.level = 'info'; // Nivel de log: info, warn, error, debug, etc.
log.transports.file.format = '{h}:{i}:{s}.{ms} {level} {text}';
log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB
log.transports.file.file = path.join(app.getPath('userData'), 'logs', 'main.log'); // Ruta del archivo de log

let mainWindow;
let backendProcess;
let frontendProcess;

// Captura errores no controlados en el proceso principal y los loguea
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception in main process:', error);
  app.quit(); // Cierra la aplicación de forma segura
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection in main process:', reason);
  app.quit(); // Cierra la aplicación de forma segura
});

/**
 * Crea y configura la ventana principal de Electron.
 */
function createWindow() {
  log.info('createWindow: Intentando crear la ventana principal.');
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true // Mantén DevTools habilitado para depurar el ejecutable si es necesario
    },
  });

  mainWindow.loadURL("http://127.0.0.1:3000");
  log.info('createWindow: Cargando URL del frontend: http://127.0.0.1:3000');

  // Abre automáticamente las Developer Tools para facilitar la depuración del frontend
  mainWindow.webContents.openDevTools();
  log.info('createWindow: Developer Tools abiertas automáticamente.');
}

/**
 * Espera a que un servidor responda en una URL específica.
 * @param {string} url La URL a la que intentar conectarse.
 * @param {function} callback La función a ejecutar cuando el servidor esté listo.
 * @param {number} retries Número máximo de intentos antes de fallar.
 * @param {number} delay Retraso en milisegundos entre cada intento.
 */
function waitForServer(url, callback, retries = 180, delay = 1500) { // Aumentado a 180 reintentos * 1.5 segundos = 4.5 minutos
  log.info(`waitForServer: Iniciando espera para ${url} (Intentos: ${retries}, Retraso: ${delay}ms)`);
  const tryConnect = (attempt = 0) => {
    if (attempt >= retries) {
      log.error(`❌ Fallo al conectar a ${url} después de ${retries} intentos. Cerrando aplicación.`);
      app.quit();
      return;
    }

    http.get(url, (res) => {
      if (res.statusCode === 200 || res.statusCode === 307) {
        log.info(`✅ ${url} listo. (Intento ${attempt + 1})`);
        callback();
      } else {
        log.warn(`🟡 ${url} respondió con ${res.statusCode}. Reintentando... (Intento ${attempt + 1})`);
        setTimeout(() => tryConnect(attempt + 1), delay);
      }
    }).on("error", (err) => {
      log.warn(`🔴 Error al conectar a ${url}: ${err.message}. Reintentando... (Intento ${attempt + 1})`);
      setTimeout(() => tryConnect(attempt + 1), delay);
    });
  };

  tryConnect();
}

// Se ejecuta cuando Electron está listo para crear ventanas del navegador.
app.whenReady().then(() => {
  log.info('app.whenReady: Electron está listo.');

  // Determinar la ruta base para los recursos empaquetados
  const baseResourcesPath = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..');
  log.info(`app.whenReady: baseResourcesPath: ${baseResourcesPath}`);

  // Construye la ruta ABSOLUTA al script principal de tu backend (main.js compilado).
  const backendDir = path.join(baseResourcesPath, 'carniceria-firebase-backend');
  const backendMain = path.join(backendDir, 'dist', 'main.js');
  log.info(`app.whenReady: Ruta del backend: ${backendMain}`);

  // 1. Ejecuta el backend.
  log.info("🚀 Iniciando backend...");
  backendProcess = exec(`set "ALLOWED_ORIGIN=http://127.0.0.1:3000" && node "${backendMain}"`, {
    cwd: backendDir,
    env: { ...process.env, ALLOWED_ORIGIN: 'http://127.0.0.1:3000' }
  }, (err, stdout, stderr) => {
    if (err) log.error("❌ Backend error:", err);
    if (stdout) log.info("Backend stdout:", stdout);
    if (stderr) log.error("Backend stderr:", stderr);
  });

  // 2. Espera a que el backend esté listo (puerto 4000).
  waitForServer("http://127.0.0.1:4000/auth/ping", () => {
    log.info("✅ Backend confirmado, iniciando frontend...");

    // Construye la ruta ABSOLUTA al directorio raíz de tu frontend (Next.js).
    const frontendDir = path.join(baseResourcesPath, 'carniceria-firebase-front');
    log.info(`app.whenReady: Ruta del frontend: ${frontendDir}`);

    // 3. Ejecuta el frontend.
    // Usamos 'npm run start' para el ejecutable (versión de producción de Next.js).
    // Asegúrate de que tu frontend esté compilado para producción antes de empaquetar Electron.
    frontendProcess = exec(`npm run start --prefix "${frontendDir}"`, {
      cwd: frontendDir
    }, (err, stdout, stderr) => {
      if (err) log.error("❌ Frontend error:", err);
      if (stdout) log.info("Frontend stdout:", stdout);
      if (stderr) log.error("Frontend stderr:", stderr);
    });

    // 4. Espera a que el frontend esté listo (puerto 3000) antes de crear la ventana de Electron.
    waitForServer("http://127.0.0.1:3000", createWindow);
  });
});

// Manejo de eventos de la aplicación Electron
app.on("window-all-closed", () => {
  log.info('app.window-all-closed: Todas las ventanas cerradas.');
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  log.info("app.will-quit: Electron se está cerrando. Terminando procesos hijos...");
  if (backendProcess) {
    log.info("Terminando proceso del backend...");
    backendProcess.kill();
  }
  if (frontendProcess) {
    log.info("Terminando proceso del frontend...");
    frontendProcess.kill();
  }
});

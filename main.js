const { app, BrowserWindow } = require("electron");
const path = require("path");
const { exec } = require("child_process");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  // Carga la interfaz ya compilada (Next.js exportado o server local)
  win.loadURL("http://localhost:3000"); // O usa `loadFile` si usas `next export`
}

app.whenReady().then(() => {
  // 🟡 Inicia backend compilado
  const backend = exec("node backend/dist/main.js", {
    cwd: path.join(__dirname),
  });

  backend.stdout.on("data", (data) => console.log("Backend:", data));
  backend.stderr.on("data", (data) => console.error("Backend error:", data));

  createWindow();
});

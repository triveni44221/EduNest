import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

let studentDataPath = null;
if (os.platform() === "win32") {
    studentDataPath = "D:/student data";
}

// Serve student documents and photos only if the path is set
if (studentDataPath) {
    app.use("/student-data", express.static(studentDataPath));
}

// Default route to check if the server is running
app.get("/", (req, res) => {
    res.send("Edunest File Server is Running...");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

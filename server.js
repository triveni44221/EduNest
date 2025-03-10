import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Explicitly set the student data folder path
const studentDataPath = "D:/student data";

// Serve student documents and photos
app.use("/student-data", express.static(studentDataPath));

// Default route to check if the server is running
app.get("/", (req, res) => {
    res.send("Edunest File Server is Running...");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

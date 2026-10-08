require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { handleUserQuestion } = require("./src/llm-service");
const { callMcpTool } = require("./src/mcp-client");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.post("/api/ask", async (req, res) => {
    try {
        const { question } = req.body;

        const result = await handleUserQuestion(question);

        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

app.post("/api/tool", async (req, res) => {
    try {
        const { toolName, params } = req.body;

        if (!toolName) {
            return res.status(400).json({
                error: "Lipsește toolName",
            });
        }

        const result = await callMcpTool(toolName, params || {});

        return res.json(result);
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Frontend MCP Client rulează pe http://localhost:${PORT}`);
});

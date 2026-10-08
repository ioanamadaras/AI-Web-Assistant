const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const jsonTools = require("./mcp-tools/jsonServerTools");
const gqlTools = require("./mcp-tools/graphqlTools");
const rdfTools = require("./mcp-tools/rdf4jTools");

const app = express();
app.use(cors());
app.use(express.json());

const toolDescriptions = JSON.parse(
    fs.readFileSync(path.join(__dirname, "tooldescriptions.json"), "utf-8"),
);

const handlers = {
    getLaureatesByNationality: jsonTools.getLaureatesByNationality,
    addEvent: jsonTools.addEvent,
    getScientistsByInstitution: gqlTools.getScientistsByInstitution,
    addInstitution: gqlTools.addInstitution,
    getArticlesByJournal: rdfTools.getArticlesByJournal,
    addJournal: rdfTools.addJournal,
};

app.post("/rpc", async (req, res) => {
    const { jsonrpc, method, params, id } = req.body;

    if (jsonrpc != "2.0") {
        return res.json({
            jsonrpc: "2.0",
            error: { code: -32600, message: "Cerere invalida" },
            id,
        });
    }

    if (method == "tools/list") {
        return res.json({
            jsonrpc: "2.0",
            id,
            result: { tools: toolDescriptions },
        });
    }

    if (method == "tools/call") {
        const toolName = params.name;
        const toolArgs = params.arguments;

        if (handlers[toolName]) {
            try {
                const result = await handlers[toolName](toolArgs);

                return res.json({ jsonrpc: "2.0", id, result });
            } catch (error) {
                return res.json({
                    jsonrpc: "2.0",
                    id,
                    error: {
                        code: -32603,
                        message: "Eroare la executia tool-ului.",
                    },
                });
            }
        } else {
            return res.json({
                jsonrpc: "2.0",
                id,
                error: { code: -32601, message: "Tool-ul cerut nu exista." },
            });
        }
    }

    return res.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: "Metoda RPC negasita." },
    });
});

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`MCP server pornit cu succes pe http://localhost:${PORT}`);
});

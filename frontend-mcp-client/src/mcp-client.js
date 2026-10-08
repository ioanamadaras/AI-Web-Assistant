const MCP_SERVER_URL = "http://localhost:5001/rpc";

async function sendMcpRequest(method, params) {
    const payload = {
        jsonrpc: "2.0",
        id: Date.now(),
        method,
    };

    if (params !== undefined) {
        payload.params = params;
    }

    const response = await fetch(MCP_SERVER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`MCP server error: ${response.status}`);
    }

    return response.json();
}

async function callMcpTool(name, args = {}) {
    return sendMcpRequest("tools/call", {
        name,
        arguments: args,
    });
}

async function listMcpTools() {
    return sendMcpRequest("tools/list");
}

module.exports = { callMcpTool, listMcpTools };

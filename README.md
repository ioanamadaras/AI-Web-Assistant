# AI Semantic Web Assistant

A conversational web application that uses Google Gemini and the Model Context Protocol (MCP) to query and update scientific data from multiple semantic web sources.

## Features

- Converts natural-language questions into tool calls using Google Gemini.
- Searches laureates and events stored in JSON Server.
- Queries scientists and institutions through GraphQL.
- Searches scientific articles and journals with SPARQL queries in RDF4J.
- Supports adding events, institutions, and journals.
- Validates required parameters and detects possible duplicate records.

## Architecture

The project contains two components:

- **Frontend MCP Client** – provides the web interface and sends user questions to the AI service.
- **Backend MCP Server** – exposes tools through a JSON-RPC endpoint and connects to JSON Server, GraphQL, and RDF4J.

## Tech Stack

- Node.js and Express.js
- Google Gemini API
- Model Context Protocol (MCP)
- JSON-RPC
- GraphQL
- SPARQL and RDF4J
- JSON Server
- HTML, CSS, and JavaScript

## Running the Project

Start the supporting data services first, then run the MCP server and the frontend client.

### Backend MCP Server

```bash
cd backend-mcp-server
npm install
npm run start-json
npm run start-graphql
npm run start-mcp
```

### Frontend MCP Client

Create a `.env` file in `frontend-mcp-client` with a Google Gemini API key:

```env
API_KEY=your_gemini_api_key
```

Then start the client:

```bash
cd frontend-mcp-client
npm install
npm start
```

The web application is available at `http://localhost:5000`.

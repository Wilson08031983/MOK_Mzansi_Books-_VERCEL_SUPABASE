# Postman VS Code Extension — Project Summary

Source: https://learning.postman.com/docs/developer/vs-code-extension/overview/

## Overview

The Postman VS Code extension lets you develop and test APIs directly in your editor (including Visual Studio Code, Cursor, Windsurf, and VSCodium). It enables sending requests, organizing collections, managing environments, writing tests and documentation, and integrating with AI agents.

## Key Capabilities

- Import collections and environments; sync `.env` files with project variables.
- Send HTTP, raw WebSocket, and gRPC requests; manage cookies and certificates.
- Organize requests into collections; manage environments and variables.
- Share workspaces, collections, and environments; control team roles.
- Write API documentation and test scripts; run collections inside the extension.
- Integrate the Postman MCP server to let AI agents manage Postman resources via API.

## Useful Shortcuts (macOS)

- Open extension: `⌘+⌥+P`
- New collection: hold `⌘`, press `R` then `C`
- New environment: hold `⌘`, press `R` then `E`
- New request tab: hold `⌘`, press `R` then `N`
- Open Postman Console: hold `⌘`, press `R` then `P`

## How To Use In This Project

- Open the `postman` folder and import `MOK_Mzansi_Books_API.postman_collection.json`.
- Use `postman/environments/development.postman_environment.json` for local testing (`base_url` is `http://localhost:3000`).
- Start the backend locally before sending requests: `npm run dev:backend` or `npm run dev:full`.
- Verify the server: `curl http://localhost:3000/health` should return a healthy response.
- Send requests and run collections within the extension; watch logs in the Postman Console.

## Links To Full Docs

- Install: https://learning.postman.com/docs/developer/vs-code-extension/install/
- Import data: https://learning.postman.com/docs/developer/vs-code-extension/import-data/overview/
- Send requests: https://learning.postman.com/docs/developer/vs-code-extension/send-requests/
- Certificates: https://learning.postman.com/docs/developer/vs-code-extension/certificates/
- Collections: https://learning.postman.com/docs/developer/vs-code-extension/use-collections/
- Environments: https://learning.postman.com/docs/developer/vs-code-extension/manage-environments/
- Share work: https://learning.postman.com/docs/developer/vs-code-extension/share/
- Documentation: https://learning.postman.com/docs/developer/vs-code-extension/document/
- Tests & scripts: https://learning.postman.com/docs/developer/vs-code-extension/tests-and-scripts/overview/
- MCP server: https://learning.postman.com/docs/developer/vs-code-extension/postman-mcp-server/
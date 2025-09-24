# Werewolf-GameManager
This behavior pack functions as the central GameManager for the Werewolf game. It is designed with version resilience in mind, ensuring compatibility across future updates of Minecraft Werewolf.

Template used - https://github.com/shizuku86/Kairo-template

## Supported Minecraft Script API
Kairo is built using the stable Script API:
- `@minecraft/server` - v2.1.0
- `@minecraft/server-ui` - v2.0.0

## Requirements
- Node.js (for development and TypeScript build)

## Setup && Build
1. Install dependencies:
   ```bash
   npm install
   ```
2. Deploy
    ```bash
    npm run build
    ```
3. Auto-deploy on file change:
    ```bash
    npm run dev
    ```
// Configuração do PM2 para rodar o build standalone (dist/) na VPS Hostinger.
// Uso no servidor: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "sabor-de-botequim",
      cwd: __dirname + "/dist",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
    },
  ],
};

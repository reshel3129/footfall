module.exports = {
  apps: [
    {
      name: 'footfall-ui',
      script: 'npm',
      args: 'start',
      cwd: '/root/footfallapp/footfall-baialshami/footfall-ui',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/ui-error.log',
      out_file: './logs/ui-out.log',
      log_file: './logs/ui-combined.log',
      time: true
    }
  ]
};



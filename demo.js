#!/usr/bin/env node

process.env.GH_AUTH_TOKEN = "";

const bot = require(".").create();

bot.comment(`
<h3>${bot.env.commitMessage}</h3>
Demo: <strong>${bot.artifactLink('demo/index.html', 'demo')}</strong>
`);

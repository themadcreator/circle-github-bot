#!/usr/bin/env node

const bot = require(".").create();

bot.comment(process.env.GH_AUTH_TOKEN, `
<h3>${bot.commitMessage()}</h3>
Demo: <strong>${bot.artifactLink('demo/index.html', 'demo')}</strong>
`);

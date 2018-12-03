#!/usr/bin/env node

const bot = require(".").create();

bot.comment(`
<h3>${bot.commitMessage()}</h3>
Demo: <strong>${bot.artifactLink('demo/index.html', 'demo')}</strong>
`);

#!/usr/bin/env node

const bot = require(".").create();

bot.postComment(`
<h3>${bot.commitMessage()}</h3>
Demo: <strong>${bot.artifactLink('demo/index.html', 'demo')}</strong>
`);

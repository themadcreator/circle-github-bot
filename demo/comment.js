#!/usr/bin/env node

const bot = require("..").create();

bot.comment(`
<h3>${bot.env.commitMessage}</h3>
Demo: <strong>${bot.artifactLink('/demo/index.html', 'demo')}</strong>
`);

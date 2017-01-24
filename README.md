


### Write the Bot Script

Create a script using this library to post a comment on github referencing
the current PR.

Example (`/demo/bot.js` from this repo):
```javascript
#!/usr/bin/env node

const bot = require("../").create();

bot.comment(`
    <h3>${bot.env.commitMessage}</h3>
    Demo: <strong>${bot.artifactLink('/demo/index.html', 'demo')}</strong>
`);

```

With that "shebang" at the top, you can `chmod +x` your script file from the
command line to make it self-executable.

### Setup Circle CI
1. Create an account on https://circleci.com/
1. Add CircleCI service integration to your github project in your repo's project settings
  1. Settings > Integrations & Services > Services
1. Add `circle.yml` file to the root of your repo
  1. Include a section in `deployment` that generates your preview and posts the comment

```yaml
deployment:
  demo:
    branch: /.*/
    commands:
      - ./demo/bot.js
```

### Authorize Comments
Authorize your circle build to comment on github

1. Generate a deploy key
  1. Settings > Deploy Keys > Add
  1. Generate a RSA key from command line like so:
    `ssh-keygen -C name-of-deploy-key -f deploy_key`
  1. Copy the contents of `deploy_key.pub` and paste into the box on github.com
  1. The deploy key does not need write access to post comments

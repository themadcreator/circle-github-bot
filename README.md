

# Setting Up Demo Comments on PRs

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

### Setup CircleCI
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

### Enable CircleCI Build for PRs
1. Set your main branch (e.g. master) to protected
1. Enabled "required status checks"
1. Select "ci/circleci" as a required status check

### Add Github Auth Token to CircleCI Environment
1. Go to your github profile settings
1. Add a new OAuth token under "Personal access tokens"
1. Once created, add the token string to your CircleCI build's environment variables
  1. Build Settings > Environment variables
1. Name the variable "GH_AUTH_TOKEN"


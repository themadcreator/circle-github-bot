
# Setting Up Demo Comments on PRs

### Write the Bot Script

Create a script using this library to post a comment on github referencing
the current PR.

Example:
```javascript
#!/usr/bin/env node

const bot = require("circle-github-bot").create();

bot.comment(`
    <h3>${bot.env.commitMessage}</h3>
    Demo: <strong>${bot.artifactLink('/demo/index.html', 'demo')}</strong>
`);

```

With that "shebang" at the top, you can `chmod +x` your script file from the
command line to make it self-executable.

### Integrate CircleCI into your Repo
1. Add CircleCI service integration to your github project in your repo's project settings
  1. Settings > Integrations & Services > Services
  1. Once CircleCI is linked to your github account, it will add its own deploy key to this repo
1. Add `circle.yml` file to the root of your repo
  1. Include a section in `deployment` that generates your preview and posts the comment

```yaml
deployment:
  demo:
    branch: /.*/
    commands:
      - ./demo/bot.js
```

### Add Github Auth Token to CircleCI Environment
Make sure your script can actually post the comment to github

1. Go to your github profile settings
1. Add a new OAuth token under **"Personal access tokens"**
1. Once created, add the token string to your CircleCI build's environment variables
  1. Build Settings > Environment variables
1. Name the variable **"GH_AUTH_TOKEN"**

### Enable CircleCI Build for PRs
Optional, but helpful. This makes sure your builds actually pass before a PR can be submitted.

1. Set your main branch (e.g. master) to protected
1. Enabled **"required status checks"**
1. Select **"ci/circleci"** as a required status check

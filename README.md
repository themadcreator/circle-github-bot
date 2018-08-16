
> Now compatible with Circle 2.0

# Circle Github Bot

This library helps you submit a comment on the PR from inside your CircleCI
build and link to a static artifact from the build.

When reviewing a PR on github, it's useful to read the code but even more useful
to test out the code on that branch in a live working web app.

See an example PR on this github repo https://github.com/themadcreator/circle-github-bot/pull/3

It works like so:

1. Someone creates a pull request on your github project
1. This triggers a CircleCI build, which:
  1. Runs tests
  1. Builds your static demo site
  1. Runs your demo.js script, submitting a comment back to the PR
1. A comment shows up on the github PR
1. CircleCI "collects" the artifacts from the build and makes them available on the web
1. You click the link on the PR and see the static site!

# Setting Up Demo Comments on PRs

### Write the Bot Comment Script
Create a `demo.js` script using this library to post a comment on github
referencing the current PR.

Example:
```javascript
#!/usr/bin/env node

const bot = require("circle-github-bot").create();

bot.comment(`
<h3>${bot.env.commitMessage}</h3>
Demo: <strong>${bot.artifactLink('demo/index.html', 'demo')}</strong>
`);
```

With that "shebang" at the top, you can `chmod +x` your script file from the
command line to make it self-executable.

### Integrate CircleCI into your Repo
1. Add CircleCI service integration to your github project in your repo's project settings
  1. Settings > Integrations & Services > Services
  1. Once CircleCI is following your github project, it will add its own deploy key to this repo
1. Add `.circleci/config.yml` file to the root of your repo
  1. Store your `demo/` directory as a build artifact
  1. Include job that runs your demo script

```yaml
version: 2

jobs:
  demo:
    docker:
      - image: circleci/node:8.10.0
    steps:
      - checkout
      - run: npm install
      - run: npm run build
      - run: ./demo.js
      - store_artifacts:
          path: demo

workflows:
  version: 2
  your-project-workflow:
    jobs:
      - demo
```

### Add Github Auth Token to CircleCI Environment
Make sure your script can actually post the comment to github

1. Go to your github profile settings
1. Add a new OAuth token under **"Developer Settings"** -> **"Personal access tokens"**
1. The only permissions required are those needed to comment on your repo. For
   example `public_repo` is enough for commenting on a public repository.
1. Once created, add the token string to your CircleCI build's environment variables
  1. Build Settings > Environment variables
1. Name the variable **"GH_AUTH_TOKEN"**

### Require CircleCI Build for PRs
Optional, but helpful. This makes sure your builds actually pass before a PR can be submitted.

1. Set your main branch (e.g. master) to protected
1. Enabled **"required status checks"**
1. Select your **"ci/circleci"** workflow jobs as a required status checks

/*!
Copyright 2017-present TheMadCreator

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { execSync, ExecSyncOptions } from "child_process";
import { basename } from "path";

interface IOptions {
    /**
     * GitHub API domain, for enterprise support.
     * @default "api.github.com"
     */
    githubDomain?: string;
}

interface IEnvironment {
    readonly buildUrl: string;
    readonly home: string;
    readonly repo: string;
    readonly sha1: string;
    readonly username: string;
    readonly commitMessage: string;
    readonly prNumber: string;
    readonly githubDomain: string;
}

// IEnvironment fields that must be defined or an Error is thrown.
const REQUIRED_ENV: Array<keyof IEnvironment> = ["buildUrl", "home", "repo", "sha1", "username"];

// Synchronously execute command and return trimmed stdout as string
function exec(command: string, options?: ExecSyncOptions) {
    return execSync(command, options)
        .toString("utf8")
        .trim();
}

// Syncronously POST to `url` with `data` content
function curl(url: string, data: string) {
    return exec(`curl --silent --data @- ${url}`, { input: data });
}

class Bot {
    public static create(options: IOptions = {}) {
        const { githubDomain = "api.github.com" } = options;

        // CI_PULL_REQUEST was deprecated in favor of CIRCLE_PULL_REQUEST in Circle 2.0.
        const prNumber = basename(process.env.CIRCLE_PULL_REQUEST || process.env.CI_PULL_REQUEST || "");

        const env: IEnvironment = {
            buildUrl: process.env.CIRCLE_BUILD_URL,
            commitMessage: exec('git --no-pager log --pretty=format:"%s" -1').replace(/\\"/g, '\\\\"'),
            githubDomain,
            home: process.env.HOME,
            prNumber,
            repo: process.env.CIRCLE_PROJECT_REPONAME,
            sha1: process.env.CIRCLE_SHA1,
            username: process.env.CIRCLE_PROJECT_USERNAME,
        };

        const missing = REQUIRED_ENV.filter(key => !env[key]);
        if (missing.length > 0) {
            throw new Error("Missing required environment variables:\n  " + missing.join(", "));
        }

        return new Bot(env);
    }

    /** @internal */
    private constructor(private readonly env: IEnvironment) {}

    /** Get an absolute URL for the given artifact path. */
    public artifactUrl(artifactPath: string) {
        return `${this.env.buildUrl}/artifacts/0/${this.env.home}/project/${artifactPath}`;
    }

    /** Render an HTML link to the path with the given text. */
    public artifactLink(artifactPath: string, text: string) {
        return `<a href='${this.artifactUrl(artifactPath)}' target='_blank'>${text}</a>`;
    }

    /** Get the message from the latest commit. */
    public commitMessage() {
        return this.env.commitMessage;
    }

    /**
     * Post a comment with the given body.
     *
     * Requires a GitHub auth token. We recommend generating a new token
     * and saving it as an environment variable called `GH_AUTH_TOKEN`. Then
     * pass this variable when calling this method.
     *
     * ```js
     * bot.comment(process.env.GH_AUTH_TOKEN, "...");
     * ```
     */
    public comment(authToken: string, body: string = "") {
        if (!authToken) {
            throw new Error("Bot.comment() requires auth token.");
        }
        if (this.env.prNumber !== "") {
            return this.curl(authToken, `issues/${this.env.prNumber}/comments`, body);
        } else {
            return this.curl(authToken, `commits/${this.env.sha1}/comments`, body);
        }
    }

    /** @internal */
    private githubUrl(authToken: string, path: string) {
        const { githubDomain, username, repo } = this.env;
        return `https://${authToken}:x-oauth-basic@${githubDomain}/repos/${username}/${repo}/${path}`;
    }

    /** @internal */
    private curl(authToken: string, path: string, body: string) {
        // tslint:disable:no-console
        console.log(`Posting to ${path}...`);
        console.log(curl(this.githubUrl(authToken, path), JSON.stringify({ body })));
        // tslint:enable:no-console
    }
}

export = Bot;

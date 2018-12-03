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
    auth: string;
    buildUrl: string;
    home: string;
    repo: string;
    sha1: string;
    username: string;
    commitMessage: string;
    prNumber: string;
    githubDomain: string;
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
            auth: process.env.GH_AUTH_TOKEN,
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

    /** Post a comment with the given body. */
    public postComment(body: string) {
        if (this.env.prNumber !== "") {
            return this.curl(`issues/${this.env.prNumber}/comments`, body);
        } else {
            return this.curl(`commits/${this.env.sha1}/comments`, body);
        }
    }

    private githubUrl(path: string) {
        return `https://${this.env.auth}:x-oauth-basic@${this.env.githubDomain}/${path}`;
    }

    private githubRepoUrl(path: string) {
        return this.githubUrl(`repos/${this.env.username}/${this.env.repo}/${path}`);
    }

    /** @internal */
    private curl(path: string, body: string) {
        // tslint:disable:no-console
        if (this.env.auth) {
            console.log(`Posting to ${path}...`);
            console.log(curl(this.githubRepoUrl(path), JSON.stringify({ body })));
        } else {
            console.log(`Cannot post comment: missing GH_AUTH_TOKEN.`);
            console.log(body);
        }
        // tslint:enable:no-console
    }
}

export = Bot;

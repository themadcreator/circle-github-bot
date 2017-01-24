###
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
###

url = require 'url'
request = require 'request'
{ basename } = require 'path'
{ execSync } = require 'child_process'

ENV = {
    # Required ENV variables
    auth          : 'GH_AUTH_TOKEN'
    username      : 'CIRCLE_PROJECT_USERNAME'
    repo          : 'CIRCLE_PROJECT_REPONAME'
    build         : 'CIRCLE_BUILD_NUM'
    artifacts     : 'CIRCLE_ARTIFACTS'
    pr            : 'CI_PULL_REQUEST'
    sha1          : 'CIRCLE_SHA1'
    # Aux variables, not in ENV. See Bot.create
    # prNumber      : ''
    # commitMessage : ''
}

# Synchronously execute command and return trimmed stdout as string
exec = (command) ->
    return execSync(command).toString('utf8').trim()

# Syncronously POST to `url` with `data` content
curl = (url, data) ->
    return exec("curl --data \"#{data}\" #{url}")

class Bot
    @create = ->
        missing = []
        for key, name of ENV
            if not process.env[name]? then missing.push(name)
            ENV[key] = process.env[name]

        if missing.length > 0
            throw new Error("Missing required environment variables:\n\n#{missing.join('\n')}\n")

        ENV.commitMessage = exec('git --no-pager log --pretty=format:"%s" -1').replace(/\\"/g, '\\\\"')
        ENV.prNumber = basename(ENV.pr)
        return new Bot(ENV)

    constructor : (@env) ->

    artifactUrl : (artifactPath) ->
        "https://circleci.com/api/v1/project/#{@env.username}/#{@env.repo}/#{@env.build}/artifacts/0/#{@env.artifacts}/#{artifactPath}"

    artifactLink : (artifactPath, text) ->
        "<a href='#{@artifactUrl(artifactPath)}' target='_blank'>#{text}</a>"

    githubUrl : (path) ->
        "https://#{@env.auth}:x-oauth-basic@api.github.com/#{path}"

    githubRepoUrl : (path) ->
        @githubUrl("repos/#{@env.username}/#{@env.repo}/#{path}")

    commentIssue : (number, body) ->
        curl(@githubRepoUrl("issues/#{number}/comments"), body)

    commentCommit : (sha1, body) ->
        curl(@githubRepoUrl("commits/#{sha1}/comments"), body)

    comment : (body) ->
        if (@env.prNumber) isnt ''
            return @commentIssue(@env.prNumber, body)
        else
            return @commentCommit(@env.sha1, body)

module.exports = Bot
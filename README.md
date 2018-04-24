# GOCD cli client

[![Greenkeeper badge](https://badges.greenkeeper.io/reaktivo/gocd-cli.svg)](https://greenkeeper.io/)


## Install

    npm install -g gocd-cli

## How to use

    gocd status --endpoint ci-server.com/go --session XXXXXXXX

## Available commands

    # Get status of pipeline
    gocd status

    # Schedule a job in a pipeline
    gocd schedule

    # Pass in env variables to scheduled job with the `--env` flag
    gocd schedule --env "GIT_BRANCH=development NODE_ENV=development"

    # When setting env variables skipping setting value will make gocd use your real env variables.
    export GIT_BRANCH=development
    gocd schedule --env "GIT_BRANCH"

    # Get pipeline log
    gocd logs


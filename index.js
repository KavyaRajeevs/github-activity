#!/usr/bin/env node


import axios from "axios";
import chalk from "chalk";
const username = process.argv[2];

if (!username) {
  console.log(chalk.red("❌ Please provide a GitHub username."));
  console.log(`Usage: github-activity <username>`);
  process.exit(1);
}

const apiUrl = `https://api.github.com/users/${username}/events`;

axios.get(apiUrl)
  .then(response => {
    const events = response.data;

    if (events.length === 0) {
      console.log(chalk.yellow(`No recent activity found for ${username}.`));
      return;
    }

    console.log(chalk.blue.bold(`Recent GitHub Activity for ${username}:\n`));

    const messageCount = {};

    for (const event of events) {
      let message;

      switch (event.type) {
        case "PushEvent":
          const commits = event.payload.commits.length;
          message = `Pushed ${commits} commit(s) to ${event.repo.name}`;
          break;

        case "IssuesEvent":
          message = `${event.payload.action === 'opened' ? 'Opened' : 'Closed'} an issue in ${event.repo.name}`;
          break;

        case "IssueCommentEvent":
          message = `Commented on an issue in ${event.repo.name}`;
          break;

        case "WatchEvent":
          message = `Starred ${event.repo.name}`;
          break;

        case "ForkEvent":
          message = `Forked ${event.repo.name} to ${event.payload.forkee.full_name}`;
          break;

        case "PullRequestEvent":
          message = `${event.payload.action} a pull request in ${event.repo.name}`;
          break;

        default:
          message = `Did ${event.type} in ${event.repo.name}`;
      }

      messageCount[message] = (messageCount[message] || 0) + 1;
    }

    for (const [msg, count] of Object.entries(messageCount)) {
      if (count === 1) console.log(`- ${msg}`);
      else console.log(`- ${msg} ${chalk.gray(`(x${count})`)}`);
    }
  })
  .catch(error => {
    if (error.response && error.response.status === 404) {
      console.log(chalk.red(`❌ User "${username}" not found.`));
    } else {
      console.log(chalk.red(`❌ Error fetching data: ${error.message}`));
    }
  });
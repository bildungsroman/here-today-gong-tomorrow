const crypto = require('crypto');
const Slack = require('slack-node');
// This function will validate your payload from GitHub
// See docs at https://developer.github.com/webhooks/securing/#validating-payloads-from-github
function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}
// The webhook handler function
exports.gongHandler = async event => {
  // get the GitHub secret from the environment variables
  const token = process.env.GITHUB_WEBHOOK_SECRET;
  const calculatedSig = signRequestBody(token, event.body);
  let errMsg;
  // get the remaining variables from the GitHub event
  const headers = event.headers;
  const sig = headers['X-Hub-Signature'];
  const githubEvent = headers['X-GitHub-Event'];
  const body = JSON.parse(event.body);
  // set variables for a release event
  let releaseVersion, releaseUrl, author = null;
  if (githubEvent === 'published') {
    releaseVersion = body.release.tag_name;
    releaseUrl = body.release.html_url;
    author = body.release.author.login;
  }
  // get repo variables
  const { repository } = body;
  const repo = repository.full_name;
  const url = repository.url;
  
  // check that a GitHub webhook secret variable exists, if not, return an error
  if (typeof token !== 'string') {
    errMsg = 'Must provide a \'GITHUB_WEBHOOK_SECRET\' env variable';
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    };
  }
  // check validity of GitHub token
  if (sig !== calculatedSig) {
    errMsg = 'X-Hub-Signature incorrect. Github webhook token doesn\'t match';
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    };
  }

  // if the event is an 'update' event, gong the Slack channel!
  // const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  const webhookUri = process.env.SLACK_WEBHOOK_URL;

  const slack = new Slack();
  slack.setWebhook(webhookUri);

  // send slack message
  slack.webhook({
    channel: "#gong-test",
    username: "gongbot",
    icon_emoji: ":bell:",
    text: 'It\'s time to celebrate!  <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/8nBOF5sJrSE?start=11" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
  }, function(err, response) {
    console.log(response);
    if (err) {
      console.log('Something went wrong');
      console.log(err);
    }
  });
  
  if (githubEvent === 'published') {
    console.log('Release event! Bring on the gong!')
    console.log(`${author} pushed release version ${releaseVersion}. See it here: ${releaseUrl}!`)
  }

  // print some messages to the CloudWatch console (for testing)
  console.log('---------------------------------');
  console.log(`\nGithub-Event: "${githubEvent}" on this repo: "${repo}" at the url: ${url}.`);
  console.log('Contents of event.body below:');
  console.log(event.body);
  console.log('---------------------------------');
  
  // return a 200 response if the GitHub tokens match
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
    }),
  };

  return response;
};

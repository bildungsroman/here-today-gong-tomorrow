# Serverless Webhooks App

This is a modification of the [Serverless Webhooks Tutorial](https://docs.stackery.io/docs/tutorials/serverless-webhooks/) from Stackery.

## Deploy this to your AWS account

You can deploy this application to your own AWS account using the following two Stackery CLI commands:

`stackery create` will initialize a new repo in your GitHub account, initializing it with the contents of the referenced template repository.

```
stackery create --stack-name 'serverless-webhooks' \
--git-provider 'github' \
--template-git-url 'https://github.com/stackery/serverless-webhooks' 
```

`stackery deploy` will deploy the newly created stack into your AWS account.

```
stackery deploy --stack-name 'serverless-webhooks' \
--env-name 'development' \
--git-ref 'master'
```

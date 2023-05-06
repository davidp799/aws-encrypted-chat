# ☁️ AWS Encrypted Chat 💬

AWS Encrypted Chat is a chat service based on AWS and NextJS.

## Frontend Architecture

AWS Encrypted Chat uses the NextJS React Framework and is hosted using AWS Amplify.
        
## Backend Architecture

AWS Encrypted Chat uses the following AWS Services:
* Amazon Cogito for authentication.
* AWS AppSync for mapping databases and real-time notifications.
* AWS Lambda for creating initialization triggers for adding users to the database with Amazon Cognito, providing a list of active and inactive users.
* Amazon DynamoDB for creating a multi-table database for users and messages.
* Amazon S3 for storing user uploads and front-end web resources.

<p align="center">
        <img src="/images/architecture-diagram.png" width="500">
</p>

## Getting Started:

### Required Software:
- Node.js (Windows/Mac/Linux):
Node.js is an asynchronous event-driven JavaScript runtime designed to build scalable network applications. To install Node.js, visit the Node.js <a href="https://nodejs.org/en/download" download>download page</a> and select the version relevant to your machine.
- VS Code (Windows/Mac/Linux):
If you do not have a preffered editor, VS Code is a useful editor for this project. To install VS Code, visit the Visual Studio Code <a href="https://code.visualstudio.com/Download" download>download page</a>.

### Running The Application:
- Once all required software is installed, navigate to the working directory through your terminal and enter `npm run dev`.
- Now, visit `localhost:3000/`. 
- If you run into the error ```Error: error:0308010C:digital envelope routines::unsupported```, you will either need to downgrade your Node.js to version 16 or enable the legacy OpenSSL provider, then retry `npm run dev`:

On Unix-like (Linux, macOS, Git bash, etc.):
```
export NODE_OPTIONS=--openssl-legacy-provider
```
On Windows command prompt:
```
set NODE_OPTIONS=--openssl-legacy-provider
```
On PowerShell:
```
$env:NODE_OPTIONS = "--openssl-legacy-provider"
```
 
### Amazon Cognito

The `lib/authStack.ts` file creates the following services

- Cognito user pool
- Cognito user pool group (if specified)
- Cognito identity pool

🗒️ The identity pool helps in providing IAM permission access to both authenticated and unauthenticated users as well as AWS services such as Amazon S3.

### AWS Lambda

The `lib/functions` directory contains a `postConfirmationTrigger` folder. The Lambda function in this folder adds a user to DynamoDB after a user signs up through our Cognito service.

### Amazon Simple Storage Service (Amazon S3)

The `lib/fileStorage.ts` file creates an Amazon S3 bucket and comes configured with managed polices that are in line with what the [Amplify Storage](https://docs.amplify.aws/cli/storage/import/#configuring-iam-role-to-use-amplify-recommended-policies) library uses as acceptable defaults.

### AWS AppSync API

The`lib/apiStack.ts` file creates an AWS AppSync API that is based on a `Todo` application.

In addition, this package makes use of the `@aws-cdk/aws-appsync-alpha` [npm package](https://www.npmjs.com/package/@aws-cdk/aws-appsync-alpha) for easily creating the request and response mapping templates.

### Amazon DynamoDB API

The `lib/databaseStack.ts` file creates a single DynamoDB table that is used as a datasource for the AWS AppSync API above.

## Useful commands

- `npm run dev` compile to js and host on local server
- `npm run watch` watch for changes and compile
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## License

This library is licensed under the MIT-0 License. For more information, see the LICENSE file.

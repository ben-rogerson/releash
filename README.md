# Releash

A CLI tool to view [Unleash](https://www.getunleash.io/) feature flag details from the command line without needing to access the [Unleash web interface](https://app.unleash-hosted.com/sign-in).

🔥 **Flag details**<br>
Quickly access your flag details, seeing possible issues highlighted.

📈 **Coming soon: Flag reports**<br>
View and export detailed flag reports of your flags.

💊 **Coming soon: Health score display**<br>
View Unleash health scores for each flag.

## Getting started

```bash
$ npm install --global releash
```

Now open the installation folder and create a new file named `config.json`.

Add your unleash hosting URL and TOKEN, it'll look something like this:

```json
{
  "URL": "https://us.app.unleash-hosted.com/usbb0000/",
  "TOKEN": "user:123123123123123123123123123123123",
  "PROJECT": "Default" // Optional: Open a project by default
}
```

Start the CLI:

```shell
releash

# Or specify a project
releash --project Project
```

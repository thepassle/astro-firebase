# astro-firebase

Deploy your server-side rendered (SSR) Astro app to [Firebase](https://firebase.google.com/).

Use this adapter in your Astro configuration file, alongside a valid deployment URL:

```js
import { defineConfig } from 'astro/config';
import firebase from 'astro-firebase';

export default defineConfig({
  adapter: firebase(),
});
```

After you build your site the `functions/` folder will contain your [Firebase Function](https://firebase.google.com/docs/functions) that runs Astro.

Now you can deploy!

```shell
firebase deploy
```

## Configuration

### packageJson

Firebase Functions requires your `functions/` folder to contain a `package.json`. We create a default `package.json` based on the `package.json` in your root. If you want to override some options, like for example the node version that Firebase should use, you can configure the `packageJson` property.

```js
import { defineConfig } from 'astro/config';
import firebase from 'astro-firebase';

export default defineConfig({
  adapter: firebase({
    packageJson: {
      engines: {
        node: '18'
      }
    }
  })
});
```

## FAQ

### 403 `Error: Forbidden Your client does not have permission to get URL / from this server`

If you're getting a 403 after deploying your project, it could be the case that you have to change the permissions of your Firebase Function. You can do this by following these steps:

- Go to your [Firebase Console](https://console.firebase.google.com/)
  - Select your firebase project
  - Select `Functions` in the menu on the left
  - Hover over your `handler` function in the Functions list in the `Dashboard`, a three-dotted menu button should appear, click it
  - Click `Detailed usage stats`, this will take you to Google Cloud Platform
    - Click the `permissions` tab
    - Click `+ ADD`
    - in the `New principals` field, enter: `"allUsers"`
    - in the `Select a role` menu, enter: `Cloud Functions` -> `Cloud Functions Invoker`
    - ✅ Done 

You should now be able to view your app.
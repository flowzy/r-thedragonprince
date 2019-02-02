### This theme is at a very early stage in development and may change substantially.

---

> Easy to setup theme development project, primarily for [r/TheDragonPrince](https://old.reddit.com/r/TheDragonPrince)

[![license](https://img.shields.io/github/license/flowzy/r-thedragonprince.svg)](LICENSE)
![dependencies](https://img.shields.io/david/flowzy/r-thedragonprince.svg)
[![build status](https://img.shields.io/travis/com/flowzy/r-thedragonprince.svg)](https://travis-ci.org/flowzy/r-thedragonprince)

<!-- Generated using: http://godban.github.io/browsers-support-badges/ -->
| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" /></br>Edge | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" /></br>Firefox | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" /></br>Chrome | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" /></br>Safari |
| --------- | --------- | --------- | --------- |
| last version| last version| last version| last version

TL;DR - Cross-browser support is very narrow at the moment.

# Table of content
* [Getting started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Installation](#installation)
    * [Usage](#usage)
* [Contributing](#contributing)
* [Acknowledgment](#acknowledgment)
* [License](#license)

# Getting started
Before you start your development on the project, you need go through a couple of steps to setup your environment.

## Prerequisites
Download and install the following software:
* [NodeJS](https://nodejs.org/en/download/)
* [Yarn](https://yarnpkg.com/)
* [git](https://git-scm.com/downloads) (recommended, but not required)
* [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) (for Chrome) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (for Firefox)

After you've done that, you now need to allow your browser to connect to "insecure" localhost:
* Chrome
    * visit [chrome://flags/#allow-insecure-localhost](chrome://flags/#allow-insecure-localhost)
    * choose "Enabled" from the dropdown list
    * restart your browser
* Firefox
    * visit https://localhost:8080/
    * click "Advanced"
    * then click "Add Exception..."
    * _at this step, if the certificate is not showing up, click "Get Certificate"_
    * add the exception by clicking "Confirm Security Exception"

## Installation
Now that you've setup your environment, you can start downloading and installing the project.

1. Clone the repository and `cd` into it:
    ```bash
    $ git clone https://github.com/flowzy/r-thedragonprince.git
    $ cd ./r-thedragonprince
    ```
    > _or download the project as a ZIP._

2. Install dependencies, using Yarn:
    ```bash
    $ yarn install
    ```
3. Open [this link](https://github.com/flowzy/r-thedragonprince/raw/master/userscript.user.js) and install the userscript.
4. At this point you should be all set and ready to go.

## Usage
Generate SSL certificates, start a local development server and watch for file changes:
```bash
$ yarn dev
```

---

Minimize the CSS file size, optimize images and rewrites CSS `url(...)` to comply with Reddit's syntax:
```bash
$ yarn prod
```

---

Combine both of the above tasks without rewriting `url(...)` to keep real image path:
```bash
$ yarn prod-test
```

---

Run `yarn prod-test` without image optimization (useful for users with weaker CPUs):
```bash
$ yarn prod-test-light
```

> Although image optimization is the most demanding task in this project, it only really runs once. After that, it stores optimized images in the cache folder (`.cache` in this case) and uses that instead for later builds. You can read on that [here](https://www.npmjs.com/package/imagemin-webpack-plugin#optionscachefolder).

---

You can also choose a header image by passing an argument `env.header` like so:

```bash
$ yarn <any of the above> --env.header=<number>
```

`number` - from 1 to the amount of header variants inside of `src/img/headers/` directory.

---

Finally, to make sure the bundle size doesn't exceed Reddit's limit, use:

```bash
yarn test
```

If this command fails, that means that one of the assets (be it an image or a stylesheet) exceeds the limit and needs more optimization applied.

**Note:** This command will run `yarn prod` beforehand, which compresses image assets.

# Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

# Acknowledgment
[@ncla](https://github.com/ncla) and his project "[musereddit](https://github.com/ncla/musereddit)" was a great starting point and helped me kickstart the initial development.

### [License](LICENSE)
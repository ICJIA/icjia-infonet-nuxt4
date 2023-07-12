[![Netlify Status](https://api.netlify.com/api/v1/badges/f9b9ef26-d98b-4df5-8d10-77c1a2b72189/deploy-status)](https://app.netlify.com/sites/icjia-infonet/deploys) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# InfoNet

Infonet blurb here

## Site

TBD

## Install

```bash
git clone https://github.com/ICJIA/icjia-infonet-nuxt3.git
cd icjia-infonet-nuxt3
cp .env.sample .env
yarn install
nvm use
```

> Note: If you don't have `nvm` installed, you can install it with `brew install nvm` or `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`

## Start development server

Start the development server on http://localhost:8000

```bash
yarn dev
https://localhost:8000
```

## Preview

```bash
yarn preview
```

## Manually generate static site and serve locally (port 3000):

```bash
yarn generate:serve
```

> Note: Vercel's 'Serve' must be installed globally: `npm install -g serve`

## Manually run build scripts for a remote API (i.e., a headless CMS such as Strapi)

```bash
yarn scripts
```

## Manually run build scripts for a local API (i.e., no backend -- all local data)

```bash
yarn scripts:local
```

## Production

Build the application for production:

```bash
yarn generate
```

_Netlify will automatically deploy the live site when changes are pushed to the master branch._

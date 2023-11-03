[![Netlify Status](https://api.netlify.com/api/v1/badges/f9b9ef26-d98b-4df5-8d10-77c1a2b72189/deploy-status)](https://app.netlify.com/sites/icjia-infonet/deploys) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# InfoNet

InfoNet is a web-based data collection and reporting system used by victim service providers in Illinois. The system is nationally recognized for facilitating standardized data collection and reporting at the statewide level. Initial development of InfoNet began in the mid-90s as a collaborative effort between the Illinois Criminal Justice Information Authority, the Illinois Coalition Against Sexual Assault, and the Illinois Coalition Against Domestic Violence. Since then, InfoNet has grown to include partnerships with the Illinois Department of Human Services and the Children’s Advocacy Centers of Illinois.

The primary purposes of InfoNet are to:

- Standardize data collection and reporting, thereby improving the ability to analyze information statewide and locally.

- Provide a central repository for statewide victim service data.

- Ease reporting for victim service providers that receive grants from multiple funding agencies, which often require different types of information. Facilitate continuous strategic planning for improving services and system response to victims.

## Site

https://infonet.icjia.illinois.gov

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

# URL Shortener

## Description
This is a small personal url-shortener based on [Cloudflare Workers](https://workers.cloudflare.com/) and the Workers KV. 

The whole shortener consists of three applications. The Shortener service that redirects the short-urls to the original urls. A Worker that works as api to create, edit and delete urls. And a small dashboard to interact with the api.

## Usage

1. **clone the repo via `git clone`**.
2. **change the `wrangler.example.toml` files to `wrangler.toml` and insert your account id and KV-IDs.**
	- *hint: if you change the KV Namespace also change it at the `bindings.d.ts`*
3. **install all dependecies via `yarn`**.
   - *hint: if you want to use `yarn v1` just delete `.yarn` and `.yarnrc.yml`*
   - *hint: if you want to use `npm` just delete `.yarn`, `.yarnrc.yml` and `yarn.lock` and run `npm install`*
5. **For security reasons you have to add a secret api key to the api and dashboard via `wrangler secret put SECRET_API_KEY` in the specific directory**
4. **Happy development 😁**
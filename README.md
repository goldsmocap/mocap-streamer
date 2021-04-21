# Run Locally - Development

1. Start the remote axis-streamer: run `yarn remote dev` from the project root.

    This starts the remote server running on `locahost` port `3000`.

2. Start the local axis-streamer: in a new terminal run `yarn local dev` from the project root.

    This starts the local server running on `localhost` port `4000`.

3. Start the web-ui: in a new terminal run `yarn local-webui serve` from the project root.

# Local Streamer

## How to create executable

- Make sure you have `pkg` installed. This can be installed via npm (`npm install -g pkg`) or yarn (`yarn global add pkg`).
- From the root of the project run `yarn local pkg`.
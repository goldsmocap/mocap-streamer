# Run Locally - Development

1. Start the remote axis-streamer: run `yarn remote dev` from the project root.

    This starts the remote server running on `locahost` port `3000`.

2. Start the local axis-streamer: in a new terminal run `yarn local dev` from the project root.

    This starts the local server running on `localhost` port `4000`.

3. Start the web-ui: in a new terminal run `yarn local-webui serve` from the project root.

# Making a release

### Create and publish docker image to docker hub

*NOTE: Docker and access to the axis-streamer DockerHub account is required for this step*

1. Open a terminal and navigate to the `remote` folder.

2. Login to the axis-streamer DockerHub account. `docker login -u goldsmithsmocap`

3. Enter password when prompted.

4. Build the docker image. `docker build -t goldsmithsmocap/remote-streamer:<tag> -t goldsmithsmocap/remote-streamer:latest .`

5. Once built push these images to the DockerHub repo. `docker push goldsmithsmocap/remote-streamer --all-tags`

### Run docker image on Digital Ocean server

TODO: write this!

### Create executable for local streamer

- Make sure you have `pkg` installed. This can be installed via npm (`npm install -g pkg`) or yarn (`yarn global add pkg`).
- From the root of the project run `yarn local pkg`.
FROM node:14 as builder
RUN mkdir -p /usr/axis-streamer
WORKDIR /usr/axis-streamer
COPY package.json /usr/axis-streamer/
RUN npm install
COPY . /usr/axis-streamer
RUN npm run build

FROM node:14
RUN mkdir -p /usr/axis-streamer
WORKDIR /usr/axis-streamer
COPY --from=builder /usr/axis-streamer/dist /usr/axis-streamer/dist
COPY --from=builder /usr/axis-streamer/node_modules /usr/axis-streamer/node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
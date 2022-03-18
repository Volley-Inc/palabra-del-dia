FROM node:16-buster-slim

# Create Directory for the Container
WORKDIR /usr/src/app

EXPOSE 80

CMD [ "npm", "start" ]

# Only copy the package.json file to work directory
ARG NPM_TOKEN
COPY docker/.npmrc .npmrc
COPY tsconfig.json .
#COPY google.json .
COPY .npmignore .
COPY package.json .
COPY package-lock.json .
RUN npm ci
RUN rm -f .npmrc

COPY src ./src
RUN npm run build

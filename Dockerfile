FROM node:10-alpine

RUN apk add --update make git

WORKDIR /opt/insurello

# Copy Makefile
COPY Makefile /opt/insurello

# Install dependencies
COPY package.json /opt/insurello
RUN make setup

# Build
COPY . /opt/insurello
RUN make build

CMD ["npm", "run", "start-js"]

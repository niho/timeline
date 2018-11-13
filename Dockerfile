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

# Entrypoint
RUN ["chmod", "+x", "./docker-entrypoint.sh"]
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]

CMD ["npm", "run", "start-js"]

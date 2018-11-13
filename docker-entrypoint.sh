#!/bin/sh
/opt/insurello/node_modules/.bin/knex migrate:latest
exec "$@"

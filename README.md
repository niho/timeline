# Changelog

Event sourced data store designed for auditing.


## Services

| Name | Description |
|:-----|:------------|
| `changelog.commit` | Commit one or multiple events on a timeline. |
| `changelog.fetch` | Fetch a list of commits on a timeline. |

#### Headers

Both the commit and fetch service uses the `x-timeline` header to decide which timeline the request is intended for. The commit service also uses the `x-author` header to decide the author for the commit(s).


## Topics

| Exchange | Description |
|:-----|:------------|
| `changelog` | All newly created commits are published on this topic exchange with the timeline id as the routing key. |


## Message format

### Event

| Field | Type | Required | Description |
|:------|:----:|:--------:|:------------|
| `event` | string | yes | The name of the event. |
| `payload` | mixed | yes | The payload of the event. Can be any valid JSON type (including `null`). |
| `thread` | string | no | A commit id in the timeline that indicates the thread the event is associated with (default is `null`, i.e. no thread). |


### Commit

| Field | Type | Required | Description |
|:------|:----:|:--------:|:------------|
| `id` | string | yes | The commit id (globally unique). |
| `parent` | string | no | The id of the previous commit in the timeline according to a logical ordering. If the commit is the first in the timeline this value is `null`. |
| `timestamp` | string | yes | The point in time the commit was created. |
| `timeline` | number | yes | The timeline id. |
| `event` | string | yes | The name of the event. |
| `payload` | mixed | yes | The payload of the event. Can be any valid JSON type (including `null`). |
| `thread` | string | no | A commit id in the timeline that indicates the thread the event is associated with. |
| `author` | string | no | The author of the commit. |


## Environment variables

| Name | Format | Default | Description |
|:-----|:------:|:-------:|:------------|
| `AMQP_URL` | URL | `amqp://guest:guest@localhost:5672` | Address to the AMQP broker. |
| `DATABASE_CLIENT` | String | `pg` | The database client to use. |
| `DATABASE_URL` | URL | n/a | The connection URL for the database. |
| `DATABASE_SEARCH_PATH` | String | n/a | The database schema to use. |


## Getting started

```sh
make          # Build the project and run tests
make format   # Format code according to style guide
make test     # Run tests
npm start     # Start the worker
```

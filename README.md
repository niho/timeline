# Timeline

An simple library for creating auditable Merkle trees of threaded events.

## How does it work?

A timeline is a logical sequence of `Commit` objects that are chained together in a Merkle chain, similar to how a Git repository works. A commit can optionally belong to a "thread" which is the id of a previous commit in the timeline. A thread is a conceptual grouping of multiple commits, yet the overall logical ordering of the chain is still linear. A timeline is in that sense a hybrid between a tree and a chain. It can be handled and presented as a tree, but it still remains a simple chain.

Commits are created from `Event` objects. Events are much simpler, only containing an event type, a payload and an optional thread id. Events can be grouped together in transactions. When you commit a group of events each event will be turned into a commit and added to the history. If any pre-condition fails no commits will be created.

## Data types

### Event

| Field     |  Type  | Required | Description                                                                                                             |
| :-------- | :----: | :------: | :---------------------------------------------------------------------------------------------------------------------- |
| `event`   | string |   yes    | The name of the event.                                                                                                  |
| `payload` | mixed  |   yes    | The payload of the event. Can be any valid JSON type (including `null`).                                                |
| `thread`  | string |    no    | A commit id in the timeline that indicates the thread the event is associated with (default is `null`, i.e. no thread). |

### Commit

| Field       |  Type  | Required | Description                                                                                                                                     |
| :---------- | :----: | :------: | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`        | string |   yes    | The commit id (globally unique).                                                                                                                |
| `parent`    | string |    no    | The id of the previous commit in the timeline according to a logical ordering. If the commit is the first in the timeline this value is `null`. |
| `timestamp` | string |   yes    | The point in time the commit was created.                                                                                                       |
| `timeline`  | number |   yes    | The timeline id.                                                                                                                                |
| `event`     | string |   yes    | The name of the event.                                                                                                                          |
| `payload`   | mixed  |   yes    | The payload of the event. Can be any valid JSON type (including `null`).                                                                        |
| `thread`    | string |    no    | A commit id in the timeline that indicates the thread the event is associated with.                                                             |
| `author`    | string |    no    | The author of the commit.                                                                                                                       |

## Getting started

```sh
make          # Build the project and run tests
make format   # Format code according to style guide
make test     # Run tests
```

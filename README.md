# Timeline

An simple library for creating auditable Merkle trees of threaded events.

## How does it work?

A timeline is a logical sequence of `Commit` objects that are chained together in a Merkle chain, similar to how a Git repository works. A commit can optionally belong to a "thread" which is the id of a previous commit in the timeline. A thread is a conceptual grouping of multiple commits, yet the overall logical ordering of the chain is still linear. A timeline is in that sense a hybrid between a tree and a chain. It can be handled and presented as a tree, but it still remains a simple chain.

Commits are created from `Event` objects. Events are much simpler, only containing an event type, a payload and an optional thread id. Events can be grouped together in transactions. When you commit a group of events each event will be turned into a commit and added to the history. If any pre-condition fails no commits will be created.

## Example usage

```typescript
import { Event, Commit, timeline } from "timeline";

// Load the current history from a database.
let history: Commit[] = [...];

// You need to specify the author of the events.
const author = "John Doe";

// The list of events.
const events: Event[] = [{
  event: "example",
  payload: "Hello world!",
  thread: null
}];

// A validation function that can be used to check pre-conditions.
// You can add any number of validation functions using the `validate()`
// function on a timeline object.
const isValidExampleEvent = (event, history) =>
  event.event === "example" && typeof event.payload === "string" ?
    Promise.resolve() :
    Promise.reject();

timeline("42", history)
  .validate(isValidExampleEvent)
  .commit(author, events)
  .then((commits) => {
    // We can now update the history with the new commits
    // (or more likely, save them in a database).
    history = history.concat(commits);
  });
```

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
| `timestamp` | number |   yes    | The point in time the commit was created.                                                                                                       |
| `timeline`  | string |   yes    | The timeline id.                                                                                                                                |
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

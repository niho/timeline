import * as Bluebird from "bluebird";
import * as rabbot from "rabbot";
import { Commit } from "./commit";

export const publish = (commits: Commit[]) =>
  Bluebird.each(commits, commit =>
    rabbot.publish("changelog", {
      routingKey: commit.timeline.toString(),
      type: commit.event,
      messageId: commit.id,
      headers: {
        "x-commit-event": commit.event,
        "x-commit-parent": commit.parent,
        "x-commit-timeline": commit.timeline.toString()
      },
      body: commit,
      persistent: true
    })
  );

import { Database } from "./db";
import { Datastore } from "./timeline";

export const defaultStore = function($db: Database): Datastore {
  return {
    fetch: id =>
      $db
        .select()
        .from("commits")
        .where("timeline", id)
        .orderBy("timestamp", "asc")
        .then(_commits => _commits),

    insert: (_id, commits) => {
      if (commits.length === 0) {
        return Promise.resolve([]);
      }
      return $db.transaction(trx => {
        return trx
          .insert(commits)
          .into("commits")
          .return(commits);
      });
    }
  };
};

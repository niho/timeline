exports.up = function(knex, Promise) {
  return knex.schema.createTable("commits", (t) => {
    t.string("id").notNullable();
    t.string("parent");
    t.integer("timeline").notNullable();
    t.string("event").notNullable();
    t.timestamp("timestamp").notNullable();
    t.json("payload");
    t.primary("id");
    t.unique("parent");
    t.index(["timeline", "timestamp"]);
    t.index(["timeline", "event"]);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("commits");
};

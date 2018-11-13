exports.up = function(knex, Promise) {
  return knex.schema.table("commits", (t) => {
    t.string("author");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table("commits", (t) => {
    t.dropColumn("author");
  });
};

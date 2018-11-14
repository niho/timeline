exports.up = function(knex, Promise) {
  return knex.schema.table("commits", (t) => {
    t.string("thread").references("id");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table("commits", (t) => {
    t.dropColumn("thread");
  });
};

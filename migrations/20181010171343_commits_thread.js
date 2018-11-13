exports.up = function(knex, Promise) {
  return knex.schema.table("commits", (t) => {
    t.string("thread").references("id");
    knex.schema.raw("ALTER TABLE commits CONSTRAINT ADD not_self_threading CHECK ( thread <> id )");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table("commits", (t) => {
    t.dropColumn("thread");
  });
};

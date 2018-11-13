exports.up = function(knex, Promise) {
  return knex.schema.table("commits", (t) => {
    t.foreign("timeline")
      .references("id")
      .inTable("public.insurance_cases")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropForeign("timeline");
};

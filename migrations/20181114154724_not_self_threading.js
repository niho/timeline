exports.up = function(knex, Promise) {
  return knex.schema.raw("ALTER TABLE commits ADD CONSTRAINT not_self_threading CHECK ( thread <> id )");
};

exports.down = function(knex, Promise) {
  return knex.schema.raw("ALTER TABLE commits DROP CONSTRAINT not_self_threading");
};

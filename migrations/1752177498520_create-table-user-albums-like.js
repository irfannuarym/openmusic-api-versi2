exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('user_albums_like', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    albumId: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
  pgm.addConstraint('user_albums_like', `unique_user_id_and_'albumId'`, `UNIQUE(user_id, "albumId")`);
  pgm.addConstraint('user_albums_like', 'fk_user_albums_like.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('user_albums_like', `fk_user_albums_like.'albumId'_albums.id`, 'FOREIGN KEY("albumId") REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('user_albums_like');
};
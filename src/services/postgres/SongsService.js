const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._songs = [];
  }

  addSong({ title, year, performer, genre, duration, albumId }) {
    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newSong = {
      id, title, year, performer, genre, duration, albumId, insertedAt, updatedAt,
    };

    this._songs.push(newSong);

    return id;
  }

  getSongs() {
    return this._songs;
  }

  getSongById(id) {
    const song = this._songs.find((s) => s.id === id);
    if (!song) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    return song;
  }

  editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const index = this._songs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    const updatedAt = new Date().toISOString();

    this._songs[index] = {
      ...this._songs[index],
      title,
      year,
      performer,
      genre,
      duration,
      albumId,
      updatedAt,
    };
  }

  deleteSongById(id) {
    const index = this._songs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
    }

    this._songs.splice(index, 1);
  }
}

module.exports = SongsService;

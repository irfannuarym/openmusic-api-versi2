class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);

    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongFromPlaylistHandler = this.getSongFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);

    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, owner });

    return h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: { playlistId },
    }).code(201);
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;
    const filteredplaylists = await this._service.getPlaylists(owner);

    return {
      status: 'success',
      data: {
        playlists: filteredplaylists.map((playlists) => ({
          id: playlists.id,
          name: playlists.name,
          username: playlists.username,
        })),
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id: owner } = request.auth.credentials;
    const { id } = request.params;

    await this._service.verifyPlaylistOwner(id, owner);
    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, owner);
    await this._service.verifySong(songId);
    await this._service.addSongToPlaylist(playlistId, songId);
    // await this._service.postActivity(playlistId, songId, owner, 'add');

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongFromPlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, owner);
    const playlist = await this._service.getSongsFromPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, owner);
    await this._service.deleteSongFromPlaylist(playlistId, songId);
    // await this._service.postActivity(playlistId, songId, owner, 'delete');

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, owner);

    const activitiesFiltered = await this._service.getPlaylistActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities: activitiesFiltered.map((activity) => ({
          username: activity.username,
          title: activity.title,
          action: activity.action,
          time: activity.time,
        })),
      },
    };
  }
}

module.exports = PlaylistsHandler;

require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const authentications = require('./api/authentications');
const users = require('./api/users');
const albums = require('./api/albums');
const songs = require('./api/songs');
const playlists = require('./api/playlists');
const collaborations = require('./api/collaborations');

const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const UsersService = require('./services/postgres/UsersService');
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');

const AuthValidator = require('./validator/authValidator');
const UsersValidator = require('./validator/usersValidator');
const AlbumValidator = require('./validator/albumValidator');
const SongValidator = require('./validator/songValidator');
const PlaylistValidator = require('./validator/playlistValidator');
const PlaylistSongsValidator = require('./validator/playlistSongsValidator');
const CollaborationsValidator = require('./validator/collaborationValidator');

const TokenManager = require('./utils/tokenize');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register(Jwt);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  const authenticationsService = new AuthenticationsService();
  const usersService = new UsersService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);

  await server.register([
    {
      plugin: authentications,
      options: {
        authService: authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: {
          validatePlaylistPayload: PlaylistValidator.validatePlaylistPayload,
          validatePlaylistSongPayload: PlaylistSongsValidator.validatePlaylistSongPayload,
        },
      },
    },
    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: response.message,
        }).code(response.statusCode);
      }

      if (!response.isServer) {
        return h.continue;
      }

      console.error(response);
      return h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami',
      }).code(500);
    }

    return h.continue;
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      status: 'success',
      message: 'Server OpenMusic V2 aktif!',
    }),
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();

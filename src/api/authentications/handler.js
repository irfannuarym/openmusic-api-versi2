class AuthenticationsHandler {
  constructor(authService, usersService, tokenManager, validator) {
    this._authService = authService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthPayload(request.payload);

    const { username, password } = request.payload;
    const id = await this._usersService.verifyUserCredential(username, password);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    await this._authService.addRefreshToken(refreshToken);

    return h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: { accessToken, refreshToken },
    }).code(201);
  }

  async putAuthenticationHandler(request) {
    this._validator.validatePutAuthPayload(request.payload);
    const { refreshToken } = request.payload;

    await this._authService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id });

    return {
      status: 'success',
      message: 'Access token berhasil diperbarui',
      data: { accessToken },
    };
  }

  async deleteAuthenticationHandler(request) {
    this._validator.validateDeleteAuthPayload(request.payload);
    const { refreshToken } = request.payload;

    await this._authService.verifyRefreshToken(refreshToken);
    await this._authService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
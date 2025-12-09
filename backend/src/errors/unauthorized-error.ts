class UnauthorizedError extends Error {
  public statusCode: number;

  constructor(message: string = 'Необходима авторизация') {
    super(message);
    this.statusCode = 401;
  }
}

export default UnauthorizedError;

class NotFoundError extends Error {
  public statusCode: number;

  constructor(message: string = 'Маршрут не найден') {
    super(message);
    this.statusCode = 404;
  }
}

export default NotFoundError;

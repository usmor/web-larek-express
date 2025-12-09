class BadRequestError extends Error {
  public statusCode: number;

  constructor(message: string = 'Ошибка валидации данных') {
    super(message);
    this.statusCode = 400;
  }
}

export default BadRequestError;

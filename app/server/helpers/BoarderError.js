export const BoarderClientError = class extends Error {
  constructor(message, status = 400) {
    super(message);

    this.status = status;
    this.expose = true;
    this.headers = {
      'Custom-Error': 'true'
    };
  }
};

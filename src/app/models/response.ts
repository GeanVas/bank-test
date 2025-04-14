export default class ApiResponse<T> {
  message: string;
  data: T;
  name?: string;

  constructor(message: string, data: T, name?: string) {
    this.message = message;
    this.data = data;
    this.name = name;
  }
}
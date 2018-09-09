export namespace RadixNs {

  export interface Response {
    id: number;
    result: { token: string }
    params: { TEST: string }
    method: string;
    error: Error;
  }

  export class Registration {
    data: string;
    constructor (name: string, description: string, permissions: string[]) {
      this.data = JSON.stringify({
        jsonrpc: '2.0',
        method: 'register',
        params: {
          'name': name,
          'description': description,
          'permissions': permissions
        },
        id: 0
      });
    }
  }

  export class Login {
    data: string;
    token: string;
    constructor (token: string) {
      this.token = token;
      this.data = JSON.stringify({
        jsonrpc: '2.0',
        method: 'ping',
        params: {
          'token': token
        },
        id: 9
      });
    }
  }

}

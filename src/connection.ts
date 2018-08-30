import { Subject, Observer, Subscription } from 'rxjs';
import { WebSocket } from 'ws';
import { resolve } from 'path';

class Messages extends Subject<any> {
  private items: Observer<any>[] = [];

  constructor() {
    super();
  }

  public add(item: Observer<any>): void {
    if (this.observers.length > 0) {
      this.next(item);
    } else {
      this.items.push(item);
    }
  }

  public subscribeToMessages(observer: Observer<any>) {
    const subscription: Subscription = super.subscribe(observer);

    this.items.forEach((item: Observer<any>) => this.next(item));
    this.items = [];
    return subscription;
  }
}

export class Connection {
  private token: Subject<string>;
  private message: Messages;
  private socket: WebSocket;
  
  public register(name: string, description: string, permissions: string) {
    const request: any = JSON.stringify({
      jsonrpc: '2.0',
      method: 'register',
      params: {
        'name': name,
        'description': description,
        'permissions': permissions
      },
      is: 0
    });

    return new Promise((resolve, reject) => {
      this.socket = new WebSocket('ws://localhost:54345');
    });
  }
}
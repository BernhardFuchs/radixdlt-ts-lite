import { Subject, Observer, Subscription } from 'rxjs';
import WebSocket = require('ws');
import Data = WebSocket.Data;

import { RadixNs } from './models/radix-namespace';
import Registration = RadixNs.Registration;
import Response = RadixNs.Response;

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
  private socket: WebSocket;

  private token: Subject<string> = new Subject();
  private message: Messages = new Messages();

  private tokenValue: string = '';

  private getAddress = new Subject();
  private getBalance = new Subject();
  private sendTransaction = new Subject();
  private getTransactions = new Subject();
  private sendMessage = new Subject();
  private getMessages = new Subject();
  private sendApplicationMessage = new Subject();
  private getApplicationMessages = new Subject();
  
  constructor () {
    this.socket = new WebSocket('localhost:54345', 'ws');
  }
  
  public register(registration: Registration): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.onopen = () => this.handleOpen(registration.data, resolve, reject);
      this.socket.onmessage = (evt) => this.handleResponse(evt.data);
    });
  }

  private handleOpen(registrationData: string, resolve: any, reject: any) {
    this.socket.send(registrationData);
    this.token.subscribe(
      token => {
        resolve();
        this.tokenValue = token;
        this.message.subscribe((msg: any) => {
          msg.params.token = token;
          msg = JSON.stringify(msg);
          this.socket.send(msg);
        });
      },
      error => reject(error)
    );
  }

  handleResponse(resData: Data): any {
    const parsedResponse: Response = JSON.parse(resData.toString());
    if (parsedResponse.hasOwnProperty('result') || parsedResponse.hasOwnProperty('params')) {
      this.getResponse(parsedResponse);
    } else {
      this.getError(parsedResponse);
    }
  }

  getResponse(response: Response) {
    switch (response.id) {
      case 0: // register
        this.token.next(response.result.token);
        break;
      case 1: // getAddress
        this.getAddress.next(response.result);
        break;
      case 2: // getBalance
      case 4: // getTransactions
      case 6: // getMessages
      case 8: // getApplicationMessages
        // console.log(response.result);
        break;
      case 3: // sendTransaction
        this.sendTransaction.next(response.result);
        break;
      case 5: // sendMessage
        this.sendMessage.next(response.result);
        break;
      case 7: // sendApplicationMessage
        this.sendApplicationMessage.next(response.result);
        break;
      case 9: // connect
        this.token.next(this.tokenValue);
        break;
      default:
        switch (response.method) {
          case 'balance.update':
            this.getBalance.next(response.params.TEST);
            break;
          case 'transaction.update':
            this.getTransactions.next(response.params);
            break;
          case 'message.update':
            this.getMessages.next(response.params);
            break;
          case 'applicationmessage.update':
            this.getApplicationMessages.next(response.params);
            break;
          default:
            console.log('The method is not supported');
            break;
        }
        break;
    }
  }
  getError(response: Response) {
    switch (response.id) {
      case 0: // register
        this.token.error(response.error);
        break;
      case 1: // getAddress
        this.getAddress.error(response.error);
        break;
      case 2: // getBalance
      case 4: // getTransactions
      case 6: // getMessages
      case 8: // getApplicationMessages
        // console.log(response.result);
        break;
      case 3: // sendTransaction
        this.sendTransaction.error(response.error);
        break;
      case 5: // sendMessage
        this.sendMessage.error(response.error);
        break;
      case 7: // sendApplicationMessage
        this.sendApplicationMessage.error(response.error);
        break;
      case 9: // connect
        this.token.error(response.error);
        break;
      default:
        console.log('The method is not supported');
        break;
    }
  }
}
import { Connection } from '../connection';
import { RadixNs } from '../models/radix-namespace';
import Registration = RadixNs.Registration;
import Login = RadixNs.Login;

const registration = new Registration('testreg', 'descr blah', ['address', 'balance']);
const connection = new Connection();
connection.register(registration)
  .then(
    () => {
      console.log('#### register successfull');
      testConnect(connection.getTokenValue());
  })
  .catch((err) => console.log('#### ERIOR reg: ', err));

function testConnect(token: string) {
  const login = new Login(token);
  connection.connect(login)
    .then(() => console.log('#### connect successfull'))
    .catch((err) => console.log('#### ERIOR connect: ', err));
}

import Web3 from "web3";
import config from "config";
import fs from 'fs';

const ENDPOINT = `https://${config['infura_network']}.infura.io/v3/${config['infura_endpoint']}`;
const web3 = new Web3(new Web3.providers.HttpProvider(ENDPOINT));

/**
 * Create two accounts for test.
 */
const createAccounts = () => {
  const aliceKeys = web3.eth.accounts.create();
  console.log(aliceKeys);
  const bobKeys = web3.eth.accounts.create();
  console.log(bobKeys);
};

/**
 * Output balance amount of certain account.
 * @param {string} name account name (any string)
 * @param {string} account account
 */
const checkBalance = (name, account) => {
  web3.eth.getBalance(account)
    .then((balance) => {
      console.log(`${name} balance: ${Number(balance).toLocaleString()} wei`);
    });
};

// checkBalance('sender', config['sender_id']);
// checkBalance('recipient', config['recipient_id']);

/**
 * Sign a transaction and send.
 * @param {string} from sender account
 * @param {number} gasPrice gas limit
 * @param {number} gas gas fee
 * @param {string} to recipient account
 * @param {number} value transaction amount
 * @param {string} secret sender secret key
 * @param {string} data optional information
 */
const signTransaction = (from, gasPrice, gas, to, value, secret, data = '') => {
  const tx = {
    from: from,
    gasPrice: gasPrice.toString(),
    gas: gas.toString(),
    to: to,
    value: value.toString(),
    data: data
  };

  web3.eth.accounts.signTransaction(tx, secret)
    .then((signedTx) => {
      console.log('--------------------------------------------------');
      console.log('Signed transaction');
      console.log('--------------------------------------------------');
      console.log(signedTx);

      web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .then((result) => {
          console.log('--------------------------------------------------');
          console.log('Transaction Receipt');
          console.log('--------------------------------------------------');
          console.log(result);
        });
    });
};

// signTransaction(
//   config['sender_id'],
//   20000000000,
//   42000,
//   config['recipient_id'],
//   1000,
//   config['sender_secret']
// );

/**
 * Deploy certain contract.
 * @param {string} name contract name (at ./contracts/)
 * @param {string} from sender account
 * @param {number} gasPrice gas limit
 * @param {number} gas gas fee
 * @param {string} secret sender secret key
 */
const deployContract = (name, from, gasPrice, gas, secret) => {
  fs.readFile(`./contracts/${name}/${name}.abi`, (error1, abi) => {
    fs.readFile(`./contracts/${name}/${name}.dat`, (error2, data) => {
      const obj = "0x" + JSON.parse(data)['object'];
      const tx = {
        from: from,
        gasPrice: gasPrice.toString(),
        gas: gas.toString(),
        data: obj
      };

      web3.eth.accounts.signTransaction(tx, secret)
        .then((signedTx) => {
          web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            .then((result) => {
              console.log(result);
            });
        });
    });
  });

  // This way throws the error.
  // >> The method eth_sendTransaction does not exist/is not available.
  // -----
  // fs.readFile(`./contracts/${name}/${name}.abi`, (error, abi) => {
  //   const contract = new web3.eth.Contract(JSON.parse(abi));
  //   console.log(contract);

  //   fs.readFile(`./contracts/${name}/${name}.dat`, (error, data) => {
  //     const obj = "0x" + JSON.parse(data)['object'];
  //     contract.deploy({ data: obj })
  //       .send({
  //         from: from,
  //         gas: gas.toString(),
  //         gasPrice: gasPrice.toString()
  //       }, (error, transactionHash) => {
  //         console.log(error);
  //         console.log(transactionHash);
  //       })
  //       .then((contract) => {
  //         console.log(contract);
  //       });
  //   });
  // })
};

// deployContract(
//   'helloworld',
//   config['sender_id'],
//   20000000000,
//   4900000,
//   config['sender_secret']
// );

/**
 * Call a contract.
 * @param {string} name contract name (at ./contracts/)
 * @param {string} from sender account
 * @param {number} gasPrice gas limit
 * @param {number} gas gas fee
 * @param {string} to contract address
 * @param {string} secret sender secret key
 */
const callContract = (name, from, gasPrice, gas, to, secret) => {
  fs.readFile(`./contracts/${name}/${name}.abi`, (error, abi) => {
    const contract = new web3.eth.Contract(JSON.parse(abi), to);
    const payload = contract.methods.Hello().encodeABI();
    const tx = {
      from: from,
      gasPrice: gasPrice.toString(),
      gas: gas.toString(),
      to: to,
      data: payload
    };
    
    web3.eth.accounts.signTransaction(tx, secret)
      .then((signedTx) => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction)
          .then((result) => {
            console.log(result);
          });
      });
  });
};

// TODO: get this from transaction receipt after calling deployContract.
const contractAddress = '0x0ad95843bf43Dd55e89Eb12C1db5d2c3D455823B';

// callContract(
//   'helloworld',
//   config['sender_id'],
//   20000000000,
//   4700000,
//   contractAddress,
//   config['sender_secret']
// );

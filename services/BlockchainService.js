const { ethers } = require('ethers');
require('dotenv').config();

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.governmentWallet = new ethers.Wallet(process.env.GOVERNMENT_PRIVATE_KEY, this.provider);
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "certId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "certHash",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        }
      ],
      "name": "CertificateIssued",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        }
      ],
      "name": "IssuerApproved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        }
      ],
      "name": "IssuerRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "certificates",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "certHash",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "metadata",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "hashToCertId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isApprovedIssuer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        }
      ],
      "name": "addIssuer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        }
      ],
      "name": "removeIssuer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "certHash",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "metadata",
          "type": "string"
        }
      ],
      "name": "storeCertificateHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "providedHash",
          "type": "bytes32"
        }
      ],
      "name": "verifyAndGetDetails",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bool",
              "name": "isValid",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "certId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "metadata",
              "type": "string"
            }
          ],
          "internalType": "struct CertificateHashRegistry.VerificationResult",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextCertId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  
    ],
    this.contract = new ethers.Contract(this.contractAddress, this.ABI, this.provider);
  }

  async addIssuer(instituteAddress) {
    const tx = await this.contract.connect(this.governmentWallet).addIssuer(instituteAddress);
    await tx.wait();
    return tx.hash;
  }

  async removeIssuer(instituteAddress) {
    const tx = await this.contract.connect(this.governmentWallet).removeIssuer(instituteAddress);
    await tx.wait();
    return tx.hash;
  }

  async storeCertificateHash(certHash, metadata, signer) {
    const tx = await this.contract.connect(signer).storeCertificateHash(certHash, metadata);
    await tx.wait();
    return tx.hash;
  }

  async verifyCertificate(providedHash) {
    // providedHash as bytes32
    const result = await this.contract.verifyAndGetDetails(providedHash);
    return {
      valid: result.isValid,
      certId: result.certId.toString(),
      metadata: result.metadata
    };
  }

  async isApprovedIssuer(address) {
    return await this.contract.isApprovedIssuer(address);
  }

  async getNextCertId() {
    return (await this.contract.nextCertId()).toString();
  }
}

module.exports = new BlockchainService();
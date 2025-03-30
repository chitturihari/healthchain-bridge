
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_recorded_at",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_blood_pressure_systolic",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_blood_pressure_diastolic",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_blood_sugar",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_heart_rate",
        "type": "uint256"
      }
    ],
    "name": "addDailyReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_doctor",
        "type": "address"
      }
    ],
    "name": "grantAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_qualification",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_phone",
        "type": "string"
      }
    ],
    "name": "registerDoctor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_fullName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_dateOfBirth",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_weight",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_height",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_aadharNumber",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_bloodType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_phoneNumber",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "_isMarried",
        "type": "bool"
      }
    ],
    "name": "registerPatient",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_doctor",
        "type": "address"
      }
    ],
    "name": "revokeAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_cid",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_category",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_dou",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      }
    ],
    "name": "uploadFile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_patient",
        "type": "address"
      }
    ],
    "name": "getDailyReports",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "recorded_at",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "blood_pressure_systolic",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "blood_pressure_diastolic",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "blood_sugar",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "heart_rate",
            "type": "uint256"
          }
        ],
        "internalType": "struct HealthRecord.DailyReport[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_doctor",
        "type": "address"
      }
    ],
    "name": "getDoctorDetails",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "qualification",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "phone",
        "type": "string"
      },
      {
        "internalType": "address[]",
        "name": "sharedPatients",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_patient",
        "type": "address"
      }
    ],
    "name": "getFiles",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "category",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "dou",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct HealthRecord.File[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_patient",
        "type": "address"
      }
    ],
    "name": "getPatientDetails",
    "outputs": [
      {
        "internalType": "string",
        "name": "full_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "date_of_birth",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "weight",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "height",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "aadhar_number",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "blood_type",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "phone_number",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isMarried",
        "type": "bool"
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
    "name": "isDoctor",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isPatient",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default contractABI;

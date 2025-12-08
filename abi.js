const CONTRACT_ADDRESS = "0xC1879ACa61b9c29993FdD929564d485FbB718E33";

const CONTRACT_ABI = [
    // 這裡貼上你的 ABI JSON 內容
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "patient",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "doctor",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "status",
                    "type": "bool"
                }
            ],
            "name": "AccessChanged",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_patient",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "_doctorName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_diagnosis",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_note",
                    "type": "string"
                }
            ],
            "name": "addRecord",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "patient",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "doctorName",
                    "type": "string"
                }
            ],
            "name": "RecordAdded",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_doctor",
                    "type": "address"
                },
                {
                    "internalType": "bool",
                    "name": "_status",
                    "type": "bool"
                }
            ],
            "name": "setPermission",
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
            "name": "getRecords",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "id",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "doctorName",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "diagnosis",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "note",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "doctorAddr",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct MediChainLite.Record[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }

];
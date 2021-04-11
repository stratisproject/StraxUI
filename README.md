# STRAX Wallet

This is the repository of the Stratis wallet. This wallet using Electron and Angular at the front-end and .NET Core with C# in the back-end.  
STRAX Wallet is a full node staking wallet for the Stratis network.
To download and install the latest release, please have a look [here](https://github.com/stratisproject/StraxUI/releases).

# Building and running the StratisBitcoinFullNode daemon

The StratisFullNode daemon is the backend REST service, hosting a Stratis node upon which STRAX Wallet depends.  
The StratisFullNode daemon is hosted in another repository. All information on building and running the daemon can be found [here](https://github.com/stratisproject/StratisFullNode/blob/master/Documentation/getting-started.md).

# Building and running the user interface

## Install prerequisites

Download and install the latest version of Git [here](https://git-scm.com/).  
Download and install the latest Long Term Support (LTS) version of NodeJS [here](https://nodejs.org/). 

## Getting Started

Clone the repository locally:

``` bash
git clone https://www.github.com/stratisproject/StraxUI
```

Navigate to the StraxUI folder in a terminal:
``` bash
cd ./StraxUI
```

## Install dependencies with npm:

From within the StraxUI directory run:

``` bash
npm install
```

## Run the UI in development mode

#### Terminal Window 1
[Run the daemon](https://github.com/stratisproject/StratisFullNode/blob/master/Documentation/getting-started.md)  

#### Terminal Window 2
Each of our supported networks have their own way of starting the user interface.  
Use `npm run mainnet` to start the UI in StraxMain mode.  
Use `npm run testnet` to start the UI in StraxTest mode.   
All these commands will compile the Angular code and spawn the Electron process for the desired network.

## Build the UI for production

|Command|Description|
|--|--|
|`npm run build:prod`| Compiles the application for production. Output files can be found in the dist folder |
|`npm run package:linux`| Builds the STRAX Wallet application for linux systems |
|`npm run package:linuxarm`| Builds the STRAX Wallet application for linux-arm system (i.e., Raspberry Pi) |
|`npm run package:windows`| Builds the STRAX Wallet application for Windows systems |
|`npm run package:mac`| Builds the STRAX Wallet application for MacOS systems |

When starting the application it will automatically run the network in Mainnet mode. If you want to start the application for testnet, please add the `-testnet` argument when starting the application.

**The application is optimised. Only the files of /dist folder are included in the executable. Distributable packages can be found in the app-builds/ folder**

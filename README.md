# Cards.io

<p align="center">
<img src= "https://cards.siliconcupcake.me/favicon.png" height="300"></p>

Cards.io is an open-source game-engine written for implementing multi-player card-based games.
Currently, `cards.io` supports the following games:
* Literature


### Built With
* [Node.js](https://nodejs.org/)
* [Typescript](https://www.typescriptlang.org/)
* [MongoDB](https://www.mongodb.com/)
* [Socket.io](https://socket.io)

## Getting Started

### Prerequisites
* Install Node.js
* Install node package manager(npm)
* MongoDB

### Project Setup

1. Clone the repository - `git clone https://github.com/NavenAllen/backend.cards.io`
1. Go to the project directory - `cd backend.cards.io`
1. Install dependencies - `npm install`
1. Stop the mongodb service - `service mongod stop`
1. Deploy a replica set - `mongod --dbpath ./data --replSet "rs"`
1. Initiate the replica set once while setting up the server - `mongo 'rs.initiate()'`
1. Start the server - `npm run start`

## Reporting Issues
If you think you've found a bug, or something isn't behaving the way you think it should, please raise an [issue](https://github.com/NavenAllen/backend.cards.io/issues) on GitHub.

## Contributing
All contributions are welcome! We strive to maintain a welcoming and collaborative community. Have a look at the [contributing guidelines](CONTRIBUTING.md), and go ahead!

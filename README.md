## About The Project

<p align="center">
<img src= "https://drive.google.com/uc?export=view&id=1k_WJF9hVjHiYhu9LMxAmrmqKR3AmJAmU"></p>

Online card games platform with games:
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
2. Go to the project directory - `cd backend.cards.io`
3. Install dependencies - `npm install`
4. Stop the mongodb service - `service mongod stop`
5 `mongod --dbpath ./data --replSet "rs"`
6. Initiate the replica set once while setting up the server - `mongo 'rs.initiate()'`
7. Start the server - `npm run start`
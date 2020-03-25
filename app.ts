
import express from 'express';
import async from 'async';
import socketio from 'socket.io';
import bodyParser from 'body-parser';
import r from 'rethinkdb';
import { startSocketIOServer } from './src/api'

import { config }  from './config';

// import other games as necessary


const port = process.env.PORT || config.express.port; 
const app = express();
var io;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// catch 400
app.use((err, req, res, next) => {
		console.log(err.stack);
		res.status(400).send(`Error: ${res.originUrl} not found`);
		next();
});

// catch 500
app.use((err, req, res, next) => {
		console.log(err.stack);
		res.status(500).send(`Error: ${err}`);
		next();
});


// Connect to the database
async.waterfall([
		function connect(callback) {
			r.connect(config.rethinkdb, callback);
		},

		function createDatabase(connection, callback) {
			//Create the database if needed.
			r.dbList().contains(config.rethinkdb.db).do(function(containsDb) {
				return r.branch(
					containsDb,
					{created: 0},
					r.dbCreate(config.rethinkdb.db)
				);
			}).run(connection, function(err) {
				callback(err, connection);
			});
		},

		function createTable(connection, callback) {
			//Create the table if needed.
			r.tableList().contains('todos').do(function(containsTable) {
				return r.branch(
					containsTable,
					{created: 0},
					r.tableCreate('todos')
				);
			}).run(connection, function(err) {
				callback(err, connection);
			});
		},

		function createIndex(connection, callback) {
			//Create the index if needed.
			r.table('todos').indexList().contains('createdAt').do(function(hasIndex) {
				return r.branch(
					hasIndex,
					{created: 0},
					r.table('todos').indexCreate('createdAt')
				);
			}).run(connection, function(err) {
				callback(err, connection);
			});
		},

		function waitForIndex(connection, callback) {
			//Wait for the index to be ready.
			r.table('todos').indexWait('createdAt').run(connection, function(err, result) {
				callback(err, connection);
			});
		}
	], function(err, connection) {
		if(err) {
			console.error(err);
			process.exit(1);
			return;
		}
	
		app.rdb = connection;
		let server = app.listen(port);
		startSocketIOServer(server);

});
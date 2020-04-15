import path from 'path'
import winston from 'winston'

// Importing configuration file
import { config } from '../../config'

// Define the custom settings for each transport (file, console)
var transportOptions = {
	infoFile: {
		level: 'info',
		filename: path.join(config.winston.directory, 'info_logs.log'),
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 10,
		colorize: true
	},
	errorFile: {
		level: 'error',
		filename: path.join(config.winston.directory, 'error_logs.log'),
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 10,
		colorize: true
	},
	debugFile: {
		level: 'debug',
		filename: path.join(config.winston.directory, 'debug_logs.log'),
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 10,
		colorize: true
	},
	console: {
		level: 'info',
		handleExceptions: true,
		json: false,
		colorize: true
	}
}

// Configure different transports based on environment
let transports = new Array()
// Push production/error level transports
transports.push(new winston.transports.File(transportOptions.debugFile))
transports.push(new winston.transports.File(transportOptions.infoFile))
transports.push(new winston.transports.File(transportOptions.errorFile))

// Push development level transports
if (process.env.NODE_ENV !== 'production') {
	transports.push(new winston.transports.Console(transportOptions.console))
}

// Setting format of logs
let formats = new Array()
formats.push(winston.format.splat())
formats.push(
	winston.format.timestamp({
		format: 'YYYY-MM-DD HH:mm:ss'
	})
)
formats.push(winston.format.json())

// Instantiate a new Winston Logger with the settings defined above
export var Logger = winston.createLogger({
	format: winston.format.combine.apply(null, formats),
	transports: transports,
	exitOnError: false // do not exit on handled exceptions
})

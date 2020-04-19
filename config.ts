let config = {
	mongodb: {
		host: 'localhost',
		port: 27017,
		authKey: '',
		db: 'cards-io',
		replicaSetName: 'rs'
	},
	express: {
		port: 3000
	},
	winston: {
		directory: 'logs'
	}
}

export { config }

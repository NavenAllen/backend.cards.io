let config = {
	mongodb: {
		host: 'cards-mongodb',
		port: 27017,
		authKey: '',
		db: 'cards-io',
		replicaSetName: 'my-replica'
	},
	express: {
		port: 3000
	}
}

export { config }

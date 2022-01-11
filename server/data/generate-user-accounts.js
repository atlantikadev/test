var dbManager = require('./db-manager');
var bcrypt = require('bcrypt');

const uuidV4 = require('uuid/v4');
const saltRounds = 10;


var users = [
    {
        id: uuidV4(),
        username: 'akabbaj alt',
        firstname: 'Adil',
        lastname: 'Kabbaj',
        email: 'adil_kabbaj@yahoo.fr',
        password: bcrypt.hashSync('123456', saltRounds),
        loginCount: 0
    }
];

/*
var users = [
	{
		id: uuidV4(),
        username: 'youhbi',
        firstname: 'Younes',
        lastname: 'Ouhbi',
        email: 'younesouhbi@yahoo.com',
        password: bcrypt.hashSync('3dengine', saltRounds),
        loginCount: 0
	},
	{
		id: uuidV4(),
        username: 'akabbaj',
        firstname: 'Adil',
        lastname: 'Kabbaj',
        email: 'akabbaj@insea.ac.ma',
        password: bcrypt.hashSync('123456', saltRounds),
        loginCount: 0
	},
	{
		id: uuidV4(),
        username: 'aguedira',
        firstname: 'Abdelilah',
        lastname: 'Guedira',
        email: 'abdelilah.guedira@acaps.ma',
        password: bcrypt.hashSync('123456', saltRounds),
        loginCount: 0
	},
	{
		id: uuidV4(),
        username: 'ybennani',
        firstname: 'Yassine',
        lastname: 'Bennani',
        email: 'yassinebennani74@yahoo.fr',
        password: bcrypt.hashSync('123456', saltRounds),
        loginCount: 0
	},
	{
		id: uuidV4(),
        username: 'agharbi',
        firstname: 'Abdelkhalak',
        lastname: 'Gharbi',
        email: 'abdelgharbi@yahoo.fr',
        password: bcrypt.hashSync('123456', saltRounds),
        loginCount: 0
	},
	{
		id: uuidV4(),
        username: 'chatoubi',
        firstname: 'Chakib',
        lastname: 'Atoubi',
        email: 'chakibatoubi@menara.ma',
        password: bcrypt.hashSync('123456', saltRounds),
        loginCount: 0
	},
	{
		id: uuidV4(),
        username: 'tmouline',
        firstname: 'Taoufiq',
        lastname: 'Mouline',
        email: 'moulinetaoufiq2@gmail.com',
        password: bcrypt.hashSync('123456', saltRounds),
        loginCount: 0
	},
	{
		id: uuidV4(),
        username: 'rbenomar ',
        firstname: 'Rafiq',
        lastname: 'Ben Omar',
        email: '0667222541@gmail.com',
        password: bcrypt.hashSync('123456', saltRounds),
        loginCount: 0
	},
	{
		id: uuidV4(),
        username: 'mgazoulit',
        firstname: 'Mokhtar',
        lastname: 'Gazoulit',
        email: 'gazoulitmokhtar@gmail.com',
        password: bcrypt.hashSync('123456', saltRounds),
        loginCount: 0
	},
	{
		id: uuidV4(),
        username: 'mkabbaj',
        firstname: 'Mekki',
        lastname: 'Kabbaj',
        email: 'Kabbaj@imanor.gov.ma',
        password: bcrypt.hashSync('123456', saltRounds),
        loginCount: 0
	}
];
*/


dbManager.connect(function() {

	var promises = [];
	for(var i = 0; i < users.length; i++) {
		promises.push(dbManager.addUser(users[i]));
	}

	Promise.all(promises)
		.then(function(result) {

			console.log('Done adding users!')
			dbManager.disconnect();

		});

});


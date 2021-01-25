// get preview

const config = require('../config.json');

const { readFileSync } = require('fs');
const { join } = require('path');

let preview = readFileSync(join(__dirname, '../templates/preview.html'), 'utf8');

const firebase = require('firebase-admin');


firebase.initializeApp({
	credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE))
});

const db = firebase.firestore();
const links = db.collection('urls');

module.exports = async (req, res) => {

	let { id } = req.query;

	if (!id) {
		return res.status(400).json({
			status: 400,
			message: 'No short URL ID provided'
		});
	}

	const urlRef = links.doc(id);
	const doc = await urlRef.get();

	if (!doc.exists) {
		return res.status(404).json({
			status: 404,
			message: 'Short URL with that ID does not exist'
		});
	}

	let data = doc.data();

	return res.status(200).send(
		preview
			.replace(/%%ID%%/gmi, id)
			.replace(/%%SHORT%%/gmi, `${config.host}/${id}`)
			.replace(/%%LONG%%/gmi, data.url)
	);
};
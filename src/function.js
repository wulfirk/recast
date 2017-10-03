const toText = message => { return { type: 'text', content: message } }
const toImage = image_url => { return { type: 'picture', content: image_url } }

const toButtons = (title, buttons) => {
	return { type: 'quickReplies', content: { buttons, title } }
}
const toButton = (title, value) => { return { title, value } }

module.exports = {
	toText: toText,
	toImage: toImage,
	toButtons: toButtons,
	toButton: toButton,
}
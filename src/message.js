/*
 * message.js
 * This file contains your bot code
 */

const recastai = require('recastai')
const odapi = require('./odapi')
const funcTo = require('./function')

const sendMessage = message => {
	message.reply()
		.then(() => {
			// Do some code after sending messages
		})
		.catch(err => {
			console.error('Error while sending message to channel', err)
		})
}

const moreInfo = message => {
	let button = []
	button.push(funcTo.toButton('accident','Donnes moi plus d\'infos sur "accident"'))
	button.push(funcTo.toButton('culture','Donnes moi plus d\'infos sur "culture"'))
	button.push(funcTo.toButton('immobilier','Donnes moi plus d\'infos sur "immobilier"'))
	button.push(funcTo.toButton('demographie','Donnes moi plus d\'infos sur "demographie"'))

	message.addReply(
		funcTo.toButtons(`Plus d'informations`,button)
	)

	sendMessage(message)
}

const sendError = (e, message, result) => {
	console.log(e)
	message.addReply(funcTo.toText(`Il y a eu une erreur`))
	message.addReply(funcTo.toImage(`http://img.freepik.com/free-vector/worker-crying_1012-222.jpg?size=180&ext=jpg`))

	sendMessage(message)
	result.resetConversation()
}

const sendHelp = (message) => {
	message.addReply(funcTo.toText(`Désolé je n'ai pas été programmé à répondre à cela. Tape "help" si tu veux de l'aide`))
	sendMessage(message)
}

// This function is the core of the bot behaviour
const replyMessage = (message) => {
  // Instantiate Recast.AI SDK, just for request service
  const request = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE)
  // Get text from message received
  const text = message.content

  console.log('I receive: ', text)

  // Get senderId to catch unique conversation_token
  const senderId = message.senderId

  // Call Recast.AI SDK, through /converse route
  request.converseText(text, { conversationToken: senderId })
  .then(result => {
    /*
    * YOUR OWN CODE
    * Here, you can add your own process.
    * Ex: You can call any external API
    * Or: Update your mongo DB
    * etc...
    */
    if (result.action) {
      console.log('The conversation action is: ', result.action.slug)
        switch (result.action.slug) {
			case "frenchcity":
				//console.log(result)
				if (result.get('location') && result.get('location').formatted) {
					let arrVille = result.get('location').formatted.split(",");
					let query = {
						type: "ville",
						query: arrVille[0]
					}
					odapi(result, query)
						.then(res => {
							message.addReply(res)
							moreInfo(message)
						})
						.catch(function(e) {
							sendError(e, message, result)
						})
				} else {
					sendHelp(message)
				}
				break
			case "show_action":
				if (result.get('category') && result.get('category').value) {
					let city = result.getMemory('ville')
					let query = {}
					switch (result.get('category').value) {
						case 'accident':
							query = {
								type: "accident",
								query: city.uri,
								label: city.label,
								year: "2016"
							}
							odapi(result, query)
								.then(res => {
									message.addReply(res)
									moreInfo(message)
								})
								.catch(function(e) {
									sendError(e, message, result)
								})
							break
						case 'culture':
							query = {
								type: "culture",
								query: city.uri,
								label: city.label,
								year: "2016"
							}
							odapi(result, query)
								.then(res => {
									message.addReply(res)
									moreInfo(message)
								})
								.catch(function(e) {
									sendError(e, message, result)
								})
							break
						case 'immobilier':
							query = {
								type: "immobilier",
								query: city.uri,
								label: city.label,
								year: "2013"
							}
							odapi(result, query)
								.then(res => {
									message.addReply(res)
									moreInfo(message)
								})
								.catch(function(e) {
									sendError(e, message, result)
								})
							break
						case 'demographie':
							query = {
								type: "demographie",
								query: city.uri,
								label: city.label,
								year: "2014"
							}
							odapi(result, query)
								.then(res => {
									message.addReply(res)
									moreInfo(message)
								})
								.catch(function(e) {
									sendError(e, message, result)
								})
							break
						default:
							message.addReply(funcTo.toText(`Je ne peux pas donner plus d'infos`))
							moreInfo(message)
							break
					}
				} else {
					sendHelp(message)
				}
				break
			default:
				if (!result.replies.length) {
					message.addReply(funcTo.toText(`Je n'ai rien à te dire :/`))
					sendMessage(message)
				} else {
					// Add each reply received from API to replies stack
					result.replies.forEach(replyContent => message.addReply(funcTo.toText(replyContent)))
					sendMessage(message)
				}
				break
		}
    } else {
		sendHelp(message)
	}

  })
  .catch(err => {
    console.error('Error while sending message to Recast.AI', err)
  })
}

module.exports = replyMessage

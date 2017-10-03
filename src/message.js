/*
 * message.js
 * This file contains your bot code
 */

const recastai = require('recastai')
const odapi = require('./odapi')
const odaccidentapi = require('./odaccidentapi')
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
					odapi(result, arrVille[0])
						.then(res => {
							message.addReply(res)
							let button = []
							button.push(funcTo.toButton('accident','Donnes moi plus d\'infos sur "accident"'))
							button.push(funcTo.toButton('culture','Donnes moi plus d\'infos sur "culture"'))
							button.push(funcTo.toButton('immobilier','Donnes moi plus d\'infos sur "immobilier"'))
							message.addReply(
								funcTo.toButtons(`Plus d'informations`,button)
							)
							sendMessage(message)
						})
				} else {
					message.addReply(funcTo.toText(`Je ne trouve rien`))
					sendMessage(message)
				}
				break
			case "show_action":
				if (result.get('category') && result.get('category').value) {
					switch (result.get('category').value) {
						case 'accident':
							let city = result.getMemory('ville')
							odaccidentapi(result, city.uri, city.label, '2016')
								.then(res => {
									message.addReply(res)
									sendMessage(message)
								})
							break
						default:
							message.addReply(funcTo.toText(`Je ne peux pas donner plus d\'infos`))
							let button = []
							button.push(funcTo.toButton('accident','Donnes moi plus d\'infos sur "accident"'))
							button.push(funcTo.toButton('culture','Donnes moi plus d\'infos sur "culture"'))
							button.push(funcTo.toButton('immobilier','Donnes moi plus d\'infos sur "immobilier"'))
							message.addReply(
								funcTo.toButtons(`Plus d'informations`,button)
							)
							sendMessage(message)
							break
					}
				}
				break
			default:
				break
		}
    }

    // If there is not any message return by Recast.AI for this current conversation
    if (!result.replies.length) {
      //message.addReply({ type: 'text', content: 'I don\'t have the reply to this yet :)' })
    } else {
      // Add each reply received from API to replies stack
      result.replies.forEach(replyContent => message.addReply(funcTo.toText(replyContent)))
		sendMessage(message)
    }
  })
  .catch(err => {
    console.error('Error while sending message to Recast.AI', err)
  })
}

module.exports = replyMessage

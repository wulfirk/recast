const rp = require('request-promise')
const funcTo = require('./function')
const secret = require('./secret')

const odapi = (result, ville) => {
	return Promise.all([
		ODCall(ville),
	]).then(datas => {
		return funcTo.toText((getUrl(result, datas[0])))
	})
}

const ODCall = (query) => {
	var opad = {
		type: 'odapi',
		query: query
	}
	var options = {
		url: secret(opad)
	}
	return rp(options).then(resultOD => {
		console.log(resultOD)
		const res = JSON.parse(resultOD)
		return {
			uri: res[0].uri,
			url: res[0].url,
			label: res[0].label,
		}
	})
}

const getUrl = (result, data) => {
	const url = data.url
	const label = data.label
	const uri = data.uri
	//console.log(result)
	result.setMemory({ ville: {label: label, uri: uri}})
	const reply = `J'ai des infos pour ${label} ici ${url}`
	return reply
}

module.exports = odapi
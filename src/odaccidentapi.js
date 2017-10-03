const rp = require('request-promise')
const funcTo = require('./function')
const secret = require('./secret')

const odaccidentapi = (result, uri, label, year) => {
	return Promise.all([
		ODCall(uri, year),
	]).then(datas => {
		return funcTo.toText((getInfo(result, datas[0]) + label))
	})
}

const ODCall = (query, year) => {
	var opad = {
		type: 'odaccidentapi',
		query: query,
		year: year
	}
	var options = {
		url: secret(opad),
	}
	return rp(options).then(resultOD => {
		console.log(options.url)
		console.log(resultOD)
		const res = JSON.parse(resultOD)
		console.log(res)
		return {
			accidentsNumber: res[query].accidentsNumber[0].value,
		}
	})
}

const getInfo = (result, data) => {
	const accidentsNumber = data.accidentsNumber
	console.log(data)
	const reply = `Il y a eu ${accidentsNumber} accident(s) pour `
	return reply
}

module.exports = odaccidentapi
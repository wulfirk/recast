const rp = require('request-promise')
const funcTo = require('./function')
const secret = require('./secret')

const odapi = (result, query) => {
	return Promise.all([
		ODCall(query),
	]).then(datas => {
		return funcTo.toText((getRes(result, datas[0], query)))
	}).catch(function (e) {
		throw e
	})
}

const ODCall = (query) => {
	let opad = {}
	switch (query.type) {
		case 'ville':
			opad = {
				type: query.type,
				query: encodeURIComponent(query.query.replace(/\d+/g, ''))
			}
			break
		case 'accident':
		case 'culture':
		case 'immobilier':
		case 'demographie':
			opad = {
				type: query.type,
				query: query.query,
				year: query.year
			}
			break
		default:
			break
	}

	console.log(secret(opad))
	const options = {
		url: secret(opad)
	}
	return rp(options)
		.then( resultOD => {
			console.log(resultOD)
			const res = JSON.parse(resultOD)

			switch (query.type) {
				case 'ville':
					return {
						uri: res[0].uri,
						url: res[0].url,
						label: res[0].label,
					}

					break
				case 'accident':
					return {
						accidentsNumber: res[query.query].accidentsNumber[0].value
					}

					break
				case 'culture':
					return {
						theaters: res[query.query].theaters[0].value,
						cinemas: res[query.query].cinemas[0].value,
						conservatories: res[query.query].conservatories[0].value,
						museums: res[query.query].museums[0].value
					}

					break
				case 'immobilier':
					return {
						houses: res[query.query].houses[0].value,
						apartments: res[query.query].apartments[0].value,
						housing: res[query.query].housing[0].value,
						otherHousing: res[query.query].otherHousing[0].value,
						vacantHousing: res[query.query].vacantHousing[0].value
					}

					break
				case 'demographie':
					return {
						births: res[query.query].births[0].value,
						deaths: res[query.query].deaths[0].value,
						density: res[query.query].density[0].value,
						population: res[query.query].population[0].value
					}

					break
				default:
					break
			}
		})
		.catch(function (e) {
			throw e
		})
}

const getRes = (result, data, query) => {
	let label = ''
	let year = ''
	switch (query.type) {
		case 'ville':
			let url = data.url
			label = data.label
			let uri = data.uri

			result.setMemory({ ville: {label: label, uri: uri}})

			return `J'ai des infos pour ${label} ici ${url}`

			break
		case 'accident':
			let accidentsNumber = data.accidentsNumber
			label = query.label
			year = query.year

			return `Il y a eu ${accidentsNumber} accident(s) de la route à ${label} en ${year}`

			break
		case 'culture':
			let theaters = data.theaters
			let cinemas = data.cinemas
			let conservatories = data.conservatories
			let museums = data.museums
			label = query.label
			year = query.year

			return `Il y a ${theaters} théâtre(s), ${cinemas} cinéma(s), ${conservatories} conservatoire(s) et ${museums} musée(s) à ${label} en ${year}`

			break
		case 'immobilier':
			let houses = data.houses
			let apartments = data.apartments
			let housing = data.housing
			let otherHousing = data.otherHousing
			let vacantHousing = data.vacantHousing
			label = query.label
			year = query.year

			return `Il y a ${housing} logement(s) dont ${apartments} appartement(s), ${houses} maison(s) et ${otherHousing} autre(s) logement(s) avec ${vacantHousing} logement(s) vacant(s) à ${label} en ${year}`

			break
		case 'demographie':
			let births = data.births
			let deaths = data.deaths
			let density = Math.round(data.density)
			let population = data.population
			label = query.label
			year = query.year

			return `Il y a ${population} personnes(s) à ${label} avec ${births} naissance(s) et ${deaths} décès pour une densité de ${density} hab/km² en ${year}`

			break
		default:
			break
	}


}

module.exports = odapi
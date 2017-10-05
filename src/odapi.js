const rp = require('request-promise')
	,funcTo = require('./function')
	,secret = require('./secret');

const odapi = (result, query) =>
	Promise.all([ ODCall(query) ])
	.then( datas => funcTo.toText((getRes(result, datas[0], query))) );

const ODCall = (query) => {
	let opad = {};
	switch (query.type) {
		case 'ville':
			opad = {
				type: query.type,
				query: encodeURIComponent(query.query.replace(/\d+/g, ''))
			};
			break;
		case 'accident':
		case 'culture':
		case 'immobilier':
		case 'demographie':
			opad = {
				type: query.type,
				query: query.query,
				year: query.year
			};
			break;
		default:
			break;
	}

	console.log('INFO >', secret(opad));
	const options = {
		url: secret(opad)
	};
	return rp(options)
		.then( resultOD => {
			console.log('INFO >', resultOD);
			const res = JSON.parse(resultOD);
			//TODO: try catch

			switch (query.type) {
				case 'ville':
					return {
						uri: res[0].uri,
						url: res[0].url,
						label: res[0].label,
					};
					break;
				case 'accident':
					return {
						accidentsNumber: res[query.query].accidentsNumber[0].value
					};
					break;
				case 'culture':
					return {
						theaters: res[query.query].theaters[0].value,
						cinemas: res[query.query].cinemas[0].value,
						conservatories: res[query.query].conservatories[0].value,
						museums: res[query.query].museums[0].value
					};
					break;
				case 'immobilier':
					return {
						houses: res[query.query].houses[0].value,
						apartments: res[query.query].apartments[0].value,
						housing: res[query.query].housing[0].value,
						otherHousing: res[query.query].otherHousing[0].value,
						vacantHousing: res[query.query].vacantHousing[0].value
					};
					break;
				case 'demographie':
					return {
						births: res[query.query].births[0].value,
						deaths: res[query.query].deaths[0].value,
						density: res[query.query].density[0].value,
						population: res[query.query].population[0].value
					};
					break;
				default:
					break;
			}
		})
};

const getRes = (result, data, query) => {
	let label = ''
		,year = '';
	switch (query.type) {
		case 'ville':
			let url = data.url
				,uri = data.uri;
			label = data.label;

			result.setMemory({ ville: {label: label, uri: uri}});

			return `J'ai des infos pour ${label} ici ${url}`;
			break;
		case 'accident':
			let accidentsNumber = data.accidentsNumber;
			label = query.label;
			year = query.year;

			return `Il y a eu ${accidentsNumber} accident(s) de la route à ${label} en ${year}`;
			break;
		case 'culture':
			let theaters = data.theaters
				,cinemas = data.cinemas
				,conservatories = data.conservatories
				,museums = data.museums;
			label = query.label;
			year = query.year;

			return `Il y a ${theaters} théâtre(s), ${cinemas} cinéma(s), ${conservatories} conservatoire(s) et ${museums} musée(s) à ${label} en ${year}`;
			break;
		case 'immobilier':
			let houses = data.houses
				,apartments = data.apartments
				,housing = data.housing
				,otherHousing = data.otherHousing
				,vacantHousing = data.vacantHousing;
			label = query.label;
			year = query.year;

			return `Il y a ${housing} logement(s) dont ${apartments} appartement(s), ${houses} maison(s) et ${otherHousing} autre(s) logement(s) avec ${vacantHousing} logement(s) vacant(s) à ${label} en ${year}`;
			break;
		case 'demographie':
			let births = data.births
				,deaths = data.deaths
				,density = Math.round(data.density)
				,population = data.population;
			label = query.label;
			year = query.year;

			return `Il y a ${population} personnes(s) à ${label} avec ${births} naissance(s) et ${deaths} décès pour une densité de ${density} hab/km² en ${year}`;
			break;
		default:
			break;
	}
};

module.exports = odapi;

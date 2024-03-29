/**
 * 자주 사용하는 fetch 템플릿
 * @param {string} destination fetch url, 목적지
 * @returns {object} 가져온 정보 JSON
 */
const fatchTemplate = async (method, destination) => {
	console.log(`fatchTemplate, method: ${method}, destination: ${destination}`);

	const result = await fetch(destination, {
		method: method,
		headers: {
			"Content-Type": "application/json",
		},
	});
	
	if(result === null){
		return null;
	}
	else if(result.status === 500){
		alert('Error!\nCan not get answer');
		return null;
	}
	else{
		const jsonResult = await result.json();

		if(jsonResult.statusCode === 500){
			return null;
		}
		else if(jsonResult.data === null){
			return null;
		}
		else{
			return jsonResult.data;
		}
	}
}

/**
 * 입력한 서버의 순위권 길드의 정보를 가져온다
 * @param {string} serverName 서버 이름
 * @returns {object} 가져온 길드 정보 JSON
 */
export const getServerGuildList = async (serverName) => {
	const result = await fatchTemplate('GET', `/guilds/${encodeURIComponent(serverName)}`);
	console.log('getServerGuildList', result);

	return result;
}

/**
 * 입력한 캐릭터 이름의 기본 정보를 가져온다
 * @param {string} characterNickName 캐릭터 이름
 * @returns {object} 가져온 캐릭터 정보 JSON
 */
export const getCharacterInfo = async (characterNickName) => {
	const result = await fatchTemplate('GET', `/character/${encodeURIComponent(characterNickName)}`);
	console.log('getCharacterInfo', result);

	return result;
}

/**
 * 입력한 캐릭터 이름의 장비 정보를 가져온다
 * @param {string} characterNickName 캐릭터 이름
 * @returns {object} 가져온 캐릭터 정보 JSON
 */
export const getEquipmentInfo = async (characterNickName) => {
	const result = await fatchTemplate('GET', `/equipment/${encodeURIComponent(characterNickName)}`);
	console.log('getEquipmentInfo', result);

	return result;
}

/**
 * 입력한 캐릭터 이름의 각인 정보를 가져온다
 * @param {string} characterNickName 캐릭터 이름
 * @returns {object} 가져온 캐릭터 정보 JSON
 */
export const getEngravingsInfo = async (characterNickName) => {
	const result = await fatchTemplate('GET', `/engravings/${encodeURIComponent(characterNickName)}`);
	console.log('getEngravingsInfo', result);

	return result;
}

/**
 * 입력한 캐릭터 이름의 카드 정보를 가져온다
 * @param {string} characterNickName 캐릭터 이름
 * @returns {object} 가져온 캐릭터 정보 JSON
 */
export const getCardsInfo = async (characterNickName) => {
	const result = await fatchTemplate('GET', `/cards/${encodeURIComponent(characterNickName)}`);
	console.log('getCardsInfo', result);

	return result;
}

/**
 * 입력한 캐릭터 이름의 보석 정보를 가져온다
 * @param {string} characterNickName 캐릭터 이름
 * @returns {object} 가져온 캐릭터 정보 JSON
 */
export const getGemsInfo = async (characterNickName) => {
	const result = await fatchTemplate('GET', `/gems/${encodeURIComponent(characterNickName)}`);
	console.log('getGemsInfo', result);

	return result;
}

/**
 * 입력한 캐릭터 이름이 속한 원정대의 모든 캐릭터를 가져온다
 * @param {string} characterNickName 캐릭터 이름
 * @returns {object} 가져온 캐릭터들 정보 JSON
 */
export const getCharacterList = async (characterNickName) => {
	const result = await fatchTemplate('GET', `/characters/${encodeURIComponent(characterNickName)}`);
	console.log('getCharacterList', result);

	return result;
}
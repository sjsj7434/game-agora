/**
 * 자주 사용하는 fetch 템플릿
 * @param {string} destination fetch url, 목적지
 * @returns {object} 가져온 정보 JSON
 */
const fatchTemplate = async (method, destination) => {
	console.log(`fatchTemplate, method: ${method}, destination: ${destination}`);

	const result = await fetch(destination, {
		method: method,
		body: JSON.stringify({id: 't', age: 45}),
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
 * 입력한 캐릭터 이름의 기본 정보를 가져온다
 * @returns {object} 가져온 캐릭터 정보 JSON
 */
export const postTest = async () => {
	const result = await fatchTemplate('POST', `${process.env.REACT_APP_SERVER}/accounts`);
	console.log('postTest', result);

	return result;
}
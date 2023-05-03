/**
 * 자주 사용하는 fetch 템플릿
 * @param {string} destination fetch url, 목적지
 * @returns {object} 가져온 정보 JSON
 */
const fatchTemplate = async (method, destination, bodyData) => {
	console.log(`fatchTemplate, method: ${method}, destination: ${destination}`);
	const fecthOption = method === "GET" ?  {method: method, headers: {"Content-Type": "application/json",}} : {method: method, body: JSON.stringify(bodyData), headers: {"Content-Type": "application/json",}}
	const result = await fetch(destination, fecthOption);
	console.log(result)
	
	if(result === null){
		return null;
	}
	else if(result.status === 500){
		alert("Error!\nCan not get answer");
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
export const postTest = async (sendData) => {
	const result = await fatchTemplate("POST", `${process.env.REACT_APP_SERVER}/accounts`, sendData);
	console.log("postTest", result);

	return result;
}

/**
 * 입력한 캐릭터 이름의 기본 정보를 가져온다
 * @returns {object} 가져온 캐릭터 정보 JSON
 */
export const putTest = async (sendData) => {
	const result = await fatchTemplate("PUT", `${process.env.REACT_APP_SERVER}/accounts`, sendData);
	console.log("putTest", result);

	return result;
}

/**
 * 입력한 캐릭터 이름의 기본 정보를 가져온다
 * @returns {object} 가져온 캐릭터 정보 JSON
 */
export const deleteTest = async (sendData) => {
	const result = await fatchTemplate("DELETE", `${process.env.REACT_APP_SERVER}/accounts`, sendData);
	console.log("deleteTest", result);

	return result;
}

/**
 * stove 계정 소개란에 적을 인증코드를 생성한다
 * @returns {object} 생성한 인증코드
 */
export const getVerificationCode = async (sendData) => {
	const result = await fatchTemplate("GET", `${process.env.REACT_APP_SERVER}/accounts/stove/token`, sendData);
	console.log("getVerificationCode", result);

	return result;
}

/**
 * stove 계정 소개란에 적어놓은 인증코드와 비교
 * @returns {object} 가져온 stove 소개란 인증코드
 */
export const checkCodeMatch = async (sendData) => {
	const result = await fatchTemplate("GET", `${process.env.REACT_APP_SERVER}/accounts/stove/${sendData}`, null);
	console.log("checkCodeMatch", result);

	return result;
}

/**
 * 이미 존재하는 ID인지 확인
 * @returns {object} 가져온 stove 소개란 인증코드
 */
export const isDuplicatedID = async (id) => {
	const result = await fatchTemplate("GET", `${process.env.REACT_APP_SERVER}/accounts/id/${id}`, null);
	console.log("isDuplicatedID", result);

	return result;
}

/**
 * 이미 존재하는 닉네임인지 확인
 * @returns {object} 가져온 stove 소개란 인증코드
 */
export const isDuplicatedNickname = async (nickname) => {
	const result = await fatchTemplate("GET", `${process.env.REACT_APP_SERVER}/accounts/nickname/${nickname}`, null);
	console.log("isDuplicatedNickname", result);

	return result;
}

/**
 * 회원가입
 * @returns {object} 회원가입 처리 결과
 */
export const createAccount = async (accountInfo) => {
	const result = await fatchTemplate("POST", `${process.env.REACT_APP_SERVER}/accounts`, accountInfo);
	console.log("createAccount", result);

	return result;
}

/**
 * 로그인, Sign In
 * @returns {object} 로그인 처리 결과
 */
export const signInAccount = async (accountInfo) => {
	const result = await fetch(`${process.env.REACT_APP_SERVER}/accounts/signin`, {
		method: "POST",
		redirect: "follow",
		credentials: "include", // Don't forget to specify this if you need cookies
		headers: {"Content-Type": "application/json",},
		body: JSON.stringify(accountInfo)
	});
	
	if(result === null){
		return null;
	}
	else if(result.status === 500){
		alert("Error!\nCan not get answer");
		return null;
	}
	else{
		const jsonResult = await result.json();

		console.log("signInAccount: ", jsonResult);
	
		return jsonResult.data;
	}
}

/**
 * 로그인, Sign In
 * @returns {object} 로그인 처리 결과
 */
export const checkSignInStatus = async () => {
	const result = await fetch(`${process.env.REACT_APP_SERVER}/accounts/signin/status`, {
		method: "POST",
		redirect: "follow",
		credentials: "include", // Don't forget to specify this if you need cookies
	});
	
	if(result === null){
		return null;
	}
	else if(result.status === 500){
		alert("Error!\nCan not get answer");
		return null;
	}
	else{
		const jsonResult = await result.json();

		return jsonResult.data;
	}
}

/**
 * 로그아웃, sign out
 * @returns {object} 로그아웃 처리 결과
 */
export const setSignOut = async () => {
	await fetch(`${process.env.REACT_APP_SERVER}/accounts/signout`, {
		method: "POST",
		redirect: "follow",
		credentials: "include", // Don't forget to specify this if you need cookies
	});
}
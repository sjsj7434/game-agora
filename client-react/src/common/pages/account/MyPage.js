import { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { useNavigate } from "react-router-dom";
import Table from 'react-bootstrap/Table';

import * as accountsFetch from '../../js/accountFetch.js'
import Row from 'react-bootstrap/esm/Row.js';
import Col from 'react-bootstrap/esm/Col.js';
import LoadingModal from '../common/LoadingModal.js';
import Image from 'react-bootstrap/Image';
import '../../css/MyPage.css';
import EditIntroduce from './EditIntroduce.js';

const MyPage = () => {
	const [accountData, setAccountData] = useState(null);
	const [renderData, setRenderData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("");

	const navigate = useNavigate();

	const callMyInfo = useCallback(async () => {
		const myInfo = await accountsFetch.getMyInfo();

		if(myInfo === null){
			navigate("/");
			return;
		}

		setAccountData(myInfo);

		setIsLoading(false);
	}, [navigate])

	useEffect(() => {
		callMyInfo();
	}, [callMyInfo])

	const deleteAccount = useCallback(async () => {
		if(window.confirm("탈퇴를 진행하시겠습니까?") === false){
			return;
		}

		const deleteResult = await accountsFetch.deleteAccount();

		if(deleteResult === "true"){
			alert("정상적으로 탈퇴 처리되었습니다");
		}
		else{
			alert("계정을 탈퇴 처리할 수 없습니다");
		}
		
		navigate("/");
	}, [navigate])

	// const clickREQ = async () => {
	// 	await accountsFetch.requestVerifyEmail();
	// }

	const stringParser = (value) => {
		let name = "";

		if(value === "lostark_character_level"){
			name = "전투 레벨";
		}
		switch (value) {
			case "lostark_character_level":
				name = "전투 레벨";
				break;
			case "lostark_item_level":
				name = "아이템 레벨";
				break;
			case "lostark_name":
				name = "캐릭터";
				break;
			case "lostark_server":
				name = "서버";
				break;
			case "stove_code":
				name = "스토브 코드";
				break;
			default:
				name = "-";
				break;
		}

		return name;
	}

	useEffect(() => {
		//캐릭터 인증 업데이트
		const renewLostarkCharacter = async () => {
			setIsLoading(true);
			setLoadingMessage("인증 정보를 갱신 중입니다...");
			const result = await accountsFetch.renewLostarkCharacter();
		
			if(result === null){
				return;
			}
			if(result === "0001"){
				alert("정상적으로 업데이트 되었습니다");
			}
			else if(result === "0002"){
				alert("알 수 없는 데이터가 입력되었습니다");
			}
			else if(result === "0003"){
				alert("정보를 업데이트할 수 없습니다(닉네임이 변경되었다면 변경하기를 진행해주세요");
			}
			else if(result === "0004"){
				alert("이미 캐릭터 인증 또는 업데이트가 진행되었습니다\n잠시 후 다시 진행해주세요");	
				setIsLoading(false);
				return;
			}

			callMyInfo();
		}

		//캐릭터 인증을 해제
		const deactivateLostarkCharacter = async () => {
			if(window.confirm("로스트아크 캐릭터 인증을 해제하시겠습니까?") === true){
				setIsLoading(true);
				setLoadingMessage("인증을 해제하는 중입니다...");
				await accountsFetch.deactivateLostarkCharacter();
	
				callMyInfo();
			}
		}

		//프로필 사진 저장
		const uploadProfilePicture = async () => {
			const fileData = document.querySelector("#profilePictureInput").files[0];
			if(fileData !== null && fileData !== undefined){
				const sendData = new FormData();
				sendData.append("upload", fileData);
				
				const uploadResult = await accountsFetch.uploadProfilePicture(sendData);
				console.log(uploadResult);
				
				callMyInfo();
			}
		}
		
		if(accountData !== null){
			setRenderData(
				<Container style={{maxWidth: "600px"}}>
					<LoadingModal showModal={isLoading} message={loadingMessage}></LoadingModal>

					<div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", minHeight: "100px", maxHeight: "100px", overflow: "hidden" }}>
						<div style={{ marginRight: "1rem" }}>
							{
								accountData.profilePictureURL !== null ? 
								<>
									<label htmlFor="profilePictureInput" style={{ cursor: "pointer" }}>
										{/* <Image src="https://th.bing.com/th?id=ORMS.af754456c4a0bbb236c02bf807d2d151&pid=Wdp&w=240&h=129&qlt=90&c=1&rs=1&dpr=1&p=0" roundedCircle className="profilePicture" /> */}
										<Image src={accountData.profilePictureURL} roundedCircle className="profilePicture" />
									</label>
								</>
								:
								<>
									<Button variant="light" style={{ padding: "0px", margin: "0px", border: "0px" }}>
										<label htmlFor="profilePictureInput" style={{ cursor: "pointer" }}>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" className="bi bi-person-bounding-box profilePictureNone" viewBox="0 0 16 16">
												<path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5"/>
												<path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
											</svg>
										</label>
									</Button>
								</>
							}

							<input type="file" id="profilePictureInput" onChange={ () => { uploadProfilePicture() } } accept=".png, .jpg, .webp, .gif, .jpeg" style={{ display: "none" }} />
						</div>
						<div>
							<span style={{ fontSize: "1.2rem", fontWeight: 800 }}>
								{accountData.nickname}
							</span>
							<br />
							<span style={{ fontSize: "0.8rem" }}>
								{accountData.email === null ? "-" : accountData.email}
							</span>
							<br />
							<span style={{ fontSize: "0.8rem" }}>
								{accountData.createdAt.substring(0, 10)} 가입
							</span>
						</div>
					</div>

					<div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", fontSize: "0.8rem", marginTop: "0.5rem" }}>
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid lightgray", width: "33.3%", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
							<span>작성 글</span>
							<span>{new Intl.NumberFormat().format(accountData.postWriteCount)}</span>
						</div>
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid lightgray", width: "33.3%", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
							<span>작성 댓글</span>
							<span>{new Intl.NumberFormat().format(accountData.replyWriteCount)}</span>
						</div>
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid lightgray", width: "33.3%", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
							<span>커뮤력</span>
							<span>{new Intl.NumberFormat().format(accountData.exp)}</span>
						</div>
					</div>

					<div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", fontSize: "0.8rem", marginTop: "0.5rem" }}>
						<div onClick={ () => { navigate("/account/mypage/blacklist") } } style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid lightgray", width: "100%", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
							<span>차단 목록 관리</span>
						</div>
					</div>

					<div style={{paddingLeft: "10px", paddingRight: "10px", fontSize: "0.8rem", marginTop: "2rem", marginBottom: "2rem"}}>
						{/* <Table hover>
							<colgroup>
								<col width="30%" />
								<col width="5%" />
								<col width="*" />
							</colgroup>
							<tbody>
								<tr>
									<th>이메일</th>
									<td><div className="vr"></div></td>
									<td>
										<div style={{ display: "flex", alignItems: "center" }}>
											{accountData.email}
											&nbsp;&nbsp;
											<Button onClick={() => { clickREQ() }} variant="outline-success" style={{ width: "30%", maxWidth: "130px", padding: "2px", fontSize: "0.8rem" }}>인증하기</Button>
										</div>
									</td>
								</tr>
								<tr>
									<th>비밀번호 변경일</th>
									<td><div className="vr"></div></td>
									<td>
										{accountData.passwordChangeDate === null ? "-" : accountData.passwordChangeDate.substring(0, 10)}
									</td>
								</tr>
							</tbody>
						</Table> */}
						
						<div className="rowDivider"></div>
						
						<Table>
							<tbody>
								{
									accountData.authentication.map((element) => (
										<tr key={element.type}>
											<th>
												{stringParser(element.type)}
											</th>
											<td>
												{element.data}
											</td>
										</tr>
									))
								}
								{
									accountData.authentication.length === 0 ?
									<tr>
										<td colSpan="2">인증되지 않음</td>
									</tr>
									:
									<tr>
										<th>인증일</th>
										<td>{accountData.authentication.filter((element) => element.type === "lostark_item_level")[0].updatedAt.substring(0, 10)}</td>
									</tr>
								}
							</tbody>
						</Table>

						<div style={{ display: "flex", alignItems: "center" }}>
							{
								accountData.authentication.length === 0 ? 
								<>
									<Col>
										<div className="d-grid gap-2" style={{ margin: "0.4rem" }}>
											<Button onClick={() => { navigate("activate/lostark") }} variant="outline-success" style={{ padding: "2px", fontSize: "0.8rem" }}>인증하기</Button>
										</div>
									</Col>
								</>
								:
								<>
									<Col>
										<div className="d-grid gap-2" style={{ margin: "0.4rem" }}>
											<Button onClick={() => { renewLostarkCharacter() }} variant="outline-success" style={{ padding: "2px", fontSize: "0.8rem" }}>갱신</Button>
										</div>
									</Col>
									<Col>
										<div className="d-grid gap-2" style={{ margin: "0.4rem" }}>
											<Button onClick={() => { navigate("activate/lostark") }} variant="outline-warning" style={{ padding: "2px", fontSize: "0.8rem" }}>변경</Button>
										</div>
									</Col>
									<Col>
										<div className="d-grid gap-2" style={{ margin: "0.4rem" }}>
											<Button onClick={() => { deactivateLostarkCharacter() }} variant="outline-danger" style={{ padding: "2px", fontSize: "0.8rem" }}>해제</Button>
										</div>
									</Col>
								</>
							}
						</div>
						
						<div className="rowDivider"></div>

						<div>
							{
								accountData.introduce !== null ?
								<>
									<EditIntroduce status={"read"} accountData={accountData} introduce={accountData.introduce}></EditIntroduce>
								</>
								:
								<>
									<EditIntroduce status={"empty"} accountData={accountData} introduce={"자기소개를 작성해보세요!"}></EditIntroduce>
								</>
							}
						</div>
						
						<div className="rowDivider"></div>

						<Row>
							<Col>
								<div className="d-grid gap-2">
									<Button variant="outline-primary" size="lg" onClick={() => {navigate("renew/email")}} style={{ padding: "2px", fontSize: "0.8rem" }}>이메일 변경</Button>
								</div>
							</Col>
							<Col>
								<div className="d-grid gap-2">
									<Button variant="outline-primary" size="lg" onClick={() => {navigate("renew/password")}} style={{ padding: "2px", fontSize: "0.8rem" }}>비밀번호 변경</Button>
								</div>
							</Col>
							<Col>
								<div className="d-grid gap-2">
									<Button variant="outline-primary" size="lg" onClick={() => {navigate("renew/nickname")}} style={{ padding: "2px", fontSize: "0.8rem" }}>닉네임 변경</Button>
								</div>
							</Col>
						</Row>

						<div className="d-grid gap-2" style={{ marginTop: "1.5rem" }}>
							<Button variant="danger" size="lg" onClick={() => { deleteAccount() }} style={{ fontSize: "0.8rem" }}>회원탈퇴</Button>
						</div>
					</div>
				</Container>
			);
		}
	}, [accountData, isLoading, loadingMessage, callMyInfo, deleteAccount, navigate])

	return renderData;
}

export default MyPage;
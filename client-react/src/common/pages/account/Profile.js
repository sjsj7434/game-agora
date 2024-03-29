import { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { useNavigate, useParams } from "react-router-dom";

import * as accountsFetch from '../../js/accountFetch.js'
import LoadingModal from '../common/LoadingModal.js';
import Image from 'react-bootstrap/Image';
import '../../css/MyPage.css';
import MyEditor from '../post/MyEditor.js';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

const Profile = () => {
	const [accountData, setAccountData] = useState(null);
	const [renderData, setRenderData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("");
	
	const params = useParams();
	const navigate = useNavigate();

	const callMyInfo = useCallback(async () => {
		const yourInfo = await accountsFetch.getYourInfo(params.nickname);
		console.log(yourInfo)

		if(yourInfo === null){
			// navigate("/");
			return;
		}

		setAccountData(yourInfo);

		setIsLoading(false);
	}, [params.nickname, navigate])

	useEffect(() => {
		console.log(params)
		setIsLoading(true);
		setLoadingMessage("사용자 정보를 가져오는 중입니다...");

		callMyInfo();
	}, [params, callMyInfo])

	const lostarkTextParser = (value) => {
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
				name = "닉네임";
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
		//내가 작성한 글 가져오기
		const getMyPost = async () => {
			const resultData = await accountsFetch.getMyPost();
			console.log(resultData)
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
									<Image src={accountData.profilePictureURL} roundedCircle className="profilePictureNoClick" />
								</>
								:
								<>
									<Button variant="light" style={{ padding: "0px", margin: "0px", border: "0px" }} disabled>
										<label htmlFor="profilePictureInput">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" className="bi bi-person-bounding-box profilePictureNone" viewBox="0 0 16 16">
												<path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5"/>
												<path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
											</svg>
										</label>
									</Button>
								</>
							}
						</div>
						<div>
							<span style={{ fontSize: "1.2rem", fontWeight: 800 }}>
								{accountData.nickname}
							</span>
							<br />
							&nbsp;
							<br />
							<span style={{ fontSize: "0.8rem" }}>
								{accountData.createdAt.substring(0, 10)} 가입
							</span>
						</div>
					</div>

					<div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", fontSize: "0.8rem", marginTop: "0.5rem" }}>
						<div onClick={() => { getMyPost() }} style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid lightgray", width: "33.3%", paddingTop: "0.5rem", paddingBottom: "0.5rem", cursor: "pointer" }}>
							<span>작성 글</span>
							<span>{new Intl.NumberFormat().format(accountData.postWriteCount)}</span>
						</div>
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid lightgray", width: "33.3%", paddingTop: "0.5rem", paddingBottom: "0.5rem", cursor: "pointer" }}>
							<span>작성 댓글</span>
							<span>{new Intl.NumberFormat().format(accountData.replyWriteCount)}</span>
						</div>
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid lightgray", width: "33.3%", paddingTop: "0.5rem", paddingBottom: "0.5rem", cursor: "pointer" }}>
							<span>커뮤력</span>
							<span>{new Intl.NumberFormat().format(accountData.exp)}</span>
						</div>
					</div>

					<div className="rowDivider"></div>

					<div style={{ display: "flex", justifyContent: "center" }}>
						<Card style={{ width: "100%", fontSize: "0.8rem" }}>
							{
								accountData.authentication.length === 0 ?
								<>
									<Card.Body>
										<Card.Title>
											로스트아크
										</Card.Title>

										<div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2.5rem", marginBottom: "2.5rem" }}>
											<p>
												<strong>인증 정보가 존재하지 않습니다</strong>
											</p>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-x-circle" viewBox="0 0 16 16" style={{ width: "4rem", height: "4rem", margin: "1rem" }}>
												<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
												<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
											</svg>
										</div>
									</Card.Body>
								</>
								:
								<>
									<Card.Body>
										<Card.Title>
											로스트아크
										</Card.Title>
									</Card.Body>
									<ListGroup className="list-group-flush">
										{
											accountData.authentication.map((element) => (
												<ListGroup.Item key={element.type}>
													<div style={{ display: "flex", alignItems: "center" }}>
														<div style={{ width: "45%" }}><strong>{lostarkTextParser(element.type)}</strong></div>
														<div style={{ width: "10%" }}>|</div>
														<div style={{ width: "45%" }}>{element.data}</div>
													</div>
												</ListGroup.Item>
											))
										}
									</ListGroup>

									<Card.Footer className="text-muted">
										{accountData.authentication.filter((element) => element.type === "lostark_item_level")[0].updatedAt.substring(0, 10)} 인증 되었습니다
									</Card.Footer>
								</>
							}
						</Card>
					</div>

					<div className="rowDivider"></div>

					<div style={{fontSize: "0.8rem", marginTop: "2rem", marginBottom: "2rem"}}>
						<div style={{ maxHeight: "400px", overflow: "auto", border: "1px solid lightgray", borderRadius: "6px" }}>
							<MyEditor
								editorMode={"read"}
								savedData={accountData.introduce}
								editorMaxKB={0}
								setEditor={() => {}}
								setEditorSizeByte={() => {}}
							/>
						</div>
					</div>
				</Container>
			);
		}
	}, [accountData, isLoading, loadingMessage, callMyInfo, navigate])

	return renderData;
}

export default Profile;
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from 'react';
import MyEditor from '../MyEditor'
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Placeholder from 'react-bootstrap/Placeholder';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import LoadingModal from '../../common/LoadingModal';
import * as postFetch from '../../../js/postFetch';
import '../../../css/View.css';

const UnknownPostWrite = (props) => {
	const [writeMode, setWriteMode] = useState("");
	const [postCode, setPostCode] = useState(null);
	const [renderData, setRenderData] = useState(<></>);
	const [contentTitle, setContentTitle] = useState("");
	const [contentData, setContentData] = useState("");
	const [postCategory, setPostCategory] = useState("");
	const [contentPassword, setContentPassword] = useState("");
	const [identity, setIdentity] = useState(false);
	const [failMessage, setFailMessage] = useState(<>&nbsp;</>);
	const [editorSizeByte, setEditorSizeByte] = useState(0);
	const [loadingModalShow, setLoadingModalShow] = useState(false);
	const [loadingModalMessage, setLoadingModalMessage] = useState("");
	const params = useParams();
	const navigate = useNavigate();
	const [editorObject, setEditorObject] = useState(null);

	const editorMaxKB = 30;

	/**
	 * 신규 게시글 작성
	 */
	const saveEditorData = useCallback(async () => {
		const passwordElement = document.querySelector("#contentPassword");
		const titleElement = document.querySelector("#title");
		const categoryElement = document.querySelector("#category");

		if(passwordElement.value === ""){
			alert("게시글의 수정&삭제를 위해 비밀번호를 입력해주세요");
			passwordElement.focus();
			return;
		}
		else if(titleElement.value === ""){
			alert("제목을 입력해주세요");
			titleElement.focus();
			return;
		}

		if(editorSizeByte >= editorMaxKB){
			alert("작성된 글의 용량이 너무 큽니다");
			return;
		}

		if(window.confirm("게시글을 저장하시겠습니까?") === false){
			return;
		}

		setLoadingModalShow(true);
		setLoadingModalMessage("게시글을 저장 중입니다...");

		const editorContet = editorObject.getData();

		const sendData = {
			title: titleElement.value,
			content: editorContet,
			hasImage: editorContet.indexOf("<img") > -1 ? true : false,
			password: passwordElement.value,
			category: categoryElement.value,
		};

		const createResult = await postFetch.createContent("unknown", sendData);

		if(createResult.createdCode === 0){
			if(createResult.status === "long_title"){
				alert("제목이 너무 길어 저장할 수 없습니다(최대 100자)");
				setLoadingModalShow(false);
			}
			else if(createResult.status === "long_content"){
				alert(`작성된 글의 용량이 너무 커 저장할 수 없습니다(최대 ${editorMaxKB}KB)`);
				setLoadingModalShow(false);
			}
		}
		else{
			navigate(`/lostark/post/unknown/view/${createResult.createdCode}`);
		}

	}, [editorObject, editorSizeByte, editorMaxKB, navigate])

	/**
	 * 게시글 수정
	 */
	const editEditorData = useCallback(async () => {
		const titleElement = document.querySelector("#title");
		const categoryElement = document.querySelector("#category");

		if(titleElement.value === ""){
			alert("제목을 입력해주세요");
			titleElement.focus();
			return;
		}

		console.log(editorSizeByte, editorMaxKB, editorSizeByte >= editorMaxKB);
		if(editorSizeByte >= editorMaxKB){
			alert("작성된 글의 용량이 너무 큽니다");
			return;
		}

		if(window.confirm("게시글을 수정하시겠습니까?") === false){
			return;
		}

		setLoadingModalShow(true);
		setLoadingModalMessage("게시글을 수정 중입니다...");

		const editorContet = editorObject.getData();

		const sendData = {
			code: postCode,
			password: contentPassword,
			title: titleElement.value,
			content: editorContet,
			hasImage: editorContet.indexOf("<img") > -1 ? true : false,
			category: categoryElement.value,
		};

		let result = await postFetch.updateContent("unknown", sendData);

		if(result === null){
			alert("문제가 발생하여 게시글을 수정할 수 없습니다(1)");
			setLoadingModalShow(false);
			setLoadingModalMessage("");
		}
		else if(result === undefined){
			alert("문제가 발생하여 게시글을 수정할 수 없습니다(2)");
			setLoadingModalShow(false);
			setLoadingModalMessage("");
		}
		else{
			//정상적으로 처리 성공
			navigate(`/lostark/post/unknown/view/${postCode}`);
		}
	}, [postCode, contentPassword, editorObject, editorSizeByte, editorMaxKB, navigate])

	useEffect(() => {
		if(params.postCode !== undefined){
			setPostCode(params.postCode);
			setWriteMode("edit");
		}
		else{
			setPostCode(null);
			setWriteMode("new");
		}
	}, [params.postCode])

	useEffect(() => {
		/**
		 * 게시글 정보 가져오기
		 */
		const getContentData = async () => {
			const readResult = await postFetch.getContentData("unknown", postCode);
			const contentData = readResult.contentData;
	
			setContentTitle(contentData.title);
			setContentData(contentData.content);
			setPostCategory(contentData.category)
		}

		if(postCode !== null && identity === true){
			getContentData();
		}
	}, [postCode, identity])

	useEffect(() => {
		/**
		 * 수정 진입 전에 게시글 비밀번호 확인
		 */
		const checkBeforeEdit = async () => {
			const contentPasswordElement = document.querySelector("#contentPassword");

			if(contentPasswordElement.value === ""){
				alert("비밀번호를 입력해주세요");
				contentPasswordElement.focus();
				return;
			}

			setLoadingModalShow(true);
			setLoadingModalMessage("비밀번호 확인 중...");
			setFailMessage(<>&nbsp;</>);

			const sendData = {
				code: postCode,
				password: contentPasswordElement.value,
			};
			
			const checkResult = await postFetch.checkBeforeEdit("unknown", sendData)

			if(checkResult === true){
				setIdentity(true);
				setContentPassword(contentPasswordElement.value);
			}
			else{
				setFailMessage(<><b>[ ! ]</b> 올바른 비밀번호가 아닙니다</>);
			}

			setLoadingModalShow(false);
			setLoadingModalMessage("");
		}

		if(writeMode === "new"){
			setRenderData(
				<>
					<Form>
						<div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", marginTop: "30px"}}>
							익명 게시판
							&nbsp;
							<Button onClick={() => {saveEditorData()}} variant="primary" style={{width: "20%", minWidth: "70px", maxWidth: "100px", fontSize: "0.8rem"}}>저장</Button>
						</div>

						<Row className="g-2">
							<Col>
								<Form.Control id="writer" type="text" placeholder="작성자" defaultValue={"익명"} autoComplete="off" style={{marginBottom: "10px", fontSize: "0.8rem"}} readOnly />
							</Col>
							<Col>
								<Form.Control id="contentPassword" type="password" placeholder="비밀번호" autoComplete="current-password" maxLength={20} style={{marginBottom: "10px", fontSize: "0.8rem"}} />
							</Col>
						</Row>

						<Form.Select id="category" size="sm" style={{ marginBottom: "10px" }}>
							<option value="normal">일반</option>
							<option value="humor">유머</option>
							<option value="life">일상</option>
							<option value="info">정보</option>
							<option value="report">고발</option>
						</Form.Select>

						<Form.Control id="title" type="text" placeholder="제목" style={{marginBottom: "10px", fontSize: "0.8rem"}} defaultValue={""} maxLength={100} />
						
						<MyEditor
							editorMode={"write"}
							savedData={""}
							editorMaxKB={editorMaxKB}
							setEditor={(editor) => {setEditorObject(editor)}}
							setEditorSizeByte={(size) => {setEditorSizeByte(size)}}
						/>

						<ProgressBar
							now={parseInt((editorSizeByte / editorMaxKB) * 100, 10)} label={`${parseInt((editorSizeByte / editorMaxKB) * 100, 10)} %`}
							variant="success"
							style={{ height: "2.5rem", fontSize: "1rem", backgroundColor: "lightgray" }}
						/>

						<div style={{display: "flex", justifyContent: "flex-end", marginBottom: "15px", marginTop: "30px"}}>
							<Button onClick={() => {if(window.confirm("작성한 내용을 전부 비우시겠습니까?") === true){editorObject.setData("")}}} variant="danger" style={{width: "20%", minWidth: "70px", maxWidth: "100px", fontSize: "0.8rem"}}>비우기</Button>
							&nbsp;
							<Button onClick={() => {if(window.confirm("작성한 내용을 저장하지않고 나가시겠습니까?") === true){navigate("/lostark/post/unknown/1")}}} variant="secondary" style={{width: "20%", minWidth: "70px", maxWidth: "100px", fontSize: "0.8rem"}}>나가기</Button>
							&nbsp;
							<Button onClick={() => {saveEditorData()}} variant="primary" style={{width: "20%", minWidth: "70px", maxWidth: "100px", fontSize: "0.8rem"}}>저장</Button>
						</div>
					</Form>
				</>
			)
		}
		else if(writeMode === "edit"){
			if(identity !== true){
				setRenderData(
					<Container style={{maxWidth: "600px"}}>
						<Form>
							<Form.Group as={Row} className="mb-3">
								<Form.Label style={{fontWeight: "800", fontSize: "0.8rem"}}>
									게시글 비밀번호를 입력해주세요
								</Form.Label>
								<Col>
									<InputGroup>
										<Form.Control id="contentPassword" maxLength={20} type="password" autoComplete="off" placeholder="게시글 비밀번호를 입력해주세요" onKeyDown={(event) => {if(event.key === "Enter"){checkBeforeEdit()}}} style={{fontSize: "0.8rem"}} />
									</InputGroup>
									<Form.Text style={{color: "red", fontSize: "0.8rem"}}>
										{failMessage}
									</Form.Text>
								</Col>
							</Form.Group>
						</Form>

						<div style={{display: "flex", justifyContent: "flex-end"}}>
							<Button onClick={() => {if(window.confirm("내용을 수정하지않고 나가시겠습니까?") === true){navigate(`/lostark/post/unknown/view/${postCode}`)}}} variant="secondary" style={{width: "20%", minWidth: "70px", maxWidth: "100px", fontSize: "0.8rem"}}>나가기</Button>
							&nbsp;
							<Button onClick={() => {checkBeforeEdit()}} variant="primary" style={{width: "20%", minWidth: "70px", maxWidth: "100px", fontSize: "0.8rem"}}>확인</Button>
						</div>
					</Container>
				);
			}
			else{
				if(contentData === "" && contentTitle === ""){
					setRenderData(
						<>
							<Placeholder as={"p"} animation="glow">
								<Placeholder style={{width: "10%"}} />{" "}<Placeholder style={{width: "35%"}} />{" "}<Placeholder style={{width: "25%"}} />{" "}
								<Placeholder style={{width: "10%"}} />{" "}<Placeholder style={{width: "35%"}} />{" "}<Placeholder style={{width: "25%"}} />{" "}
							</Placeholder>
							<Placeholder as={"p"} animation="glow">
								<Placeholder style={{width: "30%"}} />{" "}<Placeholder style={{width: "55%"}} />{" "}
							</Placeholder>
							<Placeholder as={"p"} animation="glow">
								<Placeholder style={{width: "100%", height: "350px"}} />
							</Placeholder>
							<Placeholder as={"p"} animation="glow">
								<Placeholder style={{width: "10%"}} />{" "}<Placeholder style={{width: "10%"}} />
							</Placeholder>
						</>
					);
				}
				else{
					setRenderData(
						<>
							<div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", marginTop: "30px"}}>
								익명 게시판
								&nbsp;
								<Button onClick={() => {editEditorData()}} variant="primary" style={{width: "20%", minWidth: "70px", maxWidth: "100px", fontSize: "0.8rem"}}>수정</Button>
							</div>

							<Form.Select id="category" size="sm" style={{ marginBottom: "10px" }} defaultValue={postCategory}>
								<option value="normal">일반</option>
								<option value="humor">유머</option>
								<option value="life">일상</option>
								<option value="info">정보</option>
								<option value="report">고발</option>
							</Form.Select>

							<Form.Control id="title" type="text" placeholder="제목" style={{marginBottom: "10px", fontSize: "0.8rem"}} defaultValue={contentTitle} />

							<MyEditor
								editorMode={"write"}
								savedData={contentData}
								editorMaxKB={editorMaxKB}
								setEditor={(editor) => {setEditorObject(editor)}}
								setEditorSizeByte={(size) => {setEditorSizeByte(size)}}
							/>

							<ProgressBar
								now={parseInt((editorSizeByte / editorMaxKB) * 100, 10)} label={`${parseInt((editorSizeByte / editorMaxKB) * 100, 10)} %`}
								variant="success"
								style={{ height: "2.5rem", fontSize: "1rem", backgroundColor: "lightgray" }}
							/>

							<div style={{display: "flex", justifyContent: "flex-end", marginBottom: "15px", marginTop: "30px"}}>
								<Button onClick={() => {if(window.confirm("내용을 수정하지않고 나가시겠습니까?") === true){navigate(`/lostark/post/unknown/view/${postCode}`)}}} variant="secondary" style={{width: "20%", minWidth: "70px", maxWidth: "100px", fontSize: "0.8rem"}}>나가기</Button>
								&nbsp;
								<Button onClick={() => {editEditorData()}} variant="primary" style={{width: "20%", minWidth: "70px", maxWidth: "100px", fontSize: "0.8rem"}}>수정</Button>
							</div>
						</>
					);
				}
			}
		}
	}, [writeMode, postCategory, postCode, contentTitle, contentData, identity, failMessage, editorObject, editorSizeByte, saveEditorData, editEditorData, navigate])
	
	return(
		<Container style={{maxWidth: "1000px"}}>
			{renderData}
			<LoadingModal showModal={loadingModalShow} message={loadingModalMessage}/>
		</Container>
	);
}

export default UnknownPostWrite;
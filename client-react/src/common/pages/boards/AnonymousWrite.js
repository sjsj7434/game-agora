import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from 'react';
import MyEditor from './MyEditor'
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Placeholder from 'react-bootstrap/Placeholder';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import LoadingModal from '../common/LoadingModal';
import * as anonymousBoardsFetch from '../../js/anonymousBoardsFetch';
import '../../css/View.css';

const AnonymousWrite = () => {
	const [writeMode, setWriteMode] = useState("");
	const [contentCode, setContentCode] = useState(null);
	const [renderData, setRenderData] = useState(<></>);
	const [contentTitle, setContentTitle] = useState("");
	const [contentData, setContentData] = useState("");
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
			password: passwordElement.value,
			title: titleElement.value,
			content: editorContet,
			hasImage: editorContet.indexOf("<img") > -1 ? true : false,
		};

		let createResult = await anonymousBoardsFetch.createContent(sendData);

		if(createResult === null){
			alert("문제가 발생하여 게시글을 저장할 수 없습니다(1)");
			setLoadingModalShow(false);
			setLoadingModalMessage("");
		}
		else if(createResult === undefined){
			alert("문제가 발생하여 게시글을 저장할 수 없습니다(2)");
			setLoadingModalShow(false);
			setLoadingModalMessage("");
		}
		else{
			navigate(`/lostark/board/anonymous/1`);
		}
	}, [editorObject, editorSizeByte, editorMaxKB, navigate])

	/**
	 * 게시글 수정
	 */
	const editEditorData = useCallback(async () => {
		const titleElement = document.querySelector("#title");

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
			code: contentCode,
			password: contentPassword,
			title: titleElement.value,
			content: editorContet,
			hasImage: editorContet.indexOf("<img") > -1 ? true : false,
			writer: "",
		};

		let result = await anonymousBoardsFetch.updateContent(sendData);

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
			navigate(`/lostark/board/anonymous/view/${contentCode}`);
		}
	}, [contentCode, contentPassword, editorObject, editorSizeByte, editorMaxKB, navigate])

	useEffect(() => {
		if(params.contentCode !== undefined){
			setContentCode(params.contentCode);
			setWriteMode("edit");
		}
		else{
			setContentCode(null);
			setWriteMode("new");
		}
	}, [params.contentCode])

	useEffect(() => {
		/**
		 * 게시글 정보 가져오기
		 */
		const readContent = async () => {
			const readResult = await anonymousBoardsFetch.readContent(contentCode, "edit");
	
			setContentTitle(readResult.title);
			setContentData(readResult.content);
		}

		if(contentCode !== null && identity === true){
			readContent();
		}
	}, [contentCode, identity])

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
				code: contentCode,
				password: contentPasswordElement.value,
			};
			
			const checkResult = await anonymousBoardsFetch.checkBeforeEdit(sendData)

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
					익명 게시판 / 신규
					<Row className="g-2">
						<Col>
							<Form.Control id="writer" type="text" placeholder="작성자" defaultValue={"익명"} style={{marginBottom: "10px", fontSize: "0.8rem"}} readOnly />
						</Col>
						<Col>
							<Form.Control id="contentPassword" type="password" placeholder="비밀번호" maxLength={20} style={{marginBottom: "10px", fontSize: "0.8rem"}} />
						</Col>
					</Row>
					<Form.Control id="title" type="text" placeholder="제목" style={{marginBottom: "10px", fontSize: "0.8rem"}} defaultValue={""} />
					
					<MyEditor
						writeMode={writeMode}
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
						<Button onClick={() => {saveEditorData()}} variant="outline-primary" style={{width: "20%", minWidth: "60px", maxWidth: "200px", fontSize: "0.8rem"}}>저장</Button>
						&nbsp;
						<Button onClick={() => {if(window.confirm("작성한 내용을 전부 비우시겠습니까?") === true){editorObject.setData("")}}} variant="outline-danger" style={{width: "20%", minWidth: "60px", maxWidth: "200px", fontSize: "0.8rem"}}>비우기</Button>
						&nbsp;
						<Button onClick={() => {if(window.confirm("작성한 내용을 저장하지않고 나가시겠습니까?") === true){navigate("/lostark/board/anonymous/1")}}} variant="outline-secondary" style={{width: "20%", minWidth: "60px", maxWidth: "200px", fontSize: "0.8rem"}}>취소</Button>
					</div>
				</>
			)
		}
		else if(writeMode === "edit"){
			if(identity !== true){
				setRenderData(
					<Container style={{maxWidth: "600px"}}>
						<Form.Group as={Row} className="mb-3">
							<Form.Label style={{fontWeight: "800", fontSize: "0.8rem"}}>
								게시글 비밀번호를 입력해주세요
							</Form.Label>
							<Col>
								<InputGroup>
									<Form.Control id="contentPassword" maxLength={20} type="password" placeholder="게시글 비밀번호를 입력해주세요" onKeyDown={(event) => {if(event.key === "Enter"){checkBeforeEdit()}}} autoComplete="off" style={{fontSize: "0.8rem"}} />
								</InputGroup>
								<Form.Text style={{color: "red", fontSize: "0.8rem"}}>
									{failMessage}
								</Form.Text>
							</Col>
						</Form.Group>

						<div style={{display: "flex", justifyContent: "flex-end", marginBottom: "15px", marginTop: "30px"}}>
							<Button
								onClick={() => {checkBeforeEdit()}}
								variant="outline-primary"
								style={{width: "20%", minWidth: "60px", maxWidth: "200px", fontSize: "0.8rem"}}
							>
								확인
							</Button>
							&nbsp;
							<Button
								onClick={() => {if(window.confirm("내용을 수정하지않고 나가시겠습니까?") === true){navigate(`/lostark/board/anonymous/view/${contentCode}`)}}}
								variant="outline-secondary"
								style={{width: "20%", minWidth: "60px", maxWidth: "200px", fontSize: "0.8rem"}}
							>
								취소
							</Button>
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
							익명 게시판 / 수정
							<br />
							<Form.Control id="title" type="text" placeholder="제목" style={{marginBottom: "10px", fontSize: "0.8rem"}} defaultValue={contentTitle} />

							<MyEditor
								writeMode={writeMode}
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
								<Button
									onClick={() => {editEditorData()}}
									variant="outline-primary"
									style={{width: "20%", minWidth: "60px", maxWidth: "200px", fontSize: "0.8rem"}}
								>
									수정
								</Button>
								&nbsp;
								<Button
									onClick={() => {if(window.confirm("내용을 수정하지않고 나가시겠습니까?") === true){navigate(`/lostark/board/anonymous/view/${contentCode}`)}}}
									variant="outline-secondary"
									style={{width: "20%", minWidth: "60px", maxWidth: "200px", fontSize: "0.8rem"}}
								>
									취소
								</Button>
							</div>
						</>
					);
				}
			}
		}
	}, [writeMode, contentCode, contentTitle, contentData, identity, failMessage, editorObject, editorSizeByte, saveEditorData, editEditorData, navigate])
	
	return(
		<Container style={{maxWidth: "1000px"}}>
			{renderData}
			<LoadingModal showModal={loadingModalShow} message={loadingModalMessage}/>
		</Container>
	);
}

export default AnonymousWrite;
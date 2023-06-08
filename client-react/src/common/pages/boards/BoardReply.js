import { useState, useEffect, useCallback } from 'react';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CustomPagination from './CustomPagination';

const BoardReply = (props) => {
	const [upvoteCount, setUpvoteCount] = useState(0);
	const [downvoteCount, setDownvoteCount] = useState(0);
	const [renderData, setRenderData] = useState(<></>);

	/**
	 * 자주 사용하는 fetch 템플릿
	 * @param {string} destination fetch url, 목적지
	 * @returns {object} 가져온 정보 JSON
	 */
	const parseStringToJson = async (jsonString) => {
		if(jsonString === null){
			return null;
		}
		else if(jsonString.status === 500){
			alert("Error!\nCan not get data");
			return null;
		}
		else{
			const jsonResult = await jsonString.json();

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
	 * 댓글 페이지 이동
	 */
	const pageMoveFunc = (pageIndex) => {
		document.querySelector("div[id^=reply_]").scrollIntoView({ behavior: "smooth", block: "center" });
		getReplies(pageIndex);
	}

	/**
	 * 댓글 작성
	 */
	const createReply = useCallback(async () => {
		const replyDataElement = document.querySelector("#replyData");
		const replyPasswordElement = document.querySelector("#replyPassword");

		if(replyDataElement.value === ""){
			alert("내용을 입력해주세요");
			replyDataElement.focus();
			return;
		}
		else if(replyPasswordElement.value === ""){
			alert("삭제를 위한 비밀번호를 입력해주세요");
			replyPasswordElement.focus();
			return;
		}

		const sendData = {
			parentContentCode: props.contentCode,
			parentReplyCode: 0,
			content: replyDataElement.value,
			password: replyPasswordElement.value,
			level: 0,
			writer: "",
		}

		if(props.contentCode !== null){
			const fecthOption = {
				method: "POST"
				, body: JSON.stringify(sendData)
				, headers: {"Content-Type": "application/json",}
				, credentials: "include", // Don't forget to specify this if you need cookies
			};
			const jsonString = await fetch(`${process.env.REACT_APP_SERVER}/boards/reply`, fecthOption);
			const jsonData = await parseStringToJson(jsonString);

			console.log("createdReply", jsonData)

			if(jsonData === null){
				alert("댓글 작성 중 오류가 발생하였습니다(1)");
			}
			else if(jsonData === undefined){
				alert("댓글 작성 중 오류가 발생하였습니다(2)");
			}
			else{
				getReplies(1);
				// document.querySelector("#replyForm").reset();
			}
		}
	}, [props.contentCode])

	/**
	 * 댓글 삭제
	 */
	const deleteReply = async (replyCode) => {
		const deletePassword = window.prompt("댓글을 삭제하시려면 비밀번호를 입력해주세요");

		if(deletePassword === null){
			return;
		}
		else if(deletePassword === ""){
			alert("비밀번호를 입력해주세요");
			return;
		}
		else{
			const sendData = {
				code: replyCode,
				password: deletePassword,
				writer: "",
			}

			if(props.contentCode !== null){
				const fecthOption = {
					method: "DELETE"
					, body: JSON.stringify(sendData)
					, headers: {"Content-Type": "application/json",}
					, credentials: "include", // Don't forget to specify this if you need cookies
				};
				const jsonString = await fetch(`${process.env.REACT_APP_SERVER}/boards/reply`, fecthOption);
				const jsonData = await parseStringToJson(jsonString);

				console.log("deleteReply", jsonData)

				if(jsonData === null){
					alert("댓글 삭제 중 오류가 발생하였습니다(1)");
				}
				else if(jsonData === undefined){
					alert("댓글 삭제 중 오류가 발생하였습니다(2)");
				}
				else if(jsonData === false){
					alert("올바른 비밀번호가 아닙니다");
				}
				else{
					getReplies(1);
				}
			}
		}
	}

	/**
	 * 대댓글
	 */
	const appendReply = async (replyCode) => {
		const targetForm = document.querySelector(`#replyOfReplyForm_${replyCode}`);

		if(targetForm.style.display === "block"){
			targetForm.style.display = "none";
			return;
		}
		else{
			targetForm.style.display = "block";
		}

		const formArray = document.querySelectorAll(`form[id^=replyOfReplyForm_]`);
		for (const element of formArray) {
			if(element.id !== `replyOfReplyForm_${replyCode}`){
				if(element.style.display === "block"){
					element.style.display = "none";
				}
			}
		}
	}

	/**
	 * 게시글 upvote & downvote
	 */
	const voteReply = useCallback(async (type) => {
		const upvoteReply = document.querySelector("#upvoteReply");
		const downvoteReply = document.querySelector("#downvoteReply");
		upvoteReply.disabled = true;
		downvoteReply.disabled = true;

		if(props.contentCode !== null){
			const fecthOption = {
				method: "POST"
				, headers: {"Content-Type": "application/json",}
				, credentials: "include", // Don't forget to specify this if you need cookies
			};
			const jsonString = await fetch(`${process.env.REACT_APP_SERVER}/boards/reply/${type}/${props.contentCode}`, fecthOption);
			const jsonData = await parseStringToJson(jsonString);

			if(jsonData === null){
				alert("오늘은 이미 해당 게시물에 추천, 비추천을 하였습니다");
			}
			else{
				setUpvoteCount(jsonData.upvote);
				setDownvoteCount(jsonData.downvote);
			}
			
			upvoteReply.disabled = false;
			downvoteReply.disabled = false;
		}
	}, [props.contentCode])

	useEffect(() => {
		getReplies(1);
	}, [props.contentCode])

	/**
	 * 댓글 가져오기
	 */
	const getReplies = useCallback(async (page) => {
		if(props.contentCode !== null){
			console.log(`${process.env.REACT_APP_SERVER}/boards/reply/${props.contentCode}/${page}`)
			const fecthOption = {
				method: "GET"
				, headers: {"Content-Type": "application/json",}
				, credentials: "include", // Don't forget to specify this if you need cookies
			};

			const jsonString = await fetch(`${process.env.REACT_APP_SERVER}/boards/reply/${props.contentCode}/${page}`, fecthOption);
			// const jsonString = await fetch(`${process.env.REACT_APP_SERVER}/boards/TEST`, fecthOption);
			const jsonData = await parseStringToJson(jsonString);

			console.log("getReplies", jsonData)

			if(jsonData !== null){
				if(jsonData[1] === 0){
					setRenderData(
						<div style={{fontSize: "0.75rem", color: "lightgray"}}>
							* 등록된 댓글이 없습니다
						</div>
					);
				}
				else{
					const renderElement = [];

					renderElement.push(
						<div id={"replyTop"} style={{display: "flex", justifyContent: "flex-start"}}>
							<p style={{fontSize: "0.8rem"}}>댓글 <strong>{jsonData[1]}</strong>개</p>
						</div>
					);

					for (const element of jsonData[0]) {
						renderElement.push(
							<div id={`reply_${element.code}`} key={`reply_${element.code}`} style={{display: "flex", flexDirection: "column", paddingBottom: "5px", marginBottom: "5px", borderBottom: "1px solid lightgray"}}>
								<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
									<div>
										<Image src="https://cdn-icons-png.flaticon.com/512/1211/1211612.png" roundedCircle style={{width: "1.7rem", height: "1.7rem", border: "1px solid lightgray", backgroundColor: "#fbecca"}} />
										&nbsp;
										<span style={{fontSize: "0.8rem", color: "black"}}>{element.writer === "" ? `익명(${element.ip})` : element.writer}</span>
										&nbsp;
										<span style={{fontSize: "0.75rem", color: "lightgray"}}>{new Date().toLocaleString("sv-SE")}</span>
									</div>
									<div>
										<Button id={"deleteReply"} onClick={() => {deleteReply(element.code)}} variant="outline-danger" style={{padding: "2px", fontSize: "0.7rem"}}>
											삭제
										</Button>
									</div>
								</div>

								<div style={{fontSize: "0.75rem", marginTop: "5px"}}>
									{element.content}
								</div>

								<div style={{marginTop: "5px"}}>
									<Button id={"appendReply"} onClick={() => {appendReply(element.code)}} variant="outline-secondary" style={{padding: "1px", width: "15%", maxWidth: "150px", fontSize: "0.7rem"}}>
										답글
									</Button>
								</div>

								<Form id={`replyOfReplyForm_${element.code}`} style={{display: "none", margin: "4px", backgroundColor: "#efefef"}}>
									<div style={{padding: "12px"}}>
										<Form.Group className="mb-3">
											<Form.Label style={{fontSize: "0.8rem"}}>대댓글 작성</Form.Label>
											<Row className="g-2">
												<Col>
													<Form.Control type="text" placeholder="작성자" defaultValue={"익명"} style={{marginBottom: "10px", fontSize: "0.8rem"}} readOnly />
												</Col>
												<Col>
													<Form.Control type="password" placeholder="비밀번호" maxLength={20} style={{marginBottom: "10px", fontSize: "0.8rem"}} />
												</Col>
											</Row>
											<Form.Control as="textarea" rows={3} style={{fontSize: "0.8rem"}} />
											<Button onClick={() => {deleteReply(element.code)}} variant="primary" style={{width: "100%", marginTop: "10px", fontSize: "0.8rem"}}>
												저장
											</Button>
										</Form.Group>
									</div>
								</Form>
							</div>
						);
					}

					renderElement.push(
						<div style={{display: "flex", justifyContent: "center"}}>
							<CustomPagination currentPage={page} contentPerPage={50} contentCount={jsonData[1]} howManyPages={4} pageMoveFunc={pageMoveFunc}/>
						</div>
					);
					
					setRenderData(renderElement);
				}
			}
		}
	}, [props.contentCode])

	return(
		<Container style={{maxWidth: "1440px"}}>
			<div>
				<Form id={"replyForm"}>
					<Form.Group className="mb-3">
						<Form.Label>댓글 작성</Form.Label>
						<Row className="g-2">
							<Col>
								<Form.Control id="writer" type="text" placeholder="작성자" defaultValue={"익명"} style={{marginBottom: "10px"}} readOnly />
							</Col>
							<Col>
								<Form.Control id="replyPassword" type="password" placeholder="비밀번호" maxLength={20} style={{marginBottom: "10px"}} />
							</Col>
						</Row>
						<Form.Control id={"replyData"} as="textarea" rows={4} />
					</Form.Group>
				</Form>
				<div style={{display: "flex", justifyContent: "flex-end"}}>
					<Button id={"createReply"} onClick={() => {createReply()}} variant="outline-primary" style={{width: "30%", maxWidth: "200px", padding: "1px"}}>
						<span style={{fontSize: "0.8rem"}}>등록</span>
					</Button>
				</div>

				<hr/>
			</div>

			{renderData}
		</Container>
	);
}

export default BoardReply;
import { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import Tab from 'react-bootstrap/Tab';

import * as accountsAction from '../../js/accountsAction'

const ActivateLostark = (props) => {
	const [characterModalShow, setCharacterModalShow] = useState(false);
	const [characterList, setcharacterList] = useState([]);

	useEffect(() => {
		const call = async (characterName) => {
			console.log(characterName);
		}
		
		call(props.characterName);
	}, [props]); //처음 페이지 로딩 될때만

	const moveToStovePage = async () => {
		const stoveURL = document.querySelector('#stoveURL').value;
		window.open(`https://timeline.onstove.com/${stoveURL}`);
	}
	const getVerificationCode = async () => {
		const verificationCode = await accountsAction.getVerificationCode();
		document.querySelector('#verificationCode').value = verificationCode;
		document.querySelector("#verificationArea").style.display = "";
		document.querySelector("#getCodeButton").disabled = true;
	}
	const copyVerificationCode = async () => {
		const verificationCode = document.querySelector('#verificationCode');
		await navigator.clipboard.writeText(verificationCode.value);
		alert('인증코드가 복사되었습니다');
	}

	const compareCodeWithStove = async () => {
		//아직 정확한 비교가 이루어지지 않고 있으니 코드 비교 구현 필요
		props.setWaitModalShow(true);
		const stoveURL = document.querySelector('#stoveURL').value;
		const characterNames = await accountsAction.checkCodeMatch(stoveURL);
		console.log("characterNames", characterNames);

		if(characterNames.length === 0){
			alert("No data!");
			setCharacterModalShow(false);
		}
		else{
			const elements = [];
			elements.push(characterNames.map((character) => {
				return (
					<ListGroup.Item key={character} action onClick={() => {setCharacter(character)}}>
						{character}
					</ListGroup.Item>
				)
			}));

			setcharacterList(elements);
			setCharacterModalShow(true);
		}
		
		props.setWaitModalShow(false);
	}

	const setCharacter = (character) => {
		if(window.confirm(`${character}로 캐릭터를 설정하시겠습니까?`)){
			document.querySelector('#getCodeButton').disabled = true;
			document.querySelector('#verifyButton').disabled = true;
			setCharacterModalShow(false);
			document.querySelector("#formArea").style.display = "";
			
			document.querySelector('#chosenCharacter').value = character;
		}
	}

	return (
		<Container fluid>
			<div style={{ marginTop: "20px" }}>
				<Form>
					<Form.Group as={Row} className="mb-3">
						<Form.Label column sm="2">
							Stove Code
						</Form.Label>
						<Col sm="10">
							<Row className="mb-3">
								<InputGroup>
									<Form.Control
										id="stoveURL"
										defaultValue={"83200592"}
									/>
									<Button variant="outline-secondary" onClick={() => {moveToStovePage()}}>
										Go Stove
									</Button>
									<Button variant="outline-secondary" id="getCodeButton" onClick={() => {getVerificationCode()}}>
										Get Code
									</Button>
								</InputGroup>
								<Form.Text muted>
									Please write only the "code", not all url
								</Form.Text>
							</Row>
							<Row id="verificationArea" className="mb-3" style={{display: "none"}}>
								<InputGroup>
									<Form.Control
										id="verificationCode"
										readOnly
									/>
									
									<Button variant="outline-secondary" onClick={() => {copyVerificationCode()}}>
										Copy
									</Button>
									<Button variant="outline-secondary" id="verifyButton" onClick={() => {compareCodeWithStove()}}>
										Verify
									</Button>
								</InputGroup>
								<Form.Text muted>
									Your password must be 8-20 characters long, contain letters and numbers
								</Form.Text>
							</Row>
						</Col>
					</Form.Group>
					
					<Modal show={characterModalShow} onHide={() => {setCharacterModalShow(false)}} animation={true} backdrop="static" keyboard={false} centered>
						<Modal.Header>
							<Modal.Title>Choose one</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Tab.Container id="list-group-tabs-example" defaultActiveKey="#link1">
								<Row>
									<Col>
										<ListGroup variant="flush">
											{characterList}
										</ListGroup>
									</Col>
								</Row>
							</Tab.Container>
						</Modal.Body>
					</Modal>

					<div id="formArea" style={{display: "none"}}>
						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="2">
								Character
							</Form.Label>
							<Col sm="10">
								<Form.Control id="chosenCharacter" plaintext readOnly />
								<Form.Text muted>
									Your ID must be 1-20 characters long, only alphabet
								</Form.Text>
							</Col>
						</Form.Group>
						
						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="2">
								Level
							</Form.Label>
							<Col sm="10">
								<Form.Control id="chosenCharacterLevel" defaultValue="1232.34" plaintext readOnly />
								<Form.Text muted>
									Your ID must be 1-20 characters long, only alphabet
								</Form.Text>
							</Col>
						</Form.Group>
						
						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="2">
								Class
							</Form.Label>
							<Col sm="10">
								<Form.Control id="chosenCharacterClass" defaultValue="goal keep" plaintext readOnly />
								<Form.Text muted>
									Your ID must be 1-20 characters long, only alphabet
								</Form.Text>
							</Col>
						</Form.Group>
					</div>
					<Button size={"lg"} style={{width: "100%"}}>SAVE</Button>
				</Form>
			</div>
		</Container>
	);
}

export default ActivateLostark;
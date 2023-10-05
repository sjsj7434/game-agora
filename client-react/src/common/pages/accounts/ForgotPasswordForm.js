import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import LoadingModal from '../common/LoadingModal.js';

import * as accountsFetch from '../../js/accountsFetch.js'

const ForgotPasswordForm = (props) => {
	const [showLoadingModal, setShowLoadingModal] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (event) => {
		event.preventDefault();
		event.stopPropagation();
		const form = event.currentTarget;

		if(form.emailInput.value === ""){
			alert("이메일 (Email)을 확인해주세요");
			form.emailInput.focus();
			return false;
		}

		setShowLoadingModal(true);
		setLoadingMessage("이메일 발송 처리 중...");
		// await asyncWaiter(1);
		setShowLoadingModal(false);

		const signInResult = await accountsFetch.requestPasswordReset({
			email: form.emailInput.value,
		});

		if(signInResult === "email_sent"){
			alert("비밀번호 초기화를 위한 이메일이 발송되었습니다");
			navigate("/");
		}
		else if(signInResult === "no_user"){
			alert("이메일을 발송할 수 없습니다");
		}
	};

	/**
	 * 과도한 호출을 방지하기위한 대기
	 * @param {number} second 대기할 초
	 * @returns 없음
	 */
	// const asyncWaiter = async (second) => {
	// 	return new Promise((prom) => setTimeout(prom, second * 1000));
	// }

	return (
		<Container style={{maxWidth: "450px"}}>
			<LoadingModal showModal={showLoadingModal} message={loadingMessage}></LoadingModal>

			<div style={{ marginTop: "30px" }}>
				<div style={{ display: "flex", alignItems: "center", marginBottom: "20px", paddingBottom: "10px", borderBottom: "2px solid lightgray" }}>
					<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
						<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
					</svg>
					<span style={{fontSize: "1.2rem", marginLeft: "12px"}}>비밀번호를 잊으셨나요?</span>
				</div>
				<Form noValidate onSubmit={handleSubmit}>
					<Form.Group as={Row} className="mb-3">
						<Form.Label style={{fontWeight: "800", fontSize: "0.8rem"}}>
							이메일 (Email)
						</Form.Label>
						<InputGroup>
							<Form.Control id="emailInput" maxLength={20} type="text" placeholder="이메일을 입력해주세요" style={{fontSize: "0.9rem"}} />
						</InputGroup>
						<Form.Text muted style={{fontSize: "0.72rem"}}>
							가입하신 이메일을 적어주시면 해당 이메일로 비밀번호 재설정 메일이 발송됩니다
							<br />
							이메일 입력 / 이메일이 DB에 있으면 메일 발송 / 해당 메일의 링크를 클릭하면 해당 계정 비밀번호 변경하는 페이지로 이동
							<br />
							아무나 메일 찍어서 초기화 시키지 못하는 방법임
						</Form.Text>
					</Form.Group>

					<Button type="submit" variant="success" size="lg" style={{width: "100%", marginTop: "10px", fontSize: "0.9rem"}}>메일 보내기</Button>
				</Form>
			</div>
		</Container>
	);
}

export default ForgotPasswordForm;
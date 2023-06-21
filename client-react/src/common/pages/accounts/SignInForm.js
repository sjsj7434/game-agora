import { useState } from 'react';
import { Navigate, useNavigate } from "react-router-dom";
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import LoadingModal from '../common/LoadingModal.js';

import * as accountsFetch from '../../../common/js/accountsFetch.js'

const SignInForm = (props) => {
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
		if(form.passwordInput.value === ""){
			alert("비밀번호 (Password)를 확인해주세요");
			form.passwordInput.focus();
			return false;
		}

		setShowLoadingModal(true);
		setLoadingMessage("로그인 처리 중...");
		// await asyncWaiter(1);
		setShowLoadingModal(false);

		const signInResult = await accountsFetch.signInAccount({
			email: form.emailInput.value,
			password: form.passwordInput.value,
		});

		if(signInResult === "success"){
			props.checkSignInStatus();
			navigate("/");
		}
		else if(signInResult === "fail"){
			alert("이메일이나 비밀번호가 올바르지 않습니다");
		}
		else if(signInResult === "fail_limit"){
			alert("===== 경고 =====\n\n이메일이나 비밀번호가 올바르지 않습니다\n한번 더 실패할 경우 해당 계정은 잠금 처리됩니다");
		}
		else if(signInResult === "locked"){
			alert("===== 경고 =====\n\n지속된 로그인 실패로 계정이 잠금상태가 되었습니다\n[비밀번호 찾기]를 이용해주세요");
		}
		else if(signInResult === "sleep"){
			alert("계정이 휴면상태입니다");
		}
		else if(signInResult === "error"){
			alert("로그인에 실패하였습니다");
		}
		else if(signInResult === "already"){
			alert("누군가 이미 로그인하였습니다");
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

	if(props.accountData.status === "signin"){
		return (
			<Navigate to="/" />
		);
	}
	else{
		return (
			<Container style={{maxWidth: "600px"}}>
				<LoadingModal showModal={showLoadingModal} message={loadingMessage}></LoadingModal>

				<div style={{ marginTop: "30px" }}>
					<div style={{ display: "flex", alignItems: "center", marginBottom: "20px", paddingBottom: "10px", borderBottom: "2px solid lightgray" }}>
						<svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" fill="green" className="bi bi-box-arrow-in-up-right" viewBox="0 0 16 16">
							<path fillRule="evenodd" d="M6.364 13.5a.5.5 0 0 0 .5.5H13.5a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 13.5 1h-10A1.5 1.5 0 0 0 2 2.5v6.636a.5.5 0 1 0 1 0V2.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H6.864a.5.5 0 0 0-.5.5z"/>
							<path fillRule="evenodd" d="M11 5.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793l-8.147 8.146a.5.5 0 0 0 .708.708L10 6.707V10.5a.5.5 0 0 0 1 0v-5z"/>
						</svg>
						<span style={{fontSize: "1.2rem", marginLeft: "12px"}}>로그인</span>
					</div>
					<Form noValidate onSubmit={handleSubmit}>
						<Form.Group as={Row} className="mb-3">
							<Form.Label style={{fontWeight: "800", fontSize: "0.8rem"}}>
								이메일 (Email)
							</Form.Label>
							<InputGroup>
								<Form.Control id="emailInput" maxLength={20} type="text" placeholder="이메일을 입력해주세요" style={{fontSize: "0.9rem"}} />
							</InputGroup>
						</Form.Group>

						<Form.Group as={Row} className="mb-3">
							<Form.Label style={{fontWeight: "800", fontSize: "0.8rem"}}>
								비밀번호 (Password)
							</Form.Label>
							<InputGroup>
								<Form.Control id="passwordInput" maxLength={20} type="password" placeholder="비밀번호를 입력해주세요" style={{fontSize: "0.9rem"}} />
							</InputGroup>
							<Form.Text muted style={{fontSize: "0.72rem"}}>
								5번 이상 로그인에 실패할 경우 계정이 <span style={{color: "orangered", fontWeight: "600"}}>잠금 상태</span>가 됩니다
								<br />
								<span style={{color: "orangered", fontWeight: "600"}}>잠금 상태</span>가 되면 아래의 <span style={{color: "#0d6efd", fontWeight: "600"}}>비밀번호 찾기</span>를 이용해주세요
							</Form.Text>
						</Form.Group>

						<Button type="submit" variant="success" size="lg" style={{width: "100%", marginTop: "10px", fontSize: "0.95rem"}}>로그인</Button>
					</Form>

					<Button variant="outline-primary" size="lg" style={{width: "100%", marginTop: "10px", fontSize: "0.95rem"}}>비밀번호 찾기</Button>
				</div>
			</Container>
		);
	}
}

export default SignInForm;
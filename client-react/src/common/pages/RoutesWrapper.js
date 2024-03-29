import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Common.css';

import Error404 from './errors/Error404';
import * as accountFetch from '../js/accountFetch.js'
import LostarkMain from '../../lostark/pages/main/LostarkMain.js';
import SetActiveMenu from './SetActiveMenu';
import CommonTopMenu from './CommonTopMenu';

import UsefulSitesLostark from './common/UsefulSitesLostark';
import HelpCenter from './common/HelpCenter';

import RegisterForm from './account/RegisterForm';
import LoginForm from './account/LoginForm';
import MyPage from './account/MyPage';
import ForgotPasswordForm from './account/ForgotPasswordForm';
import BlockLoginUser from './account/BlockLoginUser';
import BlockLogoutUser from './account/BlockLogoutUser';
import RenewNicknameForm from './account/RenewNicknameForm';
import ActivateLostarkAPI from './account/ActivateLostarkAPI';
import ResetPasswordForm from './account/ResetPasswordForm';
import RenewPasswordForm from './account/RenewPasswordForm';

import AnnouncePostList from './post/announce/AnnouncePostList.js';
import AnnouncePostView from './post/announce/AnnouncePostView.js';

import UnknownPostList from './post/unknown/UnknownPostList.js';
import UnknownPostView from './post/unknown/UnknownPostView.js';
import UnknownPostWrite from './post/unknown/UnknownPostWrite.js';

import KnownPostList from './post/known/KnownPostList.js';
import KnownPostView from './post/known/KnownPostView.js';
import KnownPostWrite from './post/known/KnownPostWrite.js';
import MyBlacklist from './account/MyBlacklist.js';
import Profile from './account/Profile.js';
import Intro from './Intro.js';
import PrivacyPolicy from './PrivacyPolicy.js';
import PostHistory from './account/PostHistory.js';
import Footer from './footer.js';

// import CharacterInfo from '../../lostark/pages/character/CharacterInfo';

// index.js에서 StrictMode 존재하면 두번 랜더링, 개발 모드에서만 적용됩니다. 생명주기 메서드들은 프로덕션 모드에서 이중으로 호출되지 않습니다.
const RoutesWrapper = () => {
	const [accountData, setAccountData] = useState(null);
	const [currentMenu, setCurrentMenu] = useState(null);
	let location = useLocation();
	
	const checkLoginStatus = async () => {
		const statusJSON = await accountFetch.checkLoginStatus();
		setAccountData(statusJSON);
	}

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		})
		
		checkLoginStatus();
	}, [location.pathname]); //URL이 바뀔 때 마다 로그인 정보 갱신

	if(accountData !== null){
		return (
			<>
				<CommonTopMenu accountData={accountData} currentMenu={currentMenu} checkLoginStatus={checkLoginStatus} />

				<div style={{ minHeight: "50vh" }}>
					<Routes>
						{/* Contents */}
						<Route path="" element={ <Navigate to="/lostark/main" replace={true} /> } />

						<Route path="lostark">
							<Route path="" element={
								<Navigate to="main" replace={true} />
							} />
							<Route path="main" element={
								<>
									<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/lostark/main"} />
									<LostarkMain />
								</>
							} />

							<Route path="useful" element={
								<>
									<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/lostark/useful"} />
									<UsefulSitesLostark />
								</>
							} />

							<Route path="post">
								<Route path="unknown">
									<Route path="" element={
										<Navigate to="1" replace={true} />
									} />

									<Route path=":page" element={
										<>
											<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/lostark/post/unknown"} />
											<UnknownPostList />
										</>
									} />

									<Route path="view/:postCode" element={
										<>
											<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/lostark/post/unknown"} />
											<UnknownPostView />
										</>
									} />

									<Route path="write" element={
										<>
											<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/lostark/post/unknown"} />
											<UnknownPostWrite />
										</>
									} />

									<Route path="edit/:postCode" element={
										<>
											<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/lostark/post/unknown"} />
											<UnknownPostWrite />
										</>
									} />
								</Route>

								<Route path="known">
									<Route path="" element={
										<Navigate to="1" replace={true} />
									} />

									<Route path=":page" element={
										<>
											<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/lostark/post/known"} />
											<KnownPostList />
										</>
									} />

									<Route path="view/:postCode" element={
										<>
											<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/lostark/post/known"} />
											<KnownPostView accountData={accountData} />
										</>
									} />

									<Route path="write" element={
										<BlockLogoutUser
											accountData={accountData}
											ifAllow={
												<>
													<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/lostark/post/known"} />
													<KnownPostWrite accountData={accountData} />
												</>
											}
										/>
									} />

									<Route path="edit/:postCode" element={
										<BlockLogoutUser
											accountData={accountData}
											ifAllow={
												<>
													<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/lostark/post/known"} />
													<KnownPostWrite accountData={accountData} />
												</>
											}
										/>
									} />
								</Route>
							</Route>
						</Route>

						<Route path="account">
							<Route path="register" element={
								<BlockLoginUser
									accountData={accountData}
									ifAllow={
										<>
											<SetActiveMenu pageTitle="" setCurrentMenu={setCurrentMenu} menuCode={"/account/register"} />
											<RegisterForm />
										</>
									}
								/>
							} />
							<Route path="login" element={
								<BlockLoginUser
									accountData={accountData}
									ifAllow={
										<>
											<SetActiveMenu pageTitle="" setCurrentMenu={setCurrentMenu} menuCode={"/account/login"} />
											<LoginForm />
										</>
									}
								/>
							} />

							<Route path="find/password" element={
								<BlockLoginUser
									accountData={accountData}
									ifAllow={
										<>
											<SetActiveMenu pageTitle="" setCurrentMenu={setCurrentMenu} menuCode={"/account/find/password"} />
											<ForgotPasswordForm />
										</>
									}
								/>
							} />

							<Route path="reset/password/:verificationCode" element={
								<BlockLoginUser
									accountData={accountData}
									ifAllow={
										<>
											<ResetPasswordForm />
										</>
									}
								/>
							} />
							
							<Route path="mypage">
								<Route path="" element={
									<BlockLogoutUser
										accountData={accountData}
										ifAllow={
											<>
												<SetActiveMenu pageTitle="Agora(My)" setCurrentMenu={setCurrentMenu} menuCode={"/account/mypage"} />
												<MyPage />
											</>
										}
									/>
								} />
								
								<Route path="blacklist" element={
									<BlockLogoutUser
										accountData={accountData}
										ifAllow={
											<>
												<SetActiveMenu pageTitle="Agora(LA 인증)" setCurrentMenu={setCurrentMenu} menuCode={"/account/mypage/blacklist"} />
												<MyBlacklist />
											</>
										}
									/>
								} />

								<Route path="activate/lostark" element={
									<BlockLogoutUser
										accountData={accountData}
										ifAllow={
											<>
												<SetActiveMenu pageTitle="Agora(LA 인증)" setCurrentMenu={setCurrentMenu} menuCode={"/account/activate/lostark"} />
												{/* <ActivateLostarkScrap /> */}
												<ActivateLostarkAPI />
											</>
										}
									/>
								} />
								
								<Route path="renew/password" element={
									<BlockLogoutUser
										accountData={accountData}
										ifAllow={
											<>
												<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/account/renew/password"} />
												<RenewPasswordForm checkLoginStatus={checkLoginStatus} />
											</>
										}
									/>
								} />
								
								<Route path="renew/nickname" element={
									<BlockLogoutUser
										accountData={accountData}
										ifAllow={
											<>
												<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/account/renew/nickname"} />
												<RenewNicknameForm />
											</>
										}
									/>
								} />
							</Route>

							<Route path="profile">
								<Route path="introduce/:nickname" element={
									<>
										<SetActiveMenu pageTitle="Agora(Your)" setCurrentMenu={setCurrentMenu} menuCode={"/account/profile"} />
										<Profile />
									</>
								} />

								<Route path="history/post/:nickname" element={
									<>
										<SetActiveMenu pageTitle="Agora(Your)" setCurrentMenu={setCurrentMenu} menuCode={"/account/profile"} />
										<Profile />
									</>
								} />

								<Route path="history/reply/:nickname" element={
									<>
										<SetActiveMenu pageTitle="Agora(Your)" setCurrentMenu={setCurrentMenu} menuCode={"/account/profile"} />
										<Profile />
									</>
								} />
							</Route>

							<Route path="history">
								<Route path="post/:nickname" element={
									<>
										<SetActiveMenu pageTitle="Agora(Your)" setCurrentMenu={setCurrentMenu} menuCode={"/account/profile"} />
										<PostHistory />
									</>
								} />
							</Route>
						</Route>

						{/* <Route path="/character/:characterName" element={ <CharacterInfo /> } /> */}

						<Route path="post/announce">
							<Route path="" element={
								<Navigate to="1" replace={true} />
							} />

							<Route path=":page" element={
								<>
									<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/post/announce"} />
									<AnnouncePostList />
								</>
							} />

							<Route path="view/:postCode" element={
								<>
									<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/post/announce"} />
									<AnnouncePostView accountData={accountData} />
								</>
							} />
						</Route>
						
						<Route path="help" element={
							<BlockLogoutUser
								accountData={accountData}
								ifAllow={
									<>
										<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={"/help"} />
										<HelpCenter />
									</>
								}
							/>
						} />

						<Route path="intro" element={
							<>
								<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={""} />
								<Intro />
							</>
						} />

						<Route path="privacy" element={
							<>
								<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={""} />
								<PrivacyPolicy />
							</>
						} />

						{/* 상단에 위치하는 라우트들의 규칙을 모두 확인, 일치하는 라우트가 없는경우 처리 */}
						<Route path="*" element={
							<>
								<SetActiveMenu pageTitle="Agora(LA)" setCurrentMenu={setCurrentMenu} menuCode={""} />
								<Error404 />
							</>
						} />
					</Routes>
				</div>

				<Footer/>
			</>
		);
	}
}

export default RoutesWrapper;
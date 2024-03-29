import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './common/pages/App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// index.js에서 StrictMode 존재하면 두번 랜더링, 개발 모드에서만 적용됩니다. 생명주기 메서드들은 프로덕션 모드에서 이중으로 호출되지 않습니다.
// 진짜 두번 렌더링되고 있는지, 개발모드라서 두번 렌더링되는지 혼란스러움 그래서 개발 끝마치면 엄격 모드 켜서 확인할 예정
root.render(
	// <React.StrictMode>
		<App />
	// </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
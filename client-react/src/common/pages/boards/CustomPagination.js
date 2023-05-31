import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Pagination from 'react-bootstrap/Pagination';

const CustomPagination = (props) => {
	const [renderData, setRenderData] = useState(<></>);
	const [currentPage, setCurrentPage] = useState(null);
	const [contentPerPage, setContentPerPage] = useState(null);
	const [contentCount, setContentCount] = useState(null);
	const [moveURL, setMoveURL] = useState(null);
	const [howManyPages, setHowManyPages] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		setCurrentPage(Number(props.currentPage));
		setContentPerPage(props.contentPerPage);
		setContentCount(props.contentCount);
		setMoveURL(props.moveURL);
		setHowManyPages(props.howManyPages);
	}, [props.currentPage, props.contentPerPage, props.contentCount, props.moveURL, props.howManyPages])
	
	useEffect(() => {
		if(currentPage !== null && contentPerPage !== null && contentCount !== null && moveURL !== null){
			const paginationData = [];
			const maxPageCount = parseInt((contentCount - 1) / contentPerPage, 10) + 1;
			const startPage = ((parseInt((currentPage - 1) / howManyPages, 10)) * howManyPages) + 1;
			const endPage = (startPage + (howManyPages - 1) >= maxPageCount ? maxPageCount : startPage + (howManyPages - 1));
			const prevPageIndex = (startPage <= 1 ? 1 : startPage - 1);
			const nextPageIndex = (endPage <= maxPageCount ? endPage + 1 : endPage);
			const isDisablePrev = (startPage - 1 <= 0 ? true : false);
			const isDisableNext = (maxPageCount <= endPage ? true : false);

			// console.log(`    startPage: ${startPage} / endPage: ${endPage} / maxPageCount: ${maxPageCount} / endDir: ${(startPage + howManyPages >= maxPageCount ? "left" : "right")}`);
			// console.log(`    prevPageIndex: ${prevPageIndex} / isDisablePrev: ${isDisablePrev} / nextPageIndex: ${nextPageIndex} / isDisableNext: ${isDisableNext}`);

			paginationData.push(<Pagination.Prev key={"pagenation_prev"} disabled={isDisablePrev} onClick={() => {navigate(`${moveURL}/${prevPageIndex}`)}} />);
			for (let pageIndex = startPage; pageIndex <= endPage; pageIndex++) {
				paginationData.push(
					<Pagination.Item key={"pagenation_" + pageIndex} active={pageIndex === currentPage ? true : false} onClick={() => {navigate(`${moveURL}/${pageIndex}`)}}>
						{pageIndex}
					</Pagination.Item>
				);
			}
			paginationData.push(<Pagination.Next key={"pagenation_next"} disabled={isDisableNext} onClick={() => {navigate(`${moveURL}/${nextPageIndex}`)}} />);

			setRenderData(
				<Pagination>
					{paginationData}
				</Pagination>
			);
		}
	}, [currentPage, contentPerPage, contentCount, moveURL, howManyPages, navigate])
	
	return renderData;
}

export default CustomPagination;
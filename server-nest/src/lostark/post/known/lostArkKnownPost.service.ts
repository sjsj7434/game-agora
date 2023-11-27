import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThanOrEqual, Between, Equal, In } from 'typeorm';
import { AccountsService } from 'src/accounts/accounts.service';
import { Request, Response } from 'express';
import { ErrorLogService } from 'src/log/error.log.service';
import { LostArkKnownPost } from './lostArkKnownPost.entity';
import { LostArkKnownReply } from './lostArkKnownReply.entity';
import { LostArkKnownVoteHistory } from './lostArkKnownVoteHistory.entity';
import { CreateLostArkKnownPostDTO, DeleteLostArkKnownPostDTO, UpdateLostArkKnownPostDTO } from './lostArkKnownPost.dto';
import { CreateLostArkKnownReplyDTO, DeleteLostArkKnownReplyDTO } from './lostArkKnownReply.dto';

@Injectable()
export class LostArkKnownPostService {
	constructor(
		@InjectRepository(LostArkKnownPost) private lostArkKnownPostRepository: Repository<LostArkKnownPost>,
		@InjectRepository(LostArkKnownReply) private lostArkKnownReplyRepository: Repository<LostArkKnownReply>,
		@InjectRepository(LostArkKnownVoteHistory) private lostArkKnownVoteHistoryRepository: Repository<LostArkKnownVoteHistory>,
		private accountsService: AccountsService,
		private errorLogService: ErrorLogService,
	) { }

	private REPlY_MAX_LENG: number = 300; //댓글 글자 수 제한
	private REPlY_MAX_ROW: number = 10; //댓글 줄 수 제한
	private HOW_MANY_CONTENTS_ON_LIST: number = 20;

	async isVotablePost(contentCode: number, userId: string): Promise<boolean> {
		try {
			if(userId === ""){
				return false;
			}
			else{
				return !await this.lostArkKnownVoteHistoryRepository.exist({
					select: {
						writerNickname: true
					},
					where: {
						code: Equal(contentCode),
						writerID: Equal(userId),
					},
				});
			}
		}
		catch (error) {
			this.errorLogService.createErrorLog(error);
		}
	}

	/**
	 * 검색 날짜 범위 설정
	 * @param type 검색 타입
	 * @returns Date
	 */
	setSearchDate(type: string): Date {
		const dateOfNow = new Date();
		const yearNow = dateOfNow.getFullYear();
		const monthNow = dateOfNow.getMonth();
		const dayNow = dateOfNow.getDate();

		const allTime: Date = new Date(2023, 1, 1); //전체
		const yearly: Date = new Date(yearNow - 1, monthNow, dayNow); //연간
		const monthly: Date = new Date(yearNow, monthNow - 1, dayNow); //월간
		const weekly: Date = new Date(yearNow, monthNow, dayNow - 7); //주간
		const daily: Date = new Date(yearNow, monthNow, dayNow - 1); //일간
		let searchDate: Date = null;

		switch (type) {
			case "allTime":
				searchDate = allTime;
				break;
			case "yearly":
				searchDate = yearly;
				break;
			case "monthly":
				searchDate = monthly;
				break;
			case "weekly":
				searchDate = weekly;
				break;
			case "daily":
				searchDate = daily;
				break;
			default:
				searchDate = monthly;
				break;
		}

		return searchDate;
	}

	/**
	 * 추천 트랜드 게시글 목록 가져오기
	 */
	async getUpvoteTrend(page: number, type: string): Promise<[LostArkKnownPost[], number]> {
		try {
			const searchDate: Date = this.setSearchDate(type);
			const perPage: number = 10;
			const upvoteCutline: number = 1;

			const result = await this.lostArkKnownPostRepository.findAndCount({
				relations: ["reply"], //댓글 정보 join
				select: {
					reply: { code: true },
					code: true,
					category: true,
					writerNickname: true,
					title: true,
					view: true,
					upvote: true,
					downvote: true,
					ip: true,
					hasImage: true,
					createdAt: true,
				},
				where: {
					deletedAt: IsNull(),
					upvote: MoreThanOrEqual(upvoteCutline),
					createdAt: Between(searchDate, new Date()),
					category: In(["anonymous", "user"]),
				},
				order: {
					upvote: "DESC",
					view: "DESC",
					createdAt: "DESC",
				},
				withDeleted: true,
				skip: (page - 1) * perPage,
				take: perPage,
			});

			return result;
		}
		catch (error) {
			this.errorLogService.createErrorLog(error);
		}
	}

	/**
	 * 비추천 트랜드 게시글 목록 가져오기
	 */
	async getDownvoteTrend(page: number, type: string): Promise<[LostArkKnownPost[], number]> {
		const searchDate: Date = this.setSearchDate(type);
		const perPage: number = 10;
		const downvoteCutline: number = 1;

		const result = await this.lostArkKnownPostRepository.findAndCount({
			relations: ["reply"], //댓글 정보 join
			select: {
				reply: { code: true },
				code: true,
				category: true,
				writerNickname: true,
				title: true,
				view: true,
				upvote: true,
				downvote: true,
				ip: true,
				hasImage: true,
				createdAt: true,
			},
			where: {
				deletedAt: IsNull(),
				downvote: MoreThanOrEqual(downvoteCutline),
				createdAt: Between(searchDate, new Date()),
				category: In(["anonymous", "user"]),
			},
			order: {
				downvote: "DESC",
				view: "DESC",
				createdAt: "DESC",
			},
			withDeleted: true,
			skip: (page - 1) * perPage,
			take: perPage,
		});

		return result;
	}

	/**
	 * 조회 트랜드 게시글 목록 가져오기
	 */
	async getViewTrend(page: number, type: string): Promise<[LostArkKnownPost[], number]> {
		const searchDate: Date = this.setSearchDate(type);
		const perPage: number = 10;
		const viewCutline: number = 1;

		const result = await this.lostArkKnownPostRepository.findAndCount({
			relations: ["reply"], //댓글 정보 join
			select: {
				reply: { code: true },
				code: true,
				category: true,
				writerNickname: true,
				title: true,
				view: true,
				upvote: true,
				downvote: true,
				ip: true,
				hasImage: true,
				createdAt: true,
			},
			where: {
				deletedAt: IsNull(),
				view: MoreThanOrEqual(viewCutline),
				createdAt: Between(searchDate, new Date()),
				category: In(["anonymous", "user"]),
			},
			order: {
				view: "DESC",
				upvote: "DESC",
				downvote: "ASC",
				createdAt: "DESC",
			},
			withDeleted: true,
			skip: (page - 1) * perPage,
			take: perPage,
		});

		return result;
	}

	//=================================================================================================================================================================================

	/**
	 * 유저 게시판 목록 가져오기
	 */
	async getPostList(page: number): Promise<[LostArkKnownPost[], number]> {
		/*
		const queryOBJ = this.lostArkKnownPostRepository
		.createQueryBuilder("boards")
		.leftJoinAndSelect("boards.replies", "replies", "replies.parentContentCode = boards.code")
		.leftJoinAndSelect("boards.accounts", "accounts", "accounts.id = boards.writerID")
		.innerJoinAndSelect("accounts.authentication", "authentication", "authentication.uuid = accounts.uuid AND authentication.type = 'lostark_item_level'")

		.select("boards.code", "code")
		.addSelect("boards.writerNickname", "writerNickname")
		.addSelect("boards.title", "title")
		.addSelect("boards.view", "view")
		.addSelect("boards.upvote", "upvote")
		.addSelect("boards.downvote", "downvote")
		.addSelect("boards.hasImage", "hasImage")
		.addSelect("boards.createdAt", "createdAt")
		.addSelect("REPLACE(authentication.data, ',', '')", 'simpleItemLevel')
		.addSelect("COUNT(replies.code)", "repliesCount")

		.where("boards.category = :category", { category: "user" })
		.groupBy(`
			boards.code
			, boards.writerNickname
			, boards.title
			, boards.view
			, boards.upvote
			, boards.downvote
			, boards.hasImage
			, boards.createdAt
		`)
		.orderBy("boards.code", "DESC")
		.withDeleted()
		.skip((page - 1) * this.HOW_MANY_CONTENTS_ON_LIST)
		.take(this.HOW_MANY_CONTENTS_ON_LIST)

		// const queryData = queryOBJ.getSql();
		// console.log(queryData)

		const result3 = await queryOBJ.getRawMany(); // getMany를 하게 되면 entity와 같은 값만 나옴, getRawMany를 해야 위와 같은 연산 처리가 가능하다.
		console.log(result3)

		// return result2;
		return [result3, result3.length];
		*/

		const result = await this.lostArkKnownPostRepository.findAndCount({
			relations: ["reply", "accounts", "accounts.authentication"], //댓글 정보 join
			select: {
				reply: { code: true },
				accounts: { email: true, authentication: { type: true, data: true } },
				code: true,
				writerNickname: true,
				title: true,
				view: true,
				upvote: true,
				downvote: true,
				hasImage: true,
				createdAt: true,
			},
			where: {
				category: Equal("user"),
				deletedAt: IsNull(),
				accounts: {
					authentication: [
						{ type: Equal("lostark_item_level") },
						{ type: IsNull() },
					]
				}
			},
			order: {
				code: "DESC",
			},
			withDeleted: true,
			skip: (page - 1) * this.HOW_MANY_CONTENTS_ON_LIST,
			take: this.HOW_MANY_CONTENTS_ON_LIST,
		});

		return result;
	}

	/**
	 * 유저 게시판 글 읽기, 조회수 + 1
	 */
	async readPost(request: Request, response: Response, contentCode: number): Promise<{ contentData: LostArkKnownPost, isWriter: boolean }> {
		const loginCookie = await this.accountsService.checkLoginStatus(request, response);

		if (isNaN(contentCode) === true) {
			return null;
		}

		let isAuthor: boolean = false;

		await this.lostArkKnownPostRepository.increment({ code: contentCode }, "view", 1);

		const contentData = await this.lostArkKnownPostRepository.findOne({
			select: {
				code: true,
				category: true,
				title: true,
				content: true,
				view: true,
				upvote: true,
				downvote: true,
				writerID: true,
				writerNickname: true,
				ip: true,
				createdAt: true,
				updatedAt: true,
			},
			where: {
				code: Equal(contentCode),
				category: Equal("user"),
			},
		});

		if (contentData !== null) {
			isAuthor = contentData.writerID === loginCookie.id;
		}

		return { contentData: contentData, isWriter: isAuthor };
	}

	/**
	 * 유저 게시판 글 데이터 가져오기
	 */
	async getPost(request: Request, response: Response, contentCode: number): Promise<{ contentData: LostArkKnownPost, isWriter: boolean }> {
		const loginCookie = await this.accountsService.checkLoginStatus(request, response);

		if (isNaN(contentCode) === true) {
			return null;
		}

		let isAuthor: boolean = false;

		const contentData = await this.lostArkKnownPostRepository.findOne({
			select: {
				code: true,
				category: true,
				title: true,
				content: true,
				view: true,
				upvote: true,
				downvote: true,
				writerID: true,
				writerNickname: true,
				ip: true,
				createdAt: true,
				updatedAt: true,
			},
			where: {
				code: Equal(contentCode),
				category: Equal("user"),
			},
		});

		if (contentData !== null) {
			// contentData.ip = contentData.ip.split(".")[0] + (contentData.ip.split(".")[1] !== undefined ? "." + contentData.ip.split(".")[1] : "");
			isAuthor = contentData.writerID === loginCookie.id;
		}

		return { contentData: contentData, isWriter: isAuthor };
	}

	/**
	 * 유저 게시글 작성자 확인
	 */
	async isAuthor(request: Request, response: Response, code: number): Promise<boolean> {
		const loginCookie = await this.accountsService.checkLoginStatus(request, response);

		if (loginCookie.status === "login") {
			if (isNaN(code) === true) {
				return false;
			}

			const isExists = await this.lostArkKnownPostRepository.exist({
				select: {
					code: true,
					writerID: true,
				},
				where: {
					code: Equal(code),
					category: Equal("user"),
					writerID: Equal(loginCookie.id),
				},
			});

			return isExists;
		}
		else {
			return false;
		}
	}

	/**
	 * 유저 게시판에 게시글을 생성한다
	 */
	async createPost(createPostDTO: CreateLostArkKnownPostDTO, ipData: string, request: Request, response: Response) {
		const loginCookie = await this.accountsService.checkLoginStatus(request, response);

		if (loginCookie.status === "login") {
			createPostDTO.category = "user";
			createPostDTO.writerID = loginCookie.id;
			createPostDTO.writerNickname = loginCookie.nickname;
			createPostDTO.ip = ipData; //개발서버에서는 로컬만 찍혀서 임시로 비활성
			createPostDTO.ip = Math.random().toString().substring(2, 5) + "." + Math.random().toString().substring(2, 5) + "." + Math.random().toString().substring(2, 5) + "." + Math.random().toString().substring(2, 5);

			await this.lostArkKnownPostRepository.save(createPostDTO);

			return true;
		}
		else {
			return false;
		}
	}

	/**
	 * 유저 게시판에 글을 수정한다
	 */
	async updatePost(request: Request, response: Response, updatePostDTO: UpdateLostArkKnownPostDTO): Promise<boolean> {
		const loginCookie = await this.accountsService.checkLoginStatus(request, response);

		if (loginCookie.status === "login") {
			if (loginCookie.id !== updatePostDTO.writerID) {
				//위의 값이 아니면 누군가 값을 조작하여 전송했을 가능성이 있으므로 게시글 저장 차단
				return false;
			}

			updatePostDTO.writerID = loginCookie.id;

			const isExists = await this.lostArkKnownPostRepository.exist({
				where: {
					code: Equal(updatePostDTO.code),
					category: Equal("user"),
					password: Equal(""),
					writerID: Equal(updatePostDTO.writerID),
				}
			});

			if (isExists === true) {
				// updatePostDTO.updatedAt = new Date(); //update 날짜 수정

				await this.lostArkKnownPostRepository.save(updatePostDTO);
			}

			return isExists;
		}
		else {
			return false;
		}
	}

	/**
	 * 유저 게시판 글을 softDelete한다
	 */
	async softDeletePost(request: Request, response: Response, deletePostDTO: DeleteLostArkKnownPostDTO): Promise<boolean> {
		const loginCookie = await this.accountsService.checkLoginStatus(request, response);

		if (loginCookie.status === "login") {
			const isExists = await this.lostArkKnownPostRepository.exist({
				where: {
					code: Equal(deletePostDTO.code),
					category: Equal("user"),
					password: Equal(""),
					writerID: Equal(loginCookie.id),
				}
			});

			if (isExists === true) {
				await this.lostArkKnownPostRepository.softDelete({
					code: Equal(deletePostDTO.code)
				});
			}

			return isExists;
		}
		else {
			return false;
		}
	}

	/**
	 * 유저 게시판 글 추천
	 */
	async upvotePost(request: Request, response: Response, contentCode: number, ipData: string): Promise<{ upvote: number, downvote: number, isVotable: boolean }> {
		const loginCookie = await this.accountsService.checkLoginStatus(request, response);
		const isVotable: boolean = await this.isVotablePost(contentCode, loginCookie.id);

		if (isVotable === true && loginCookie !== null) {
			await this.lostArkKnownPostRepository.increment({ code: Equal(contentCode), category: Equal("user") }, "upvote", 1);
			
			const insertHistory = this.lostArkKnownVoteHistoryRepository.create({
				parentContentCode: contentCode,
				voteType: "up",
				writerID: loginCookie.id,
				writerNickname: loginCookie.nickname,
				ip: ipData,
			});
			await this.lostArkKnownVoteHistoryRepository.insert(insertHistory);
		}

		const contentData = await this.lostArkKnownPostRepository.findOne({
			select: {
				upvote: true,
				downvote: true,
			},
			where: {
				code: Equal(contentCode),
				category: Equal("user"),
			},
		});

		return { upvote: contentData.upvote, downvote: contentData.downvote, isVotable: isVotable };
	}

	/**
	 * 유저 게시판 글 비추천
	 */
	async downvotePost(request: Request, response: Response, contentCode: number, ipData: string): Promise<{ upvote: number, downvote: number, isVotable: boolean }> {
		const loginCookie = await this.accountsService.checkLoginStatus(request, response);
		const isVotable: boolean = await this.isVotablePost(contentCode, loginCookie.id);

		if (isVotable === true) {
			await this.lostArkKnownPostRepository.increment({ code: Equal(contentCode), category: Equal("user") }, "downvote", 1);

			const insertHistory = this.lostArkKnownVoteHistoryRepository.create({
				parentContentCode: contentCode,
				voteType: "down",
				writerID: loginCookie.id,
				writerNickname: loginCookie.nickname,
				ip: ipData,
			});
			await this.lostArkKnownVoteHistoryRepository.insert(insertHistory);
		}

		const contentData = await this.lostArkKnownPostRepository.findOne({
			select: {
				upvote: true,
				downvote: true,
			},
			where: {
				code: Equal(contentCode),
				category: Equal("user"),
			},
		});

		return { upvote: contentData.upvote, downvote: contentData.downvote, isVotable: isVotable };
	}

	/**
	 * 유저 게시판 추천자 목록
	 */
	async getPostUpvoteList(request: Request, response: Response, contentCode: number): Promise<LostArkKnownVoteHistory[]> {
		// const loginCookie = await this.accountsService.checkLoginStatus(request, response);

		const contentData = await this.lostArkKnownVoteHistoryRepository.find({
			select: {
				writerNickname: true,
				createdAt: true,
			},
			where: {
				parentContentCode: Equal(contentCode),
				voteType: Equal("up"),
			},
		});

		return contentData;
	}

	/**
	 * 유저 게시판 비추천자 목록
	 */
	async getPostDownvoteList(request: Request, response: Response, contentCode: number): Promise<LostArkKnownVoteHistory[]> {
		// const loginCookie = await this.accountsService.checkLoginStatus(request, response);

		const contentData = await this.lostArkKnownVoteHistoryRepository.find({
			select: {
				writerNickname: true,
				createdAt: true,
			},
			where: {
				parentContentCode: Equal(contentCode),
				voteType: Equal("down"),
			},
		});

		return contentData;
	}

	/**
	 * 유저 게시판 댓글 목록 가져오기
	 */
	async getReply(contentCode: number, page: number): Promise<[LostArkKnownReply[], number]> {
		const perPage = 50;

		const repliesData = await this.lostArkKnownReplyRepository.findAndCount({
			skip: (page - 1) * perPage, //시작 인덱스
			take: perPage, //페이지 당 갯수
			select: {
				code: true,
				parentReplyCode: true,
				level: true,
				content: true,
				upvote: true,
				downvote: true,
				writerNickname: true,
				ip: true,
				createdAt: true,
				deletedAt: true
			},
			where: {
				parentContentCode: Equal(contentCode),
			},
			order: {
				replyOrder: "DESC",
				level: "ASC",
				code: "ASC",
			},
			withDeleted: true,
		});

		if (repliesData[1] !== 0) {
			for (let index: number = 0; index < repliesData[0].length; index++) {
				if (repliesData[0][index]["deletedAt"] !== null) {
					repliesData[0][index]["content"] = new Date(repliesData[0][index]["deletedAt"]).toLocaleString("sv-SE") + " 삭제되었습니다";
				}
			}
		}

		return repliesData;
	}

	/**
	 * 유저 게시판 댓글 생성
	 */
	async createReply(request: Request, response: Response, createReplyDTO: CreateLostArkKnownReplyDTO, ipData: string): Promise<boolean> {
		//부모 게시글의 코드만 바꿔서 요청이 들어오면 비로그인 유저가 로그인 전용 게시글에 댓글을 익명으로 남길 수 있게됨
		//댓글 저장 전에 부모 게시글의 정보 확인
		if (createReplyDTO.content === ""){
			return false;
		}
		else if (createReplyDTO.content.length > this.REPlY_MAX_LENG) {
			return false;
		}
		else if (createReplyDTO.content.split("\n").length > this.REPlY_MAX_ROW) {
			return false;
		}

		const loginCookie = await this.accountsService.checkLoginStatus(request, response);

		if (loginCookie.status === "login") {
			createReplyDTO.writerID = loginCookie.id;
			createReplyDTO.writerNickname = loginCookie.nickname;
			createReplyDTO.replyOrder = 0;

			if (createReplyDTO.level === 0) {
				createReplyDTO.parentReplyCode = 0;
			}

			createReplyDTO.ip = ipData;
			createReplyDTO.ip = Math.random().toString().substring(2, 5) + "." + Math.random().toString().substring(2, 5) + "." + Math.random().toString().substring(2, 5) + "." + Math.random().toString().substring(2, 5);

			const contentData = await this.lostArkKnownPostRepository.exist({
				where: {
					code: Equal(createReplyDTO.parentContentCode),
					category: Equal("user"),
				},
			});

			if (contentData === true) {
				const replyData = await this.lostArkKnownReplyRepository.save(createReplyDTO);

				if (replyData.level === 0) {
					//댓글
					replyData.replyOrder = replyData.code;
				}
				else {
					//답글
					replyData.replyOrder = replyData.parentReplyCode;
				}

				await this.lostArkKnownReplyRepository.save(replyData);

				return true;
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	}

	/**
	 * 유저 게시판 댓글 삭제
	 */
	async deleteReply(request: Request, response: Response, deleteReplyDTO: DeleteLostArkKnownReplyDTO): Promise<boolean> {
		const loginCookie = await this.accountsService.checkLoginStatus(request, response);

		if (loginCookie.status !== "login") {
			return false;
		}
		
		const replyData = await this.lostArkKnownReplyRepository.exist({
			where: {
				code: Equal(deleteReplyDTO.code),
				writerID: Equal(loginCookie.id),
			}
		});

		if (replyData === false) {
			return false;
		}
		else {
			await this.lostArkKnownReplyRepository.softDelete({
				code: Equal(deleteReplyDTO.code),
				writerID: Equal(loginCookie.id),
			});

			return true;
		}
	}

	/**
	 * 게시판 글 이미지 삽입
	 */
	async uploadImage(file: Express.Multer.File): Promise<{ url: string } | { error: { message: string } }> {
		// const timeOfNow = new Date();
		// const timeString = timeOfNow.toLocaleDateString("sv-SE").replace(/-/g, "") + timeOfNow.toLocaleTimeString("sv-SE").replace(/:/g, "");
		// const randomName = Array(10).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16).substring(0, 1)).join("");
		file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8"); //한글 파일 이름이 깨져서 인코딩 추가
		console.log("uploadImage : ", file);

		return { url: "https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AAZrqDW?w=300&h=157&q=60&m=6&f=jpg&u=t" };
		// return { error: { message: "test error" } };
	}
}
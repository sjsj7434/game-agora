import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Equal } from 'typeorm';
import { AccountService } from 'src/account/account.service';
import { Request, Response } from 'express';
import { ErrorLogService } from 'src/log/error.log.service';
import { LostarkAnnounceVoteHistory } from './lostarkAnnounceVoteHistory.entity';
import { LostarkAnnouncePost } from './lostarkAnnouncePost.entity';

@Injectable()
export class LostarkAnnouncePostService {
	constructor(
		@InjectRepository(LostarkAnnouncePost) private lostarkAnnouncePostRepository: Repository<LostarkAnnouncePost>,
		@InjectRepository(LostarkAnnounceVoteHistory) private lostarkAnnounceVoteHistoryRepository: Repository<LostarkAnnounceVoteHistory>,
		private accountService: AccountService,
		private errorLogService: ErrorLogService,
	) { }

	private HOW_MANY_CONTENTS_ON_LIST: number = 20;

	async isVotablePost(postCode: number, userId: string): Promise<boolean> {
		try {
			if (userId === "") {
				return false;
			}
			else {
				return !await this.lostarkAnnounceVoteHistoryRepository.exist({
					select: {
						voterNickname: true
					},
					where: {
						postCode: Equal(postCode),
						voterID: Equal(userId),
					},
				});
			}
		}
		catch (error) {
			this.errorLogService.createErrorLog(error);
		}
	}

	//=================================================================================================================================================================================

	/**
	 * 유저 게시판 목록 가져오기
	 */
	async getPostList(page: number): Promise<[LostarkAnnouncePost[], number]> {
		const result = await this.lostarkAnnouncePostRepository.findAndCount({
			select: {
				code: true,
				title: true,
				view: true,
				upvote: true,
				downvote: true,
				hasImage: true,
				createdAt: true,
			},
			where: {
				deletedAt: IsNull(),
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
	async readPost(request: Request, response: Response, postCode: number): Promise<{ contentData: LostarkAnnouncePost, isWriter: boolean }> {
		const loginCookie = await this.accountService.checkLoginStatus(request, response);

		if (isNaN(postCode) === true) {
			return null;
		}

		let isAuthor: boolean = false;

		await this.lostarkAnnouncePostRepository.increment({ code: postCode }, "view", 1);

		const contentData = await this.lostarkAnnouncePostRepository.findOne({
			select: {
				code: true,
				category: true,
				title: true,
				content: true,
				view: true,
				upvote: true,
				downvote: true,
				writerID: true,
				ip: true,
				createdAt: true,
				updatedAt: true,
			},
			where: {
				code: Equal(postCode),
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
	async getPost(request: Request, response: Response, postCode: number): Promise<{ contentData: LostarkAnnouncePost, isWriter: boolean }> {
		const loginCookie = await this.accountService.checkLoginStatus(request, response);

		if (isNaN(postCode) === true) {
			return null;
		}

		let isAuthor: boolean = false;

		const contentData = await this.lostarkAnnouncePostRepository.findOne({
			select: {
				code: true,
				category: true,
				title: true,
				content: true,
				view: true,
				upvote: true,
				downvote: true,
				writerID: true,
				ip: true,
				createdAt: true,
				updatedAt: true,
			},
			where: {
				code: Equal(postCode),
			},
		});

		if (contentData !== null) {
			// contentData.ip = contentData.ip.split(".")[0] + (contentData.ip.split(".")[1] !== undefined ? "." + contentData.ip.split(".")[1] : "");
			isAuthor = contentData.writerID === loginCookie.id;
		}

		return { contentData: contentData, isWriter: isAuthor };
	}

	/**
	 * 유저 게시판 글 추천
	 */
	async upvotePost(request: Request, response: Response, postCode: number, ipData: string): Promise<{ upvote: number, downvote: number, isVotable: boolean }> {
		const loginCookie = await this.accountService.checkLoginStatus(request, response);
		const isVotable: boolean = await this.isVotablePost(postCode, loginCookie.id);

		if (isVotable === true && loginCookie !== null) {
			await this.lostarkAnnouncePostRepository.increment({ code: Equal(postCode) }, "upvote", 1);

			const insertHistory = this.lostarkAnnounceVoteHistoryRepository.create({
				postCode: postCode,
				voteType: "up",
				voterID: loginCookie.id,
				voterNickname: loginCookie.nickname,
				ip: ipData,
			});
			await this.lostarkAnnounceVoteHistoryRepository.insert(insertHistory);
		}

		const contentData = await this.lostarkAnnouncePostRepository.findOne({
			select: {
				upvote: true,
				downvote: true,
			},
			where: {
				code: Equal(postCode),
			},
		});

		return { upvote: contentData.upvote, downvote: contentData.downvote, isVotable: isVotable };
	}

	/**
	 * 유저 게시판 글 비추천
	 */
	async downvotePost(request: Request, response: Response, postCode: number, ipData: string): Promise<{ upvote: number, downvote: number, isVotable: boolean }> {
		const loginCookie = await this.accountService.checkLoginStatus(request, response);
		const isVotable: boolean = await this.isVotablePost(postCode, loginCookie.id);

		if (isVotable === true) {
			await this.lostarkAnnouncePostRepository.increment({ code: Equal(postCode) }, "downvote", 1);

			const insertHistory = this.lostarkAnnounceVoteHistoryRepository.create({
				postCode: postCode,
				voteType: "down",
				voterID: loginCookie.id,
				voterNickname: loginCookie.nickname,
				ip: ipData,
			});
			await this.lostarkAnnounceVoteHistoryRepository.insert(insertHistory);
		}

		const contentData = await this.lostarkAnnouncePostRepository.findOne({
			select: {
				upvote: true,
				downvote: true,
			},
			where: {
				code: Equal(postCode),
			},
		});

		return { upvote: contentData.upvote, downvote: contentData.downvote, isVotable: isVotable };
	}

	/**
	 * 유저 게시판 추천자 목록
	 */
	async getPostUpvoteList(request: Request, response: Response, postCode: number): Promise<LostarkAnnounceVoteHistory[]> {
		// const loginCookie = await this.accountService.checkLoginStatus(request, response);

		const contentData = await this.lostarkAnnounceVoteHistoryRepository.find({
			select: {
				voterNickname: true,
				createdAt: true,
			},
			where: {
				postCode: Equal(postCode),
				voteType: Equal("up"),
			},
		});

		return contentData;
	}

	/**
	 * 유저 게시판 비추천자 목록
	 */
	async getPostDownvoteList(request: Request, response: Response, postCode: number): Promise<LostarkAnnounceVoteHistory[]> {
		// const loginCookie = await this.accountService.checkLoginStatus(request, response);

		const contentData = await this.lostarkAnnounceVoteHistoryRepository.find({
			select: {
				voterNickname: true,
				createdAt: true,
			},
			where: {
				postCode: Equal(postCode),
				voteType: Equal("down"),
			},
		});

		return contentData;
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
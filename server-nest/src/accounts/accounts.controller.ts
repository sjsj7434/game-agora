import { Param, Controller, Get, Post, Put, Delete, Body, Res, Req, Patch } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountsDTO, DeleteAccountsDTO, UpdateAccountsDTO } from './accounts.dto';
import { Request, Response } from 'express';
import { Accounts } from './accounts.entity';
import { LostarkAPIService } from '../lostark/api/lostark.api.service';

@Controller("accounts")
export class  AccountsController {
	constructor(private accountsService: AccountsService, private apiService: LostarkAPIService) { }

	/**
	 * 마이페이지 > LA 인증 > 토큰 발급
	 */
	@Get("publish/token")
	async publishUserToken(@Req() request: Request): Promise<string> {
		console.log("[Controller-accounts-publishUserToken]");
		const userProfileToken = await this.accountsService.publishUserToken(request);
		return userProfileToken;
	}

	@Get("stove/profile/api/:stoveURL")
	async checkProfileTokenMatchAPI(@Req() request: Request, @Param("stoveURL") stoveURL: string): Promise<[string, object]> {
		console.log("[Controller-accounts-checkProfileTokenMatchAPI] => " + stoveURL);
		const stoveURLWithOutProtocol: string = stoveURL.replace(/https:\/\/|http:\/\//g, "");
		
		if(isNaN(Number(stoveURLWithOutProtocol)) === false){
			// const compareResult: boolean = await this.accountsService.isMatchStoveUserToken(request, stoveURLWithOutProtocol);
			const compareResult: boolean = true;

			if (compareResult === true){
				const characterName = await this.accountsService.getStoveUserCharacters_api(stoveURLWithOutProtocol);
				const characterNames = await this.apiService.getCharacterList(characterName); // { CharacterClassName: string, CharacterName: number, ItemAvgLevel: string, ItemMaxLevel: string, ServerName: string }
				
				return ["success", characterNames];
			}
			else {
				return ["fail", []];
			}
		}
		else{
			return ["codeError", []];
		}
	}

	@Get("stove/profile/scrap/:stoveURL")
	async checkProfileTokenMatchScrap(@Req() request: Request, @Param("stoveURL") stoveURL: string): Promise<[string, object]> {
		console.log("[Controller-accounts-checkProfileTokenMatchScrap] => " + stoveURL);
		const stoveURLWithOutProtocol: string = stoveURL.replace(/https:\/\/|http:\/\//g, "");
		
		if(isNaN(Number(stoveURLWithOutProtocol)) === false){
			// const compareResult: boolean = await this.accountsService.isMatchStoveUserToken(request, stoveURLWithOutProtocol);
			const compareResult: boolean = true;

			if (compareResult === true){
				const characterNames = await this.accountsService.getStoveUserCharacters_scrap(stoveURLWithOutProtocol);

				return ["success", characterNames];
			}
			else {
				return ["fail", []];
			}
		}
		else{
			return ["codeError", []];
		}
	}

	@Get("stove/character/scrap/:characterName")
	async getCharacterInfoScrap(@Req() request: Request, @Param("characterName") characterName: string): Promise<object> {
		console.log("[Controller-accounts-getCharacterInfoScrap] => " + characterName);
		
		const characterInfo: object = await this.accountsService.getCharacterInfo_scrap(characterName);

		return characterInfo;
	}

	@Post()
	async createAccount(@Body() createAccountsDTO: CreateAccountsDTO): Promise<number> {
		console.log("[Controller-accounts-createAccount] => ", createAccountsDTO);

		const result = await this.accountsService.createAccount(createAccountsDTO);

		return result;
	}

	@Delete()
	async deleteAccount(@Body() deleteAccountsDTO: DeleteAccountsDTO): Promise<string> {
		console.log("[Controller-accounts-deleteAccount] => ", deleteAccountsDTO);

		const result = await this.accountsService.deleteAccount(deleteAccountsDTO);
		console.log(result);

		return "soft-delete";
	}

	@Put("lostark/character")
	async updateLostarkMainCharacter(@Req() request: Request, @Body() body: { lostarkMainCharacter: string }): Promise<string> {
		console.log("[Controller-accounts-updateLostarkMainCharacter] => ", body);

		const result = await this.accountsService.updateLostarkMainCharacter(request, body);
		console.log(result);

		return "update lostark";
	}

	@Post("signin")
	async signInAccount(@Body() body: { email: string, password: string }, @Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<string> {
		console.log("[Controller-accounts-signInAccount] => ", body);

		const cookieCheck = await this.accountsService.checkSignInStatus(request, response);

		if (cookieCheck.status === "empty") { //로그인을 시도하지 않은 상태
			const result = await this.accountsService.signInAccount(body, request, response);

			return result;
		}
		else {
			if (cookieCheck.status === "error") {
				return "fail";
			}
			else if (cookieCheck.status === "locked") {
				return "locked";
			}
			else if (cookieCheck.status === "banned") {
				return "banned";
			}
			else{
				return "already";
			}
		}
	}

	@Post("signout")
	async setSignOut(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
		console.log("[Controller-accounts-setSignOut]");

		this.accountsService.setSignOut(request, response);
	}

	@Get("signin/status")
	async getSignInStatus(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<{ status: string, email: string, nickname: string }> {
		console.log("[Controller-accounts-getSignInStatus]");

		const cookieCheck = await this.accountsService.checkSignInStatus(request, response);

		return cookieCheck;
	}

	@Get("information/my")
	async getMyInfo(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<Accounts> {
		console.log("[Controller-accounts-getMyInfo]");

		const accountData = await this.accountsService.getMyInfo(request, response);

		return accountData;
	}

	@Patch("password")
	async updatePassword(@Req() request: Request, @Res({ passthrough: true }) response: Response, @Body() body: { oldPassword: string, newPassword: string }): Promise<number> {
		console.log("[Controller-accounts-updatePassword]", body);

		const updateResult = await this.accountsService.updatePassword(request, response, body);

		return updateResult;
	}
}
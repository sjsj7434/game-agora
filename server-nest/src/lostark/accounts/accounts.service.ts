import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accounts } from './accounts.entity';
import { AccountsDTO } from './accounts.dto';
import { randomBytes } from 'crypto';
import puppeteer from 'puppeteer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
 
@Injectable()
export class AccountsService {
	constructor(
		@InjectRepository(Accounts) private accountsRepository: Repository<Accounts>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) { }

	/**
	 * 유저의 스토브 소개란에 적을 인증 코드(32글자)를 생성한다
	 */
	async publishUserToken(): Promise<string>{
		const verificationCode = randomBytes(16).toString('hex');
		
		//인증번호는 node-cache를 사용하는 방법을 고려 중...
		const value = await this.cacheManager.get('verificationCode');
		console.log('hello =>   ', value)
		await this.cacheManager.set('verificationCode', verificationCode, (60 * 1000 * 3)); //3 minutes TTL(Time to live)
		// await this.cacheManager.del('verificationCode');
		//await this.cacheManager.reset();

		return verificationCode;
	}

	/**
	 * 유저의 스토브 소개란에 적힌 인증 코드를 가져온다
	 */
	async getStoveUserToken(stoveCode: string): Promise<string>{
		const browser = await puppeteer.launch({
			headless: true,
			waitForInitialPage: true,
		});
		const page = await browser.newPage();
		// await page.setViewport({width: 1920, height: 1080}); //화면 크기 설정, headless: false 여야 확인 가능
		await page.goto(`https://timeline.onstove.com/${stoveCode}`, {waitUntil: 'networkidle2'});

		const targetElement = await page.$('#navContent > div > div.layout-column-r > section:nth-child(1) > div.section-body > p'); //소개

		const data = await page.evaluate((data) => {
			return data.textContent;
		}, targetElement);
		
		await browser.close(); //창 종료

		return data;
	}

	/**
	 * 유저의 스토브 ID로 로스트아크 캐릭터 이름 목록을 가져온다
	 * 서버이름에 포함된 @를 이용해 반환 값을 split하여 사용
	 */
	async getStoveUserCharacters(stoveCode: string): Promise<object>{
		const result: object = {
			characterName: '',
			serverName: ''
		};
		const browser = await puppeteer.launch({
			headless: true,
			waitForInitialPage: true,
		});
		const page = await browser.newPage();
		// await page.setViewport({width: 1920, height: 1080}); //화면 크기 설정, headless: false 여야 확인 가능
		await page.goto(`https://lostark.game.onstove.com/Board/GetExpandInfo?memberNo=${stoveCode}`, {timeout: 10000, waitUntil: 'networkidle2'});

		const pageTarget = page.target(); //save this to know that this was the opener
		await page.click('body > div.profile-library > div.profile-link > a.button.button--black'); //click on a link
		const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget); //check that you opened this page, rather than just checking the url
		const newPage = await newTarget.page(); //get the page object
		await newPage.waitForSelector("body"); //wait for page to be loaded

		// const serverInfo = await newPage.$$eval('#expand-character-list > strong', (servers) => {
		// 	const serverList: Array<string> = [];
		// 	for(const element of servers){
		// 		serverList.push(element.textContent);
		// 	}
		// 	return serverList;
		// });

		const characterNames = await newPage.$$eval('#expand-character-list > ul > li > span > button > span', (characters) => {
			const characterList: Array<string> = [];
			for(const element of characters){
				characterList.push(element.textContent);
			}
			return characterList;
		});

		await browser.close(); //창 종료

		return characterNames;
	}

	/**
	 * ID로 1개의 계정을 찾는다
	 */
	findWithID(accountID: string): Promise<Accounts | null> {
		return this.accountsRepository.findOne({
			where: {
				id: accountID,
			},
		});
	}

	/**
	 * Controller에서 넘겨준 정보를 사용하여 계정을 전부 찾는다
	 */
	findAll(): Promise<Accounts[]> {
		return this.accountsRepository.find({
			// where: whereCondition,
			// take, skip / it is for the pagination
			// order
		});
	}

	/**
	 * 계정을 생성한다
	 */
	async createAccount(dto: AccountsDTO): Promise<Accounts | null> {
		await this.accountsRepository.save(dto)

		return;
	}

	/**
	 * ID에 맞는 계정을 수정한다
	 * find > 정보 수정 > save 처리
	 */
	async updateAccount(dto: AccountsDTO) {
		const account = await this.accountsRepository.findOne({
			where: {
				age: dto.age,
			}
		});

		account.id = dto.id;

		await this.accountsRepository.save(account);
	}

	/**
	 * code에 맞는 계정을 삭제(논리 삭제)
	 * find > 정보 수정 > save 처리
	 */
	async deleteAccount(dto: AccountsDTO) {
		await this.accountsRepository.softDelete({
			code: dto.code
		});
	}
}
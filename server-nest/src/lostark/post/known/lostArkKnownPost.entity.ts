import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { LostArkKnownReply } from './lostArkKnownReply.entity';
import { LostArkKnownPostVoteHistory } from './lostArkKnownPostVoteHistory.entity';
import { Account } from 'src/account/account.entity';

// This will create following database table
// If table is already exsists there could be error

//이모티콘 때문에 저장 오류가 발생한다면
//ALTER DATABASE game_agora CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
//ALTER TABLE boards CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin

@Entity()
export class LostArkKnownPost {
	@OneToMany(() => LostArkKnownReply, (reply) => reply.post)
	reply: LostArkKnownReply[];

	@OneToMany(() => LostArkKnownPostVoteHistory, (voteHistory) => voteHistory.post)
	voteHistory: LostArkKnownPostVoteHistory[];

	@ManyToOne(() => Account, (account) => account.post)
	@JoinColumn({ name: "writerUUID", referencedColumnName: "uuid" })
	account: Account;

	/**
	 * 자동으로 생성되는 코드
	 */
	@PrimaryGeneratedColumn({
		type: "int",
		unsigned: true,
	})
	code: number;

	/**
	 * 게시글 구분
	 */
	@Column({
		type: "varchar",
		length: 50,
		nullable: false,
	})
	category: string;

	/**
	 * 게시글 제목
	 */
	@Column({
		type: "varchar",
		length: 200,
		nullable: false,
	})
	title: string;

	/**
	 * 게시글 내용
	 */
	@Column({
		type: "text",
		nullable: false,
	})
	content: string;

	/**
	 * 게시글에 이미지가 있는지
	 */
	@Column({
		type: "boolean",
		default: false,
		nullable: false,
	})
	hasImage: boolean;

	/**
	 * 게시글 조회수
	 */
	@Column({
		type: "int",
		unsigned: true,
		default: 0,
		nullable: false,
	})
	view: number;

	/**
	 * 게시글 추천수
	 */
	@Column({
		type: "int",
		unsigned: true,
		default: 0,
		nullable: false,
	})
	upvote: number;

	/**
	 * 게시글 비추천수
	 */
	@Column({
		type: "int",
		unsigned: true,
		default: 0,
		nullable: false,
	})
	downvote: number;

	/**
	 * 작성자 UUID
	 */
	@Column({
		type: "varchar",
		length: 50,
		nullable: false,
		select: false,
	})
	writerUUID: string;

	/**
	 * 작성자 ID
	 */
	@Column({
		type: "varchar",
		length: 50,
		nullable: false,
		select: false,
	})
	writerID: string;

	/**
	 * 작성자 ip
	 */
	@Column({
		type: "varchar",
		length: 50,
		select: false,
	})
	ip: string;

	/**
	 * 게시글 생성일자(자동)
	 */
	@CreateDateColumn()
	createdAt!: Date;

	/**
	 * 게시글 변경일자(수동)
	 */
	@Column({
		type: "datetime",
		nullable: true,
	})
	updatedAt: Date | null;

	/**
	 * 게시글 삭제일자(자동), soft delete
	 */
	@DeleteDateColumn()
	deletedAt!: Date | null;
}
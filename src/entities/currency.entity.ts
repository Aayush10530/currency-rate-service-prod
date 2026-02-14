import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('currency')
export class Currency {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ unique: true })
    code: string;

    @CreateDateColumn()
    createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Currency } from './currency.entity';

@Entity('exchange_rate')
@Unique(['baseCurrency', 'targetCurrency', 'fetchedAt'])
@Index(['baseCurrency', 'targetCurrency', 'fetchedAt'])
export class ExchangeRate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Currency, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'baseCurrencyId' })
    baseCurrency: Currency;

    @ManyToOne(() => Currency, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'targetCurrencyId' })
    targetCurrency: Currency;

    @Column({ type: 'numeric', precision: 18, scale: 8 })
    rate: string;

    @Column()
    fetchedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}

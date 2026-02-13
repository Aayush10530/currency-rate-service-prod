import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    @Get()
    async checkHealth() {
        try {
            await this.dataSource.query('SELECT 1');
            return { status: 'ok', database: 'connected' };
        } catch (error) {
            throw new HttpException(
                { status: 'error', database: 'disconnected' },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

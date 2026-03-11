import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export const revenueChartPeriods = ['daily', 'weekly', 'monthly'] as const;

export type RevenueChartPeriod = (typeof revenueChartPeriods)[number];

export class GetRevenueChartDto {
	@ApiPropertyOptional({
		description: 'Revenue aggregation period',
		enum: revenueChartPeriods,
		example: 'daily',
	})
	@IsOptional()
	@IsIn(revenueChartPeriods)
	period?: RevenueChartPeriod;

	@ApiPropertyOptional({
		description: 'Start date in ISO format',
		example: '2026-03-01T00:00:00.000Z',
	})
	@IsOptional()
	@IsString()
	startDate?: string;

	@ApiPropertyOptional({
		description: 'End date in ISO format',
		example: '2026-03-31T23:59:59.999Z',
	})
	@IsOptional()
	@IsString()
	endDate?: string;
}

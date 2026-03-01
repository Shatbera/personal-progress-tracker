import { IsInt, Max, Min } from 'class-validator';

export class CreateDayPlanDto {
	@IsInt()
	@Min(0)
	@Max(1440)
	startMinutes: number;

	@IsInt()
	@Min(0)
	@Max(1440)
	endMinutes: number;
}

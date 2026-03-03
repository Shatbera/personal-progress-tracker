import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateDayBlockDto {
	@IsInt()
	@Min(0)
	@Max(1440)
	startMinutes: number;

	@IsInt()
	@Min(0)
	@Max(1440)
	endMinutes: number;

	@IsString()
	label: string;
}

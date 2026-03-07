import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

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

	@IsOptional()
	@IsUUID()
	categoryId?: string | null;
}

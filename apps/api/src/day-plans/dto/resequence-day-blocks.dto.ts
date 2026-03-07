import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';

class ResequenceDayBlockItemDto {
	@IsString()
	id: string;

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

export class ResequenceDayBlocksDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ResequenceDayBlockItemDto)
	blocks: ResequenceDayBlockItemDto[];
}

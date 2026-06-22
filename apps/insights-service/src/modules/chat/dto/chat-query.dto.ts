import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ChatQueryDto {
  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsIn(['en', 'hi', 'hinglish'])
  locale?: 'en' | 'hi' | 'hinglish';

  @IsOptional()
  @IsUUID()
  conversationId?: string;
}

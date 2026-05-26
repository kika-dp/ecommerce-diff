import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = process.env.DATABASE_URL;
        const base = {
          type: 'postgres' as const,
          autoLoadEntities: true,
          synchronize: config.get<boolean>('database.synchronize'),
          logging: config.get<boolean>('database.logging'),
          ssl: url ? { rejectUnauthorized: false } : false,
        };
        if (url) return { ...base, url };
        return {
          ...base,
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.database'),
        };
      },
    }),
  ],
})
export class DatabaseModule {}

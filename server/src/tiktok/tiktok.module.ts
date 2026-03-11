import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiktokController } from './tiktok.controller';
import { TiktokService } from './tiktok.service';
import { Product } from '../products/entities/product.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
	imports: [TypeOrmModule.forFeature([Product]), OrdersModule],
	controllers: [TiktokController],
	providers: [TiktokService],
})
export class TiktokModule {}

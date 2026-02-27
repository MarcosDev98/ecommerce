import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUserId } from 'src/auth/decorators/get-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  @ApiOperation({
    summary: 'Obtener el historial de órdenes del usuario logueado',
  })
  async findMyOrders(@GetUserId() userId: number) {
    return this.ordersService.findByUser(userId);
  }

  @ApiBearerAuth()
  @ApiTags('orders')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUserId() userId: number,
  ) {
    return this.ordersService.create(createOrderDto, userId);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}

import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ContractRequestService } from './contract-request.service';
import {
    CreateContractRequestDto,
    RespondToContractRequestDto,
    UpdateContractRequestDto,
} from './dto/contract-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('contract-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractRequestController {
    constructor(private readonly contractRequestService: ContractRequestService) { }

    @Post()
    @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN)
    create(@Request() req, @Body() createDto: CreateContractRequestDto) {
        return this.contractRequestService.create(
            req.user.id,
            req.user.role,
            createDto,
        );
    }

    @Get()
    @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN)
    findAll(@Request() req) {
        return this.contractRequestService.findAllForUser(req.user.id, req.user.role);
    }

    @Get(':id')
    @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN)
    async findOne(@Request() req, @Param('id') id: string) {
        const result = await this.contractRequestService.findOne(id, req.user.id, req.user.role);
        return result || {};
    }

    @Patch(':id/approve')
    @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN)
    approve(
        @Request() req,
        @Param('id') id: string,
        @Body() respondDto: RespondToContractRequestDto,
    ) {
        return this.contractRequestService.approve(
            id,
            req.user.id,
            req.user.role,
            respondDto,
        );
    }

    @Patch(':id/reject')
    @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN)
    reject(
        @Request() req,
        @Param('id') id: string,
        @Body() respondDto: RespondToContractRequestDto,
    ) {
        return this.contractRequestService.reject(
            id,
            req.user.id,
            req.user.role,
            respondDto,
        );
    }

    @Patch(':id/cancel')
    @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN)
    cancel(@Request() req, @Param('id') id: string) {
        return this.contractRequestService.cancel(id, req.user.id, req.user.role);
    }

    @Patch(':id')
    @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN)
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateDto: UpdateContractRequestDto,
    ) {
        return this.contractRequestService.update(
            id,
            req.user.id,
            req.user.role,
            updateDto,
        );
    }
}

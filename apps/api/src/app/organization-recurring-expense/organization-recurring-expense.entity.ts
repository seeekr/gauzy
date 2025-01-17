import {
    Column,
    Entity,
    Index,
} from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Base } from '../core/entities/base';
import { OrganizationRecurringExpense as IOrganizationRecurringExpense, CurrenciesEnum } from '@gauzy/models';

@Entity('organization_recurring_expense')
export class OrganizationRecurringExpense extends Base implements IOrganizationRecurringExpense {
    @ApiModelProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Index()
    @Column()
    orgId: string;

    @ApiModelProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Index()
    @Column()
    categoryName: string;

    @ApiModelProperty({ type: Number })
    @IsNumber()
    @IsNotEmpty()
    @Column()
    value: number;

    @ApiModelProperty({ type: String, enum: CurrenciesEnum })
    @IsEnum(CurrenciesEnum)
    @IsNotEmpty()
    @Index()
    @Column()
    currency: string;
}

import { IsPositive } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 200 })
    name: string

    @Column({ type: 'float' })
    price: number

    @Column({ type: 'float' })
    @IsPositive()
    cost: number

    @Column({ type: 'int',default:0 })
    @IsPositive()
    stock: number

    @Column('text',{unique:true})
    slug:string

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date
    
}

import { IsPositive } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

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

    @Column({ type: 'int', default: 0 })
    @IsPositive()
    stock: number

    @Column('text', { unique: true })
    slug: string

    @Column({type:'text', array:true, default:[]})
    tags:string[]

    @OneToMany(
        ()=> ProductImage,
        (productImage)=> productImage.product,
        {cascade:true}
    )
    images?:ProductImage

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date

    @BeforeInsert()
    @BeforeUpdate()
    convertStringToSlug() {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-');

    }

}

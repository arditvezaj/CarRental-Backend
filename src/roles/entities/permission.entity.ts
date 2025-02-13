import { IsDefined, Length } from 'class-validator';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 128 })
    @Length(1, 128)
    @IsDefined()
    name: string;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];
}

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "cars" })
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  make: string;

  @Column({ nullable: true })
  model: string;

  @Column({ type: "date", nullable: true })
  date: Date | string;

  @Column({ nullable: true })
  engine: string;

  @Column({ nullable: true })
  transmission: string;

  @Column({ nullable: true })
  fuel: string;

  @Column({ nullable: true })
  firstRegistration: string;

  @Column({ nullable: true })
  price: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  isPremium: boolean;
}

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  nombre!: string

  @Column()
  apellido!: string

  @Column()
  email!: string
  
  @Column()
  username!: string

  @Column()
  password!: string

  @Column()
  isDeleted!: boolean
}
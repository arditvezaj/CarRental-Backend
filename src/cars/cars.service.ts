import { Injectable } from "@nestjs/common";
import { CreateCarDto } from "./dto/create-car.dto";
import { UpdateCarDto } from "./dto/update-car.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Car } from "./entities/car.entity";

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carsRepository: Repository<Car>
  ) {}

  async create(createCarDto: CreateCarDto) {
    return await this.carsRepository.save(createCarDto);
  }

  findAll() {
    return this.carsRepository.find();
  }

  findOne(id: number) {
    return this.carsRepository.findOne({ where: { id } });
  }

  update(id: number, updateCarDto: UpdateCarDto) {
    return this.carsRepository.update(id, updateCarDto);
  }

  remove(id: number) {
    return this.carsRepository.delete(id);
  }
}

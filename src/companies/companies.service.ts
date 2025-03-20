import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Repository } from 'typeorm';
import { Company } from 'src/companies/entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
// import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    try {
      if (!createCompanyDto.logo) {
        throw new BadRequestException('Logo ist erforderlich');
      }

      const company = this.companiesRepository.create(createCompanyDto);

      return await this.companiesRepository.save(company);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Unternehmen mit diesem Namen existiert bereits',
        );
      }
      throw error;
    }
  }

  async findAll(search: string): Promise<Company[]> {
    const query = this.companiesRepository.createQueryBuilder('company');

    if (search) {
      query.andWhere('LOWER(company.name) LIKE :search', {
        search: search.toLowerCase() + '%',
      });
    }

    query.orderBy('LOWER(company.name)', 'ASC');

    return await query.getMany();
  }

  async findOne(id: number) {
    return await this.companiesRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    try {
      const company = await this.findOne(id);
      if (!company) {
        throw new NotFoundException();
      }

      Object.assign(company, updateCompanyDto);

      return await this.companiesRepository.save(company);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Unternehmen mit diesem Namen existiert bereits',
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    const company = await this.findOne(id);
    if (!company) {
      throw new NotFoundException();
    }

    return await this.companiesRepository.remove(company);
  }

  // async deleteImage(publicId: string): Promise<void> {
  //   cloudinary.config({
  //     cloud_name: 'dev5szzyt',
  //     api_key: '414523388966149',
  //     api_secret: 'pBbaITWDMHr1eYj-EWwKTQc4_CE',
  //     secure: true,
  //   });

  //   try {
  //     const result = await cloudinary.uploader.destroy('logos/' + publicId);

  //     if (result.result !== 'ok') {
  //       throw new Error(`Failed to delete logo: ${result.result}`);
  //     }
  //   } catch (error) {
  //     throw new Error(`Failed to delete logo: ${error.message}`);
  //   }
  // }
}

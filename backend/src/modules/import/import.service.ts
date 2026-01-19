import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { ImportTemplate } from './entities/import-template.entity';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(ImportTemplate)
    private importTemplatesRepository: Repository<ImportTemplate>,
  ) {}

  async createTemplate(createDto: any): Promise<ImportTemplate> {
    const template = this.importTemplatesRepository.create(createDto);
    const saved = await this.importTemplatesRepository.save(template);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async getTemplate(assetTypeId: string): Promise<ImportTemplate | null> {
    return this.importTemplatesRepository.findOne({
      where: { asset_type_id: assetTypeId },
    });
  }

  async parseExcel(file: Express.Multer.File): Promise<{
    headers: string[];
    rows: any[][];
  }> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // 转换为JSON数组
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (data.length === 0) {
        throw new Error('Excel文件为空');
      }
      
      // 第一行作为表头
      const headers = (data[0] as any[]).map((h: any) => String(h || '').trim()).filter(h => h);
      
      if (headers.length === 0) {
        throw new Error('Excel文件没有有效的表头');
      }
      
      // 其余行作为数据
      const rows = (data.slice(1) as any[][]).map(row => 
        row.map(cell => String(cell || '').trim())
      );
      
      return { headers, rows };
    } catch (error: any) {
      throw new Error(`解析Excel文件失败: ${error.message}`);
    }
  }

  async importData(file: any, templateId: string): Promise<any> {
    // 实现数据导入逻辑
    return { success: true, imported: 0 };
  }
}


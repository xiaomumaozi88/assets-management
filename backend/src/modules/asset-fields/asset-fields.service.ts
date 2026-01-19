import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetField, FieldType } from './entities/asset-field.entity';

@Injectable()
export class AssetFieldsService {
  constructor(
    @InjectRepository(AssetField)
    private assetFieldsRepository: Repository<AssetField>,
  ) {}

  async create(createDto: any): Promise<AssetField> {
    const field = this.assetFieldsRepository.create(createDto);
    const saved = await this.assetFieldsRepository.save(field);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findByAssetType(assetTypeId: string): Promise<AssetField[]> {
    return this.assetFieldsRepository.find({
      where: { asset_type_id: assetTypeId },
      order: { display_order: 'ASC' },
    });
  }

  async findByAssetTemplate(templateId: string): Promise<AssetField[]> {
    return this.assetFieldsRepository.find({
      where: { asset_template_id: templateId },
      order: { display_order: 'ASC' },
    });
  }

  async update(id: string, updateDto: any): Promise<AssetField | null> {
    console.log('=== 开始更新字段 ===');
    console.log('ID:', id);
    console.log('请求数据:', JSON.stringify(updateDto, null, 2));
    
    try {
      // 先获取现有记录（使用原生 SQL 避免 TypeORM 元数据问题）
      const existingResult = await this.assetFieldsRepository.query(
        'SELECT * FROM asset_fields WHERE id = $1',
        [id]
      );
      const existing = existingResult && existingResult.length > 0 ? existingResult[0] : null;
      console.log('现有记录:', existing ? JSON.stringify(existing, null, 2) : '不存在');
      
      if (!existing) {
        throw new Error('字段不存在');
      }

      // 过滤掉不应该更新的字段
      const { id: _, created_at, updated_at, ...updateData } = updateDto;
      console.log('过滤后的更新数据:', JSON.stringify(updateData, null, 2));
      
      // 如果 field_code 为空字符串、null 或 undefined，需要生成一个
      const existingFieldCode = existing.field_code;
      const hasValidExistingCode = existingFieldCode && typeof existingFieldCode === 'string' && existingFieldCode.trim() !== '';
      
      if (!updateData.field_code || (typeof updateData.field_code === 'string' && updateData.field_code.trim() === '')) {
        console.log('field_code 为空，开始生成');
        console.log('现有 field_code 值:', existingFieldCode);
        console.log('现有 field_code 是否有效:', hasValidExistingCode);
        
        // 先尝试使用现有的 field_code（如果有效）
        if (hasValidExistingCode) {
          updateData.field_code = existingFieldCode;
          console.log('使用现有 field_code:', updateData.field_code);
        } else if (updateData.field_name) {
          // 从 field_name 生成 field_code
          let generatedCode = updateData.field_name
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
          
          console.log('第一次生成的 field_code:', generatedCode);
          
          // 如果生成后还是空的（比如纯中文），使用时间戳
          if (!generatedCode || generatedCode.trim() === '') {
            generatedCode = `field_${id.substring(0, 8)}_${Date.now()}`;
            console.log('使用时间戳生成 field_code:', generatedCode);
          }
          
          updateData.field_code = generatedCode;
        } else {
          // 如果连 field_name 都没有，使用时间戳
          updateData.field_code = `field_${id.substring(0, 8)}_${Date.now()}`;
          console.log('使用默认 field_code:', updateData.field_code);
        }
      }
      
      // 确保 field_code 不为空
      if (!updateData.field_code || (typeof updateData.field_code === 'string' && updateData.field_code.trim() === '')) {
        console.error('field_code 仍然为空!');
        throw new Error('field_code 不能为空');
      }
      
      console.log('最终的 field_code:', updateData.field_code);
      
      // 处理 null 值，转换为 undefined（这样 TypeORM 不会更新这些字段）
      if (updateData.default_value === null) {
        updateData.default_value = undefined;
      }
      if (updateData.validation_rule === null) {
        updateData.validation_rule = undefined;
      }
      if (updateData.options === null) {
        updateData.options = undefined;
      }
      
      // 确保 is_primary 是布尔值
      if (updateData.is_primary !== undefined) {
        updateData.is_primary = Boolean(updateData.is_primary);
      }
      
      console.log('准备保存的数据:', JSON.stringify(updateData, null, 2));
      
      // 确保 field_type 是有效的枚举值
      if (updateData.field_type && !Object.values(FieldType).includes(updateData.field_type)) {
        console.error('无效的 field_type:', updateData.field_type);
        throw new HttpException(`无效的字段类型: ${updateData.field_type}`, HttpStatus.BAD_REQUEST);
      }
      
      // 确保 created_at 不被更新
      delete updateData.created_at;
      
      // 使用原生 SQL 更新，避免 TypeORM 元数据缓存问题
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      Object.keys(updateData).forEach(key => {
        if (key !== 'id' && key !== 'created_at') {
          setClauses.push(`"${key}" = $${paramIndex}`);
          values.push(updateData[key]);
          paramIndex++;
        }
      });
      
      if (setClauses.length > 0) {
        values.push(id); // id 作为最后一个参数
        const sql = `UPDATE asset_fields SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`;
        await this.assetFieldsRepository.query(sql, values);
      }
      
      // 使用原生 SQL 查询返回更新后的记录，避免 TypeORM 元数据问题
      const result = await this.assetFieldsRepository.query(
        'SELECT * FROM asset_fields WHERE id = $1',
        [id]
      );
      
      if (!result || result.length === 0) {
        throw new HttpException('更新后无法找到记录', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      // 将查询结果转换为实体格式
      const updated = result[0];
      return updated as AssetField;
    } catch (error: any) {
      console.error('=== 更新字段失败 ===');
      console.error('错误消息:', error.message);
      console.error('错误堆栈:', error.stack);
      console.error('错误详情:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // 抛出 HttpException 以便前端能看到错误信息
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || '更新字段失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    await this.assetFieldsRepository.delete(id);
  }
}


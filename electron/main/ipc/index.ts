import { ipcMain } from 'electron';
import { query } from '../database';
import { getCurrentUser } from '../index';

/**
 * 设置IPC处理程序
 */
export function setupIpcHandlers() {
  // 获取当前用户
  ipcMain.handle('get-current-user', async () => {
    return getCurrentUser();
  });

  // ==================== 生产线相关 ====================

  // 获取所有生产线
  ipcMain.handle('get-production-lines', async () => {
    try {
      return await query('SELECT * FROM production_lines ORDER BY line_number');
    } catch (error: any) {
      console.error('获取生产线失败:', error);
      
      // 检查是否为连接错误
      if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
        throw new Error('数据库连接失败，请检查数据库服务是否正常运行');
      }
      
      // 检查是否为表不存在错误
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        throw new Error('数据表不存在，请检查数据库结构是否正确');
      }
      
      throw new Error(`获取生产线数据失败: ${error.message || '未知错误'}`);
    }
  });

  // 添加生产线
  ipcMain.handle('add-production-line', async (_, data: any) => {
    try {
      const operator = getCurrentUser();
      // 将生产线编号和名称转为大写
      data.line_number = data.line_number.toUpperCase();
      data.line_name = data.line_name.toUpperCase();

      const result = await query(
        `INSERT INTO production_lines 
        (line_number, line_name, line_type, shift, speed, efficiency, \`group\`, flow_code, abbreviation, operator_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.line_number, data.line_name, data.line_type, data.shift, data.speed,
        data.efficiency, data.group, data.flow_code, data.abbreviation, operator]
      );

      return { success: true, id: result.insertId };
    } catch (error: any) {
      console.error('添加生产线失败:', error);
      
      // 检查是否为重复键错误
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
        if (error.message?.includes('line_number')) {
          throw new Error(`生产线编号 "${data.line_number}" 已存在，请使用不同的编号`);
        }
        throw new Error('该生产线信息已存在，请检查输入数据');
      }
      
      // 检查约束错误
      if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || error.message?.includes('CHECK constraint')) {
        throw new Error('输入数据不符合要求，请检查生产线类型等字段是否正确');
      }
      
      throw new Error(`添加生产线失败: ${error.message || '未知错误'}`);
    }
  });

  // 更新生产线
  ipcMain.handle('update-production-line', async (_, data: any) => {
    try {
      const operator = getCurrentUser();
      // 将生产线编号和名称转为大写
      data.line_number = data.line_number.toUpperCase();
      data.line_name = data.line_name.toUpperCase();

      await query(
        `UPDATE production_lines 
        SET line_number = ?, line_name = ?, line_type = ?, shift = ?, 
        speed = ?, efficiency = ?, \`group\` = ?, flow_code = ?, 
        abbreviation = ?, operator_id = ? 
        WHERE id = ?`,
        [data.line_number, data.line_name, data.line_type, data.shift,
        data.speed, data.efficiency, data.group, data.flow_code,
        data.abbreviation, operator, data.id]
      );

      return { success: true };
    } catch (error: any) {
      console.error('更新生产线失败:', error);
      
      // 检查是否为重复键错误
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
        if (error.message?.includes('line_number')) {
          throw new Error(`生产线编号 "${data.line_number}" 已被其他记录使用，请使用不同的编号`);
        }
        throw new Error('该生产线信息与现有记录冲突，请检查输入数据');
      }
      
      // 检查约束错误
      if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || error.message?.includes('CHECK constraint')) {
        throw new Error('输入数据不符合要求，请检查生产线类型等字段是否正确');
      }
      
      throw new Error(`更新生产线失败: ${error.message || '未知错误'}`);
    }
  });

  // 删除生产线
  ipcMain.handle('delete-production-line', async (_, { id }: { id: number }) => {
    try {
      // 由于设置了外键级联删除，删除生产线时会自动删除相关的特殊信息
      await query('DELETE FROM production_lines WHERE id = ?', [id]);
      return { success: true };
    } catch (error: any) {
      console.error('删除生产线失败:', error);
      
      // 检查是否为外键约束错误
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.message?.includes('foreign key constraint')) {
        throw new Error('无法删除该生产线，因为它正在被其他数据引用。请先删除相关的引用数据。');
      }
      
      // 检查是否为记录不存在错误
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.message?.includes('Cannot delete or update a parent row')) {
        throw new Error('删除失败：该生产线不存在或已被删除。');
      }
      
      throw new Error(`删除生产线失败: ${error.message || '未知错误'}`);
    }
  });

  // 获取生产线特殊信息
  ipcMain.handle('get-production-line-special-info', async (_, { lineId, codeType }: { lineId: number, codeType: string }) => {
    try {
      return await query(
        'SELECT * FROM production_line_special_info WHERE production_line_id = ? AND code_type = ?',
        [lineId, codeType]
      );
    } catch (error: any) {
      console.error('获取生产线特殊信息失败:', error);
      
      // 检查是否为连接错误
      if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
        throw new Error('数据库连接失败，请检查数据库服务是否正常运行');
      }
      
      // 检查是否为表不存在错误
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        throw new Error('特殊信息数据表不存在，请检查数据库结构是否正确');
      }
      
      // 检查是否为参数错误
      if (error.code === 'ER_BAD_FIELD_ERROR' || error.message?.includes('Unknown column')) {
        throw new Error('数据库字段错误，请检查数据库结构是否正确');
      }
      
      throw new Error(`获取生产线特殊信息失败: ${error.message || '未知错误'}`);
    }
  });

  // 添加生产线特殊信息
  ipcMain.handle('add-production-line-special-info', async (_, data: any) => {
    try {
      const operator = getCurrentUser();
      // 如果是白车身码，转为大写
      if (data.code_type === 'WhiteBodyCode') {
        data.code_value = data.code_value.toUpperCase();
      }

      // 获取生产线信息以获取line_type
      const lineResult = await query('SELECT line_type FROM production_lines WHERE id = ?', [data.production_line_id]);
      const lineRows = lineResult as any[];

      if (!lineRows || lineRows.length === 0) {
        throw new Error('找不到对应的生产线，请刷新页面后重试');
      }

      const line_type = lineRows[0].line_type;

      // 检查是否已存在相同的特殊信息
      const existingResult = await query(
        'SELECT id FROM production_line_special_info WHERE production_line_id = ? AND code_type = ? AND code_value = ?',
        [data.production_line_id, data.code_type, data.code_value]
      );

      const existingRows = existingResult as any[];
      if (existingRows && existingRows.length > 0) {
        const codeTypeName = data.code_type === 'WhiteBodyCode' ? '白车身码' : '颜色码';
        throw new Error(`${codeTypeName} "${data.code_value}" 在该生产线中已存在，请使用不同的代码`);
      }

      const result = await query(
        `INSERT INTO production_line_special_info 
        (production_line_id, code_type, code_value, line_type, operator_id) 
        VALUES (?, ?, ?, ?, ?)`,
        [data.production_line_id, data.code_type, data.code_value, line_type, operator]
      );

      return { success: true, id: result.insertId };
    } catch (error: any) {
      console.error('添加生产线特殊信息失败:', error);
      
      // 检查是否为重复键错误
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
        const codeTypeName = data.code_type === 'WhiteBodyCode' ? '白车身码' : '颜色码';
        throw new Error(`${codeTypeName} "${data.code_value}" 已存在，请使用不同的代码`);
      }
      
      // 如果错误信息已经是自定义的，直接抛出
      if (error.message && !error.message.includes('添加生产线特殊信息失败')) {
        throw error;
      }
      
      throw new Error(`添加生产线特殊信息失败: ${error.message || '未知错误'}`);
    }
  });

  // 删除生产线特殊信息
  ipcMain.handle('delete-production-line-special-info', async (_, { id }: { id: number }) => {
    try {
      await query('DELETE FROM production_line_special_info WHERE id = ?', [id]);
      return { success: true };
    } catch (error: any) {
      console.error('删除生产线特殊信息失败:', error);
      
      // 检查是否为外键约束错误
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.message?.includes('foreign key constraint')) {
        throw new Error('无法删除该特殊信息，因为它正在被其他数据引用。请先删除相关的引用数据。');
      }
      
      throw new Error(`删除生产线特殊信息失败: ${error.message || '未知错误'}`);
    }
  });

  // ==================== 特殊发动机相关 ====================

  // 获取所有特殊发动机
  ipcMain.handle('get-special-engines', async () => {
    try {
      return await query('SELECT * FROM special_engines ORDER BY engine_code');
    } catch (error: any) {
      console.error('获取特殊发动机失败:', error);
      
      // 检查是否为连接错误
      if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
        throw new Error('数据库连接失败，请检查数据库服务是否正常运行');
      }
      
      // 检查是否为表不存在错误
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        throw new Error('特殊发动机数据表不存在，请检查数据库结构是否正确');
      }
      
      throw new Error(`获取特殊发动机数据失败: ${error.message || '未知错误'}`);
    }
  });

  // 添加特殊发动机
  ipcMain.handle('add-special-engine', async (_, data: any) => {
    try {
      const operator = getCurrentUser();

      const result = await query(
        `INSERT INTO special_engines 
        (engine_code, gear, engine_name, operator_id) 
        VALUES (?, ?, ?, ?)`,
        [data.engine_code, data.gear, data.engine_name, operator]
      );

      return { success: true, id: result.insertId };
    } catch (error: any) {
      console.error('添加特殊发动机失败:', error);
      
      // 检查是否为重复键错误
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
        if (error.message?.includes('engine_code')) {
          throw new Error(`发动机代码 "${data.engine_code}" 已存在，请使用不同的代码`);
        }
        throw new Error('该发动机信息已存在，请检查输入数据');
      }
      
      throw new Error(`添加特殊发动机失败: ${error.message || '未知错误'}`);
    }
  });

  // 更新特殊发动机
  ipcMain.handle('update-special-engine', async (_, data: any) => {
    try {
      const operator = getCurrentUser();

      await query(
        `UPDATE special_engines 
        SET engine_code = ?, gear = ?, engine_name = ?, operator_id = ? 
        WHERE id = ?`,
        [data.engine_code, data.gear, data.engine_name, operator, data.id]
      );

      return { success: true };
    } catch (error: any) {
      console.error('更新特殊发动机失败:', error);
      
      // 检查是否为重复键错误
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
        if (error.message?.includes('engine_code')) {
          throw new Error(`发动机代码 "${data.engine_code}" 已被其他记录使用，请使用不同的代码`);
        }
        throw new Error('该发动机信息与现有记录冲突，请检查输入数据');
      }
      
      throw new Error(`更新特殊发动机失败: ${error.message || '未知错误'}`);
    }
  });

  // 删除特殊发动机
  ipcMain.handle('delete-special-engine', async (_, { id }: { id: number }) => {
    try {
      await query('DELETE FROM special_engines WHERE id = ?', [id]);
      return { success: true };
    } catch (error: any) {
      console.error('删除特殊发动机失败:', error);
      
      // 检查是否为外键约束错误
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.message?.includes('foreign key constraint')) {
        throw new Error('无法删除该特殊发动机，因为它正在被其他数据引用。请先删除相关的引用数据。');
      }
      
      throw new Error(`删除特殊发动机失败: ${error.message || '未知错误'}`);
    }
  });

  // ==================== 计划用颜色相关 ====================

  // 获取所有计划用颜色
  ipcMain.handle('get-planned-colors', async () => {
    try {
      return await query('SELECT * FROM planned_colors ORDER BY color_code');
    } catch (error: any) {
      console.error('获取计划用颜色失败:', error);
      
      // 检查是否为连接错误
      if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
        throw new Error('数据库连接失败，请检查数据库服务是否正常运行');
      }
      
      // 检查是否为表不存在错误
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        throw new Error('计划用颜色数据表不存在，请检查数据库结构是否正确');
      }
      
      throw new Error(`获取计划用颜色数据失败: ${error.message || '未知错误'}`);
    }
  });

  // 添加计划用颜色
  ipcMain.handle('add-planned-color', async (_, data: any) => {
    try {
      const operator = getCurrentUser();

      const result = await query(
        `INSERT INTO planned_colors 
        (color_code, color_name, top_coat_color, operator_id) 
        VALUES (?, ?, ?, ?)`,
        [data.color_code, data.color_name, data.top_coat_color, operator]
      );

      return { success: true, id: result.insertId };
    } catch (error: any) {
      console.error('添加计划用颜色失败:', error);
      
      // 检查是否为重复键错误
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
        if (error.message?.includes('color_code')) {
          throw new Error(`颜色代码 "${data.color_code}" 已存在，请使用不同的代码`);
        }
        throw new Error('该颜色信息已存在，请检查输入数据');
      }
      
      throw new Error(`添加计划用颜色失败: ${error.message || '未知错误'}`);
    }
  });

  // 更新计划用颜色
  ipcMain.handle('update-planned-color', async (_, data: any) => {
    try {
      const operator = getCurrentUser();

      await query(
        `UPDATE planned_colors 
        SET color_code = ?, color_name = ?, top_coat_color = ?, operator_id = ? 
        WHERE id = ?`,
        [data.color_code, data.color_name, data.top_coat_color, operator, data.id]
      );

      return { success: true };
    } catch (error: any) {
      console.error('更新计划用颜色失败:', error);
      
      // 检查是否为重复键错误
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
        if (error.message?.includes('color_code')) {
          throw new Error(`颜色代码 "${data.color_code}" 已被其他记录使用，请使用不同的代码`);
        }
        throw new Error('该颜色信息与现有记录冲突，请检查输入数据');
      }
      
      throw new Error(`更新计划用颜色失败: ${error.message || '未知错误'}`);
    }
  });

  // 删除计划用颜色
  ipcMain.handle('delete-planned-color', async (_, { id }: { id: number }) => {
    try {
      await query('DELETE FROM planned_colors WHERE id = ?', [id]);
      return { success: true };
    } catch (error: any) {
      console.error('删除计划用颜色失败:', error);
      
      // 检查是否为外键约束错误
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.message?.includes('foreign key constraint')) {
        throw new Error('无法删除该计划用颜色，因为它正在被其他数据引用。请先删除相关的引用数据。');
      }
      
      throw new Error(`删除计划用颜色失败: ${error.message || '未知错误'}`);
    }
  });
}
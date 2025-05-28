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
      return await query('SELECT * FROM production_lines ORDER BY line_type, line_number');
    } catch (error) {
      console.error('获取生产线失败:', error);
      throw new Error('获取生产线失败');
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

      return { success: true, id: (result as any).insertId };
    } catch (error) {
      console.error('添加生产线失败:', error);
      throw new Error('添加生产线失败');
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
    } catch (error) {
      console.error('更新生产线失败:', error);
      throw new Error('更新生产线失败');
    }
  });

  // 删除生产线
  ipcMain.handle('delete-production-line', async (_, { id }: { id: number }) => {
    try {
      // 由于设置了外键级联删除，删除生产线时会自动删除相关的特殊信息
      await query('DELETE FROM production_lines WHERE id = ?', [id]);
      return { success: true };
    } catch (error) {
      console.error('删除生产线失败:', error);
      throw new Error('删除生产线失败');
    }
  });

  // 获取生产线特殊信息
  ipcMain.handle('get-production-line-special-info', async (_, { lineId, codeType }: { lineId: number, codeType: string }) => {
    try {
      return await query(
        'SELECT * FROM production_line_special_info WHERE production_line_id = ? AND code_type = ?',
        [lineId, codeType]
      );
    } catch (error) {
      console.error('获取生产线特殊信息失败:', error);
      throw new Error('获取生产线特殊信息失败');
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
        throw new Error('找不到对应的生产线');
      }

      const line_type = lineRows[0].line_type;

      // 检查是否已存在相同的特殊信息
      const existingResult = await query(
        'SELECT id FROM production_line_special_info WHERE production_line_id = ? AND code_type = ? AND code_value = ?',
        [data.production_line_id, data.code_type, data.code_value]
      );

      const existingRows = existingResult as any[];
      if (existingRows && existingRows.length > 0) {
        throw new Error('该特殊信息已存在');
      }

      const result = await query(
        `INSERT INTO production_line_special_info 
        (production_line_id, code_type, code_value, line_type, operator_id) 
        VALUES (?, ?, ?, ?, ?)`,
        [data.production_line_id, data.code_type, data.code_value, line_type, operator]
      );

      return { success: true, id: (result as any).insertId };
    } catch (error) {
      console.error('添加生产线特殊信息失败:', error);
      throw new Error('添加生产线特殊信息失败: ' + (error as Error).message);
    }
  });

  // 删除生产线特殊信息
  ipcMain.handle('delete-production-line-special-info', async (_, { id }: { id: number }) => {
    try {
      await query('DELETE FROM production_line_special_info WHERE id = ?', [id]);
      return { success: true };
    } catch (error) {
      console.error('删除生产线特殊信息失败:', error);
      throw new Error('删除生产线特殊信息失败');
    }
  });

  // ==================== 特殊发动机相关 ====================

  // 获取所有特殊发动机
  ipcMain.handle('get-special-engines', async () => {
    try {
      return await query('SELECT * FROM special_engines ORDER BY engine_code');
    } catch (error) {
      console.error('获取特殊发动机失败:', error);
      throw new Error('获取特殊发动机失败');
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

      return { success: true, id: (result as any).insertId };
    } catch (error) {
      console.error('添加特殊发动机失败:', error);
      throw new Error('添加特殊发动机失败');
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
    } catch (error) {
      console.error('更新特殊发动机失败:', error);
      throw new Error('更新特殊发动机失败');
    }
  });

  // 删除特殊发动机
  ipcMain.handle('delete-special-engine', async (_, { id }: { id: number }) => {
    try {
      await query('DELETE FROM special_engines WHERE id = ?', [id]);
      return { success: true };
    } catch (error) {
      console.error('删除特殊发动机失败:', error);
      throw new Error('删除特殊发动机失败');
    }
  });

  // ==================== 计划用颜色相关 ====================

  // 获取所有计划用颜色
  ipcMain.handle('get-planned-colors', async () => {
    try {
      return await query('SELECT * FROM planned_colors ORDER BY color_code');
    } catch (error) {
      console.error('获取计划用颜色失败:', error);
      throw new Error('获取计划用颜色失败');
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

      return { success: true, id: (result as any).insertId };
    } catch (error) {
      console.error('添加计划用颜色失败:', error);
      throw new Error('添加计划用颜色失败');
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
    } catch (error) {
      console.error('更新计划用颜色失败:', error);
      throw new Error('更新计划用颜色失败');
    }
  });

  // 删除计划用颜色
  ipcMain.handle('delete-planned-color', async (_, { id }: { id: number }) => {
    try {
      await query('DELETE FROM planned_colors WHERE id = ?', [id]);
      return { success: true };
    } catch (error) {
      console.error('删除计划用颜色失败:', error);
      throw new Error('删除计划用颜色失败');
    }
  });
}
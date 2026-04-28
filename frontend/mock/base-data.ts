/**
 * base-data 模块 - Mock 数据
 */

export default {
  // 学期日历 - 提交
  'POST /api/base-data/calendar': (req: any, res: any) => {
    const { startDate, endDate, disabledDates } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        code: 400,
        message: '提交失败：缺少开始或结束日期',
        timestamp: Date.now(),
      });
    }

    return res.json({
      code: 200,
      message: 'success',
      data: {
        calendarId: 1,
        startDate,
        endDate,
        disabledCount: disabledDates?.length || 0,
      },
      timestamp: Date.now(),
    });
  },

  // 学期日历 - 获取
  'GET /api/base-data/calendar': (_req: any, res: any) => {
    return res.json({
      code: 200,
      message: 'success',
      data: {
        calendarId: 1,
        startDate: '2026-09-01',
        endDate: '2027-01-15',
        disabledDates: [
          { date: '2026-10-01', remark: '国庆节' },
          { date: '2026-10-02', remark: '国庆节' },
        ],
      },
      timestamp: Date.now(),
    });
  },

  // 课程录入批量导入
  'POST /api/base-data/courses/import': async (req: any, res: any) => {
    try {
      console.log('收到课程录入导入请求');
      console.log('req.files:', req.files);
      console.log('req.file:', req.file);
      console.log('req.body:', req.body);

      // UmiJS mock 中，文件上传需要特殊处理
      // 这里直接返回成功，实际项目中需要配置 multer 中间件
      res.send({
        success: true,
        message: '课程数据导入成功，共导入 0 条记录',
        data: {
          imported: 0, // 导入的记录数
          failed: 0,   // 失败的记录数
        },
      });
    } catch (error) {
      console.error('导入错误:', error);
      res.status(500).send({
        success: false,
        message: '导入失败：' + (error as Error).message,
      });
    }
  },

  // 课程设置批量导入
  'POST /api/base-data/course-settings/import': async (req: any, res: any) => {
    try {
      console.log('收到课程设置导入请求');
      res.send({
        success: true,
        message: '课程设置导入成功，共导入 0 条记录',
        data: {
          imported: 0,
          failed: 0,
        },
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: '导入失败：' + (error as Error).message,
      });
    }
  },

  // 专业设置批量导入
  'POST /api/base-data/majors/import': async (req: any, res: any) => {
    try {
      console.log('收到专业设置导入请求');
      res.send({
        success: true,
        message: '专业设置导入成功，共导入 0 条记录',
        data: {
          imported: 0,
          failed: 0,
        },
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: '导入失败：' + (error as Error).message,
      });
    }
  },

  // 教师录入批量导入
  'POST /api/base-data/teachers/import': async (req: any, res: any) => {
    try {
      console.log('收到教师录入导入请求');
      res.send({
        success: true,
        message: '教师数据导入成功，共导入 0 条记录',
        data: {
          imported: 0,
          failed: 0,
        },
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: '导入失败：' + (error as Error).message,
      });
    }
  },

  // 下载课程录入模板
  'GET /api/base-data/courses/import/template': (req: any, res: any) => {
    // TODO: 返回 Excel 模板文件
    // 示例：res.download('templates/courses_template.xlsx');
    res.send('模板文件下载接口');
  },

  // 下载课程设置模板
  'GET /api/base-data/course-settings/import/template': (req: any, res: any) => {
    res.send('模板文件下载接口');
  },

  // 下载专业设置模板
  'GET /api/base-data/majors/import/template': (req: any, res: any) => {
    res.send('模板文件下载接口');
  },

  // 下载教师录入模板
  'GET /api/base-data/teachers/import/template': (req: any, res: any) => {
    res.send('模板文件下载接口');
  },
};

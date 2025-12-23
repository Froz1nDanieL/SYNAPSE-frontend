import fs from 'fs';
import path from 'path';

// 定义包含API文件的目录
const apiDir = './app/composables/api';

// 读取目录中的所有文件
fs.readdir(apiDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // 过滤出.ts文件
  const tsFiles = files.filter(file => file.endsWith('.ts') && file !== 'typings.d.ts');

  tsFiles.forEach(file => {
    const filePath = path.join(apiDir, file);
    
    // 读取文件内容
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }

      // 将request函数替换为$fetch
      let updatedData = data.replace(
        /return request<([^>]+)>\(([^,]+),\s*{([\s\S]*?)}\);/g,
        (match, type, url, options) => {
          // 处理options中的data字段，将其重命名为body（$fetch使用body而不是data）
          let updatedOptions = options.replace(/data:/g, 'body:');
          
          // 移除可能存在的...(options || {})行，因为我们直接传递options
          updatedOptions = updatedOptions.replace(/\s*\.\.\.\(options \|\| {}\),?\s*/g, '');
          
          // 构造新的返回语句
          return `return $fetch<${type}>(${url}, {${updatedOptions}});`;
        }
      );

      // 写回文件
      fs.writeFile(filePath, updatedData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }
        
        console.log(`Updated ${file}`);
      });
    });
  });
});
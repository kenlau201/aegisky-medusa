const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// 尝试用adm-zip解析docx（docx本质是zip）
try {
  const zip = new AdmZip(path.join(__dirname, 'whitepaper.docx'));
  const xml = zip.readAsText('word/document.xml');

  // 简单提取文本
  let text = xml;
  // 移除XML标签，保留文本
  text = text.replace(/<w:p[^>]*>/g, '\n\n');
  text = text.replace(/<w:br[^>]*\/>/g, '\n');
  text = text.replace(/<w:tab[^>]*\/>/g, '\t');
  text = text.replace(/<[^>]+>/g, '');
  // HTML实体解码
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&apos;/g, "'");
  // 压缩多余空行
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  console.log(text);
} catch (e) {
  console.error('解析失败:', e.message);
  console.log('尝试安装adm-zip...');
}

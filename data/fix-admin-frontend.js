const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '..', 'storefront', 'src', 'app', '[lang]', 'admin');

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix API URL - ensure it's /store/admin/
  content = content.replace(/\$\{API_BASE\}\/store\/admin\//g, '${API_BASE}/store/admin/');
  content = content.replace(/\$\{API_BASE\}\/admin\//g, '${API_BASE}/store/admin/');
  
  // Fix auth headers - use x-admin-token instead of Authorization
  content = content.replace(/'x-admin-token':\s*t/g, "'x-admin-token': t");
  content = content.replace(/'x-admin-token':\s*token/g, "'x-admin-token': token");
  content = content.replace(/Authorization:\s*`Bearer \$\{t\}`/g, "'x-admin-token': t");
  content = content.replace(/Authorization:\s*`Bearer \$\{token\}`/g, "'x-admin-token': token");
  
  // Fix fetch calls to include proper headers object
  content = content.replace(
    /headers:\s*\{\s*Authorization[^}]+\}/g,
    "headers: { 'x-admin-token': t, 'Content-Type': 'application/json' }"
  );
  
  fs.writeFileSync(filePath, content);
  console.log('Updated:', path.basename(filePath));
}

// Update all admin pages
const files = [
  path.join(adminDir, 'page.tsx'),
  path.join(adminDir, 'orders', 'page.tsx'),
  path.join(adminDir, 'orders', '[id]', 'page.tsx'),
  path.join(adminDir, 'rfq', 'page.tsx'),
  path.join(adminDir, 'compensations', 'page.tsx'),
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Ensure API calls use correct path and headers
    // Replace all fetch calls to admin endpoints
    content = content.replace(
      /fetch\(`\$\{API_BASE\}\/admin\//g,
      'fetch(`${API_BASE}/store/admin/'
    );
    
    // Fix headers in all fetch calls
    content = content.replace(
      /headers:\s*\{\s*Authorization:\s*`Bearer \$\{t\}`\s*\}/g,
      "headers: { 'x-admin-token': t }"
    );
    content = content.replace(
      /headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}/g,
      "headers: { 'x-admin-token': token }"
    );
    content = content.replace(
      /headers:\s*\{\s*'x-admin-token':\s*t\s*\}/g,
      "headers: { 'x-admin-token': t }"
    );
    
    // For PATCH/POST with Content-Type
    content = content.replace(
      /headers:\s*\{\s*'Content-Type':\s*'application\/json',\s*Authorization:\s*`Bearer \$\{token\}`\s*\}/g,
      "headers: { 'Content-Type': 'application/json', 'x-admin-token': token }"
    );
    
    fs.writeFileSync(f, content);
    console.log('Updated:', path.basename(f));
  } else {
    console.log('Not found:', f);
  }
});

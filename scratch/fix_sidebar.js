const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/layout/AdminSidebar.tsx', 'utf-8');
code = code.replace(
  'export interface AdminSidebarProps {',
  'export interface AdminSidebarProps {\n  activeId?: string;'
);
code = code.replace(
  '  className = \'\',\n}) => {',
  '  className = \'\',\n  activeId,\n}) => {'
);
fs.writeFileSync('frontend/src/components/layout/AdminSidebar.tsx', code, 'utf-8');
console.log('Successfully updated AdminSidebar.tsx');

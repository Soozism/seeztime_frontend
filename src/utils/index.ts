import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string, sheetName = 'Sheet1') => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const fullFilename = `${filename}_${timestamp}.xlsx`;
    
    // Write file
    XLSX.writeFile(wb, fullFilename);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

export const formatDataForExcel = (data: any[], headers: { [key: string]: string }) => {
  return data.map(item => {
    const formattedItem: any = {};
    Object.keys(headers).forEach(key => {
      const value = getNestedValue(item, key);
      formattedItem[headers[key]] = value;
    });
    return formattedItem;
  });
};

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : '';
  }, obj);
};

export const convertToPersianNumbers = (text: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return text.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

// Use dateUtils.toPersian and dateUtils.formatWithTime instead of these functions

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '۰ بایت';
  
  const k = 1024;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return convertToPersianNumbers(
    parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  );
};

export const generateColors = (count: number): string[] => {
  const colors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#fa541c', '#a0d911', '#2f54eb',
  ];
  
  if (count <= colors.length) {
    return colors.slice(0, count);
  }
  
  // Generate additional colors if needed
  const additionalColors = [];
  for (let i = colors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle approximation
    additionalColors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return [...colors, ...additionalColors];
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const formatNumber = (num: number): string => {
  return convertToPersianNumbers(num.toLocaleString('fa-IR'));
};

export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

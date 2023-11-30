/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable sf-plugin/no-hardcoded-messages-flags */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import fs = require('fs');

export function countCodeLines(directory: string, extension: string, language: 'apex' | 'javascript'): { Total: number; Comments: number; Code: number } {
  const codeFiles = getAllFiles(directory, extension);
  let commentLines = 0;
  let totalLines = 0;

  codeFiles.forEach(filePath => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let comments = [];
    if (language === 'apex') {
      comments = fileContent.match(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g) ?? [];
    } else if (language === 'javascript') {
      comments = fileContent.match(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g) ?? [];
    }
    const total = fileContent.split('\n').filter(line => line.trim() !== '').length;
    commentLines += comments.length;
    totalLines += total;
  });

  return {
    Total: totalLines,
    Comments: commentLines,
    Code: totalLines - commentLines
  };
}

function getAllFiles(directory: string, extension: string): string[] {
  const files: string[] = [];
  const dirents = fs.readdirSync(directory, { withFileTypes: true });

  for (const dirent of dirents) {
    const fullPath = `${directory}/${dirent.name}`;
    if (dirent.isDirectory()) {
      files.push(...getAllFiles(fullPath, extension));
    } else if (dirent.isFile() && dirent.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}
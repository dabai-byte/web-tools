// PDF工具箱 - 核心逻辑
// 使用 pdf-lib 库进行PDF操作

const { PDFDocument } = PDFLib;

// 工具函数：格式化文件大小
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// 工具函数：下载文件
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ========== 合并PDF ==========
const mergeZone = document.getElementById('merge-zone');
const mergeInput = document.getElementById('merge-input');
const mergeFiles = document.getElementById('merge-files');
const mergeBtn = document.getElementById('merge-btn');
let mergeFileList = [];

mergeZone.addEventListener('click', () => mergeInput.click());
mergeZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    mergeZone.classList.add('border-purple-400', 'bg-purple-50');
});
mergeZone.addEventListener('dragleave', () => {
    mergeZone.classList.remove('border-purple-400', 'bg-purple-50');
});
mergeZone.addEventListener('drop', (e) => {
    e.preventDefault();
    mergeZone.classList.remove('border-purple-400', 'bg-purple-50');
    handleMergeFiles(e.dataTransfer.files);
});
mergeInput.addEventListener('change', (e) => handleMergeFiles(e.target.files));

function handleMergeFiles(files) {
    for (const file of files) {
        if (file.type === 'application/pdf') {
            mergeFileList.push(file);
        }
    }
    updateMergeUI();
}

function updateMergeUI() {
    mergeFiles.innerHTML = mergeFileList.map((file, i) => `
        <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <span class="text-sm text-gray-700 truncate">${file.name}</span>
            <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400">${formatSize(file.size)}</span>
                <button onclick="removeMergeFile(${i})" class="text-red-500 hover:text-red-700">×</button>
            </div>
        </div>
    `).join('');
    mergeBtn.disabled = mergeFileList.length < 2;
}

window.removeMergeFile = (i) => {
    mergeFileList.splice(i, 1);
    updateMergeUI();
};

mergeBtn.addEventListener('click', async () => {
    if (mergeFileList.length < 2) return;
    
    mergeBtn.textContent = '处理中...';
    mergeBtn.disabled = true;
    
    try {
        const mergedPdf = await PDFDocument.create();
        
        for (const file of mergeFileList) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }
        
        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        downloadBlob(blob, 'merged.pdf');
        
        mergeBtn.textContent = '✓ 合并完成！';
        setTimeout(() => {
            mergeBtn.textContent = '合并PDF';
            mergeBtn.disabled = mergeFileList.length < 2;
        }, 2000);
    } catch (error) {
        alert('处理失败：' + error.message);
        mergeBtn.textContent = '合并PDF';
        mergeBtn.disabled = mergeFileList.length < 2;
    }
});

// ========== 压缩PDF ==========
const compressZone = document.getElementById('compress-zone');
const compressInput = document.getElementById('compress-input');
const compressInfo = document.getElementById('compress-info');
const compressBtn = document.getElementById('compress-btn');
let compressFile = null;

compressZone.addEventListener('click', () => compressInput.click());
compressZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    compressZone.classList.add('border-blue-400', 'bg-blue-50');
});
compressZone.addEventListener('dragleave', () => {
    compressZone.classList.remove('border-blue-400', 'bg-blue-50');
});
compressZone.addEventListener('drop', (e) => {
    e.preventDefault();
    compressZone.classList.remove('border-blue-400', 'bg-blue-50');
    handleCompressFile(e.dataTransfer.files[0]);
});
compressInput.addEventListener('change', (e) => handleCompressFile(e.target.files[0]));

function handleCompressFile(file) {
    if (file && file.type === 'application/pdf') {
        compressFile = file;
        compressInfo.textContent = `文件: ${file.name} (${formatSize(file.size)})`;
        compressBtn.disabled = false;
    }
}

compressBtn.addEventListener('click', async () => {
    if (!compressFile) return;
    
    compressBtn.textContent = '处理中...';
    compressBtn.disabled = true;
    
    try {
        const arrayBuffer = await compressFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { 
            ignoreEncryption: true,
            updateMetadata: false 
        });
        
        // 重新保存以压缩
        const pdfBytes = await pdf.save({
            useObjectStreams: true,
            addDefaultPage: false,
        });
        
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const ratio = ((1 - pdfBytes.length / compressFile.size) * 100).toFixed(1);
        
        compressInfo.textContent = `原始: ${formatSize(compressFile.size)} → 压缩后: ${formatSize(pdfBytes.length)} (减少 ${ratio}%)`;
        downloadBlob(blob, 'compressed_' + compressFile.name);
        
        compressBtn.textContent = '✓ 压缩完成！';
        setTimeout(() => {
            compressBtn.textContent = '压缩PDF';
            compressBtn.disabled = false;
        }, 2000);
    } catch (error) {
        alert('处理失败：' + error.message);
        compressBtn.textContent = '压缩PDF';
        compressBtn.disabled = false;
    }
});

// ========== 拆分PDF ==========
const splitZone = document.getElementById('split-zone');
const splitInput = document.getElementById('split-input');
const splitPages = document.getElementById('split-pages');
const splitBtn = document.getElementById('split-btn');
let splitFile = null;
let splitPageCount = 0;

splitZone.addEventListener('click', () => splitInput.click());
splitZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    splitZone.classList.add('border-green-400', 'bg-green-50');
});
splitZone.addEventListener('dragleave', () => {
    splitZone.classList.remove('border-green-400', 'bg-green-50');
});
splitZone.addEventListener('drop', (e) => {
    e.preventDefault();
    splitZone.classList.remove('border-green-400', 'bg-green-50');
    handleSplitFile(e.dataTransfer.files[0]);
});
splitInput.addEventListener('change', (e) => handleSplitFile(e.target.files[0]));

async function handleSplitFile(file) {
    if (file && file.type === 'application/pdf') {
        splitFile = file;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            splitPageCount = pdf.getPageCount();
            splitPages.textContent = `文件: ${file.name} - 共 ${splitPageCount} 页`;
            splitBtn.disabled = false;
        } catch (error) {
            splitPages.textContent = '无法读取PDF文件';
        }
    }
}

splitBtn.addEventListener('click', async () => {
    if (!splitFile || splitPageCount === 0) return;
    
    splitBtn.textContent = '处理中...';
    splitBtn.disabled = true;
    
    try {
        const arrayBuffer = await splitFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        
        // 每页拆分为单独文件
        for (let i = 0; i < splitPageCount; i++) {
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(pdf, [i]);
            newPdf.addPage(page);
            
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            downloadBlob(blob, `page_${i + 1}.pdf`);
            
            // 避免浏览器阻止多次下载
            if (i < splitPageCount - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        splitBtn.textContent = `✓ 已拆分为 ${splitPageCount} 个文件！`;
        setTimeout(() => {
            splitBtn.textContent = '拆分PDF';
            splitBtn.disabled = false;
        }, 2000);
    } catch (error) {
        alert('处理失败：' + error.message);
        splitBtn.textContent = '拆分PDF';
        splitBtn.disabled = false;
    }
});

console.log('PDF工具箱已加载');
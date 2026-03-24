// 图片工具箱 - 核心逻辑

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

// ========== 图片压缩 ==========
const compressZone = document.getElementById('compress-zone');
const compressInput = document.getElementById('compress-input');
const compressBtn = document.getElementById('compress-btn');
const qualityRange = document.getElementById('quality-range');
const qualityVal = document.getElementById('quality-val');
const compressPreview = document.getElementById('compress-preview');
const compressImg = document.getElementById('compress-img');
const compressResult = document.getElementById('compress-result');
let compressFile = null;

qualityRange.addEventListener('input', () => {
    qualityVal.textContent = qualityRange.value;
});

compressZone.addEventListener('click', () => compressInput.click());
compressZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    compressZone.classList.add('border-green-400', 'bg-green-50');
});
compressZone.addEventListener('dragleave', () => {
    compressZone.classList.remove('border-green-400', 'bg-green-50');
});
compressZone.addEventListener('drop', (e) => {
    e.preventDefault();
    compressZone.classList.remove('border-green-400', 'bg-green-50');
    handleCompressFile(e.dataTransfer.files[0]);
});
compressInput.addEventListener('change', (e) => handleCompressFile(e.target.files[0]));

function handleCompressFile(file) {
    if (file && file.type.startsWith('image/')) {
        compressFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            compressImg.src = e.target.result;
            compressPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        compressBtn.disabled = false;
        compressResult.textContent = `原始大小: ${formatSize(file.size)}`;
    }
}

compressBtn.addEventListener('click', async () => {
    if (!compressFile) return;
    
    compressBtn.textContent = '处理中...';
    compressBtn.disabled = true;
    
    const quality = parseInt(qualityRange.value) / 100;
    
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            const ratio = ((1 - blob.size / compressFile.size) * 100).toFixed(1);
            compressResult.textContent = `原始: ${formatSize(compressFile.size)} → 压缩后: ${formatSize(blob.size)} (减少 ${ratio}%)`;
            downloadBlob(blob, 'compressed_' + compressFile.name);
            
            compressBtn.textContent = '✓ 压缩完成！';
            setTimeout(() => {
                compressBtn.textContent = '压缩图片';
                compressBtn.disabled = false;
            }, 2000);
        }, 'image/jpeg', quality);
    };
    img.src = compressImg.src;
});

// ========== 格式转换 ==========
const convertZone = document.getElementById('convert-zone');
const convertInput = document.getElementById('convert-input');
const convertBtn = document.getElementById('convert-btn');
const formatSelect = document.getElementById('format-select');
const convertPreview = document.getElementById('convert-preview');
const convertImg = document.getElementById('convert-img');
let convertFile = null;

convertZone.addEventListener('click', () => convertInput.click());
convertZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    convertZone.classList.add('border-blue-400', 'bg-blue-50');
});
convertZone.addEventListener('dragleave', () => {
    convertZone.classList.remove('border-blue-400', 'bg-blue-50');
});
convertZone.addEventListener('drop', (e) => {
    e.preventDefault();
    convertZone.classList.remove('border-blue-400', 'bg-blue-50');
    handleConvertFile(e.dataTransfer.files[0]);
});
convertInput.addEventListener('change', (e) => handleConvertFile(e.target.files[0]));

function handleConvertFile(file) {
    if (file && file.type.startsWith('image/')) {
        convertFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            convertImg.src = e.target.result;
            convertPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        convertBtn.disabled = false;
    }
}

convertBtn.addEventListener('click', async () => {
    if (!convertFile) return;
    
    convertBtn.textContent = '处理中...';
    convertBtn.disabled = true;
    
    const format = formatSelect.value;
    const mimeType = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
    const ext = format === 'jpeg' ? 'jpg' : format;
    
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // JPEG 需要白色背景（因为 JPEG 不支持透明）
        if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            const newName = convertFile.name.replace(/\.[^.]+$/, '.' + ext);
            downloadBlob(blob, newName);
            
            convertBtn.textContent = '✓ 转换完成！';
            setTimeout(() => {
                convertBtn.textContent = '转换格式';
                convertBtn.disabled = false;
            }, 2000);
        }, mimeType, 0.92);
    };
    img.src = convertImg.src;
});

// ========== 调整大小 ==========
const resizeZone = document.getElementById('resize-zone');
const resizeInput = document.getElementById('resize-input');
const resizeBtn = document.getElementById('resize-btn');
const resizePreview = document.getElementById('resize-preview');
const resizeImg = document.getElementById('resize-img');
const resizeWidth = document.getElementById('resize-width');
const resizeHeight = document.getElementById('resize-height');
const resizeDimensions = document.getElementById('resize-dimensions');
const keepRatio = document.getElementById('keep-ratio');
let resizeFile = null;
let originalWidth = 0;
let originalHeight = 0;

resizeZone.addEventListener('click', () => resizeInput.click());
resizeZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    resizeZone.classList.add('border-purple-400', 'bg-purple-50');
});
resizeZone.addEventListener('dragleave', () => {
    resizeZone.classList.remove('border-purple-400', 'bg-purple-50');
});
resizeZone.addEventListener('drop', (e) => {
    e.preventDefault();
    resizeZone.classList.remove('border-purple-400', 'bg-purple-50');
    handleResizeFile(e.dataTransfer.files[0]);
});
resizeInput.addEventListener('change', (e) => handleResizeFile(e.target.files[0]));

function handleResizeFile(file) {
    if (file && file.type.startsWith('image/')) {
        resizeFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            resizeImg.src = e.target.result;
            resizePreview.classList.remove('hidden');
            
            // 获取原始尺寸
            const img = new Image();
            img.onload = () => {
                originalWidth = img.width;
                originalHeight = img.height;
                resizeDimensions.textContent = `原始尺寸: ${img.width} × ${img.height}`;
                resizeWidth.value = img.width;
                resizeHeight.value = img.height;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        resizeBtn.disabled = false;
    }
}

// 保持宽高比
resizeWidth.addEventListener('input', () => {
    if (keepRatio.checked && originalWidth && originalHeight) {
        const ratio = originalHeight / originalWidth;
        resizeHeight.value = Math.round(resizeWidth.value * ratio);
    }
});

resizeHeight.addEventListener('input', () => {
    if (keepRatio.checked && originalWidth && originalHeight) {
        const ratio = originalWidth / originalHeight;
        resizeWidth.value = Math.round(resizeHeight.value * ratio);
    }
});

resizeBtn.addEventListener('click', async () => {
    if (!resizeFile) return;
    
    const newWidth = parseInt(resizeWidth.value);
    const newHeight = parseInt(resizeHeight.value);
    
    if (!newWidth || !newHeight || newWidth < 1 || newHeight < 1) {
        alert('请输入有效的宽度和高度');
        return;
    }
    
    resizeBtn.textContent = '处理中...';
    resizeBtn.disabled = true;
    
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        
        // 高质量缩放
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob((blob) => {
            const newName = 'resized_' + resizeFile.name;
            downloadBlob(blob, newName);
            
            resizeBtn.textContent = '✓ 调整完成！';
            setTimeout(() => {
                resizeBtn.textContent = '调整大小';
                resizeBtn.disabled = false;
            }, 2000);
        }, 'image/png');
    };
    img.src = resizeImg.src;
});

console.log('图片工具箱已加载');
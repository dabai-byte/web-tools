// 随机工具箱 - 核心逻辑

// ========== Tab 切换 ==========
function showTab(tabName) {
    // 隐藏所有 tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    // 显示选中的 tab
    document.getElementById('tab-' + tabName).classList.remove('hidden');
    // 更新按钮样式
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-purple-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.remove('bg-gray-200', 'text-gray-700');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('bg-purple-600', 'text-white');
}

// ========== 随机数生成器 ==========
function generateNumber() {
    const min = parseInt(document.getElementById('min-num').value) || 1;
    const max = parseInt(document.getElementById('max-num').value) || 100;
    const count = parseInt(document.getElementById('count-num').value) || 1;
    const unique = document.getElementById('unique-num').checked;
    
    if (min >= max) {
        alert('最小值必须小于最大值');
        return;
    }
    
    if (unique && count > (max - min + 1)) {
        alert('生成数量超过了可能的不重复数值数量');
        return;
    }
    
    const results = [];
    const used = new Set();
    
    while (results.length < count) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (unique) {
            if (!used.has(num)) {
                used.add(num);
                results.push(num);
            }
        } else {
            results.push(num);
        }
    }
    
    const resultEl = document.getElementById('result-number');
    resultEl.classList.remove('hidden');
    resultEl.textContent = results.join(', ');
}

// ========== 随机密码生成器 ==========
function generatePassword() {
    const length = parseInt(document.getElementById('pwd-length').value);
    const useUpper = document.getElementById('pwd-upper').checked;
    const useLower = document.getElementById('pwd-lower').checked;
    const useNum = document.getElementById('pwd-num').checked;
    const useSymbol = document.getElementById('pwd-symbol').checked;
    
    let chars = '';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNum) chars += '0123456789';
    if (useSymbol) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (!chars) {
        alert('请至少选择一种字符类型');
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    const resultEl = document.getElementById('result-password');
    resultEl.classList.remove('hidden');
    resultEl.textContent = password;
    
    document.getElementById('copy-btn').classList.remove('hidden');
    window.currentPassword = password;
}

function copyPassword() {
    if (window.currentPassword) {
        navigator.clipboard.writeText(window.currentPassword).then(() => {
            const btn = document.getElementById('copy-btn');
            btn.textContent = '✓ 已复制！';
            setTimeout(() => btn.textContent = '📋 复制密码', 2000);
        });
    }
}

// ========== 随机名字生成器 ==========
const nameData = {
    'chinese-male': {
        surnames: ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高'],
        names: ['伟', '强', '磊', '军', '勇', '杰', '涛', '明', '超', '刚', '平', '辉', '鹏', '华', '飞', '斌', '波', '宇', '浩', '凯', '晨', '阳', '俊', '睿', '泽']
    },
    'chinese-female': {
        surnames: ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高'],
        names: ['芳', '娜', '敏', '静', '丽', '艳', '娟', '霞', '秀', '玲', '桂', '英', '华', '慧', '巧', '美', '婷', '雪', '萍', '红', '月', '梅', '琳', '欣', '怡']
    },
    'english-male': {
        first: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin'],
        last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
    },
    'english-female': {
        first: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle'],
        last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
    },
    'nickname': {
        prefixes: ['小', '大', '阿', '飞', '快乐', '自由', '阳光', '星辰', '梦幻', '灵'],
        suffixes: ['熊', '鱼', '猫', '鸟', '狼', '虎', '龙', '凤', '云', '风', '雨', '雪', '月', '星', '影', '剑', '刀', '琴', '书', '画'],
        words: ['逍遥', '独行', '追风', '听雨', '望月', '踏雪', '寻梅', '踏歌', '听风', '观云', '追梦', '星辰', '云端', '漫步', '飞翔']
    }
};

function generateName() {
    const type = document.getElementById('name-type').value;
    const count = parseInt(document.getElementById('name-count').value) || 5;
    
    const results = [];
    
    for (let i = 0; i < count; i++) {
        let name = '';
        
        if (type === 'chinese-male' || type === 'chinese-female') {
            const data = nameData[type];
            name = data.surnames[Math.floor(Math.random() * data.surnames.length)];
            const nameLen = Math.random() > 0.5 ? 1 : 2;
            for (let j = 0; j < nameLen; j++) {
                name += data.names[Math.floor(Math.random() * data.names.length)];
            }
        } else if (type === 'english-male' || type === 'english-female') {
            const data = nameData[type];
            name = data.first[Math.floor(Math.random() * data.first.length)] + ' ' + 
                   data.last[Math.floor(Math.random() * data.last.length)];
        } else if (type === 'nickname') {
            const style = Math.floor(Math.random() * 3);
            if (style === 0) {
                name = nameData.nickname.prefixes[Math.floor(Math.random() * nameData.nickname.prefixes.length)] +
                       nameData.nickname.suffixes[Math.floor(Math.random() * nameData.nickname.suffixes.length)];
            } else if (style === 1) {
                name = nameData.nickname.words[Math.floor(Math.random() * nameData.nickname.words.length)];
            } else {
                name = nameData.nickname.suffixes[Math.floor(Math.random() * nameData.nickname.suffixes.length)] +
                       Math.floor(Math.random() * 1000);
            }
        }
        
        results.push(name);
    }
    
    const resultEl = document.getElementById('result-name');
    resultEl.classList.remove('hidden');
    resultEl.innerHTML = results.map(n => `<span class="inline-block bg-white/20 px-4 py-2 rounded-lg m-1">${n}</span>`).join('');
}

// ========== 随机选择器 ==========
function pickRandom() {
    const optionsText = document.getElementById('picker-options').value;
    const options = optionsText.split('\n').map(s => s.trim()).filter(s => s);
    
    if (options.length === 0) {
        alert('请输入至少一个选项');
        return;
    }
    
    const picked = options[Math.floor(Math.random() * options.length)];
    
    const resultEl = document.getElementById('result-picker');
    resultEl.classList.remove('hidden');
    resultEl.textContent = '🎉 ' + picked;
}

// ========== 抛硬币 ==========
window.coinStats = { heads: 0, tails: 0 };

function flipCoin() {
    const coinDisplay = document.getElementById('coin-display');
    const resultEl = document.getElementById('result-coin');
    const statsEl = document.getElementById('coin-stats');
    
    // 动画效果
    coinDisplay.innerHTML = '<span class="text-8xl animate-spin inline-block">🪙</span>';
    
    setTimeout(() => {
        const result = Math.random() < 0.5 ? '正面' : '反面';
        const emoji = result === '正面' ? '🌕' : '🌑';
        
        if (result === '正面') window.coinStats.heads++;
        else window.coinStats.tails++;
        
        coinDisplay.innerHTML = `<span class="text-8xl">${emoji}</span>`;
        resultEl.classList.remove('hidden');
        resultEl.textContent = result + '！';
        
        statsEl.textContent = `统计：正面 ${window.coinStats.heads} 次 / 反面 ${window.coinStats.tails} 次`;
    }, 500);
}

// ========== 掷骰子 ==========
const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function rollDice() {
    const count = parseInt(document.getElementById('dice-count').value) || 2;
    const displayEl = document.getElementById('dice-display');
    const resultEl = document.getElementById('result-dice');
    
    // 动画效果
    displayEl.innerHTML = Array(count).fill('<span class="text-6xl animate-bounce inline-block">🎲</span>').join('');
    
    setTimeout(() => {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(Math.floor(Math.random() * 6) + 1);
        }
        
        displayEl.innerHTML = results.map(r => `<span class="text-6xl">${diceEmojis[r-1]}</span>`).join('');
        resultEl.classList.remove('hidden');
        resultEl.textContent = `总计：${results.reduce((a, b) => a + b, 0)}`;
    }, 500);
}

console.log('随机工具箱已加载');
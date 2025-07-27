document.addEventListener('DOMContentLoaded', function() {
    const weightLossForm = document.getElementById('weightLossForm');
    const mainContent = document.querySelector('main');

    // 表单提交处理
    weightLossForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(weightLossForm);
        const userData = Object.fromEntries(formData.entries());

        // 计算结果
        const results = calculateResults(userData);

        // 显示结果页面
        renderResultsPage(userData, results);
    });

    // 计算所有结果
    function calculateResults(userData) {
        const { gender, birthDate, height, weight, bodyFat, skeletalMuscle } = userData;
        const age = calculateAge(new Date(birthDate));

        // 基础身体数据
        const bodyFatPercentage = (bodyFat / weight * 100).toFixed(1);
        const skeletalMusclePercentage = (skeletalMuscle / weight * 100).toFixed(1);
        const bmr = calculateBMR(gender, weight, height, age);
        const bmi = calculateBMI(weight, height);
        const bmiCategory = getBMICategory(bmi);

        // 目标数据
        const targetBodyFatPercentage = gender === 'male' ? 15 : 25;
        const targetBodyFatPercentageLabel = gender === 'male' ? '彭于晏基础版' : '刘亦菲基础版';
        const targetWeight = calculateTargetWeight(weight, bodyFat, targetBodyFatPercentage);
        const fatToLose = (bodyFat - (targetBodyFatPercentage / 100 * targetWeight)).toFixed(1);

        // 时间计算
        const weeksNeeded = calculateWeeksNeeded(bodyFat, targetBodyFatPercentage / 100 * targetWeight);
        const monthsNeeded = Math.round(weeksNeeded / 4.33);
        const targetDate = calculateTargetDate(monthsNeeded);

        return {
            age,
            bodyFatPercentage,
            skeletalMusclePercentage,
            bmr,
            bmi: bmi.toFixed(2),
            bmiCategory,
            targetBodyFatPercentage,
            targetBodyFatPercentageLabel,
            targetWeight: targetWeight.toFixed(1),
            fatToLose,
            weeksNeeded,
            monthsNeeded,
            targetDate
        };
    }

    // 计算年龄
    function calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // 计算基础代谢率(BMR)
    function calculateBMR(gender, weight, height, age) {
        weight = parseFloat(weight);
        height = parseFloat(height);
        age = parseInt(age);

        if (gender === 'male') {
            return Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
        } else {
            return Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
        }
    }

    // 计算BMI
    function calculateBMI(weight, height) {
        weight = parseFloat(weight);
        height = parseFloat(height) / 100; // 转换为米
        return weight / (height * height);
    }

    // 获取BMI分类
    function getBMICategory(bmi) {
        if (bmi < 18.5) return '过轻';
        if (bmi < 24) return '正常';
        if (bmi < 28) return '超重';
        return '肥胖';
    }

    // 计算目标体重
    function calculateTargetWeight(currentWeight, currentFat, targetFatPercentage) {
        currentWeight = parseFloat(currentWeight);
        currentFat = parseFloat(currentFat);
        const leanBodyMass = currentWeight - currentFat;
        return leanBodyMass / (1 - targetFatPercentage / 100);
    }

    // 计算需要的周数
    function calculateWeeksNeeded(currentFat, targetFat) {
        currentFat = parseFloat(currentFat);
        targetFat = parseFloat(targetFat);
        return Math.log10(targetFat / currentFat) / Math.log10(0.995);
    }

    // 计算目标日期
    function calculateTargetDate(monthsToAdd) {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + monthsToAdd);
        return targetDate;
    }

    // 渲染结果页面
    function renderResultsPage(userData, results) {
        // 创建个性化称呼
        const lastName = userData.lastName;
        const personalizedName = lastName.repeat(2) + '宝宝';

        // 格式化目标日期
        const formattedTargetDate = `${results.targetDate.getFullYear()}年${results.targetDate.getMonth() + 1}月${results.targetDate.getDate()}日`;

        // 构建结果HTML
        const resultsHTML = `
            <div class="transition-opacity duration-500 opacity-0" id="resultsContainer">
                <!-- 个性化欢迎区 -->
                <div class="text-center mb-12 mt-6">
                    <h2 class="text-2xl sm:text-3xl font-light text-balance">${personalizedName}，快来康康你的减肥报告呗~</h2>
                </div>

                <!-- 基础数据展示区 -->
                <div class="bg-white rounded-xl shadow-apple p-6 sm:p-8 mb-10">
                    <h3 class="text-xl font-bold text-center mb-6">铛铛！这是你的重要的身体数据部分</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="text-center p-4 bg-gray-50 rounded-lg">
                            <p class="text-gray-500 text-sm mb-1">体脂率</p>
                            <p class="text-3xl font-semibold">${results.bodyFatPercentage}%</p>
                        </div>
                        <div class="text-center p-4 bg-gray-50 rounded-lg">
                            <p class="text-gray-500 text-sm mb-1">骨骼肌率</p>
                            <p class="text-3xl font-semibold">${results.skeletalMusclePercentage}%</p>
                        </div>
                        <div class="text-center p-4 bg-gray-50 rounded-lg">
                            <p class="text-gray-500 text-sm mb-1">基础代谢</p>
                            <p class="text-3xl font-semibold">${results.bmr} kcal</p>
                        </div>
                        <div class="text-center p-4 bg-gray-50 rounded-lg">
                            <p class="text-gray-500 text-sm mb-1">BMI (${results.bmiCategory})</p>
                            <p class="text-3xl font-semibold">${results.bmi}</p>
                        </div>
                    </div>
                </div>

                <!-- 减肥目标展示区 -->
                <div class="bg-white rounded-xl shadow-apple p-6 sm:p-8 mb-10">
                    <h3 class="text-xl font-bold text-center mb-8">铛铛！这是我们的减肥目标啦~</h3>
                    <div class="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0">
                        <!-- 目标体脂率 -->
                        <div class="flex flex-col items-center flex-1">
                            <div class="w-16 h-16 flex items-center justify-center mb-3 text-gray-700">
                                <i class="fa fa-user-o text-3xl"></i>
                            </div>
                            <p class="text-gray-500 text-sm mb-1">目标体脂率</p>
                            <p class="text-2xl font-semibold">${results.targetBodyFatPercentage}%</p>
                            <p class="text-xs text-gray-500 mt-1">${results.targetBodyFatPercentageLabel}</p>
                        </div>

                        <!-- 目标体重 -->
                        <div class="flex flex-col items-center flex-1">
                            <div class="w-16 h-16 flex items-center justify-center mb-3 text-primary">
                                <i class="fa fa-balance-scale text-3xl"></i>
                            </div>
                            <p class="text-gray-500 text-sm mb-1">目标体重</p>
                            <p class="text-4xl font-bold text-primary">${results.targetWeight} kg</p>
                        </div>

                        <!-- 需要减少的脂肪量 -->
                        <div class="flex flex-col items-center flex-1">
                            <div class="w-16 h-16 flex items-center justify-center mb-3 text-gray-700">
                                <i class="fa fa-fire text-3xl"></i>
                            </div>
                            <p class="text-gray-500 text-sm mb-1">需要减少的脂肪量</p>
                            <p class="text-2xl font-semibold">${results.fatToLose} kg</p>
                        </div>
                    </div>
                </div>

                <!-- 减肥时间及路线图展示区 -->
                <div class="bg-white rounded-xl shadow-apple p-6 sm:p-8 mb-10">
                    <h3 class="text-xl font-bold text-center mb-8">减肥时间规划</h3>

                    <div class="mb-8 text-center">
                        <p class="text-xl mb-2">需要坚持：${results.monthsNeeded}个月</p>
                        <p class="text-gray-500">预计达成日期：${formattedTargetDate}</p>
                    </div>

                    <!-- 路线图 -->
                    <div class="relative">
                        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="progress-bar-gradient h-full rounded-full" style="width: 0%"></div>
                        </div>

                        <!-- 时间节点 -->
                        <div class="flex justify-between mt-1">
                            <div class="flex flex-col items-center">
                                <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs -mt-4">
                                    <i class="fa fa-flag"></i>
                                </div>
                                <span class="text-xs mt-2 text-gray-500">现在</span>
                            </div>

                            ${Array.from({ length: results.monthsNeeded }).map((_, i) => {
                                const percentage = (100 / results.monthsNeeded) * (i + 1);
                                return `
                                <div class="flex flex-col items-center absolute top-0" style="left: ${percentage}%">
                                    <div class="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs -mt-3">
                                        ${i + 1}
                                    </div>
                                    <span class="text-xs mt-1 text-gray-500">第${i + 1}个月</span>
                                </div>
                                `;
                            }).join('')}

                            <div class="flex flex-col items-center">
                                <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs -mt-4">
                                    <i class="fa fa-trophy"></i>
                                </div>
                                <span class="text-xs mt-2 text-gray-500">目标</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 教练提示 -->
                <div class="bg-secondary rounded-xl p-6 text-center">
                    <div class="flex items-center justify-center mb-3 text-primary">
                        <i class="fa fa-lightbulb-o text-xl mr-2"></i>
                        <p class="font-medium">小马教练提示</p>
                    </div>
                    <p class="text-gray-700">坚持每周锻炼3次，效果更佳哦~ 记得保持均衡饮食，充足睡眠！</p>

                    <!-- 教练签名 -->
                    <div class="mt-6 text-right">
                        <p class="text-gray-500 text-sm italic">—— 小马教练</p>
                    </div>
                </div>

                <!-- 返回按钮 -->
                <div class="mt-8 text-center">
                    <button id="backToForm" class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-apple">
                        <i class="fa fa-arrow-left mr-2"></i>重新计算
                    </button>
                </div>
            </div>
        `;

        // 替换主内容
        mainContent.innerHTML = resultsHTML;

        // 添加淡入效果
        setTimeout(() => {
            document.getElementById('resultsContainer').classList.replace('opacity-0', 'opacity-100');
            // 动画进度条
            const progressBar = document.querySelector('.progress-bar-gradient');
            setTimeout(() => {
                progressBar.style.width = '100%';
                progressBar.style.transition = 'width ' + results.monthsNeeded + 's ease-in-out';
            }, 500);
        }, 100);

        // 返回按钮事件
        document.getElementById('backToForm').addEventListener('click', function() {
            location.reload();
        });
    }
});
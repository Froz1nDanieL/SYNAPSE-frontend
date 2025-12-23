// 测试提取翻译中的第一部分（第一个换行符之前的内容）
// 格式示例："a. 反常的, 不规则的, 变态的, 畸形的\nn. 畸形的人"

// 提取第一个换行符之前的文本函数
function getTextBeforeFirstNewline(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const newlineIndex = text.indexOf('\n');
  return newlineIndex === -1 ? text : text.substring(0, newlineIndex);
}

// 测试用例
const testCases = [
  {
    word: "abnormal",
    translation: "a. 反常的, 不规则的, 变态的, 畸形的\nn. 畸形的人",
    expectedFirstPart: "a. 反常的, 不规则的, 变态的, 畸形的"
  },
  {
    word: "normal",
    translation: "a. 正常的, 平常的; 标准的, 规范的\nn. 标准, 正常状态",
    expectedFirstPart: "a. 正常的, 平常的; 标准的, 规范的"
  },
  {
    word: "apple",
    translation: "n. 苹果; 苹果树; 苹果公司",
    expectedFirstPart: "n. 苹果; 苹果树; 苹果公司"
  },
  {
    word: "run",
    translation: "v. 跑, 奔跑; 运转, 运行; 经营, 管理\nn. 跑步, 奔跑; 路程, 行程; 一系列, 连续",
    expectedFirstPart: "v. 跑, 奔跑; 运转, 运行; 经营, 管理"
  },
  {
    word: "clear",
    translation: "adj. 清楚的, 清晰的; 晴朗的, 明亮的\nadv. 清楚地, 清晰地\nv. 清除, 清理; 使明白, 使清楚",
    expectedFirstPart: "adj. 清楚的, 清晰的; 晴朗的, 明亮的"
  }
];

// 模拟选项数据
const mockBackendOptions = [
  "a. 反常的, 不规则的, 变态的, 畸形的\nn. 畸形的人",
  "a. 正常的, 平常的; 标准的, 规范的\nn. 标准, 正常状态",
  "a. 优秀的, 出色的; 杰出的, 卓越的\nadv. 很好地, 出色地",
  "a. 美丽的, 漂亮的; 美好的, 优美的\nadv. 美丽地, 漂亮地"
];

// 测试提取第一部分功能
function testExtractFirstPart() {
  console.log("=== 测试：提取翻译的第一部分 ===");
  
  testCases.forEach((testCase, index) => {
    const result = getTextBeforeFirstNewline(testCase.translation);
    const isCorrect = result === testCase.expectedFirstPart;
    
    console.log(`\n${index + 1}. 单词: ${testCase.word}`);
    console.log(`   原始翻译: ${testCase.translation}`);
    console.log(`   提取结果: ${result}`);
    console.log(`   预期结果: ${testCase.expectedFirstPart}`);
    console.log(`   测试结果: ${isCorrect ? '✅ 正确' : '❌ 错误'}`);
  });
}

// 测试选项处理逻辑
function testOptionProcessing() {
  console.log("\n\n=== 测试：处理选项数据 ===");
  
  // 使用第一个测试用例作为当前单词
  const currentWord = testCases[0];
  console.log(`当前单词: ${currentWord.word}`);
  console.log(`当前单词翻译: ${currentWord.translation}`);
  
  // 提取当前单词翻译的第一部分
  const currentWordFirstPart = getTextBeforeFirstNewline(currentWord.translation);
  console.log(`当前单词翻译第一部分: ${currentWordFirstPart}`);
  
  console.log(`\n原始选项数据:`);
  mockBackendOptions.forEach((option, index) => {
    console.log(`   ${index + 1}. ${option}`);
  });
  
  // 处理选项
  const processedOptions = mockBackendOptions.map((optionText, index) => {
    const processedOption = getTextBeforeFirstNewline(optionText);
    const isCorrect = processedOption === currentWordFirstPart;
    
    return {
      originalText: optionText,
      processedText: processedOption,
      isCorrect: isCorrect
    };
  });
  
  console.log(`\n处理后的选项:`);
  processedOptions.forEach((option, index) => {
    console.log(`   ${index + 1}.`);
    console.log(`      原始: ${option.originalText}`);
    console.log(`      处理: ${option.processedText}`);
    console.log(`      正确: ${option.isCorrect ? '✅ 是' : '❌ 否'}`);
  });
}

// 测试空值和异常情况
function testEdgeCases() {
  console.log("\n\n=== 测试：边缘情况 ===");
  
  const edgeCases = [
    null,
    undefined,
    "",
    "只有一行文本没有换行",
    "\n开头就有换行",
    "第一行\n第二行\n第三行"
  ];
  
  edgeCases.forEach((test, index) => {
    const result = getTextBeforeFirstNewline(test);
    console.log(`${index + 1}. 输入: ${JSON.stringify(test)}`);
    console.log(`   结果: ${JSON.stringify(result)}`);
  });
}

// 运行所有测试
console.log("开始测试翻译第一部分提取功能...\n");
testExtractFirstPart();
testOptionProcessing();
testEdgeCases();
console.log("\n=== 所有测试完成 ===");
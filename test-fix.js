// 测试修复后的换行符处理函数

// 修复后的函数实现
function getTextBeforeFirstNewline(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  // 处理所有类型的换行符（\n, \r\n, \r）
  const newlineRegex = /[\r\n]/;
  const newlineIndex = text.search(newlineRegex);
  return newlineIndex === -1 ? text : text.substring(0, newlineIndex);
}

// 测试用例，包含不同换行符格式
const testCases = [
  {
    name: "Linux/Mac换行符(\n)",
    input: "a. 反常的, 不规则的, 变态的, 畸形的\nn. 畸形的人",
    expected: "a. 反常的, 不规则的, 变态的, 畸形的"
  },
  {
    name: "Windows换行符(\r\n)",
    input: "a. 反常的, 不规则的, 变态的, 畸形的\r\nn. 畸形的人",
    expected: "a. 反常的, 不规则的, 变态的, 畸形的"
  },
  {
    name: "旧Mac换行符(\r)",
    input: "a. 反常的, 不规则的, 变态的, 畸形的\rn. 畸形的人",
    expected: "a. 反常的, 不规则的, 变态的, 畸形的"
  },
  {
    name: "没有换行符",
    input: "n. 苹果; 苹果树; 苹果公司",
    expected: "n. 苹果; 苹果树; 苹果公司"
  },
  {
    name: "多行文本",
    input: "adj. 清楚的, 清晰的; 晴朗的, 明亮的\r\nadv. 清楚地, 清晰地\n\nv. 清除, 清理; 使明白, 使清楚",
    expected: "adj. 清楚的, 清晰的; 晴朗的, 明亮的"
  },
  {
    name: "空字符串",
    input: "",
    expected: ""
  },
  {
    name: "null输入",
    input: null,
    expected: ""
  },
  {
    name: "undefined输入",
    input: undefined,
    expected: ""
  }
];

// 运行测试
console.log("=== 测试修复后的换行符处理函数 ===");

testCases.forEach((testCase, index) => {
  const result = getTextBeforeFirstNewline(testCase.input);
  const isCorrect = result === testCase.expected;
  
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   输入: ${JSON.stringify(testCase.input)}`);
  console.log(`   输出: ${JSON.stringify(result)}`);
  console.log(`   预期: ${JSON.stringify(testCase.expected)}`);
  console.log(`   结果: ${isCorrect ? '✅ 正确' : '❌ 错误'}`);
});

// 模拟实际应用场景
console.log("\n\n=== 模拟实际应用场景 ===");

// 模拟后端返回的数据
const mockWordData = {
  word: "abnormal",
  translation: "a. 反常的, 不规则的, 变态的, 畸形的\r\nn. 畸形的人", // Windows格式换行
  options: [
    "a. 反常的, 不规则的, 变态的, 畸形的\r\nn. 畸形的人",
    "a. 正常的, 平常的; 标准的, 规范的\n\nn. 标准, 正常状态",
    "a. 优秀的, 出色的; 杰出的, 卓越的\rn. 优秀的人, 杰出的人",
    "a. 美丽的, 漂亮的; 美好的, 优美的\r\nadv. 美丽地, 漂亮地"
  ]
};

console.log("模拟单词数据:");
console.log(`单词: ${mockWordData.word}`);
console.log(`翻译: ${mockWordData.translation}`);

// 提取当前单词翻译的第一部分
const currentWordFirstPart = getTextBeforeFirstNewline(mockWordData.translation);
console.log(`\n提取的翻译第一部分: ${currentWordFirstPart}`);

// 处理选项
const processedOptions = mockWordData.options.map((optionText, index) => {
  const processedOption = getTextBeforeFirstNewline(optionText);
  const isCorrect = processedOption === currentWordFirstPart;
  
  return {
    original: optionText,
    processed: processedOption,
    isCorrect: isCorrect
  };
});

console.log("\n处理后的选项:");
processedOptions.forEach((option, index) => {
  console.log(`${index + 1}.`);
  console.log(`   原始: ${JSON.stringify(option.original)}`);
  console.log(`   处理: ${option.processed}`);
  console.log(`   正确: ${option.isCorrect ? '✅' : '❌'}`);
});

console.log("\n=== 测试完成 ===");
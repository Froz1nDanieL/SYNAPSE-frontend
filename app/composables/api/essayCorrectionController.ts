// @ts-ignore
/* eslint-disable */
import request from "~/request";

export type EssayCorrectionRequest = {
  content?: string;
  topic?: string;
  topicId?: string;
};

export type DimensionScores = {
  contentRelevance?: number;
  logicalStructure?: number;
  grammarQuality?: number;
  vocabularyLevel?: number;
  totalScore?: number;
};

export type ErrorWord = {
  originalWord?: string;
  correctWord?: string;
  context?: string;
  suggestion?: string;
};

export type GrammarError = {
  originalSentence?: string;
  correctedSentence?: string;
  errorType?: string;
  errorPosition?: string;
  suggestion?: string;
};

export type RecommendedWord = {
  originalWord?: string;
  recommendedWord?: string;
  context?: string;
  example?: string;
};

export type EssayCorrectionResult = {
  recordId?: string;
  topic?: string;
  originalContent?: string;
  correctTime?: string;
  correctedContent?: string;
  summaryComment?: string;
  dimensionScores?: DimensionScores;
  errorWords?: ErrorWord[];
  grammarErrors?: GrammarError[];
  recommendedWords?: RecommendedWord[];
};

export type EssayCorrectionReportVO = {
  id?: string;
  topicId?: string;
  topic?: string;
  content?: string;
  correctStatus?: number;
  score?: number;
  fullScore?: number;
  wordCount?: number;
  createTime?: string;
  correctTime?: string;
  result?: EssayCorrectionResult;
};

export type PageEssayCorrectionReportVO = {
  records?: EssayCorrectionReportVO[];
  total?: number;
  size?: number;
  current?: number;
  pages?: number;
};

export type BaseResponseEssayCorrectionReportVO = {
  code?: number;
  data?: EssayCorrectionReportVO;
  message?: string;
};

export type BaseResponsePageEssayCorrectionReportVO = {
  code?: number;
  data?: PageEssayCorrectionReportVO;
  message?: string;
};

/** 批改作文并保存报告 POST /essay-correction/correct */
export async function correctEssay(
  body: EssayCorrectionRequest,
  options?: { [key: string]: any },
) {
  return request<BaseResponseEssayCorrectionReportVO>("/essay-correction/correct", {
    method: "POST",
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页获取当前用户作文批改报告 GET /essay-correction/reports/page */
export async function listMyEssayCorrectionReports(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponsePageEssayCorrectionReportVO>(
    "/essay-correction/reports/page",
    {
      method: "GET",
      params,
      ...(options || {}),
    },
  );
}

/** 获取当前用户单篇作文批改报告 GET /essay-correction/reports/get */
export async function getEssayCorrectionReport(
  params: {
    id: string;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponseEssayCorrectionReportVO>(
    "/essay-correction/reports/get",
    {
      method: "GET",
      params,
      ...(options || {}),
    },
  );
}

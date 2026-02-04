// @ts-ignore
/* eslint-disable */
import request from "~/request";

/** 此处后端没有提供注释 POST /word-learn/collect */
export async function toggleCollect(
  body: API.WordCollectRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/word-learn/collect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /word-learn/collected */
export async function getCollectedWords(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCollectedWordsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageWordRecordVO>("/word-learn/collected", {
    method: "GET",
    params: {
      // pageNo has a default value: 1
      pageNo: "1",
      // pageSize has a default value: 20
      pageSize: "20",
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /word-learn/collected/clear */
export async function clearCollectedWords(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.clearCollectedWordsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseInteger>("/word-learn/collected/clear", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /word-learn/learn */
export async function submitLearnRecord(
  body: API.WordLearnRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/word-learn/learn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /word-learn/learn/batch */
export async function batchSubmitLearnRecord(
  body: API.BatchWordLearnRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListLong>("/word-learn/learn/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /word-learn/new-words */
export async function getNewWordList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getNewWordListParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListWordCardVO>("/word-learn/new-words", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /word-learn/preview/${param0} */
export async function previewWordBook(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.previewWordBookParams,
  options?: { [key: string]: any }
) {
  const { wordType: param0, ...queryParams } = params;
  return request<API.BaseResponseListWordCardVO>(
    `/word-learn/preview/${param0}`,
    {
      method: "GET",
      params: {
        // limit has a default value: 10
        limit: "10",
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /word-learn/progress */
export async function getLearnProgress(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getLearnProgressParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLearnProgressVO>("/word-learn/progress", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /word-learn/pronunciation */
export async function getWordPronunciation(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getWordPronunciationParams,
  options?: { [key: string]: any }
) {
  return request<any>("/word-learn/pronunciation", {
    method: "GET",
    params: {
      // type has a default value: 1
      type: "1",
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /word-learn/review */
export async function submitReviewRecord(
  body: API.WordReviewRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/word-learn/review", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /word-learn/review-words */
export async function getReviewWordList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getReviewWordListParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListWordCardVO>("/word-learn/review-words", {
    method: "GET",
    params: {
      // limit has a default value: 50
      limit: "50",
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /word-learn/review/batch */
export async function batchSubmitReviewRecord(
  body: API.BatchWordReviewRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/word-learn/review/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /word-learn/word-books */
export async function getWordBookList(options?: { [key: string]: any }) {
  return request<API.BaseResponseListWordBookVO>("/word-learn/word-books", {
    method: "GET",
    ...(options || {}),
  });
}

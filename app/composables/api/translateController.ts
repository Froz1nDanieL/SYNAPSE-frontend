// @ts-ignore
/* eslint-disable */
import request from "~/request";

/** 此处后端没有提供注释 POST /translate/document */
export async function translateDocument(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.translateDocumentParams,
  body: {},
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTranslateResponse>("/translate/document", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      // from has a default value: auto
      from: "auto",
      // to has a default value: zh
      to: "zh",
      ...params,
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /translate/document/format */
export async function translateDocumentWithFormat(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.translateDocumentWithFormatParams,
  body: {},
  options?: { [key: string]: any },
) {
  return request<string[]>("/translate/document/format", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      // from has a default value: auto
      from: "auto",
      // to has a default value: zh
      to: "zh",
      ...params,
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /translate/document/format/to-en */
export async function translateDocumentToEnglishWithFormat(
  body: FormData,
  options?: { [key: string]: any },
) {
  return request<Blob>("/translate/document/format/to-en", {
    method: "POST",
    data: body,
    responseType: "blob",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /translate/document/format/to-zh */
export async function translateDocumentToChineseWithFormat(
  body: FormData,
  options?: { [key: string]: any },
) {
  return request<Blob>("/translate/document/format/to-zh", {
    method: "POST",
    data: body,
    responseType: "blob",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /translate/document/to-en */
export async function translateDocumentToEnglish(
  body: {},
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTranslateResponse>(
    "/translate/document/to-en",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** 此处后端没有提供注释 POST /translate/document/to-zh */
export async function translateDocumentToChinese(
  body: {},
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTranslateResponse>(
    "/translate/document/to-zh",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** 此处后端没有提供注释 GET /translate/text */
export async function translateText(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.translateTextParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTranslateResponse>("/translate/text", {
    method: "GET",
    params: {
      // from has a default value: auto
      from: "auto",
      // to has a default value: zh
      to: "zh",
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /translate/to-en */
export async function translateToEnglish(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.translateToEnglishParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTranslateResponse>("/translate/to-en", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /translate/to-zh */
export async function translateToChinese(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.translateToChineseParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTranslateResponse>("/translate/to-zh", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

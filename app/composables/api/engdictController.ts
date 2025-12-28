// @ts-ignore
/* eslint-disable */
import request from "~/request";

/** 此处后端没有提供注释 POST /engdict/add */
export async function addEngdict(
  body: API.EngdictAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseInteger>("/engdict/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /engdict/delete */
export async function deleteEngdict(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/engdict/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /engdict/get */
export async function getEngdictById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEngdictByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseEngdict>("/engdict/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /engdict/list */
export async function listEngdict(
  body: API.EngdictQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListEngdict>("/engdict/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /engdict/list/page */
export async function listEngdictByPage(
  body: API.EngdictQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageEngdict>("/engdict/list/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /engdict/translateWord */
export async function translateWord(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.translateWordParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseWordCardVO>("/engdict/translateWord", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /engdict/update */
export async function updateEngdict(
  body: API.EngdictUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/engdict/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

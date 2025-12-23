// @ts-ignore
/* eslint-disable */
import request from "~/request";

/** 此处后端没有提供注释 POST /learnplan/create */
export async function createLearnPlan(
  body: API.LearnPlanCreateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/learnplan/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /learnplan/current */
export async function getCurrentPlan(options?: { [key: string]: any }) {
  return request<API.BaseResponseLearnPlanVO>("/learnplan/current", {
    method: "GET",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /learnplan/daily-count */
export async function updateDailyCount(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateDailyCountParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/learnplan/daily-count", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /learnplan/pause */
export async function pausePlan(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>("/learnplan/pause", {
    method: "POST",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /learnplan/resume */
export async function resumePlan(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>("/learnplan/resume", {
    method: "POST",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /learnplan/switch */
export async function switchWordBook(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.switchWordBookParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/learnplan/switch", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /learnplan/update */
export async function updateLearnPlan(
  body: API.LearnPlanUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/learnplan/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

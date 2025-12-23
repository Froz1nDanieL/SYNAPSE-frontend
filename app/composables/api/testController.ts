// @ts-ignore
/* eslint-disable */
import request from "~/request";

/** 此处后端没有提供注释 GET /test/login */
export async function login(options?: { [key: string]: any }) {
  return request<API.BaseResponseMapStringObject>("/test/login", {
    method: "GET",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /test/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<API.BaseResponseString>("/test/logout", {
    method: "GET",
    ...(options || {}),
  });
}

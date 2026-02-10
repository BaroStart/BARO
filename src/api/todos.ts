import type {
  ApiResponseUnit,
  CreateToDoReq,
  UpdateToDoReq,
  UpdateToDoStatusReq,
} from '@/generated';

import axiosInstance from './axiosInstance';
import { todosApi } from './clients';

export async function fetchTodos() {
  const { data } = await todosApi.getTodayToDoList();
  return data;
}

export async function createTodo(body: CreateToDoReq) {
  const { data } = await todosApi.createToDo({ createToDoReq: body });
  return data;
}

export async function updateTodo(body: UpdateToDoReq) {
  const { data } = await todosApi.updateToDo({ updateToDoReq: body });
  return data;
}

// changeTodoStatus: generated 코드에 {id} path parameter 누락 (백엔드 스펙 이슈) -> 수동 호출 유지
export async function changeTodoStatus(id: number, body: UpdateToDoStatusReq) {
  const { data } = await axiosInstance.patch<ApiResponseUnit>(
    `/api/v1/todos/${id}/status`,
    body,
  );
  return data;
}

export async function deleteTodo(id: number) {
  const { data } = await todosApi.deleteToDo({ id });
  return data;
}

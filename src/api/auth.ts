import type { LoginRequestDto, SignupRequestDto } from '@/generated';

import { authApi } from './clients';

export async function signup(body: SignupRequestDto) {
  const { data } = await authApi.signup({ signupRequestDto: body });
  return data;
}

export async function login(body: LoginRequestDto) {
  const { data } = await authApi.login({ loginRequestDto: body });
  return data;
}

export async function refresh(token: string) {
  const { data } = await authApi.refresh({ token });
  return data;
}

export async function logout() {
  const { data } = await authApi.logout();
  return data;
}

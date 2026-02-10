import { storagesApi } from './clients';

export async function getPreAuthenticatedUrl(fileName: string) {
  const { data } = await storagesApi.getPreAuthenticatedUrl({ fileName });
  return data;
}

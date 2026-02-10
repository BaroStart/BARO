import { examplesApi } from './clients';

export async function fetchExamples() {
  const { data } = await examplesApi.getAll();
  return data;
}

export async function fetchExampleById(id: number) {
  const { data } = await examplesApi.getById({ id });
  return data;
}

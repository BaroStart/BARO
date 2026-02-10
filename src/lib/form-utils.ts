import type { Resolver } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

export function createZodResolver<T extends z.ZodType>(schema: T): Resolver<z.infer<T>> {
  return zodResolver(schema) as Resolver<z.infer<T>>;
}

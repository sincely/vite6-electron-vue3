import { z } from 'zod'

export const ParamsDto = z.object({
  id: z.coerce.number().int().positive()
})

export const createParamDto = (...paramsName) => {
  const shape = {}
  for (const name of paramsName) {
    shape[name] = z.coerce.number().int().positive()
  }
  return z.object(shape)
}

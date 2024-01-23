import unocssui from 'unocss-ui'
import type { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  app.use(unocssui)
}

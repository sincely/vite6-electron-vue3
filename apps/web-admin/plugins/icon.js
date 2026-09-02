import { elementIcons } from './element-icons'

export default function setupIcon(app) {
  Object.keys(elementIcons).forEach((key) => {
    app.component(key, elementIcons[key])
  })
}

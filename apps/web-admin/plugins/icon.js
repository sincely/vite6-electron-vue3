import * as elementIcons from '@element-plus/icons-vue'
export default function setupIcon(app) {
  Object.keys(elementIcons).forEach((key) => {
    app.component(key, elementIcons[key])
  })
}

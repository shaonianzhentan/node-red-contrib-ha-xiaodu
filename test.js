const HomeAssistant = require('./HomeAssistant')

const BDUSS = ''
const ha = new HomeAssistant(BDUSS, null)
ha.getDeviceList(BDUSS).then(console.log)
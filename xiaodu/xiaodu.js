const Xiaodu = require('../Xiaodu')

module.exports = function (RED) {
    RED.nodes.registerType('ha-xiaodu', function (config) {
        RED.nodes.createNode(this, config);
        const node = this
        const { BDUSS } = config
        const server = RED.nodes.getNode(config.server);
        const ha = new Xiaodu(BDUSS)
        ha.getDeviceList(BDUSS).then(() => {
            console.log('获取设备列表')
            ha.device_info.forEach(device => {
                const name = device.name
                const type = 'button'
                const unique_id = ha.md5(type + name)
                const discovery_topic = `homeassistant/${type}/${unique_id}/config`
                const command_topic = `${unique_id}/set`
                server.publish(discovery_topic, {
                    name: `唤醒${name}`,
                    unique_id,
                    command_topic: server.subscribe_topic(command_topic),
                    device
                })
                server.subscribe(server.publish_topic(command_topic), payload => {
                    if (payload.toString() === 'PRESS') {
                        ha.send_to_server('小度小度', device.identifiers)
                    }
                })
            })
        })
    })
}
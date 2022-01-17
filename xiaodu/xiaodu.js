const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-xiaodu', function (config) {
        RED.nodes.createNode(this, config);
        const node = this
        const { cookie } = config
        if (cookie) {
            const server = RED.nodes.getNode(config.server);
            if (server) {
                server.register(this)
                const ha = new HomeAssistant(node)
                ha.getDeviceList(cookie).then(res => {
                    ha.status(res.msg)
                    // 遍历设备
                    res.data.list.forEach(device => {

                    })
                })

                node.on('input', async function (msg) {
                    const { payload, xiaodu } = msg
                    node.status({ fill: "blue", shape: "ring", text: "发送命令" });
                    try {
                        // 使用小度音箱
                        if (xiaodu) {
                            await ha.xiaoduBox(xiaodu, config.headers)
                        }
                        node.status({ fill: "green", shape: "ring", text: "发送成功" });
                    } catch (ex) {
                        node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                    }
                })
            }
        } else {
            node.status({ fill: "red", shape: "ring", text: "未配置Cookie" });
        }
    })
}
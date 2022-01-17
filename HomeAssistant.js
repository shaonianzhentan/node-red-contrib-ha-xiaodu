const fetch = require('node-fetch')
const FormData = require('form-data')
const { v4: uuidv4 } = require('uuid')

module.exports = class {
    constructor(node) {
        this.node = node
    }

    status(text) {
        this.node.status({ fill: "green", shape: "ring", text })
    }

    // 自动发现配置
    discovery() {

    }

    // 获取设备列表
    async getDeviceList(BDUSS) {
        return await fetch('https://xiaodu.baidu.com/saiya/device/list', {
            headers: { "cookie": `BDUSS=${BDUSS}` }
        }).then(res => res.json())
    }

    // 单命令执行
    async xiaoduBox(text, { client_id, cuid, appkey, BDUSS }) {
        const uuid = `${appkey}|O_com.baidu.duer.superapp`
        headers = {
            "client_id": client_id,
            "dueros-device-id": cuid,
            "uuid": uuid,
            "saiyalogid": `${cuid}_${Date.now()}`,
            "cookie": `BDUSS=${BDUSS}`,
            "support": "ACK,P2P,NAC",
            "content-type": "application/json; charset=UTF-8"
        }
        await fetch('https://dueros-h2.baidu.com/dlp/controller/send_to_server', {
            method: 'POST',
            body: JSON.stringify(
                {
                    "to_server": {
                        "header": {
                            "dialogRequestId": "",
                            "messageId": uuidv4(),
                            "name": "LinkClicked",
                            "namespace": "dlp.screen"
                        },
                        "payload": {
                            "initiator": {
                                "type": "USER_CLICK"
                            },
                            "token": "",
                            "url": `dueros://server.dueros.ai/query?q=${encodeURIComponent(text)}`
                        }
                    },
                    "uuid": headers.uuid
                }
            ),
            headers
        })
    }
}
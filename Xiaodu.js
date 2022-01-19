const fetch = require('node-fetch')
const { v4: uuidv4 } = require('uuid')
const crypto = require('crypto')

module.exports = class {
    constructor(BDUSS) {
        this.BDUSS = BDUSS
        this.device_list = []
        this.device_info = []
    }

    md5(text) {
        return crypto.createHash('md5').update(text).digest('hex').toLocaleLowerCase()
    }

    // 获取设备列表
    async getDeviceList() {
        const res = await fetch('https://xiaodu.baidu.com/saiya/device/list', {
            headers: { "cookie": `BDUSS=${this.BDUSS}` }
        }).then(res => res.json())
        const list = res.data.list
        this.device_info = list.map(device => {
            const { name, device_id, device_version, mac, network_infos, online_status } = device
            let model = mac
            let manufacturer = 'Baidu'
            try {
                const obj = JSON.parse(network_infos)[0]
                model = obj.ipAddress
                manufacturer = obj.ssid
            } catch {
            }
            return {
                name,
                configuration_url: "https://github.com/shaonianzhentan/node-red-contrib-ha-xiaodu",
                identifiers: device_id,
                manufacturer,
                model,
                sw_version: device_version
            }
        })
        this.device_list = list
        return list
    }

    // 单命令执行
    async send_to_server(text, device_id) {
        const { client_id, cuid, appkey } = this.device_list.find(ele => ele.device_id === device_id)
        const uuid = `${appkey}|O_com.baidu.duer.superapp`
        const headers = {
            "client_id": client_id,
            "dueros-device-id": cuid,
            "uuid": uuid,
            "saiyalogid": `${cuid}_${Date.now()}`,
            "cookie": `BDUSS=${this.BDUSS}`,
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
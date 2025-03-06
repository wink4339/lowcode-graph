import { config, workspace, project } from '@alilc/lowcode-engine'
import { RequestHandler } from "../../decorators"
import { IRequest } from "../../types"

class DataModel {
    static symbol = "datamodel"

    @RequestHandler()
    save(options: IRequest) {
        setTimeout(() => {
            options.success()
        }, 1500)
    }

    @RequestHandler()
    sync(options: IRequest) {
        setTimeout(() => {
            options.success()
        }, 1500)
    }
}

export default new DataModel()
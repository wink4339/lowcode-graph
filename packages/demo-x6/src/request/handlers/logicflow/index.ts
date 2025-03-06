import { config, workspace, project } from '@alilc/lowcode-engine'
import { RequestHandler } from "../../decorators"
import { IRequest } from "../../types"

class LogicFlow {
    static symbol = "logicflow"

    @RequestHandler()
    save(options: IRequest) {
        setTimeout(() => {
            options.success()
        }, 1500)
    }
}

export default new LogicFlow()
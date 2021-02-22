/**
 * @public
 */
import {RomsController} from "./roms-controller";
import {ModelConfig, QueryStarter} from "..";


export class Roms {

    private romsController: RomsController


    public constructor() {
        this.romsController = new RomsController();
    }

    /**
     * This method accepts the model configs that should be added to the system.
     *
     * @public
     */
    public addModelConfigs(configs: ModelConfig[]): void {
        this.romsController.addModelConfigs(configs);
    }

    /**
     * This method returns the queryStarter on which the user can start writing their query.
     *
     * @public
     */
    public use(name: string): QueryStarter {
        return this.romsController.getModelStorageContainer().find(name.toLowerCase()).createQuery()
    }

    /**
     * Puts the system in a "hold" state
     *
     * @remarks
     * This method puts the system in a "hold" state which prevents any changes from being emitted by the observer. All
     * changes will be collected and emitted once the continue() function is called.
     *
     * @public
     */
    public hold(): void {
        this.romsController.holdExternally();
    }

    /**
     * This method will get the system out of the "hold" state.
     *
     * @remarks
     * This method will get the system out of the "hold" state and let the observer emit all changes made until this
     * point from the moment the system was put in hold.
     *
     * @public
     */
    public continue(): void {
        this.romsController.continueExternally();
    }

}

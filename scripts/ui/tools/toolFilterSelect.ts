/**
 * @module ui/tools
 */
/** */

import ToolSelect from "./toolSelect";
import Protractr from "../../protractr";
import FilterString from "../../gcs/filterString";
import Figure from "../../gcs/geometry/figure";

export default class ToolFilterSelect extends ToolSelect {
    filter: FilterString;

    constructor(protractr: Protractr, filterString: string) {
        super(protractr);
        this.filter = new FilterString(filterString);
    }

    figureShouldBeSelected(figure: Figure) {
        return this.filter.satisfiesFilter([figure]) && super.figureShouldBeSelected(figure);
    }
}
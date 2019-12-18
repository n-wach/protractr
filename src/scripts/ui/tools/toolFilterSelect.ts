import ToolSelect from "./toolSelect";
import {Protractr} from "../../protractr";
import {FilterString} from "../../gcs/constraint_filter";
import {Figure} from "../../gcs/figures";

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
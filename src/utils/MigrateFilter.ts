import { HTTP } from "@willsofts/will-api";
import { VerifyError, KnValidateInfo } from "@willsofts/will-core";
import { Utilities } from "@willsofts/will-util";
import { KnModel } from "@willsofts/will-db";
import { MigrateUtility } from "./MigrateUtility";
import { FilterInfo } from "../models/MigrateAlias";
import { KnSQLUtils } from "@willsofts/will-db";
import { KnDBUtils, KnDBTypes } from "@willsofts/will-sql";

export interface ColumnSetting {
    name: string;
    condition: string;
    from?: any;
    to?: any;
    value?: any;
    verify?: boolean;
}

export interface FilterSetting {
    operator: string;
    columns: ColumnSetting[];
}

export interface FiltersSetting {
    operator: string;
    filter: FilterSetting[];
}

export class MigrateFilter {
    public logger;
    public filters: FiltersSetting;
    public model: KnModel;
    
    constructor(config: any) {
        this.model = config?.model;
        this.filters = config?.filters;
        this.logger = config?.logger;
    }

    private toArray(value: any) : any[] {
        if(typeof value === 'string') {
            return value.split(',');
        } else if(Array.isArray(value)) {
            return value;
        }
        return [];
    }

    protected validSetting(setting: ColumnSetting) : boolean {
        let condition = setting.condition;
        if(!condition || condition.trim().length==0) return false;
        if("==" == condition) return true;
        if("!=" == condition) return true;
        if(">" == condition) return true;
        if("<" == condition) return true;
        if(">=" == condition) return true;
        if("<=" == condition) return true;
        if("#in-set" == condition) return true;
        if("#out-set" == condition) return true;
        if("#in-region" == condition) return true;
        if("#out-region" == condition) return true;
        if("#is-null" == condition) return true;
        if("#is-not-null" == condition) return true;
        if("#is-blank" == condition) return true;
        if("#is-not-blank" == condition) return true;
        if("#inner-range" == condition) {
            if(typeof setting.from !== 'undefined' && typeof setting.to !== 'undefined') return true;
            return false;
        }
        if("#outer-range" == condition) {
            if(typeof setting.from !== 'undefined' && typeof setting.to !== 'undefined') return true;
            return false;
        }
        if("#under-range" == condition) {
            if(typeof setting.from !== 'undefined' && typeof setting.to !== 'undefined') return true;
            return false;
        }
        if("#upper-range" == condition) {
            if(typeof setting.from !== 'undefined' && typeof setting.to !== 'undefined') return true;
            return false;
        }
        return false;
    }

    public async validateNull(setting: ColumnSetting, validator?: any) : Promise<boolean> {
        let valid = this.validSetting(setting);
        if(!valid) {
            return Promise.reject(new VerifyError("Invalid conditioner ("+setting.condition+")",HTTP.NOT_ACCEPTABLE,-16073));
        }
        if("#is-null" == setting.condition) {
            return typeof validator === 'undefined' || validator === null;
        }
        if("#is-not-null" == setting.condition) {
            return typeof validator !== 'undefined' && validator !== null;
        }
        return false;
    }

    public async validateNumber(setting: ColumnSetting, validator?: any) : Promise<boolean> {
        let valid = await this.validateNull(setting,validator);
        if(valid) return valid;
        if("#in-region" == setting.condition) {
            return Promise.reject(new VerifyError("The operation does not apply for conditioner ("+setting.condition+")",HTTP.NOT_ACCEPTABLE,-16074));
        }
        if("#out-region" == setting.condition) {
            return Promise.reject(new VerifyError("The operation does not apply for conditioner ("+setting.condition+")",HTTP.NOT_ACCEPTABLE,-16074));
        }
        if(!validator) return false;                
        let val = Utilities.parseFloat(validator);
        if(typeof val === 'undefined') return false;
        if("#inner-range" == setting.condition) {
            let fval = Utilities.parseFloat(setting.from);
            let tval = Utilities.parseFloat(setting.to);
            return val >= (fval ? fval : 0) && val <= (tval ? tval : 0);
        }
        if("#outer-range" == setting.condition) {
            let fval = Utilities.parseFloat(setting.from);
            let tval = Utilities.parseFloat(setting.to);
            return val <= (fval ? fval : 0) || val >= (tval ? tval : 0);
        }
        if("#under-range" == setting.condition) {
            let fval = Utilities.parseFloat(setting.from);
            let tval = Utilities.parseFloat(setting.to);
            return val > (fval ? fval : 0) && val < (tval ? tval : 0);
        }
        if("#upper-range" == setting.condition) {
            let fval = Utilities.parseFloat(setting.from);
            let tval = Utilities.parseFloat(setting.to);
            return val < (fval ? fval : 0) || val > (tval ? tval : 0);
        }
        if(typeof setting.value === 'undefined' || setting.value == null) {
            if("==" == setting.condition || "<" == setting.condition || "<=" == setting.condition) {
                if(setting?.verify) {
                    return Promise.reject(new VerifyError("Invalid data input",HTTP.NOT_ACCEPTABLE,-16075));
                }
                return false;
            }
            if("!=" == setting.condition || ">" == setting.condition || ">=" == setting.condition) {
                return true;
            }
            return false;
        }
        let value = Utilities.parseFloat(setting.value,0);
        if(typeof value === 'undefined') return false;
        if("==" == setting.condition) {
            if(val == value) {
                return true;
            } else {
                if(setting?.verify) {
                    return Promise.reject(new VerifyError("Invalid data input",HTTP.NOT_ACCEPTABLE,-16075));
                }
                return false;
            }
        }
        if("!=" == setting.condition) {
            if(val != value) {
                return true;
            } else {
                if(setting?.verify) {
                    return Promise.reject(new VerifyError("Invalid data input",HTTP.NOT_ACCEPTABLE,-16075));
                }
                return false;
            }
        }
        if(">" == setting.condition) {
            if(val > value) {
                return true;
            } else {
                if(setting?.verify) {
                    return Promise.reject(new VerifyError("Invalid data input",HTTP.NOT_ACCEPTABLE,-16075));
                }
                return false;
            }
        }
        if("<" == setting.condition) {
            if(val < value) {
                return true;
            } else {
                if(setting?.verify) {
                    return Promise.reject(new VerifyError("Invalid data input",HTTP.NOT_ACCEPTABLE,-16075));
                }
                return false;
            }
        }
        if(">=" == setting.condition) {
            if(val >= value) {
                return true;
            } else {
                if(setting?.verify) {
                    return Promise.reject(new VerifyError("Invalid data input",HTTP.NOT_ACCEPTABLE,-16075));
                }
                return false;
            }
        }
        if("<=" == setting.condition) {
            if(val <= value) {
                return true;
            } else {
                if(setting?.verify) {
                    return Promise.reject(new VerifyError("Invalid data input",HTTP.NOT_ACCEPTABLE,-16075));
                }
                return false;
            }
        }
        if("#in-set" == setting.condition) {
            let valueary = this.toArray(setting.value);
            for(let num of valueary) {
                if(val == num) return true;
            }
            return false;
        }
        if("#out-set" == setting.condition) {
            let valueary = this.toArray(setting.value);
            for(let num of valueary) {
                if(val == num) return false;
            }
            return true;
        }
        return false;
    }

    public async validateString(setting: ColumnSetting, validater?: any) : Promise<boolean> {
        let valid = await this.validateNull(setting,validater);
        if(valid) return valid;
        let validator = validater;
        if("#is-blank" == setting.condition) {
            return typeof validator !== 'undefined' && validator.trim().length == 0;
        }
        if("#is-not-blank" == setting.condition) {
            return typeof validator !== 'undefined' && validator.trim().length > 0;
        }
        if(typeof validator === 'undefined' || validator == null) return false;
        if(typeof validator !== 'string') validator = String(validator);
        if("#inner-range" == setting.condition) {
            return Utilities.compareString(validator,setting.from) >= 0 && Utilities.compareString(validator,setting.to) <= 0;
        }
        if("#outer-range" == setting.condition) {
            return Utilities.compareString(validator,setting.from) <= 0 || Utilities.compareString(validator,setting.to) >= 0;
        }
        if("#under-range" == setting.condition) {
            return Utilities.compareString(validator,setting.from) > 0 && Utilities.compareString(validator,setting.to) < 0;
        }
        if("#upper-range" == setting.condition) {
            return Utilities.compareString(validator,setting.from) < 0 || Utilities.compareString(validator,setting.to) > 0;
        }
        let value = setting.value;
        if(typeof value === 'undefined' || value == null) {
            if("==" == setting.condition || "<" == setting.condition || "<=" == setting.condition) {
                if(setting?.verify) {
                    return Promise.reject(new VerifyError("Invalid data input",HTTP.NOT_ACCEPTABLE,-16075));
                }
                return false;
            }
            if("!=" == setting.condition || ">" == setting.condition || ">=" == setting.condition) return true;
            return false;
        }
        if("==" == setting.condition) return Utilities.compareString(validator,value) == 0;
        if("!=" == setting.condition) return Utilities.compareString(validator,value) != 0;
        if(">" == setting.condition) return Utilities.compareString(validator,value) > 0;
        if("<" == setting.condition) return Utilities.compareString(validator,value) < 0;
        if(">=" == setting.condition) return Utilities.compareString(validator,value) >= 0;
        if("<=" == setting.condition) return Utilities.compareString(validator,value) <= 0;
        if("#in-set" == setting.condition) {
            let valueary = this.toArray(setting.value);
            for(let str of valueary) {
                if(Utilities.equalsIgnoreCase(validator,str)) return true;
            }
            return false;
        }
        if("#out-set" == setting.condition) {
            let valueary = this.toArray(setting.value);
            for(let str of valueary) {
                if(Utilities.equalsIgnoreCase(validator,str)) return false;
            }
            return true;
        }
        if("#in-region" == setting.condition) {
            let validstr = validator.toLowerCase();
            let valueary = this.toArray(setting.value);
            for(let str of valueary) {
                str = str.toLowerCase();
                if(validstr.indexOf(str) >= 0) return true;
            }
            return false;
        }
        if("#out-region" == setting.condition) {
            let validstr = validator.toLowerCase();
            let valueary = this.toArray(setting.value);
            for(let str of valueary) {
                str = str.toLowerCase();
                if(validstr.indexOf(str) >= 0) return false;
            }
            return true;
        }
        return false;
    }

    public async validateDate(setting: ColumnSetting, validator?: any) : Promise<boolean> {
        let valid = await this.validateNull(setting,validator);
        if(valid) return valid;
        if("#in-region" == setting.condition) {
            return Promise.reject(new VerifyError("The operation does not apply for conditioner ("+setting.condition+")",HTTP.NOT_ACCEPTABLE,-16074));
        }
        if("#out-region" == setting.condition) {
            return Promise.reject(new VerifyError("The operation does not apply for conditioner ("+setting.condition+")",HTTP.NOT_ACCEPTABLE,-16074));
        }
        if(!validator) return false;
        let val = MigrateUtility.tryParseDate({name: setting.name, value: validator, model: this.model });
        if(!val) val = Utilities.parseDate(validator);
        if("#inner-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareDate(val,fval) >= 0 && Utilities.compareDate(val,tval) <= 0;
        }
        if("#outer-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareDate(val,fval) <= 0 || Utilities.compareDate(val,tval) >= 0;
        }
        if("#under-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareDate(val,fval) > 0 && Utilities.compareDate(val,tval) < 0;
        }
        if("#upper-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareDate(val,fval) < 0 || Utilities.compareDate(val,tval) > 0;
        }
        if(typeof setting.value === 'undefined' || setting.value == null) {
            if("==" == setting.condition || "<" == setting.condition || "<=" == setting.condition) {
                if(setting?.verify) {
                    return Promise.reject(new VerifyError("Invalid data input",HTTP.NOT_ACCEPTABLE,-16075));
                }
                return false;
            }
            if("!=" == setting.condition || ">" == setting.condition || ">=" == setting.condition) return true;
            return false;
        }
        let value = Utilities.parseDate(setting.value);
        if(typeof value === 'undefined') return false;
        if("==" == setting.condition) return Utilities.compareDate(val,value) == 0;
        if("!=" == setting.condition) return Utilities.compareDate(val,value) != 0;
        if(">" == setting.condition) return Utilities.compareDate(val,value) > 0;
        if("<" == setting.condition) return Utilities.compareDate(val,value) < 0;
        if(">=" == setting.condition) return Utilities.compareDate(val,value) >= 0;
        if("<=" == setting.condition) return Utilities.compareDate(val,value) <= 0;
        if("#in-set" == setting.condition) {
            let valueary = this.toArray(setting.value);
            for(let str of valueary) {
                let date = Utilities.parseDate(str);
                if(Utilities.compareDate(val,date) == 0) return true;
            }
            return false;
        }
        if("#out-set" == setting.condition) {
            let valueary = this.toArray(setting.value);
            for(let str of valueary) {
                let date = Utilities.parseDate(str);
                if(Utilities.compareDate(val,date) == 0) return false;
            }
            return true;
        }
        return false;
    }

    public async validateTime(setting: ColumnSetting, validator?: any) : Promise<boolean> {
        let valid = await this.validateNull(setting,validator);
        if(valid) return valid;
        if("#in-region" == setting.condition) {
            return Promise.reject(new VerifyError("The operation does not apply for conditioner ("+setting.condition+")",HTTP.NOT_ACCEPTABLE,-16074));
        }
        if("#out-region" == setting.condition) {
            return Promise.reject(new VerifyError("The operation does not apply for conditioner ("+setting.condition+")",HTTP.NOT_ACCEPTABLE,-16074));
        }
        if(!validator) return false;
        let val = MigrateUtility.tryParseDate({name: setting.name, value: validator, model: this.model });
        if(!val) val = Utilities.parseDate(validator);
        if("#inner-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareTime(val,fval) >= 0 && Utilities.compareTime(val,tval) <= 0;
        }
        if("#outer-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareTime(val,fval) <= 0 || Utilities.compareTime(val,tval) >= 0;
        }
        if("#under-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareTime(val,fval) > 0 && Utilities.compareTime(val,tval) < 0;
        }
        if("#upper-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareTime(val,fval) < 0 || Utilities.compareTime(val,tval) > 0;
        }
        if(typeof setting.value === 'undefined' || setting.value == null) {
            if("==" == setting.condition || "<" == setting.condition || "<=" == setting.condition) {
                if(setting?.verify) {
                    return Promise.reject(new VerifyError("Invalid data input",HTTP.NOT_ACCEPTABLE,-16075));
                }
                return false;
            }
            if("!=" == setting.condition || ">" == setting.condition || ">=" == setting.condition) return true;
            return false;
        }
        let value = Utilities.parseTime(setting.value);
        if(typeof value === 'undefined') return false;
        if("==" == setting.condition) return Utilities.compareTime(val,value) == 0;
        if("!=" == setting.condition) return Utilities.compareTime(val,value) != 0;
        if(">" == setting.condition) return Utilities.compareTime(val,value) > 0;
        if("<" == setting.condition) return Utilities.compareTime(val,value) < 0;
        if(">=" == setting.condition) return Utilities.compareTime(val,value) >= 0;
        if("<=" == setting.condition) return Utilities.compareTime(val,value) <= 0;
        if("#in-set" == setting.condition) {
            let valueary = this.toArray(setting.value);
            for(let str of valueary) {
                let date = Utilities.parseTime(str);
                if(Utilities.compareTime(val,date) == 0) return true;
            }
            return false;
        }
        if("#out-set" == setting.condition) {
            let valueary = this.toArray(setting.value);
            for(let str of valueary) {
                let date = Utilities.parseTime(str);
                if(Utilities.compareTime(val,date) == 0) return false;
            }
            return true;
        }
        return false;
    }
    
    public async validateDateTime(setting: ColumnSetting, validator?: any) : Promise<boolean> {
        let valid = await this.validateNull(setting,validator);
        if(valid) return valid;
        if("#in-region" == setting.condition) {
            return Promise.reject(new VerifyError("The operation does not apply for conditioner ("+setting.condition+")",HTTP.NOT_ACCEPTABLE,-16074));
        }
        if("#out-region" == setting.condition) {
            return Promise.reject(new VerifyError("The operation does not apply for conditioner ("+setting.condition+")",HTTP.NOT_ACCEPTABLE,-16074));
        }
        if(!validator) return false;
        let val = MigrateUtility.tryParseDate({name: setting.name, value: validator, model: this.model });
        if(!val) val = Utilities.parseDate(validator);
        if("#inner-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareDateTime(val,fval) >= 0 && Utilities.compareDateTime(val,tval) <= 0;
        }
        if("#outer-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareDateTime(val,fval) <= 0 || Utilities.compareDateTime(val,tval) >= 0;
        }
        if("#under-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareDateTime(val,fval) > 0 && Utilities.compareDateTime(val,tval) < 0;
        }
        if("#upper-range" == setting.condition) {
            let fval = MigrateUtility.tryParseDate({name: setting.name, value: setting.from, model: this.model });
            let tval = MigrateUtility.tryParseDate({name: setting.name, value: setting.to, model: this.model });
            return Utilities.compareDateTime(val,fval) < 0 || Utilities.compareDateTime(val,tval) > 0;
        }
        if(typeof setting.value === 'undefined' || setting.value == null) {
            if("==" == setting.condition || "<" == setting.condition || "<=" == setting.condition) {
                if(setting?.verify) {
                    return Promise.reject(new VerifyError("Invalid data input",HTTP.NOT_ACCEPTABLE,-16075));
                }
                return false;
            }
            if("!=" == setting.condition || ">" == setting.condition || ">=" == setting.condition) return true;
            return false;
        }
        let value = Utilities.parseDate(setting.value);
        if(typeof value === 'undefined') return false;
        if("==" == setting.condition) return Utilities.compareDateTime(val,value) == 0;
        if("!=" == setting.condition) return Utilities.compareDateTime(val,value) != 0;
        if(">" == setting.condition) return Utilities.compareDateTime(val,value) > 0;
        if("<" == setting.condition) return Utilities.compareDateTime(val,value) < 0;
        if(">=" == setting.condition) return Utilities.compareDateTime(val,value) >= 0;
        if("<=" == setting.condition) return Utilities.compareDateTime(val,value) <= 0;
        if("#in-set" == setting.condition) {
            let valueary = this.toArray(setting.value);
            for(let str of valueary) {
                let date = Utilities.parseDate(str);
                if(Utilities.compareDateTime(val,date) == 0) return true;
            }
            return false;
        }
        if("#out-set" == setting.condition) {
            let valueary = this.toArray(setting.value);
            for(let str of valueary) {
                let date = Utilities.parseDate(str);
                if(Utilities.compareDateTime(val,date) == 0) return false;
            }
            return true;
        }
        return false;
    }

    public async performFilter(dataset: any): Promise<FilterInfo> {
        let result = { cancel: false };
        if(this.filters?.filter && this.filters.filter?.length > 0) {
            let first = true;
            let validate = true;
            for(let filter of this.filters.filter) {
                let valid = true;
                if(filter?.columns && filter.columns?.length > 0) {
                    let fflag = true;
                    let checker = true;
                    for(let column of filter.columns) {
                        if(column?.name && column.name.trim().length > 0) {
                            let data = dataset[column.name];
                            let dbf = KnSQLUtils.getDBField(column.name,this.model);
                            if(dbf) {
                                let dbt = KnDBUtils.parseDBTypes(dbf.type);
                                if(dbt === KnDBTypes.DATE) {
                                    checker = await this.validateDate(column,data); 
                                } else if(dbt === KnDBTypes.TIME) {
                                    checker = await this.validateTime(column,data); 
                                } else if(dbt === KnDBTypes.DATETIME) {
                                    checker = await this.validateDateTime(column,data); 
                                } else if(dbt === KnDBTypes.INTEGER || dbt === KnDBTypes.BIGINT || dbt === KnDBTypes.DECIMAL) {
                                    checker = await this.validateNumber(column,data); 
                                } else {
                                    checker = await this.validateString(column,data); 
                                }
                                if(fflag) {
                                    fflag = false;
                                    valid = checker;
                                    continue;
                                }
                                if(filter?.operator && filter.operator?.toLowerCase() == "and") {
                                    valid = valid && checker;
                                } else {
                                    valid = valid || checker;
                                }
                                if(!valid) {
                                    break;
                                }
                            }
                        }
                    }
                }
                if(first) {
                    first = false;
                    validate = valid;
                    continue;
                }
                if(this.filters?.operator && this.filters.operator?.toLowerCase() == "and") {
                    validate = validate && valid;
                } else {
                    validate = validate || valid;
                }
                if(!validate) {
                    break;
                }
            }
            result.cancel = !validate;
        }
        return result;
    }

}

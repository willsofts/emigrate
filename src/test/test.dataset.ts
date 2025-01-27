const CHARACTER_SET = ['@','#','$','%','^','&','*','(',')','-','_','+','=','/','\\',':',';','|','[',']','{','}','<','>','?','.',','];
        
        let data_structure = {
            field1: { type: "STRING", options: { mapper: "entity.reporter" } },
            field2: { type: "INTEGER", options: { mapper: "counter" } },
            field3: { type: "DECIMAL", options: { mapper: "amount" } },
            field4: { type: "DATE", options: { mapper: "entity.asdate" } },
            field5: { type: "TIME" },
            field6: { type: "STRING", options: { mapper: ["entity.reporter","#-","counter"]}},
            field7: { type: "STRING", options: { mapper: ["entity.reporter"," - ","counter"]}},
            field8: { type: "STRING", options: { mapper: "captions[0]" } },
            field9: { type: "STRING", options: { mapper: "categories[1].text" } }
        };

        let data_set : any = {
            entity: { reporter: "Admin" },
            counter: 100,
            amount: 275.75,
            vat: 7,
            dataset: { 
                rows: [
                    { field1: "1111-1", field2: 2500.55, field3: 100, field4: "2024-12-17", field5: "10:10:10", field6: "2024-12-17 10:10:10", field7: "A" }
                ]                
            },
            captions: ["Good","Immediate","Excellent"],
            categories: [{text: "Good"},{text: "Immediate"},{text: "Excellent"}]
        };

        const parseDefaultValue = (defaultValue: string) => {
            if("#current_date"==defaultValue || "#current_time"==defaultValue || "#current_timestamp"==defaultValue) {
                return [new Date(),true];
            } else {
                if(defaultValue) {
                    if(defaultValue.trim().length==0) {
                        return [defaultValue,true];
                    }
                    if(CHARACTER_SET.includes(defaultValue.trim())) return [defaultValue,true];
                    if(defaultValue.length>1 && defaultValue.charAt(0)=='#') {
                        return [defaultValue.substring(1),true];
                    }
                }
            }
            return [defaultValue,false];
        }
    
        const scrapeData = (mapper: string | string[], dataSet: any) => {
            let results = undefined;
            let regex = new RegExp(`\\[(\\d+)\\]$`);
            if(Array.isArray(mapper)) {
                for(let item of mapper) {
                    let path = item.split('.');
                    let value = path.reduce((acc: any, part: any) => { 
                        console.log("acc=",acc,"part["+part+"]");
                        let match = part.match(regex); 
                        if (match && match[1]) {
                            let index = parseInt(match[1], 10);
                            let idx = part.lastIndexOf('[');
                            let token = part.substring(0,idx);
                            let ary = acc[token];
                            console.log("index="+index+", token="+token+", len="+ary.length+", ary=",ary);
                            return ary[index];
                        }                
                        let [value,flag] = parseDefaultValue(part);
                        if(flag) return value;
                        return acc && acc[part]; 
                    }, dataSet);                    
                    console.log("isArray: value",value);
                    if(value) {
                        results = ( results ?? "") + value;
                    }
                    console.log("results",results);
                }
            } else {
                if(mapper && mapper.trim().length>0) {
                    let path = mapper.split('.');
                    results = path.reduce((acc: any, part: any) => { 
                        console.log("acc=",acc,"part",part); 
                        let match = part.match(regex); 
                        if (match && match[1]) {
                            let index = parseInt(match[1], 10);
                            let idx = part.lastIndexOf('[');
                            let token = part.substring(0,idx);
                            let ary = acc[token];
                            console.log("index="+index+", token="+token+", len="+ary.length+", ary=",ary);
                            if(Array.isArray(ary) && ary.length>index) {
                                return ary[index];
                            }
                        }
                        let [value,flag] = parseDefaultValue(part);
                        if(flag) return value;
                        let rs = acc && acc[part]; 
                        console.log("rs",rs); 
                        return rs; 
                    }, dataSet);        
                    console.log("result",results);
                }
            }
            return results;
        };

        const transformData = (dataStructure: any, dataSet: any) => {
            let newDataSet : any = {};        
            for (let [key, value] of Object.entries(dataStructure)) {
                let mapper = (value as any)?.options?.mapper;
                if(mapper) {
                    let dataValue = scrapeData(mapper, dataSet);
                    newDataSet[key] = dataValue;
                }
            }        
            return Object.assign(dataSet,newDataSet);
        };
        
        let rows = scrapeData("dataset.rows",data_set);
        console.log("scrapeData: rows",rows);
        let new_data_set = transformData(data_structure, data_set);
        console.log("transformData: new_data_set",new_data_set);
        console.log("transformData: data_set",data_set);


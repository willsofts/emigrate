
import { evaluate } from 'mathjs';

let expression = "( ( ( ${UNIT} * ${PRICE} ) + ${AMOUNT} ) - ${DISCOUNT} ) / ${UNIT}";

let values : any = {
	UNIT: 100, PRICE: 15, AMOUNT: 1000, DISCOUNT: 20
};

const variablePattern = /\$\{(.*?)\}/g;

const variables = [...expression.matchAll(variablePattern)].map(match => match[1]);
console.log("variables:",variables);

const uniqueVariables = Array.from(new Set(variables));
console.log("uniqueVariables:",uniqueVariables);

const evaluatedExpression = expression.replace(variablePattern, (_, varName) => {
  return values[varName].toString();
});

console.log("evaluatedExpression:",evaluatedExpression);

const result = evaluate(evaluatedExpression);

console.log("result:",result);


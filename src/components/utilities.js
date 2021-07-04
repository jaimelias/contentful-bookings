export const isNumber = val => !isNaN(Number(val));

export const isValidDate = str => {
	const regEx = /^\d{4}-\d{2}-\d{2}$/;
	if(!str.match(regEx)) return false;  
	let d = new Date(str);
	const dNum = d.getTime();
	if(!dNum && dNum !== 0) return false;
	return d.toISOString().slice(0,10) === str;
};

export const durationsPluralSingular = {
	minutes: 'Minute',
	hours: 'Hour',
	days: 'Day',
	nights: 'Night',
	weeks: 'Week',
	months: 'Month',
};
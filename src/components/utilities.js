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
	nights: 'Night'
};

export const restrictMinMax = ({stateProp, change, args, thisState}) => {
	const minMax = [
		{
			max: 'maxParticipantsPerEvent',
			min: 'maxParticipantsPerBooking'
		},
		{
			max: 'maxWomenFreePerEvent',
			min: 'maxWomenFreePerBooking'
		},
		{
			max: 'maxChildrenFreePerEvent',
			min: 'maxChildrenFreePerBooking'
		},
		{
			max: 'maxDuration',
			min: 'duration'
		}
	];

	minMax.forEach(r => {
		
		const {max, min} = r;
				
		if(stateProp === max && change < thisState[min])
		{
			console.log({max});
			args[min] = change;
		}
		if(stateProp === min && change > thisState[max])
		{
			console.log({min});
			args[max] = change;
		}
	});
	
	return args;
};

export const colsTemplate = {
	colHeaders: {
		pax1: 'Participants',
		women: '',
		children: ''
	},
	columns: {
		pax1: {type: 'numeric', data: 'pax1'},
		women: {type: 'numeric', data: 'women'},
		children: {type: 'numeric', data: 'children'}
	},
};
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

export const validateBookingEvent = ({stateProp, change, args, thisState}) => {
	const bookingEvent = [
		{
			perEvent: 'maxParticipantsPerEvent',
			perBooking: 'maxParticipantsPerBooking'
		},
		{
			perEvent: 'maxWomenFreePerEvent',
			perBooking: 'maxWomenFreePerBooking'
		},
		{
			perEvent: 'maxChildrenFreePerEvent',
			perBooking: 'maxChildrenFreePerBooking'
		}
	];

	bookingEvent.forEach(r => {
		
		const {perEvent, perBooking} = r;
				
		if(stateProp === perEvent && change < thisState[perBooking])
		{
			args[perBooking] = change;
		}
		if(stateProp === perBooking && change > thisState[perEvent])
		{
			args[perEvent] = change;
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
export const defaultState = {
	enabled: false,
	duration: 1,
	durationUnit: 'hours',
	childrenEnabled: false,
	womenEnabled: false,
	seasonsEnabled: false,
	variablePriceEnabled: false,
	variablePriceLast: false,
	sharedEvent: false,
	maxParticipantsPerBooking: 1,
	maxParticipantsPerEvent: 1,
	seasons: {season_1: {
		fixedPrice: [{pax1: ''}],
		variablePrice: [{pax1: ''}],
		name: 'Default Prices',
		dates: [{from: '', to: ''}]
	}},
	childrenFreeUpToYearsOld: 0,
	maxChildrenFreePerEvent: 0,
	maxChildrenFreePerBooking: 0,
	maxWomenFreePerBooking: 0,
	maxWomenFreePerEvent: 0,
	childrenDiscount: 0,
	womenPricing: 0,
	colHeaders: ['Participants'],
	columns: [
		{type: 'numeric', data: 'pax1'}
	],
	updateHeight: false,
	selectedSeasonTab: 'season_1'
};
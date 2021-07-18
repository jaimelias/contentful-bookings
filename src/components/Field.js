import React from 'react';
import {Form} from '@contentful/forma-36-react-components';
import '@contentful/forma-36-react-components/dist/styles.css';
import 'handsontable/dist/handsontable.full.css';
import {RenderHotTable} from './handsOnTable.js';
import {RenderSwitch, RenderSelect} from './formElements.js';
import {isNumber, isValidDate, durationsPluralSingular, validateBookingEvent, colsTemplate} from './utilities.js';
import {defaultState} from './defaultState.js';
const priceKeys = ['fixedPrices', 'variablePrices'];

class Field extends React.Component {
	constructor(props){
		super(props);
		const {sdk} = props;
		const value = sdk.field.getValue();
		this.state = (value) ? value : defaultState;
		this.handlePriceChange = this.handlePriceChange.bind(this);
		this.handleMaxParticipants = this.handleMaxParticipants.bind(this);
		this.handleVariablePricing = this.handleVariablePricing.bind(this);
		this.forceUpdateHeight = this.forceUpdateHeight.bind(this);
		this.handleSeasonsNumber = this.handleSeasonsNumber.bind(this);
		this.handleDateChange = this.handleDateChange.bind(this);
		this.handleDateRowChange = this.handleDateRowChange.bind(this);
		this.handleSeasonAccordion = this.handleSeasonAccordion.bind(this);
		this.handleInput = this.handleInput.bind(this);
		this.handleSwitch = this.handleSwitch.bind(this);
	};
	forceUpdateHeight({thisWindow, updateHeight}){
		
		const {sdk} = this.props;
		
		if(updateHeight)
		{
			if(this.state.enabled)
			{
				sdk.window.updateHeight(this.divRef.clientHeight);
			}
			else
			{
				sdk.window.updateHeight();
			}
				
			this.setState({...this.state, updateHeight: false});
		}		
	};
	componentDidMount()
	{
		this.forceUpdateHeight({updateHeight: true, thisWindow: window});
	};
	componentDidUpdate()
	{
		const {updateHeight} = this.state;
		this.forceUpdateHeight({updateHeight, thisWindow: window});
	};
	handleSwitch({stateProp, change}){
		
		const {sdk} = this.props;
		
		let args = {[stateProp]: change, updateHeight: true};
		
		if(stateProp === 'enabled')
		{
			//resets state			
			
			sdk.field.setValue({...defaultState, ...args}).then(v => {
				this.setState({...v});
				console.log({handleSwitch: v});
			});
		}
		else
		{
			args = {...this.state, ...args};
			
			if(!change)
			{
				if(stateProp === 'childrenEnabled')
				{
					args = {
						...args, 
						maxChildrenFreePerEvent: 0, 
						maxChildrenFreePerBooking: 0, 
						childrenFreeUpToYearsOld: 0, 
						childrenDiscount: 0
					};
				}
				else if(stateProp === 'sharedEvent')
				{
					args = {
						...args,
						maxWomenFreePerEvent: 0,
						maxChildrenFreePerEvent: 0
					};
				}
				else if(stateProp === 'womenFreeEnabled')
				{
						args.maxWomenFreePerBooking = 0;
						args.maxWomenFreePerEvent = 0;
				}
				else if(stateProp === 'seasonsEnabled')
				{
					args.seasons = {season_1: args.seasons.season_1};
				}
				else if(stateProp === 'variablePricesEnabled')
				{	
					args.variablePricesLast = true;

					for(let k in args.seasons)
					{
						args.seasons[k].variablePrices = args.seasons[k].variablePrices
						.map(r => {
							let output = {};
							
							for(let k2 in r)
							{
								output[k2] = '';
							}
							
							return output;
						});
					}
				}
			}
			
			sdk.field.setValue({...this.state, ...args}).then(v => {
				this.setState({...v});
				console.log({handleSwitch: v});
			});			
		}
	};
	handleVariablePricing({stateProp, change, isSwitch}){
		
		const {sdk} = this.props;
		change = (isSwitch) ? change : parseInt(change.target.value);
		change = isNumber(change) ? change : 0;
		let {childrenDiscount, womenEnabled, seasons, maxWomenFreePerBooking, maxWomenFreePerEvent, maxChildrenFreePerEvent, maxChildrenFreePerBooking} = {...this.state};
		let cols = colsTemplate;
		
		womenEnabled = (stateProp === 'womenEnabled') ? change : womenEnabled;
		childrenDiscount = (stateProp === 'childrenDiscount') ? change : childrenDiscount;
				
		if(womenEnabled)
		{			
			cols.colHeaders = {
				...colsTemplate.colHeaders, 
				women: 'Women'
			};
			
			cols.columns = {
				...colsTemplate.columns, 
				women: {type: 'numeric', data: 'women'}
			};
		}
		else
		{				
			delete cols.colHeaders.women;
			delete cols.columns.women;			
		}

		if(childrenDiscount > 0)
		{
			cols.colHeaders = {...colsTemplate.colHeaders, children: `Child Up to ${change} years old`};
			cols.columns = {
				...colsTemplate.columns, 
				children: {type: 'numeric', data: 'children'}
			};
		}
		else
		{
			delete cols.colHeaders.children;
			delete cols.columns.children;				
		}
		
		if(stateProp === 'childrenFreeUpToYearsOld' && change === 0)
		{
			maxChildrenFreePerEvent = 0;
			maxChildrenFreePerBooking = 0;
		}
		
		const colHeaders = Object.values(cols.colHeaders);
		const columns = Object.values(cols.columns);
		
		const addSeasonNulls = ({seasons, womenEnabled, childrenDiscount, priceKeys}) => {
			
				for(let s in seasons)
				{
					for(let t in seasons[s])
					{
						if(priceKeys.includes(t))
						{
							seasons[s][t].map(r => {
								
								if(womenEnabled)
								{
									r.women = '';
								}
								else
								{
									delete r.women;
								}
								
								if(childrenDiscount > 0)
								{
									r.children = '';
								}
								else
								{
									delete r.children;
								}
								
								return r;
							});					
						}
					}
				}			
			
			return seasons;
		};
		
		seasons = addSeasonNulls({seasons, womenEnabled, childrenDiscount, priceKeys});
		
				
		sdk.field.setValue({...this.state, seasons, colHeaders, columns, [stateProp]: change, maxWomenFreePerBooking, maxWomenFreePerEvent, maxChildrenFreePerEvent, maxChildrenFreePerBooking, updateHeight: true}).then(v => {
			this.setState({...v});
			console.log({handleVariablePricing: v});
		});
	
	};
	
	handleSeasonsNumber({change})
	{
		const {sdk} = this.props;
		change = parseInt(change.target.value);
		let {seasons, maxParticipantsPerBooking, womenEnabled, childrenDiscount} = this.state;
		const countSeasons = Object.keys(seasons).length;
		let seasonRowTemplate = {pax1: ''};
		
		if(womenEnabled)
		{
			seasonRowTemplate = {...seasonRowTemplate, women: ''};
		}
		if(childrenDiscount > 0)
		{
			seasonRowTemplate = {...seasonRowTemplate, children: ''};
		}

		const blankSeason = {
			fixedPrices: [...Array(maxParticipantsPerBooking)].map(r => seasonRowTemplate),
			variablePrices: [...Array(maxParticipantsPerBooking)].map(r => seasonRowTemplate),
			dates: [{from: '', to: ''}]
		};
		
		let startCounter = countSeasons + 1;
		let dif;
		
		if(change > countSeasons)
		{
			dif = change-countSeasons;			
			[...Array(dif)].forEach((r, i) => {
				const seasonName = 'season_' + (startCounter + i);
				seasons[seasonName] = {...blankSeason, name: seasonName};
			});			
		}
		else
		{
			dif = countSeasons-change;
			[...Array(countSeasons)].forEach((r, i) => {
				if((i+1) > (countSeasons-dif))
				{
					delete seasons['season_' + (i + 1)];
				}
			});			
		}
						
		sdk.field.setValue({...this.state, seasons, selectedSeasonTab: `season_${change}`, updateHeight: true}).then(v => {
			this.setState({...v});
			console.log({handleSeasonsNumber: v});
		});
	};
	
	handlePriceChange({change, seasonId, priceType}){
		const {sdk} = this.props;
		let {seasons} = {...this.state};
		
		if(change)
		{
			if(Array.isArray(change))
			{
				change.forEach(o => {
					
					const [row, prop, oldValue, newValue] = o;

					if(oldValue !== newValue && !isNaN(newValue))
					{
						seasons[seasonId][priceType][row][prop] = newValue;
					}
					else
					{
						seasons[seasonId][priceType][row][prop] = '';
					}
				});
																
				sdk.field.setValue({...this.state, seasons}).then(v => {
					this.setState({...v});
					console.log({handlePriceChange: v});
				});
			}
		}
	};
	
	handleDateChange({change, seasonId}){
		const {sdk} = this.props;
		let {seasons} = {...this.state};
		
		if(change)
		{
			if(Array.isArray(change))
			{
				change.forEach(o => {
					
					const [row, prop, oldValue, newValue] = o;

					if(oldValue !== newValue && isValidDate(newValue))
					{
						seasons[seasonId].dates[row][prop] = newValue;
					}
					else
					{
						seasons[seasonId].dates[row][prop] = '';
					}
				});
																
				sdk.field.setValue({...this.state, seasons}).then(v => {
					this.setState({...v});
					console.log({handleDateChange: v});
				});
			}
		}		
	};
	handleMaxParticipants({change}){
		
		const {sdk} = this.props;
		let {seasons, maxParticipantsPerBooking, maxParticipantsPerEvent, womenEnabled, childrenDiscount} = {...this.state};
		change = parseInt(change.target.value);

		let addNulls = {pax1: ''};
		
		if(change > maxParticipantsPerEvent)
		{
			maxParticipantsPerEvent = change;
		}
		
		if(womenEnabled)
		{
			addNulls = {...addNulls, women: ''}
		}
		if(childrenDiscount > 0)
		{
			addNulls = {...addNulls, children: ''}
		}
		
		if(maxParticipantsPerBooking !== change)
		{
			for(let s in seasons)
			{
				for(let t in seasons[s])
				{	
					if(priceKeys.includes(t))
					{
						seasons[s][t] = seasons[s][t].filter((r, i) => (i+1) <= change);
						
						if(change > maxParticipantsPerBooking)
						{
							const dif = (change-maxParticipantsPerBooking);				
							[...Array(dif)].forEach(r => seasons[s][t].push(addNulls));
						}						
					}
				}
			}
			
			sdk.field.setValue({...this.state, seasons, maxParticipantsPerBooking: change, maxParticipantsPerEvent, updateHeight: true}).then(v => {
				this.setState({...v});
				console.log({handleMaxParticipants: v});
			});
		}
	};	
	handleDateRowChange({seasonId, change}){
		const {sdk} = this.props;
		let {seasons} = {...this.state};
		change = parseInt(change.target.value);
		const countDates = parseInt(seasons[seasonId].dates.length);
		let addNulls = {from: '', to: ''};
				
		if(countDates !== change)
		{
			seasons[seasonId].dates = seasons[seasonId].dates.filter((r, i) => (i+1) <= change);
			
			if(change > countDates)
			{
				const dif = change-countDates;				
				[...Array(dif)].forEach(r => seasons[seasonId].dates.push(addNulls));
			}				
		
			sdk.field.setValue({...this.state, seasons, updateHeight: true}).then(v => {
				this.setState({...v});
				console.log({handleDateRowChange: v});
			});
		}
	};
	
	handleInput({change, stateProp, isNumeric}){
		const {sdk} = this.props;
		let {seasons} = {...this.state};
		change = change.target.value;
		let args = {[stateProp]: change};

		//turns values to INT
		if(isNumeric)
		{			
			change = parseInt(change);
			args[stateProp] = change;
			
			const validate = validateBookingEvent({stateProp, change, args, thisState: this.state});
			
			args = {...args, ...validate};
			
		}
		
		//season rename
		if(seasons.hasOwnProperty(stateProp))
		{
			if(seasons[stateProp].hasOwnProperty('name'))
			{
				seasons[stateProp].name = change;
				args = {seasons};
			}
		}
		
		sdk.field.setValue({...this.state, ...args}).then(v => {
			this.setState({...v});
			console.log({handleInput: v});
		});			
	}	
	
	handleSeasonAccordion({change}){
		const {sdk} = this.props;
		const {selectedSeasonTab} = {...this.state};
		change = (change === selectedSeasonTab) ? '' : change;	

		sdk.field.setValue({...this.state, selectedSeasonTab: change, updateHeight: true}).then(v => {
			this.setState({...v});
			console.log({handleSeasonAccordion: v});
		});
	};

	
	render(){
						
		const {enabled, variablePricesEnabled, variablePricesLast, childrenEnabled, womenEnabled, seasonsEnabled, seasons, maxParticipantsPerBooking, maxParticipantsPerEvent, childrenFreeUpToYearsOld, childrenDiscount, womenFreeEnabled, colHeaders, columns, selectedSeasonTab, maxChildrenFreePerEvent, maxChildrenFreePerBooking, durationUnit, duration, maxWomenFreePerBooking, maxWomenFreePerEvent, sharedEvent} = this.state;
		
		return(
			<div ref={element => this.divRef = element} id={'hot-app'}>
				
				<Form>
					
					<RenderSwitch label={'Booking App'} stateProp={'enabled'} value={enabled} handler={this.handleSwitch} />
					
					{enabled ? <>
					
						<RenderSwitch label={'Shared Event'} stateProp={'sharedEvent'} value={sharedEvent} handler={this.handleSwitch} isChild={true} />					
					
						{sharedEvent ? <>
							<RenderSelect 
								label={'Max. Number of Participants Per Event'}
								value={maxParticipantsPerEvent}
								name={'maxParticipantsPerEvent'}
								arr={[...Array(100)]}
								isNumeric={true}
								min={1}
								handler={this.handleInput}
								enabled={enabled}
								isChild={true}
							/>						
						</> : ''}
					
						<RenderSelect 
							label={'Max. Number of Participants Per Booking'}
							value={maxParticipantsPerBooking}
							name={'maxParticipantsPerBooking'}
							arr={[...Array(100)]}
							isNumeric={true}
							min={1}
							handler={this.handleMaxParticipants}
							enabled={enabled}
							isChild={true}
						/>
						
						<RenderSelect 
							label={'Duration Unit'}
							value={durationUnit}
							name={'durationUnit'}
							arr={Object.keys(durationsPluralSingular)}
							isNumeric={false}
							min={0}
							handler={this.handleInput}
							enabled={enabled}
							isChild={true}
						/>
						
						<RenderSelect 
							label={'Duration'}
							value={duration}
							name={'duration'}
							arr={[...Array(100)]}
							isNumeric={true}
							min={1}
							handler={this.handleInput}
							enabled={enabled}
							isChild={true}
						/>
						
						<RenderSwitch label={'Variable Prices'} stateProp={'variablePricesEnabled'} value={variablePricesEnabled} handler={this.handleSwitch} />
						
						{variablePricesEnabled ? <>
							<RenderSwitch label={`Variable Price Includes Last ${durationsPluralSingular[durationUnit]}?`} stateProp={'variablePricesLast'} value={variablePricesLast} handler={this.handleSwitch} isChild={true}/>				
						</> : ''}
					
						<RenderSwitch label={'Seasons'} stateProp={'seasonsEnabled'} value={seasonsEnabled} handler={this.handleSwitch} />
						
						{seasonsEnabled ? <>
							<RenderSelect 
								label={'Number of Seasons'}
								value={Object.keys(seasons).length}
								name={'seasonsNumber'}
								arr={[...Array(20)]}
								isNumeric={true}
								min={1}
								handler={this.handleSeasonsNumber}
								enabled={enabled}
								isChild={true}
							/>						
						</> : ''}	

						<RenderSwitch label={'Women Prices'} stateProp={'womenEnabled'} value={womenEnabled}  handler={this.handleVariablePricing} />				
						
						{womenEnabled ? <>

							<RenderSwitch label={'Women Free of Cost'} stateProp={'womenFreeEnabled'} value={womenFreeEnabled} handler={this.handleSwitch} isChild={true} />	
							
							{womenFreeEnabled ? <>
							
								{sharedEvent ? <>
									<RenderSelect 
										label={`Max. ${maxWomenFreePerEvent} women are allowed to book free of cost per event`}
										value={maxWomenFreePerEvent}
										name={'maxWomenFreePerEvent'}
										arr={[...Array(1000)]}
										isNumeric={true}
										min={0}
										handler={this.handleInput}
										enabled={enabled}
										isChild={true}
									/>								
								</> : ''}

								<RenderSelect 
									label={`Max. ${maxWomenFreePerBooking} women are allowed to book free of cost per booking`}
									value={maxWomenFreePerBooking}
									name={'maxWomenFreePerBooking'}
									arr={[...Array(10)]}
									isNumeric={true}
									min={0}
									handler={this.handleInput}
									enabled={enabled}
									isChild={true}
								/>									
						
							</> : ''}
							
						</> : ''}						
						
						<RenderSwitch label={'Children Prices'} stateProp={'childrenEnabled'} value={childrenEnabled}  handler={this.handleSwitch} />
						
						{childrenEnabled ? <>
						
							<RenderSelect 
								label={`Children free of cost up to ${childrenFreeUpToYearsOld} years old`}
								value={childrenFreeUpToYearsOld}
								name={'childrenFreeUpToYearsOld'}
								arr={[...Array(18)]}
								isNumeric={true}
								min={0}
								handler={this.handleVariablePricing}
								enabled={enabled}
								isChild={true}
							/>						
						
							{childrenFreeUpToYearsOld > 0 ? <>
							
								{sharedEvent ? <>
									<RenderSelect 
										label={`Max. ${maxChildrenFreePerEvent} children are allowed to book free of cost per event`}
										value={maxChildrenFreePerEvent}
										name={'maxChildrenFreePerEvent'}
										arr={[...Array(1000)]}
										isNumeric={true}
										min={0}
										handler={this.handleInput}
										enabled={enabled}
										isChild={true}
									/>								
								</> : ''}
							
								<RenderSelect 
									label={`Max. ${maxChildrenFreePerBooking} children are allowed to book free of cost per booking`}
									value={maxChildrenFreePerBooking}
									name={'maxChildrenFreePerBooking'}
									arr={[...Array(10)]}
									isNumeric={true}
									min={0}
									handler={this.handleInput}
									enabled={enabled}
									isChild={true}
								/>								
						
							</> : ''}
							
								<RenderSelect 
									label={`Children discount up to ${childrenDiscount} years old`}
									value={childrenDiscount}
									name={'childrenDiscount'}
									arr={[...Array(18)]}
									isNumeric={true}
									min={0}
									handler={this.handleVariablePricing}
									enabled={enabled}
									isChild={true}
								/>
							</> 
						: ''}						
						
						<RenderHotTable
							seasons={seasons}
							maxParticipantsPerBooking={maxParticipantsPerBooking} 
							colHeaders={colHeaders}
							columns={columns}
							selectedSeasonTab={selectedSeasonTab}
							enabled={enabled}
							variablePricesEnabled={variablePricesEnabled}
							handlePriceChange={this.handlePriceChange}
							handleDateRowChange={this.handleDateRowChange}
							handleDateChange={this.handleDateChange}
							handleSeasonAccordion={this.handleSeasonAccordion}
							handleInput={this.handleInput}
						/>	

					</> : ''}
			</Form>
		</div>
		);
	}; 
};

export default Field;
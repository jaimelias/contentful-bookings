import React from 'react';
import {Form} from '@contentful/forma-36-react-components';
import '@contentful/forma-36-react-components/dist/styles.css';
import 'handsontable/dist/handsontable.full.css';
import {RenderHotTable} from './HandsOnTable.js';
import {RenderSwitch, RenderSelect} from './FormElements.js';
import {isNumber, isValidDate, durationsPluralSingular} from './utilities.js';
const priceKeys = ['fixed', 'variable'];

const defaultState = {
	enabled: false,
	duration: 1,
	durationUnit: 'hours',
	childrenEnabled: false,
	womenEnabled: false,
	seasonsEnabled: false,
	variablePricesEnabled: false,
	variablePricesLast: false,
	maxParticipants: 1,
	seasons: {season_1: {
		fixed: [{pax1: ''}],
		variable: [{pax1: ''}],
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
	handleSwitch({type, change}){
		
		const {sdk} = this.props;
		
		let args = {[type]: change, updateHeight: true};
		
		if(type === 'enabled')
		{
			//resets state
			args = {...defaultState, ...args};
		}
		else
		{
			args = {...this.state, ...args};
			
			if(!change)
			{
				if(type === 'womenEnabled')
				{
					args.womenPricing = 0;
				}
				else if(type === 'childrenEnabled')
				{
					args = {
						...args, 
						maxChildrenFreePerEvent: 0, 
						childrenFreeUpToYearsOld: 0, 
						childrenDiscount: 0
					};
				}
				else if(type === 'seasonsEnabled')
				{
					args.seasons = {season_1: args.seasons.season_1};
				}
				else if(type === 'variablePricesEnabled')
				{	
					args.variablePricesLast = false;
					
					for(let k in args.seasons)
					{
						args.seasons[k].variable = args.seasons[k].variable
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
		}
		
		sdk.field.setValue(args).then(v => {
			this.setState({...v});
			console.log({handleSwitch: v});
		});
	};
	handleVariablePricing({type, change}){
		
		const {sdk} = this.props;
		
		change = parseInt(change.target.value);
		change = isNumber(change) ? change : 0;
		let {childrenDiscount, womenPricing, seasons, maxWomenFreePerBooking, maxWomenFreePerEvent, maxChildrenFreePerEvent, maxChildrenFreePerBooking} = {...this.state};
		let addNull = false;

		let cols = {
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
		
		if(womenPricing === 1 && type !== 'womenPricing')
		{
			addNull = true;
			cols.colHeaders = {...cols.colHeaders, pax1: 'Men', women: 'Women'};
		}
		else
		{			
			if(type === 'womenPricing')
			{
				if(change !== 2)
				{
					maxWomenFreePerBooking = 0;
					maxWomenFreePerEvent = 0;
					
					if(change === 1)
					{
						addNull = true;
						cols.colHeaders = {...cols.colHeaders, pax1: 'Men', women: 'Women'};					
					}
					else
					{
						delete cols.colHeaders.womenPricing;
						delete cols.columns.womenPricing;					
					}
				}
				else
				{
					maxWomenFreePerBooking = 1;
					maxWomenFreePerEvent = 1;					
					delete cols.colHeaders.women;
					delete cols.columns.women;					
				}
			}
			else
			{
				delete cols.colHeaders.women;
				delete cols.columns.women;				
			}
		}
		
		if(childrenDiscount > 0 && type !== 'childrenDiscount')
		{
			addNull = true;
			cols.colHeaders = {...cols.colHeaders, children: `Child Up to ${change} years old`};
		}
		else
		{
			if(type === 'childrenDiscount' && change > 0)
			{
				addNull = true;
				cols.colHeaders = {...cols.colHeaders, children: `Child Up to ${change} years old`};
			}
			else
			{
				delete cols.colHeaders.children;
				delete cols.columns.children;				
			}
		}
		
		
		if(type === 'childrenFreeUpToYearsOld' && change === 0)
		{
			maxChildrenFreePerEvent = 0;
			maxChildrenFreePerBooking = 0;
		}
		
		const colHeaders = Object.values(cols.colHeaders);
		const columns = Object.values(cols.columns);
				
		for(let s in seasons)
		{
			for(let t in seasons[s])
			{
				if(priceKeys.includes(t))
				{
					seasons[s][t].map(r => {
						
						if(addNull)
						{
							if(type === 'womenPricing')
							{
								r.women = '';
							}
							else if(type === 'childrenDiscount')
							{
								r.children = '';
							}
						}

						return r;
					});					
				}
			}
		}
		
		
		
		sdk.field.setValue({...this.state, seasons, colHeaders, columns, [type]: change, maxWomenFreePerBooking, maxWomenFreePerEvent, maxChildrenFreePerEvent, maxChildrenFreePerBooking, updateHeight: true}).then(v => {
			this.setState({...v});
			console.log({handleVariablePricing: v});
		});
	
	};
	
	handleSeasonsNumber({change})
	{
		const {sdk} = this.props;
		change = parseInt(change.target.value);
		let {seasons, maxParticipants, womenPricing, childrenDiscount} = this.state;
		const countSeasons = Object.keys(seasons).length;
		let seasonRowTemplate = {pax1: ''};
		
		if(womenPricing === 1)
		{
			seasonRowTemplate = {...seasonRowTemplate, women: ''};
		}
		if(childrenDiscount > 0)
		{
			seasonRowTemplate = {...seasonRowTemplate, children: ''};
		}

		const blankSeason = {
			fixed: [...Array(maxParticipants)].map(r => seasonRowTemplate),
			variable: [...Array(maxParticipants)].map(r => seasonRowTemplate),
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
		let {seasons, maxParticipants, womenPricing, childrenDiscount} = {...this.state};
		const newMaxRows = parseInt(change.target.value);
		const oldmaxParticipants = parseInt(maxParticipants);
		let addNulls = {pax1: ''};
		
		if(womenPricing === 1)
		{
			addNulls = {...addNulls, women: ''}
		}
		if(childrenDiscount > 0)
		{
			addNulls = {...addNulls, children: ''}
		}
		
		if(oldmaxParticipants !== newMaxRows)
		{
			for(let s in seasons)
			{
				for(let t in seasons[s])
				{	
					if(priceKeys.includes(t))
					{
						seasons[s][t] = seasons[s][t].filter((r, i) => (i+1) <= newMaxRows);
						
						if(newMaxRows > oldmaxParticipants)
						{
							const dif = (newMaxRows-oldmaxParticipants);				
							[...Array(dif)].forEach(r => seasons[s][t].push(addNulls));
						}						
					}
				}
			}
			
			sdk.field.setValue({...this.state, seasons, maxParticipants: newMaxRows, updateHeight: true}).then(v => {
				this.setState({...v});
				console.log({handleMaxParticipants: v});
			});
		}
	};	
	handleDateRowChange({seasonId, change}){
		const {sdk} = this.props;
		let {seasons} = {...this.state};
		const newMaxRows = parseInt(change.target.value);
		const oldmaxParticipants = parseInt(seasons[seasonId].dates.length);
		let addNulls = {from: '', to: ''};
				
		if(oldmaxParticipants !== newMaxRows)
		{
			seasons[seasonId].dates = seasons[seasonId].dates.filter((r, i) => (i+1) <= newMaxRows);
			
			if(newMaxRows > oldmaxParticipants)
			{
				const dif = newMaxRows-oldmaxParticipants;				
				[...Array(dif)].forEach(r => seasons[seasonId].dates.push(addNulls));
			}				
		
			sdk.field.setValue({...this.state, seasons, updateHeight: true}).then(v => {
				this.setState({...v});
				console.log({handleDateRowChange: v});
			});
		}
	};
	
	handleInput({change, type, isNumeric}){
		const {sdk} = this.props;
		let {seasons} = {...this.state};
				
		change = change.target.value;
		let args = {[type]: change};

		//turns values to INT
		if(isNumeric)
		{
			args = {[type]: parseInt(change)};
		}
		
		//season rename
		if(seasons.hasOwnProperty(type))
		{
			if(seasons[type].hasOwnProperty('name'))
			{
				seasons[type].name = change;
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
						
		const {enabled, variablePricesEnabled,variablePricesLast, childrenEnabled, womenEnabled, seasonsEnabled, seasons, maxParticipants, childrenFreeUpToYearsOld, childrenDiscount, womenPricing, colHeaders, columns, selectedSeasonTab, maxChildrenFreePerEvent, maxChildrenFreePerBooking, durationUnit, duration, maxWomenFreePerBooking, maxWomenFreePerEvent} = this.state;
		
		return(
			<div ref={element => this.divRef = element} id={'hot-app'}>
				
				<Form>
					
					<RenderSwitch label={'Prices App'} type={'enabled'} status={enabled} handler={this.handleSwitch} />
					
					{enabled ? <>

						<RenderSwitch label={'Variable Prices'} type={'variablePricesEnabled'} status={variablePricesEnabled} handler={this.handleSwitch} />
						
						{variablePricesEnabled ? <>
							<RenderSwitch label={`Variable Price Includes Last ${durationsPluralSingular[durationUnit]}?`} type={'variablePricesLast'} status={variablePricesLast} handler={this.handleSwitch} />				
						</> : ''}
					
						<RenderSwitch label={'Seasons'} type={'seasonsEnabled'} status={seasonsEnabled} handler={this.handleSwitch} />
						
						<RenderSwitch label={'Children Prices'} type={'childrenEnabled'} status={childrenEnabled}  handler={this.handleSwitch} />
						
						<RenderSwitch label={'Women Prices'} type={'womenEnabled'} status={womenEnabled}  handler={this.handleSwitch} />
						
						<RenderSelect 
							label={'Max. Number of Participants'}
							value={maxParticipants}
							name={'maxParticipants'}
							arr={[...Array(100)]}
							isNumeric={true}
							min={1}
							handler={this.handleMaxParticipants}
							enabled={enabled}
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
						/>					
						
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
							/>						
						
							{childrenFreeUpToYearsOld > 0 ? <>
							
								<RenderSelect 
									label={`Max. ${maxChildrenFreePerEvent} children are allowed to book free of cost per event`}
									value={maxChildrenFreePerEvent}
									name={'maxChildrenFreePerEvent'}
									arr={[...Array(10)]}
									isNumeric={true}
									min={0}
									handler={this.handleInput}
									enabled={enabled}
								/>							
							
								<RenderSelect 
									label={`Max. ${maxChildrenFreePerBooking} children are allowed to book free of cost per booking`}
									value={maxChildrenFreePerBooking}
									name={'maxChildrenFreePerBooking'}
									arr={[...Array(1000)]}
									isNumeric={true}
									min={0}
									handler={this.handleInput}
									enabled={enabled}
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
								/>
							</> 
						: ''}
						
						{womenEnabled ? <>

							<RenderSelect 
								label={'Women Pricing'}
								value={womenPricing}
								name={'womenPricing'}
								arr={[
									{value: 0, text: 'Regular Rate'},
									{value: 1, text: 'Grant Discount'},
									{value: 2, text: 'Free of Cost'},
								]}
								isNumeric={false}
								min={0}
								handler={this.handleVariablePricing}
								enabled={enabled}
							/>
							
							{womenPricing === 2 ? <>
							
								<RenderSelect 
									label={`Max. ${maxWomenFreePerEvent} women are allowed to book free of cost per event`}
									value={maxWomenFreePerEvent}
									name={'maxWomenFreePerEvent'}
									arr={[...Array(1000)]}
									isNumeric={true}
									min={1}
									handler={this.handleInput}
									enabled={enabled}
								/>

								<RenderSelect 
									label={`Max. ${maxWomenFreePerBooking} women are allowed to book free of cost per booking`}
									value={maxWomenFreePerBooking}
									name={'maxWomenFreePerBooking'}
									arr={[...Array(10)]}
									isNumeric={true}
									min={1}
									handler={this.handleInput}
									enabled={enabled}
								/>									
						
							</> : ''}
							
						</> : ''}
						
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
							/>						
						</> : ''}
					
						<RenderHotTable
							seasons={seasons}
							maxParticipants={maxParticipants} 
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
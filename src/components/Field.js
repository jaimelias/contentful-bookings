import React from 'react';
import { Select, Option, Form, FormLabel, TextInput} from '@contentful/forma-36-react-components';
import '@contentful/forma-36-react-components/dist/styles.css';
import 'handsontable/dist/handsontable.full.css';
import {RenderHotTable} from './HandsOnTable.js';
import {RenderSwitch} from './FormElements.js';
const priceKeys = ['fixed', 'variable']
const isNumber = val => !isNaN(Number(val));
const column = {type: 'numeric'};
const isValidDate = str => {
	const regEx = /^\d{4}-\d{2}-\d{2}$/;
	if(!str.match(regEx)) return false;  
	let d = new Date(str);
	const dNum = d.getTime();
	if(!dNum && dNum !== 0) return false;
	return d.toISOString().slice(0,10) === str;
};

const durationUnits = ['minutes', 'hours', 'days', 'nights', 'weeks', 'months'];

const defaultState = {
	enabled: false,
	duration: 1,
	durationUnit: durationUnits[1],
	childrenEnabled: false,
	womenEnabled: false,
	seasonsEnabled: false,
	variablePricesEnabled: false,
	maxPriceRows: 2,
	seasons: {season_1: {
		fixed: [...Array(2)].map(r => ['']),
		variable: [...Array(2)].map(r => ['']),
		name: 'Default Prices',
		dates: [['', '']]
	}},
	childrenFreeUpToYearsOld: 0,
	maxNumberChildrenFree: 0,
	childrenDiscount: 0,
	womenPricing: 0,
	colHeaders: ['Participants'],
	columns: [column],
	updateHeight: false,
	selectedSeasonTab: 'season_1'
}

class Field extends React.Component {
	constructor(props){
		super(props);
		const {sdk} = props;
		const value = sdk.field.getValue();
		this.state = (value) ? value : defaultState;
		this.handlePriceChange = this.handlePriceChange.bind(this);
		this.handlePriceRowChange = this.handlePriceRowChange.bind(this);
		this.handleVariablePricing = this.handleVariablePricing.bind(this);
		this.forceUpdateHeight = this.forceUpdateHeight.bind(this);
		this.handleSeasonsNumber = this.handleSeasonsNumber.bind(this);
		this.handleDateChange = this.handleDateChange.bind(this);
		this.handleDateRowChange = this.handleDateRowChange.bind(this);
		this.handleSeasonAccordion = this.handleSeasonAccordion.bind(this);
		this.handleInput = this.handleInput.bind(this);
		this.handleSwitch = this.handleSwitch.bind(this);
	};
	forceUpdateHeight({sdk, thisWindow, updateHeight}){
		if(updateHeight)
		{
				sdk.window.updateHeight(this.divRef.clientHeight);
				this.setState({...this.state, updateHeight: false});
		}		
	};
	componentDidMount()
	{
		const {sdk} = this.props;
		this.forceUpdateHeight({sdk, updateHeight: true, thisWindow: window});
	};
	componentDidUpdate()
	{
		const {sdk} = this.props;
		const {updateHeight} = this.state;
		this.forceUpdateHeight({sdk, updateHeight, thisWindow: window});
	};
	handleSwitch({type, sdk, change}){
		
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
						maxNumberChildrenFree: 0, 
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
					for(let k in args.seasons)
					{
						args.seasons[k].variable = args.seasons[k].variable
							.map(r => r.map(r2 => ''));						
					}
				}
			}
		}
		
		sdk.field.setValue(args).then(v => {
			this.setState({...v});
			console.log({handleSwitch: v});
		});
	};
	handleVariablePricing({sdk, type, change}){
		change = parseInt(change.target.value);
		change = isNumber(change) ? change : 0;
		let {childrenDiscount, womenPricing, seasons} = {...this.state};
		let addNull = false;

		let cols = {
			colHeaders: {
				persons: 'Participants',
				womenPricing: '',
				childrenDiscount: ''
			},
			columns: {
				persons: column,
				womenPricing: column,
				childrenDiscount: column
			},				
		};
		
		if(womenPricing === 1 && type !== 'womenPricing')
		{
			addNull = true;
			cols.colHeaders = {...cols.colHeaders, persons: 'Men', womenPricing: 'Women'};
		}
		else
		{
			if(type === 'womenPricing' && change === 1)
			{
				addNull = true;
				cols.colHeaders = {...cols.colHeaders, persons: 'Men', womenPricing: 'Women'};
			}
			else
			{
				delete cols.colHeaders.womenPricing;
				delete cols.columns.womenPricing;				
			}
		}

		
		if(childrenDiscount > 0 && type !== 'childrenDiscount')
		{
			addNull = true;
			cols.colHeaders = {...cols.colHeaders, childrenDiscount: `Child Up to ${change} years old`};
		}
		else
		{
			if(type === 'childrenDiscount' && change > 0)
			{
				addNull = true;
				cols.colHeaders = {...cols.colHeaders, childrenDiscount: `Children up to ${change} years old`};
			}
			else
			{
				delete cols.colHeaders.childrenDiscount;
				delete cols.columns.childrenDiscount;				
			}
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

							r.push('');
						}
						else
						{
							r.pop();
						}
						
						return r;
					});					
				}
			}
		}
		
		sdk.field.setValue({...this.state, seasons, colHeaders, columns, [type]: change, updateHeight: true}).then(v => {
			this.setState({...v});
			console.log({handleVariablePricing: v});
		});
	
	};
	
	handleSeasonsNumber({change, sdk})
	{
		change = parseInt(change.target.value);
		let {seasons, maxPriceRows, womenPricing, childrenDiscount} = this.state;
		const countSeasons = Object.keys(seasons).length;
		let seasonRowTemplate = [''];
		
		if(womenPricing === 1)
		{
			seasonRowTemplate.push('');
		}
		if(childrenDiscount > 0)
		{
			seasonRowTemplate.push('');
		}

		const blankSeason = {
			fixed: [...Array(maxPriceRows)].map(r => seasonRowTemplate),
			variable: [...Array(maxPriceRows)].map(r => seasonRowTemplate),
			dates: [['', '']]
		};
		
		let startCounter = countSeasons + 1;
		let dif;
		
		if(change > countSeasons)
		{
			dif = change-countSeasons;			
			[...Array(dif)].forEach((r, i) => {
				const seasonName = 'seasons_' + (startCounter + i);
				seasons[seasonName] = {...blankSeason, name: seasonName};
			});			
		}
		else
		{
			dif = countSeasons-change;
			[...Array(countSeasons)].forEach((r, i) => {
				if((i+1) > (countSeasons-dif))
				{
					delete seasons['seasons_' + (i + 1)];
				}
			});			
		}
				
		sdk.field.setValue({...this.state, seasons, updateHeight: true}).then(v => {
			this.setState({...v});
			console.log({handleSeasonsNumber: v});
		});
	};
	
	handlePriceChange({change, sdk, seasonId, priceType}){
		
		let {seasons} = {...this.state};
		
		if(change)
		{
			if(Array.isArray(change))
			{
				change.forEach(o => {
					
					const [row, col, oldValue, newValue] = o;

					if(oldValue !== newValue && !isNaN(newValue))
					{
						seasons[seasonId][priceType][row][col] = newValue;
					}
					else
					{
						seasons[seasonId][priceType][row][col] = '';
					}
				});
																
				sdk.field.setValue({...this.state, seasons}).then(v => {
					this.setState({...v});
					console.log({handlePriceChange: v});
				});
			}
		}
	};
	
	handleDateChange({change, sdk, seasonId}){
		
		let {seasons} = {...this.state};
		
		if(change)
		{
			if(Array.isArray(change))
			{
				change.forEach(o => {
					
					const [row, col, oldValue, newValue] = o;

					if(oldValue !== newValue && isValidDate(newValue))
					{
						seasons[seasonId].dates[row][col] = newValue;
					}
					else
					{
						seasons[seasonId].dates[row][col] = '';
					}
				});
																
				sdk.field.setValue({...this.state, seasons}).then(v => {
					this.setState({...v});
					console.log({handleDateChange: v});
				});
			}
		}		
	};
	handlePriceRowChange({change, sdk}){
		
		let {seasons, maxPriceRows, womenPricing, childrenDiscount} = {...this.state};
		const newMaxRows = parseInt(change.target.value);
		const oldmaxPriceRows = parseInt(maxPriceRows);
		let addNulls = [''];
		
		if(womenPricing === 1)
		{
			addNulls = ['', ''];
			
			if(childrenDiscount > 0)
			{
				addNulls = ['', '', ''];
			}
		}
		else
		{
			if(childrenDiscount > 0)
			{
				addNulls = ['', '', ''];
			}			
		}
		
		if(oldmaxPriceRows !== newMaxRows)
		{
			for(let s in seasons)
			{
				for(let t in seasons[s])
				{	
					if(priceKeys.includes(t))
					{
						seasons[s][t] = seasons[s][t].filter((r, i) => (i+1) <= newMaxRows);
						
						if(newMaxRows > oldmaxPriceRows)
						{
							const dif = newMaxRows-oldmaxPriceRows;				
							[...Array(dif)].forEach(r => seasons[s][t].push(addNulls));
						}						
					}
				}
			}
			
			sdk.field.setValue({...this.state, seasons, maxPriceRows: newMaxRows, updateHeight: true}).then(v => {
				this.setState({...v});
				console.log({handlePriceRowChange: v});
			});
		}
	};	
	handleDateRowChange({sdk, seasonId, change}){
		let {seasons} = {...this.state};
		const newMaxRows = parseInt(change.target.value);
		const oldmaxPriceRows = parseInt(seasons[seasonId].dates.length);
		let addNulls = ['', ''];
				
		if(oldmaxPriceRows !== newMaxRows)
		{
			seasons[seasonId].dates = seasons[seasonId].dates.filter((r, i) => (i+1) <= newMaxRows);
			
			if(newMaxRows > oldmaxPriceRows)
			{
				const dif = newMaxRows-oldmaxPriceRows;				
				[...Array(dif)].forEach(r => seasons[seasonId].dates.push(addNulls));
			}				
		
			sdk.field.setValue({...this.state, seasons, updateHeight: true}).then(v => {
				this.setState({...v});
				console.log({handleDateRowChange: v});
			});
		}
	};
	
	handleInput({change, sdk, type}){
		let {seasons} = {...this.state};
		change = change.target.value;
		let args = {[type]: change};
		const parseToInt = ['maxNumberChildrenFree', 'duration'];
		const min1Required = ['duration'];
		
		//turns values to INT
		if(parseToInt.includes(type))
		{
			change = parseInt(change);
			
			// set minimum value as 1
			if(min1Required.includes(type) && change < 1)
			{
				change = 1;
			}
			
			args = {[type]: change};
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
	
	handleSeasonAccordion({sdk, change}){
		
		const {selectedSeasonTab} = {...this.state};
		change = (change === selectedSeasonTab) ? '' : change;	

		sdk.field.setValue({...this.state, selectedSeasonTab: change, updateHeight: true}).then(v => {
			this.setState({...v});
			console.log({handleSeasonAccordion: v});
		});
	};

	
	render(){
		const {sdk} = this.props;
						
		const {enabled, variablePricesEnabled, childrenEnabled, womenEnabled, seasonsEnabled, seasons, maxPriceRows, childrenFreeUpToYearsOld, childrenDiscount, womenPricing, colHeaders, columns, selectedSeasonTab, maxNumberChildrenFree, durationUnit, duration} = this.state;
		
		return(
			<div ref={element => this.divRef = element} id={'hot-app'}>
				
				<Form>
					
					<RenderSwitch label={'Prices App'} type={'enabled'} status={enabled} sdk={sdk} handleSwitch={this.handleSwitch} />
					
					{enabled ? <>
					
						<div style={{marginBottom: '1.5rem'}}>
							<RenderSwitch label={'Variable Prices'} type={'variablePricesEnabled'} status={variablePricesEnabled} sdk={sdk} handleSwitch={this.handleSwitch} />
						</div>					
					
						<div style={{marginBottom: '1.5rem'}}>
							<RenderSwitch label={'Seasons'} type={'seasonsEnabled'} status={seasonsEnabled} sdk={sdk} handleSwitch={this.handleSwitch} />
						</div>
						
						<div style={{marginBottom: '1.5rem'}}>
							<RenderSwitch label={'Children Prices'} type={'childrenEnabled'} status={childrenEnabled}  sdk={sdk} handleSwitch={this.handleSwitch} />
						</div>
						
						<div style={{marginBottom: '1.5rem'}}>
							<RenderSwitch label={'Women Prices'} type={'womenEnabled'} status={womenEnabled} sdk={sdk} handleSwitch={this.handleSwitch} />
						</div>
						
						<div style={{marginBottom: '1.5rem'}}>
							<FormLabel htmlFor={'maxPriceRows'}>
								{'Maximum Number of Price Rows'}
							</FormLabel>						
							<Select
								id={'maxPriceRows'}
								value={maxPriceRows}
								isDisabled={enabled === false}
								onChange={change =>{this.handlePriceRowChange({change, sdk})}}>
								{[...Array(20)].map((r, i) => <Option key={i} value={i+1}>{i+1}</Option>)}
							</Select>
						</div>
						
						<div style={{marginBottom: '1.5rem'}}>
							<FormLabel htmlFor={'durationUnit'}>
								{'Duration Unit'}
							</FormLabel>
							<Select
								id={'durationUnit'}
								value={durationUnit}
								isDisabled={enabled === false}
								onChange={(change) => {this.handleInput({sdk, change, type: 'durationUnit'})}}>
								{durationUnits.map(r => <Option key={r} value={r}>{r}</Option>)}
							</Select>
						</div>
						
						<div style={{marginBottom: '1.5rem'}}>
							<FormLabel htmlFor={'duration'}>
								{'Duration'}
							</FormLabel>
							<TextInput
								id={'duration'}
								value={duration}
								isReadOnly={enabled === false}
								onBlur={(change) => {this.handleInput({sdk, change, type: 'duration'})}} />
						</div>						
						
						{childrenEnabled ? <>
							<div style={{marginBottom: '1.5rem'}}>
								<FormLabel htmlFor={'childrenFreeUpToYearsOld'}>
									{`Children free of cost up to ${childrenFreeUpToYearsOld} years old`}
								</FormLabel>
								<Select
									id={'childrenFreeUpToYearsOld'}
									value={childrenFreeUpToYearsOld}
									isDisabled={enabled === false}
									onChange={(change) => {this.handleVariablePricing({sdk, type: 'childrenFreeUpToYearsOld', change})}}>
									{[...Array(18)].map((r, i) => <Option key={i} value={i}>{i}</Option>)}
								</Select>
							</div>
							
							{childrenFreeUpToYearsOld > 0 ? (
								<div style={{marginBottom: '1.5rem'}}>
									<FormLabel htmlFor={'maxNumberChildrenFree'}>
										{`Up to ${maxNumberChildrenFree} children are allowed to book free of cost`}
									</FormLabel>						
									<Select
										id={'maxNumberChildrenFree'}
										value={maxNumberChildrenFree}
										isDisabled={enabled === false}
										onChange={(change) => {this.handleInput({sdk, change, type: 'maxNumberChildrenFree'})}}>
										{[...Array(18)].map((r, i) => <Option key={i} value={i}>{i}</Option>)}
									</Select>
								</div>
							) : ''}
							
								<div style={{marginBottom: '1.5rem'}}>
									<FormLabel htmlFor={'childrenDiscount'}>
										{`Children discount up to ${childrenDiscount} years old`}
									</FormLabel>
									<Select
										id={'childrenDiscount'}
										value={childrenDiscount}
										isDisabled={enabled === false}
										onChange={(change) => {this.handleVariablePricing({sdk, type: 'childrenDiscount', change})}}>
										{[...Array(18)].map((r, i) => <Option key={i} value={i}>{i}</Option>)}
									</Select>
								</div>
							</> 
						: ''}
						
						{womenEnabled ? <div style={{marginBottom: '1.5rem'}}>
							<FormLabel htmlFor={'womenPricing'}>
								{'Women Pricing'}
							</FormLabel>
							<Select
								id={'womenPricing'}
								value={womenPricing}
								isDisabled={enabled === false}
								onChange={(change) => {this.handleVariablePricing({sdk, type: 'womenPricing', change})}}>
								<Option value={0}>{'Regular Rate'}</Option>
								<Option value={1}>{'Grant Discount'}</Option>
								<Option value={2}>{'Free of Cost'}</Option>
							</Select>
						</div> : ''}
						
						{seasonsEnabled ? <div style={{marginBottom: '1.5rem'}}>
							<FormLabel htmlFor={'seasonsNumber'}>
								{'Number of Seasons'}
							</FormLabel>						
							<Select
								id={'seasonsNumber'}
								value={Object.keys(seasons).length}
								isDisabled={enabled === false}
								onChange={change =>{this.handleSeasonsNumber({change, sdk})}}>
								{[...Array(20)].map((r, i) => <Option key={i} value={i+1}>{i+1}</Option>)}
							</Select>						
						</div> : ''}
					
						<RenderHotTable
							sdk={sdk}
							seasons={seasons}
							maxPriceRows={maxPriceRows} 
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
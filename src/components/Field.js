import React from 'react';
import { SelectField, Option, Subheading, SectionHeading, Form, TextInput, RadioButtonField, Switch, FormLabel} from '@contentful/forma-36-react-components';
import { HotTable } from '@handsontable/react';
import '@contentful/forma-36-react-components/dist/styles.css';
import 'handsontable/dist/handsontable.full.css';
const priceKeys = ['fixed', 'dynamic']
const isNumber = val => !isNaN(Number(val));
const dateColumn = {validator: 'date', type: 'date', dateFormat: 'YYYY-MM-DD'};
const column = {type: 'numeric'};
const isValidDate = str => {
	const regEx = /^\d{4}-\d{2}-\d{2}$/;
	if(!str.match(regEx)) return false;  
	let d = new Date(str);
	const dNum = d.getTime();
	if(!dNum && dNum !== 0) return false;
	return d.toISOString().slice(0,10) === str;
}

const defaultState = {
	enabled: false,
	maxPriceRows: 2,
	seasons: {season_1: {
		fixed: [...Array(2)].map(r => ['']),
		dynamic: [...Array(2)].map(r => ['']),
		name: 'Default Prices',
		dates: [['', '']]
	}},
	childrenFreeUpToYearsOld: 0,
	maxNumberChildrenFree: 0,
	childrenDiscount: 0,
	womenPricing: 0,
	colHeaders: ['Per Person'],
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
		this.handleSeasonRename = this.handleSeasonRename.bind(this);
		this.handleSeasonSelect = this.handleSeasonSelect.bind(this);
		this.handlemaxNumberChildrenFree = this.handlemaxNumberChildrenFree.bind(this);
		this.handleEnableDisableApp = this.handleEnableDisableApp.bind(this);
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
	handleEnableDisableApp({sdk, change}){
		
		sdk.field.setValue({...defaultState, enabled: change}).then(v => {
			this.setState({...v});
			console.log(v);
		});
	};
	handleVariablePricing({sdk, type, change}){
		change = parseInt(change.target.value);
		change = isNumber(change) ? change : 0;
		let {childrenDiscount, womenPricing, seasons} = {...this.state};
		let addNull = false;

		let cols = {
			colHeaders: {
				persons: 'Per Person',
				womenPricing: 'Women Discount',
				childrenDiscount: 'Children Discount'
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
		}
		else
		{
			if(type === 'womenPricing' && change === 1)
			{
				addNull = true;
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
		}
		else
		{
			if(type === 'childrenDiscount' && change > 0)
			{
				addNull = true;
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
		

		sdk.field.setValue({...this.state, seasons, colHeaders, columns, [type]: change}).then(v => {
			this.setState({...v});
			console.log(this.state);
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
			dynamic: [...Array(maxPriceRows)].map(r => seasonRowTemplate),
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
			console.log(this.state);
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
					console.log(v);
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
					console.log(v);
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
				console.log(v);
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
				console.log(v);
			});			
			
		}
	};
	handleSeasonRename({change, sdk, seasonId}){
		let {seasons} = {...this.state};
		change = change.target.value;
		
		if(change)
		{
			seasons[seasonId].name = change;
			
			sdk.field.setValue({...this.state, seasons}).then(v => {
				this.setState({...v});
				console.log(v);
			});			
		}
	};
	
	handleSeasonSelect({sdk, change}){
		change = change.target.value;
		
		if(change)
		{
			this.setState({...this.state, selectedSeasonTab: change, updateHeight: true});		
		}
	};
	
	handlemaxNumberChildrenFree({change, sdk}){
		change = parseInt(change.target.value);
		
		sdk.field.setValue({...this.state, maxNumberChildrenFree: change}).then(v => {
			this.setState({...v});
			console.log(v);
		});			
	}
	
	render(){
		const {sdk} = this.props;
		const {enabled, seasons, maxPriceRows, childrenFreeUpToYearsOld, childrenDiscount, womenPricing, colHeaders, columns, selectedSeasonTab, maxNumberChildrenFree} = this.state;
		const cellHeight = 23;
		
		const RenderHotTable = ({sdk, seasons, maxPriceRows, colHeaders, columns}) => {

			const tableHeight = (maxPriceRows+2)*cellHeight;
			const GetTable = ({seasonId, priceType}) => (
				<div style={{height: tableHeight}}>
					<HotTable
						licenseKey={'non-commercial-and-evaluation'}
						data={seasons[seasonId][priceType]} 
						maxRows={maxPriceRows}
						colHeaders={colHeaders}
						rowHeaders={true}
						columns={columns}
						colWidths={150}
						width={'100%'}
						height={(maxPriceRows+2)*cellHeight}
						afterChange={change => {this.handlePriceChange({change, sdk, seasonId, priceType})}}
					/>
				</div>
			);
			
			const GetDate = ({seasonId}) => {
				
				const maxDateRows = seasons[seasonId].dates.length;
				const tableHeight = (maxDateRows+2)*cellHeight;
				return (
					<div>
						<SelectField
							value={maxDateRows}
							onChange={(change) => {this.handleDateRowChange({sdk, change, seasonId})}}
							>
							{[...Array(20)].map((r, i) => <Option key={i} value={i+1}>{i+1}</Option>)}
						</SelectField>				
						<br/>
						<SectionHeading>{'Date Ranges'}</SectionHeading>
						<br/>
						<div style={{height: tableHeight}}>
							<HotTable
								licenseKey={'non-commercial-and-evaluation'}
								data={seasons[seasonId].dates} 
								maxRows={maxDateRows}
								colHeaders={['From', 'To']}
								rowHeaders={true}
								width={'100%'}
								colWidths={150}
								placeholder={'yyyy-mm-dd'}
								columns={[dateColumn, dateColumn]}
								height={tableHeight}
								afterChange={(change) => {this.handleDateChange({change, sdk, seasonId})}}
							/>
						</div>
					</div>				
				);
			};
			
			const output = Object.keys(seasons).map(k => {
				const seasonName = seasons[k].name;
		
				return (
					<div key={k} style={{border: '1px solid #dddddd', padding: '10px', marginBottom: '20px'}}>
						<FormLabel 
							style={{
								backgroundColor: '#eeeeee', 
								borderTop: 'solid 1px #dddddd',
								borderRight: 'solid 1px #dddddd',
								borderLeft: 'solid 1px #dddddd',
								padding: '10px',
								width: '100%',
								display: 'block',
								boxSizing: 'border-box',
								cursor: 'pointer'
							}}
							
							htmlFor={k}
							
							>
							<RadioButtonField
								id={k}
								value={k}
								checked={selectedSeasonTab === k}
								labelText={k}
								helpText={seasonName}
								onClick={change => {this.handleSeasonSelect({sdk, change})}}
							/>
						</FormLabel>
						{selectedSeasonTab === k ? (
							<div id={k} style={{marginTop: '20px', marginBottom: '20px'}}>		
								<Subheading>
									{k.toUpperCase()}{k !== seasonName ? ` - ${seasonName}` : ''}
								</Subheading>
								<br/>
								{k !== 'season_1' ? 
									<>
									<SectionHeading>{'Number of Dates'}</SectionHeading>
									<br/>
									<GetDate seasonId={k} />
									<br/>
									</>
									: ''
								}
								<SectionHeading>{'Fixed Price'}</SectionHeading>
								<br/>
								<GetTable seasonId={k} priceType={'fixed'} />
								<br/>
								<SectionHeading>{'Variable Price'}</SectionHeading>
								<br/>
								<GetTable seasonId={k} priceType={'dynamic'} />
								<br/>
								<SectionHeading>{'Rename Season'}</SectionHeading>
								<br/>
								<TextInput
									value={k !== seasonName && seasonName ? seasonName : ''}
									onBlur={change =>{this.handleSeasonRename({change, sdk, seasonId: k})}}
								/>
							</div>
						) : ''}
					</div>
				);
			});
			
			return (
				<div>
					<SectionHeading>Select a Season</SectionHeading>
					<br/>
					{output}
				</div>
			);
		};
				
		return(
			<div ref={element => this.divRef = element} id={'hot-app'}>
				
				<Form>
						<FormLabel htmlFor={'appStatus'}>
							<Switch
								id={'appStatus'}
								isChecked={enabled} 
								labelText={`Prices ${enabled ? 'Enabled' : 'Disabled'}`}
								onToggle={(change) => {this.handleEnableDisableApp({sdk, change})}}
							/>
						</FormLabel>
					
						<SelectField
							value={childrenFreeUpToYearsOld}
							labelText={`Children free of cost up to ${childrenFreeUpToYearsOld} years old`} 
							onChange={(change) => {this.handleVariablePricing({sdk, type: 'childrenFreeUpToYearsOld', change})}}>
							{[...Array(18)].map((r, i) => <Option key={i} value={i}>{i}</Option>)}
						</SelectField>
						
						{childrenFreeUpToYearsOld > 0 ? (
							<SelectField
								value={maxNumberChildrenFree}
								labelText={`Up to ${maxNumberChildrenFree} children are allowed to book free of cost`} 
								onChange={(change) => {this.handlemaxNumberChildrenFree({sdk, change})}}>
								{[...Array(18)].map((r, i) => <Option key={i} value={i}>{i}</Option>)}
							</SelectField>
						) : ''}
						
						<SelectField
							value={childrenDiscount}
							labelText={`Children discount up to ${childrenDiscount} years old`} 
							onChange={(change) => {this.handleVariablePricing({sdk, type: 'childrenDiscount', change})}}>
							{[...Array(18)].map((r, i) => <Option key={i} value={i}>{i}</Option>)}
						</SelectField>
						
						<SelectField
							value={womenPricing}
							labelText={'Women Pricing'} 
							onChange={(change) => {this.handleVariablePricing({sdk, type: 'womenPricing', change})}}>
							<Option value={0}>{'Regular Rate'}</Option>
							<Option value={1}>{'Grant Discount'}</Option>
							<Option value={2}>{'Free of Cost'}</Option>
						</SelectField>				
						
						<SelectField
							value={maxPriceRows}
							labelText="Maximum Number of Prices Per Person" 
							onChange={change =>{this.handlePriceRowChange({change, sdk})}}>
							{[...Array(20)].map((r, i) => <Option key={i} value={i+1}>{i+1}</Option>)}
						</SelectField>
						
						<SelectField
							value={Object.keys(seasons).length}
							labelText="Number of Seasons" 
							onChange={change =>{this.handleSeasonsNumber({change, sdk})}}>
							{[...Array(20)].map((r, i) => <Option key={i} value={i+1}>{i+1}</Option>)}
						</SelectField>
					
					<RenderHotTable
						sdk={sdk}
						seasons={seasons}
						maxPriceRows={maxPriceRows} 
						colHeaders={colHeaders}
						columns={columns}
					/>	
					
				</Form>
			</div>
		);
	}; 
};

export default Field;